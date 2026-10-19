import { createHmac, randomBytes, timingSafeEqual, randomUUID } from "node:crypto";
import { createPool, type Pool } from "mysql2/promise";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import { env } from "node:process";
import { initialConfig, type EditableItem, type SiteConfig } from "@/lib/cms";

const DATA_DIR = resolve(env["DATA_DIR"] || "data");
const LEGACY_CONTENT_FILE = resolve(DATA_DIR, "site-content.json");
const UPLOADS_DIR = resolve(DATA_DIR, "uploads");
const COOKIE_NAME = "vz_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const sessionSecret = env["SESSION_SECRET"] || randomBytes(32).toString("hex");
const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const collections = {
  services: "services",
  projects: "portfolio",
  clients: "clients",
} as const;
type CollectionName = keyof typeof collections;
type ContentDocument = { config: SiteConfig };
let database: Pool | undefined;
let storeInitialization: Promise<void> | undefined;

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}

function equalSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function createSessionCookie(secure: boolean) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure ? "; Secure" : ""}`;
}

function hasSession(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !equalSecret(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = publicOrigin();
    return new URL(origin).origin === requestOrigin || new URL(origin).origin === configuredOrigin;
  } catch {
    return false;
  }
}

function requireAdmin(request: Request) {
  return sameOrigin(request) && hasSession(request);
}

function localAssetPath(filename: string): string | null {
  if (filename === "viral-zoom-logo.png") return "/media/viral-zoom-logo.svg";
  if (filename === "viral-zoom-logo-white.png") return "/media/viral-zoom-logo-white.svg";
  if (filename === "viral-zoom-hero.mp4") return "/media/video/social-campaign-reel.mp4";
  if (filename === "viral-zoom-hero.webm") return "/media/video/social-campaign-reel.webm";
  if (filename === "viral-zoom-poster.jpg") return "/media/video/social-campaign-poster.jpg";
  const client = /^client-(\d+)\.jpg$/.exec(filename);
  if (client) return `/media/clients/client-${client[1]}.svg`;
  const portfolio = /^portfolio-(\d+)\.jpg$/.exec(filename);
  if (portfolio) {
    const index = Number(portfolio[1]);
    if (index >= 0 && index < 6)
      return `/media/campaign/social-${String(index + 1).padStart(2, "0")}.webp`;
  }
  const staticAssets: Record<string, string> = {
    "social.jpg": "/media/campaign/social-07.webp",
    "events.jpg": "/media/campaign/social-08.webp",
    "animation.jpg": "/media/campaign/social-03.webp",
    "printing.jpg": "/media/campaign/social-05.webp",
    "seo.jpg": "/media/campaign/meta-sample-01.webp",
    "video.jpg": "/media/video/social-campaign-poster.jpg",
    "website.jpg": "/media/campaign/social-02.webp",
  };
  return staticAssets[filename] ?? null;
}

function rewriteLegacyMedia(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    const legacy = value.startsWith("/__l5e/assets-v1/") ? localAssetPath(basename(value)) : null;
    if (legacy) return { value: legacy, changed: true };
    const starPlus = /^https:\/\/starplus\.agency\/storage\/images\/portfolios\/([\w.-]+)$/.exec(
      value,
    );
    if (starPlus) return { value: `/media/portfolio/${starPlus[1]}`, changed: true };
    return { value, changed: false };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const result = value.map((entry) => {
      const rewritten = rewriteLegacyMedia(entry);
      changed ||= rewritten.changed;
      return rewritten.value;
    });
    return { value: result, changed };
  }
  if (value && typeof value === "object") {
    let changed = false;
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const rewritten = rewriteLegacyMedia(entry);
      changed ||= rewritten.changed;
      result[key] = rewritten.value;
    }
    return { value: result, changed };
  }
  return { value, changed: false };
}

function migrateStoredMedia(document: ContentDocument): {
  document: ContentDocument;
  changed: boolean;
} {
  const rewritten = rewriteLegacyMedia(document) as { value: ContentDocument; changed: boolean };
  const config = rewritten.value.config as unknown as Record<string, unknown>;
  const portfolio = config["portfolio"];
  let changed = rewritten.changed;
  if (Array.isArray(portfolio)) {
    const defaultSocialImages = [
      "/media/campaign/social-01.webp",
      "/media/campaign/social-02.webp",
      "/media/campaign/social-03.webp",
    ];
    for (const entry of portfolio) {
      if (!entry || typeof entry !== "object") continue;
      const project = entry as Record<string, unknown>;
      if (
        project["slug"] !== "social-media-growth-concept" &&
        project["id"] !== "social-media-growth-concept"
      )
        continue;
      const showcase = project["socialMediaShowcase"];
      if (!showcase || typeof showcase !== "object") continue;
      const media = showcase as Record<string, unknown>;
      const performanceImages = media["performanceImages"];
      if (
        Array.isArray(performanceImages) &&
        performanceImages.length === defaultSocialImages.length &&
        performanceImages.every((image, index) => image === defaultSocialImages[index])
      ) {
        media["performanceImages"] = [
          "/media/campaign/meta-sample-01.webp",
          "/media/campaign/meta-sample-02.webp",
          "/media/campaign/meta-sample-03.webp",
        ];
        changed = true;
      }
    }
  }
  return { document: rewritten.value, changed };
}

function jsonValue<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

async function loadConfigFromDatabase(): Promise<SiteConfig> {
  const db = database;
  if (!db) throw new Error("MySQL database is not initialized");
  const [settingRows] = await db.query<import("mysql2").RowDataPacket[]>(
    "SELECT page_meta, page_copy, page_assets, brand, hero, sections, contact FROM site_settings WHERE id = 1",
  );
  const settings = settingRows[0];
  if (!settings) throw new Error("MySQL site settings are missing");
  const [items] = await db.query<import("mysql2").RowDataPacket[]>(
    "SELECT collection, content FROM content_items ORDER BY collection, position, item_id",
  );
  const config: SiteConfig = {
    pageMeta: jsonValue<SiteConfig["pageMeta"]>(settings["page_meta"]),
    pageCopy: jsonValue<SiteConfig["pageCopy"]>(settings["page_copy"]),
    pageAssets: jsonValue<SiteConfig["pageAssets"]>(settings["page_assets"]),
    brand: jsonValue<SiteConfig["brand"]>(settings["brand"]),
    hero: jsonValue<SiteConfig["hero"]>(settings["hero"]),
    sections: jsonValue<SiteConfig["sections"]>(settings["sections"]),
    contact: jsonValue<SiteConfig["contact"]>(settings["contact"]),
    services: [],
    portfolio: [],
    clients: [],
  };
  for (const item of items) {
    const collectionName = item["collection"];
    const content = item["content"];
    if (typeof collectionName !== "string")
      throw new Error("MySQL content item has invalid collection");
    const collection = collections[collectionName as CollectionName];
    if (!collection) throw new Error(`Unknown MySQL content collection: ${collectionName}`);
    (config[collection] as EditableItem[]).push(jsonValue<EditableItem>(content));
  }
  if (!validConfig(config)) throw new Error("MySQL site content is invalid");
  return config;
}

async function persistStore(document: ContentDocument) {
  const db = database;
  if (!db) throw new Error("MySQL database is not initialized");
  const connection = await db.getConnection();
  const config = document.config;
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO site_settings (id, page_meta, page_copy, page_assets, brand, hero, sections, contact)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE page_meta = VALUES(page_meta), page_copy = VALUES(page_copy), page_assets = VALUES(page_assets), brand = VALUES(brand), hero = VALUES(hero),
         sections = VALUES(sections), contact = VALUES(contact)`,
      [
        JSON.stringify(config.pageMeta),
        JSON.stringify(config.pageCopy),
        JSON.stringify(config.pageAssets),
        JSON.stringify(config.brand),
        JSON.stringify(config.hero),
        JSON.stringify(config.sections),
        JSON.stringify(config.contact),
      ],
    );
    await connection.execute("DELETE FROM content_items");
    for (const collection of Object.keys(collections) as CollectionName[]) {
      const field = collections[collection];
      for (const [position, item] of config[field].entries()) {
        await connection.execute(
          "INSERT INTO content_items (collection, item_id, position, content) VALUES (?, ?, ?, ?)",
          [collection, item.id, position, JSON.stringify(item)],
        );
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function initializeStore() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  const host = env["MYSQL_HOST"]?.trim();
  const user = env["MYSQL_USER"]?.trim();
  const password = env["MYSQL_PASSWORD"];
  const databaseName = env["MYSQL_DATABASE"]?.trim();
  if (!host || !user || password === undefined || !databaseName) {
    throw new Error(
      "MySQL is required: set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.",
    );
  }
  database = createPool({
    host,
    port: Number(env["MYSQL_PORT"] || 3306),
    user,
    password,
    database: databaseName,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: Number(env["MYSQL_POOL_SIZE"] || 10),
    queueLimit: 0,
    enableKeepAlive: true,
  });
  await database.query("SELECT 1");
  await database.query(`CREATE TABLE IF NOT EXISTS site_settings (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    page_meta JSON NOT NULL,
    page_copy JSON NOT NULL,
    page_assets JSON NOT NULL,
    brand JSON NOT NULL,
    hero JSON NOT NULL,
    sections JSON NOT NULL,
    contact JSON NOT NULL,
    CONSTRAINT chk_site_settings_singleton CHECK (id = 1)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await database.query(`CREATE TABLE IF NOT EXISTS content_items (
    collection VARCHAR(32) NOT NULL,
    item_id VARCHAR(191) NOT NULL,
    position INT UNSIGNED NOT NULL,
    content JSON NOT NULL,
    PRIMARY KEY (collection, item_id),
    KEY content_items_order (collection, position)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [hasSettings] = await database.query<import("mysql2").RowDataPacket[]>(
    "SELECT 1 AS present FROM site_settings WHERE id = 1",
  );
  if (hasSettings.length) return;

  let document: ContentDocument;
  try {
    const legacyContentFile = resolve(DATA_DIR, "site-content.json");
    const parsed = JSON.parse(await readFile(legacyContentFile, "utf8")) as ContentDocument;
    if (!parsed || typeof parsed !== "object" || !validConfig(parsed.config))
      throw new Error("Invalid content document");
    const migrated = migrateStoredMedia(parsed);
    document = migrated.document;
  } catch (error) {
    if ((error as { code?: string }).code !== "ENOENT") throw error;
    document = { config: initialConfig };
  }
  await persistStore(document);
}

async function ensureStore(): Promise<ContentDocument> {
  if (!storeInitialization) {
    storeInitialization = initializeStore().catch(async (error) => {
      storeInitialization = undefined;
      await database?.end();
      database = undefined;
      throw error;
    });
  }
  await storeInitialization;
  return { config: await loadConfigFromDatabase() };
}

async function readJson(request: Request, limit = 4 * 1024 * 1024): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > limit) throw new Error("PAYLOAD_TOO_LARGE");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > limit) throw new Error("PAYLOAD_TOO_LARGE");
  return JSON.parse(new TextDecoder().decode(bytes));
}

function validConfig(candidate: unknown): candidate is SiteConfig {
  if (!candidate || typeof candidate !== "object") return false;
  const config = candidate as Partial<SiteConfig>;
  if (
    !config.pageMeta ||
    typeof config.pageMeta !== "object" ||
    !Object.values(config.pageMeta).every(
      (seo) =>
        !!seo &&
        typeof seo.title?.en === "string" &&
        typeof seo.title?.ar === "string" &&
        typeof seo.description?.en === "string" &&
        typeof seo.description?.ar === "string" &&
        typeof seo.ogTitle?.en === "string" &&
        typeof seo.ogTitle?.ar === "string" &&
        typeof seo.ogDescription?.en === "string" &&
        typeof seo.ogDescription?.ar === "string",
    ) ||
    !config.pageCopy ||
    typeof config.pageCopy !== "object" ||
    !config.pageAssets ||
    typeof config.pageAssets !== "object" ||
    !config.brand ||
    !config.hero ||
    !config.sections ||
    !config.contact
  )
    return false;
  if (
    !Object.values(config.pageCopy).every(
      (value) => !!value && typeof value.en === "string" && typeof value.ar === "string",
    )
  )
    return false;
  if (
    !Object.values(config.pageAssets).every(
      (value) => typeof value === "string" && !value.startsWith("data:"),
    )
  )
    return false;
  if (
    !Array.isArray(config.services) ||
    !Array.isArray(config.portfolio) ||
    !Array.isArray(config.clients)
  )
    return false;
  const allItems = [...config.services, ...config.portfolio, ...config.clients] as EditableItem[];
  if (allItems.length > 2000) return false;
  return allItems.every(
    (item) =>
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.name?.en === "string" &&
      typeof item.name?.ar === "string" &&
      typeof item.description?.en === "string" &&
      typeof item.description?.ar === "string" &&
      typeof item.image === "string" &&
      typeof item.enabled === "boolean" &&
      !item.image.startsWith("data:"),
  );
}

function publicConfig(config: SiteConfig): SiteConfig {
  return {
    ...config,
    services: config.services.filter((item) => item.enabled),
    portfolio: config.portfolio.filter((item) => item.enabled),
    clients: config.clients.filter((item) => item.enabled),
  };
}

function mimeExtension(type: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return extensions[type];
}

const uploadCache = new Map<string, { type: string; size: number }>();
const failedLogins = new Map<string, { count: number; expires: number }>();
const typeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function publicOrigin() {
  const configured = env["PUBLIC_SITE_URL"]?.trim() || "https://viralzoom.tech";
  try {
    const url = new URL(configured);
    return url.protocol === "https:" && url.pathname === "/" && !url.username && !url.password
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const origin = publicOrigin();
  if (origin && method === "GET" && url.pathname === "/robots.txt") {
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${origin}/sitemap.xml\n`,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      },
    );
  }
  if (origin && method === "GET" && url.pathname === "/sitemap.xml") {
    const { config } = await ensureStore();
    const paths = [
      "/",
      "/about",
      "/contact",
      "/services",
      "/projects",
      ...config.services.filter((item) => item.enabled).map((item) => `/services/${item.id}`),
      ...config.portfolio
        .filter(
          (item) =>
            item.enabled &&
            item.projectKind !== "external" &&
            !/(?:\s+\(copy\))+$/i.test(item.name.en),
        )
        .map((item) => `/projects/${item.id}`),
    ];
    const uniquePaths = [...new Set(paths)];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePaths
      .map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
      .join("\n")}\n</urlset>\n`;
    return new Response(body, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  if (url.pathname === "/api/health" && method === "GET") {
    await ensureStore();
    return json({ ok: true, runtime: "node", storage: "mysql" });
  }

  if (url.pathname.startsWith("/uploads/")) {
    if (method !== "GET") return json({ error: "Method not allowed" }, 405, { Allow: "GET" });
    const name = url.pathname.slice("/uploads/".length);
    if (!/^[0-9a-f-]+\.(jpg|png|webp|gif|mp4|webm)$/i.test(name))
      return json({ error: "Not found" }, 404);
    const filePath = resolve(UPLOADS_DIR, name);
    if (!filePath.startsWith(`${UPLOADS_DIR}${sep}`)) return json({ error: "Not found" }, 404);
    try {
      const data = await readFile(filePath);
      const meta = uploadCache.get(name);
      const type =
        meta?.type || typeByExtension[extname(name).toLowerCase()] || "application/octet-stream";
      return new Response(data, {
        headers: {
          "content-type": type,
          "content-length": String(data.byteLength),
          "cache-control": "public, max-age=31536000, immutable",
          "x-content-type-options": "nosniff",
        },
      });
    } catch {
      return json({ error: "Not found" }, 404);
    }
  }

  if (!url.pathname.startsWith("/api/")) return null;

  if (url.pathname === "/api/auth/session" && method === "GET") {
    return json({ authenticated: hasSession(request) });
  }

  if (url.pathname === "/api/auth/login" && method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const recent = failedLogins.get(ip);
    if (recent && recent.expires > Date.now() && recent.count >= 8) {
      return json({ error: "Too many attempts. Try again later." }, 429);
    }
    try {
      const body = (await readJson(request, 8192)) as { email?: string; password?: string };
      const expectedEmail = env["ADMIN_EMAIL"] || DEFAULT_ADMIN_EMAIL;
      const expectedPassword = env["ADMIN_PASSWORD"];
      if (!expectedPassword)
        return json({ error: "Admin password is not configured on the server." }, 503);
      if (
        equalSecret((body.email || "").trim().toLowerCase(), expectedEmail.toLowerCase()) &&
        equalSecret(body.password || "", expectedPassword)
      ) {
        failedLogins.delete(ip);
        return json({ authenticated: true }, 200, {
          "set-cookie": createSessionCookie(url.protocol === "https:"),
        });
      }
      const next =
        recent && recent.expires > Date.now()
          ? { ...recent, count: recent.count + 1 }
          : { count: 1, expires: Date.now() + 10 * 60 * 1000 };
      failedLogins.set(ip, next);
      return json({ error: "Invalid email or password." }, 401);
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error && error.message === "PAYLOAD_TOO_LARGE"
              ? "Request too large"
              : "Invalid request",
        },
        400,
      );
    }
  }

  if (url.pathname === "/api/auth/logout" && method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
    return json({ authenticated: false }, 200, {
      "set-cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${url.protocol === "https:" ? "; Secure" : ""}`,
    });
  }

  if (url.pathname === "/api/uploads" && method === "POST") {
    if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > 100 * 1024 * 1024) return json({ error: "Upload is too large" }, 413);
    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Missing file" }, 400);
      const extension = mimeExtension(file.type);
      if (!extension)
        return json({ error: "Unsupported file type. Use JPG, PNG, WebP, GIF, MP4 or WebM." }, 415);
      const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size <= 0 || file.size > maxSize)
        return json({ error: "File exceeds the allowed size." }, 413);
      const name = `${randomUUID()}${extension}`;
      await mkdir(UPLOADS_DIR, { recursive: true });
      await writeFile(resolve(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()), {
        flag: "wx",
        mode: 0o644,
      });
      uploadCache.set(name, { type: file.type, size: file.size });
      return json({ url: `/uploads/${name}`, name, type: file.type, size: file.size }, 201);
    } catch {
      return json({ error: "Upload could not be processed." }, 400);
    }
  }

  const resource = url.pathname.match(/^\/api\/(services|projects|clients)(?:\/([^/]+))?$/);
  if (resource) {
    const collectionName = resource[1] as CollectionName;
    const field = collections[collectionName];
    const id = resource[2] ? decodeURIComponent(resource[2]) : undefined;
    const store = await ensureStore();
    const allCurrent = store.config[field] as EditableItem[];
    const current = hasSession(request) ? allCurrent : allCurrent.filter((item) => item.enabled);
    if (method === "GET") {
      const item = id ? current.find((record) => record.id === id) : current;
      return item ? json(item) : json({ error: "Not found" }, 404);
    }
    if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
    if (method === "POST" && !id) {
      try {
        const body = (await readJson(request)) as Partial<EditableItem>;
        const item = {
          ...body,
          id: typeof body.id === "string" && body.id ? body.id : randomUUID(),
          name: body.name || { en: "New item", ar: "عنصر جديد" },
          description: body.description || { en: "", ar: "" },
          image: typeof body.image === "string" ? body.image : "",
          enabled: body.enabled !== false,
        } as EditableItem;
        const next = { ...store, config: { ...store.config, [field]: [item, ...current] } };
        await persistStore(next);
        return json(item, 201);
      } catch {
        return json({ error: "Invalid content item" }, 400);
      }
    }
    if (method === "PUT" && id) {
      try {
        const patch = (await readJson(request)) as Partial<EditableItem>;
        const index = current.findIndex((record) => record.id === id);
        if (index < 0) return json({ error: "Not found" }, 404);
        const updated = { ...current[index], ...patch, id } as EditableItem;
        const nextItems = [...current];
        nextItems[index] = updated;
        await persistStore({ ...store, config: { ...store.config, [field]: nextItems } });
        return json(updated);
      } catch {
        return json({ error: "Invalid content item" }, 400);
      }
    }
    if (method === "DELETE" && id) {
      const nextItems = current.filter((record) => record.id !== id);
      if (nextItems.length === current.length) return json({ error: "Not found" }, 404);
      await persistStore({ ...store, config: { ...store.config, [field]: nextItems } });
      return json({ deleted: id });
    }
    return json({ error: "Method not allowed" }, 405);
  }

  if (url.pathname === "/api/site" || url.pathname === "/api/content") {
    if (method === "GET") {
      const { config } = await ensureStore();
      return json(hasSession(request) ? config : publicConfig(config));
    }
    if (method === "PUT") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const body = (await readJson(request)) as { config?: unknown };
        const candidate = body && typeof body === "object" && "config" in body ? body.config : body;
        if (!validConfig(candidate)) return json({ error: "Invalid site content structure" }, 422);
        await persistStore({ config: candidate });
        return json({ saved: true });
      } catch (error) {
        return json(
          {
            error:
              error instanceof Error && error.message === "PAYLOAD_TOO_LARGE"
                ? "Content exceeds the allowed size"
                : "Invalid JSON",
          },
          400,
        );
      }
    }
    return json({ error: "Method not allowed" }, 405);
  }

  return json({ error: "Not found" }, 404);
}
