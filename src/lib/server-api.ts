import { createHmac, randomBytes, timingSafeEqual, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import { env } from "node:process";
import { createTransport } from "nodemailer";
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
let database: PrismaClient | undefined;
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

async function getDatabase(): Promise<PrismaClient> {
  if (database) return database;
  if (!env["DATABASE_URL"] && env["MYSQL_URL"]) {
    env["DATABASE_URL"] = env["MYSQL_URL"];
  }
  if (!env["DATABASE_URL"]) {
    const user = encodeURIComponent(env["MYSQL_USER"] || "root");
    const password = encodeURIComponent(env["MYSQL_PASSWORD"] || "");
    const host = env["MYSQL_HOST"] || "127.0.0.1";
    const port = env["MYSQL_PORT"] || "3306";
    const databaseName = encodeURIComponent(env["MYSQL_DATABASE"] || "viralzoom");
    env["DATABASE_URL"] = `mysql://${user}:${password}@${host}:${port}/${databaseName}`;
  }
  const connectionUrl = env["DATABASE_URL"] || env["MYSQL_URL"];
  const parsed = connectionUrl ? new URL(connectionUrl) : null;
  const adapter = new PrismaMariaDb({
    host: parsed?.hostname || env["MYSQL_HOST"] || "127.0.0.1",
    port: Number(parsed?.port || env["MYSQL_PORT"] || 3306),
    user: decodeURIComponent(parsed?.username || env["MYSQL_USER"] || "root"),
    password: decodeURIComponent(parsed?.password || env["MYSQL_PASSWORD"] || ""),
    database: decodeURIComponent(
      parsed?.pathname.replace(/^\//, "") || env["MYSQL_DATABASE"] || "viralzoom",
    ),
    connectionLimit: Number(env["MYSQL_CONNECTION_LIMIT"] || 10),
  });
  database = new PrismaClient({ adapter });
  return database;
}

async function loadConfigFromDatabase(): Promise<SiteConfig> {
  const db = await getDatabase();
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error("MySQL site settings are missing");
  const { brand, hero, sections, contact, content } = settings;
  if (![brand, hero, sections, contact, content].every((value) => typeof value === "string")) {
    throw new Error("MySQL site settings have invalid values");
  }
  const itemRows = await db.contentItem.findMany({
    orderBy: [{ collection: "asc" }, { position: "asc" }, { itemId: "asc" }],
  });
  const parsedContact: unknown = JSON.parse(contact as string);
  if (!parsedContact || typeof parsedContact !== "object" || Array.isArray(parsedContact))
    throw new Error("MySQL contact settings are invalid");
  const contactSettings = parsedContact as SiteConfig["contact"];
  let contactChanged = false;
  if (contactSettings.email === "info@viralzoom.com") {
    contactSettings.email = "info@viralzoom.agency";
    contactChanged = true;
  }
  if (!contactSettings.phone || contactSettings.phone === "01064621943") {
    contactSettings.phone = "01222291024";
    contactChanged = true;
  }
  const config: SiteConfig = {
    brand: JSON.parse(brand as string),
    hero: JSON.parse(hero as string),
    sections: JSON.parse(sections as string),
    contact: contactSettings,
    content: JSON.parse(content as string),
    services: [],
    portfolio: [],
    clients: [],
  };
  for (const item of itemRows) {
    const collection = collections[item.collection as CollectionName];
    if (!collection) throw new Error(`Unknown MySQL content collection: ${item.collection}`);
    (config[collection] as EditableItem[]).push(JSON.parse(item.content) as EditableItem);
  }
  if (!validConfig(config)) throw new Error("MySQL site content is invalid");
  if (contactChanged) {
    await db.siteSettings.update({
      where: { id: 1 },
      data: { contact: JSON.stringify(contactSettings) },
    });
  }
  return config;
}

async function persistStore(document: ContentDocument) {
  const db = await getDatabase();
  const config = document.config;
  await db.$transaction(async (tx) => {
    await tx.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        brand: JSON.stringify(config.brand),
        hero: JSON.stringify(config.hero),
        sections: JSON.stringify(config.sections),
        contact: JSON.stringify(config.contact),
        content: JSON.stringify(config.content),
      },
      update: {
        brand: JSON.stringify(config.brand),
        hero: JSON.stringify(config.hero),
        sections: JSON.stringify(config.sections),
        contact: JSON.stringify(config.contact),
        content: JSON.stringify(config.content),
      },
    });
    await tx.contentItem.deleteMany();
    const rows = (Object.keys(collections) as CollectionName[]).flatMap((collection) => {
      const field = collections[collection];
      return config[field].map((item, position) => ({
        collection,
        itemId: item.id,
        position,
        content: JSON.stringify(item),
      }));
    });
    await tx.contentItem.createMany({ data: rows });
  });
}

async function initializeStore() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  const db = await getDatabase();
  const existing = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return;

  let document: ContentDocument;
  try {
    const parsed = JSON.parse(await readFile(LEGACY_CONTENT_FILE, "utf8")) as ContentDocument;
    if (!parsed || typeof parsed !== "object" || !validConfig(parsed.config))
      throw new Error("Invalid content document");
    const migrated = migrateStoredMedia(parsed);
    document = {
      config: {
        ...migrated.document.config,
        content: migrated.document.config.content ?? initialConfig.content,
      },
    };
  } catch (error) {
    if ((error as { code?: string }).code !== "ENOENT") throw error;
    document = { config: initialConfig };
  }
  await persistStore(document);
}
async function ensureStore(): Promise<ContentDocument> {
  if (!storeInitialization) {
    storeInitialization = initializeStore().catch((error) => {
      storeInitialization = undefined;
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
  if (!config.brand || !config.hero || !config.sections || !config.contact) return false;
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
const contactAttempts = new Map<string, { count: number; expires: number }>();
const typeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function publicOrigin() {
  const configured = env["PUBLIC_SITE_URL"]?.trim() || "https://viralzoom.agency";
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

  if (url.pathname === "/api/contact" && method === "GET") {
    if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
    const db = await getDatabase();
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return json({
      messages,
      unreadCount: messages.filter((message) => !message.isRead).length,
    });
  }

  const contactMessageResource = url.pathname.match(/^\/api\/contact\/([^/]+)$/);
  if (contactMessageResource) {
    if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
    const id = contactMessageResource[1]!;
    if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id))
      return json({ error: "Not found" }, 404);
    const db = await getDatabase();

    if (method === "PATCH") {
      let body: unknown;
      try {
        body = await readJson(request, 1024);
      } catch {
        return json({ error: "Invalid request" }, 400);
      }
      if (
        !body ||
        typeof body !== "object" ||
        typeof (body as { isRead?: unknown }).isRead !== "boolean"
      )
        return json({ error: "Invalid request" }, 400);
      const result = await db.contactMessage.updateMany({
        where: { id },
        data: { isRead: (body as { isRead: boolean }).isRead },
      });
      return result.count ? json({ updated: true }) : json({ error: "Not found" }, 404);
    }

    if (method === "DELETE") {
      const result = await db.contactMessage.deleteMany({ where: { id } });
      return result.count ? json({ deleted: true }) : json({ error: "Not found" }, 404);
    }

    return json({ error: "Method not allowed" }, 405, { Allow: "PATCH, DELETE" });
  }

  if (url.pathname === "/api/contact") {
    if (method !== "POST")
      return json({ error: "Method not allowed" }, 405, { Allow: "GET, POST" });
    if (!request.headers.has("origin") || !sameOrigin(request))
      return json({ error: "Invalid origin" }, 403);

    let body: unknown;
    try {
      body = await readJson(request, 12 * 1024);
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === "PAYLOAD_TOO_LARGE";
      return json(
        { error: tooLarge ? "Request too large" : "Invalid request" },
        tooLarge ? 413 : 400,
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return json({ error: "Invalid request" }, 400);
    const submission = body as Record<string, unknown>;
    if (typeof submission["website"] === "string" && submission["website"].trim())
      return json({ sent: true });

    const { name, email, subject, message } = submission;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 120 ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof subject !== "string" ||
      subject.length > 160 ||
      /[\r\n]/.test(subject) ||
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 5000
    ) {
      return json({ error: "Please check the contact form fields." }, 422);
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const recent = contactAttempts.get(ip);
    if (recent && recent.expires > now && recent.count >= 5)
      return json({ error: "Too many messages. Please try again later." }, 429);
    if (contactAttempts.size > 10000) {
      for (const [key, attempt] of contactAttempts) {
        if (attempt.expires <= now) contactAttempts.delete(key);
      }
    }
    contactAttempts.set(
      ip,
      recent && recent.expires > now
        ? { count: recent.count + 1, expires: recent.expires }
        : { count: 1, expires: now + 10 * 60 * 1000 },
    );

    const db = await getDatabase();
    await db.contactMessage.create({
      data: {
        id: randomUUID(),
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    const smtpUser = env["SMTP_USER"]?.trim();
    const smtpPassword = env["SMTP_PASSWORD"];
    const host = env["SMTP_HOST"]?.trim() || "smtp.hostinger.com";
    const port = Number(env["SMTP_PORT"] || 465);
    const recipient = env["CONTACT_EMAIL"]?.trim() || "info@viralzoom.agency";
    const smtpConfigured =
      !!smtpUser &&
      !!smtpPassword?.trim() &&
      !!host &&
      Number.isInteger(port) &&
      port >= 1 &&
      port <= 65535 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
    if (!smtpConfigured) {
      console.warn(
        "Contact message saved to the dashboard; SMTP email notification is not configured.",
      );
      return json({ sent: true, emailSent: false }, 201);
    }

    try {
      const transport = createTransport({
        host,
        port,
        secure: port === 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: { user: smtpUser, pass: smtpPassword },
      });
      const info = await transport.sendMail({
        from: smtpUser,
        to: recipient,
        replyTo: { name: name.trim(), address: email.trim() },
        subject: `Website contact: ${subject.trim() || "New message"}`,
        text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
      });
      const acceptedBySmtp = info.accepted.some(
        (address) => address.toLowerCase() === recipient.toLowerCase(),
      );
      if (!acceptedBySmtp) {
        console.error("Contact email was not accepted by the SMTP server.", {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
        });
        return json({ sent: true, emailSent: false }, 201);
      }
      return json({ sent: true, emailSent: true }, 201);
    } catch (error) {
      console.error("Contact email delivery failed:", error);
      return json({ sent: true, emailSent: false }, 201);
    }
  }

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
