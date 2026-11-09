import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";

const root = process.cwd();
const dataDir = await mkdtemp(join(tmpdir(), "viral-zoom-api-"));
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close((error) => (error ? reject(error) : resolve(address.port)));
  });
});
const password = `integration-${randomUUID()}-Strong!`;
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    NITRO_HOST: "127.0.0.1",
    NITRO_PORT: String(port),
    ADMIN_EMAIL: "admin@admin.com",
    ADMIN_PASSWORD: password,
    SESSION_SECRET: randomUUID() + randomUUID(),
    DATA_DIR: dataDir,
    MYSQL_URL: process.env.MYSQL_URL,
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    PUBLIC_SITE_URL: "https://viralzoom-test.invalid",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (data) => (serverOutput += data));
server.stderr.on("data", (data) => (serverOutput += data));
const base = `http://127.0.0.1:${port}`;

async function waitUntilReady() {
  const started = Date.now();
  while (Date.now() - started < 15_000) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    if (server.exitCode !== null) throw new Error(`Server exited early.\n${serverOutput}`);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Server did not become ready.\n${serverOutput}`);
}

async function expectStatus(response, status, label) {
  assert.equal(response.status, status, `${label}: expected ${status}, got ${response.status}`);
}

try {
  await waitUntilReady();

  const health = await fetch(`${base}/api/health`).then((response) => response.json());
  assert.equal(health.ok, true);
  assert.equal(health.runtime, "node");
  assert.equal(health.storage, "mysql");

  const publicConfig = await fetch(`${base}/api/site`).then((response) => response.json());
  assert.equal(
    publicConfig.sections.services,
    false,
    "Services should be hidden by default on the homepage",
  );
  assert.ok(publicConfig.portfolio.length > 0, "Public content should include published projects");

  const deniedWrite = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(publicConfig),
  });
  await expectStatus(deniedWrite, 401, "Unauthenticated content write");

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.invalid",
    },
    body: JSON.stringify({ email: "admin@admin.com", password }),
  });
  await expectStatus(login, 403, "Cross-origin admin login");

  const trustedLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://viralzoom-test.invalid",
    },
    body: JSON.stringify({ email: "admin@admin.com", password }),
  });
  await expectStatus(trustedLogin, 200, "Admin login through configured public origin");
  const setCookie = trustedLogin.headers.get("set-cookie");
  assert.ok(setCookie?.includes("HttpOnly"), "Session cookie should be HttpOnly");
  const cookie = setCookie.split(";")[0];
  const adminConfig = await fetch(`${base}/api/site`, { headers: { cookie } }).then((response) =>
    response.json(),
  );
  assert.ok(
    adminConfig.portfolio.length >= publicConfig.portfolio.length,
    "Admin should see the full project collection",
  );

  const savedConfig = structuredClone(adminConfig);
  savedConfig.sections.services = true;
  const save = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      cookie,
      origin: "https://viralzoom-test.invalid",
    },
    body: JSON.stringify({ config: savedConfig }),
  });
  await expectStatus(save, 200, "Authenticated content save");
  const persistedConfig = await fetch(`${base}/api/site`, { headers: { cookie } }).then(
    (response) => response.json(),
  );
  assert.equal(persistedConfig.sections.services, true, "CMS content should persist on the server");

  const project = {
    id: "integration-test-project",
    name: { en: "Integration Test", ar: "اختبار تكامل" },
    description: { en: "Test description", ar: "وصف تجريبي" },
    image: "",
    enabled: true,
    projectKind: "case-study",
    projectCategory: "social-media",
    imageGallery: [],
  };
  const createProject = await fetch(`${base}/api/projects`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(project),
  });
  await expectStatus(createProject, 201, "Project CRUD create");
  assert.equal((await createProject.json()).projectCategory, "social-media");

  const form = new FormData();
  form.set(
    "file",
    new Blob([Buffer.from("small-image-fixture")], { type: "image/png" }),
    "fixture.png",
  );
  const upload = await fetch(`${base}/api/uploads`, {
    method: "POST",
    headers: { cookie },
    body: form,
  });
  await expectStatus(upload, 201, "Media upload");
  const uploaded = await upload.json();
  assert.ok(uploaded.url.startsWith("/uploads/"));
  const media = await fetch(new URL(uploaded.url, base));
  await expectStatus(media, 200, "Uploaded media delivery");
  assert.equal(media.headers.get("content-type"), "image/png");

  const sitemap = await fetch(`${base}/sitemap.xml`).then((response) => response.text());
  assert.ok(sitemap.includes("https://viralzoom-test.invalid/projects/integration-test-project"));
  const robots = await fetch(`${base}/robots.txt`).then((response) => response.text());
  assert.ok(robots.includes("Disallow: /admin"));

  console.log(
    "API integration passed: MySQL persistence, health, guest write protection, admin session, persisted CMS edits, project CRUD, media upload, dynamic sitemap and robots rules.",
  );
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    if (server.exitCode !== null) return resolve();
    server.once("exit", resolve);
    setTimeout(resolve, 2_000).unref();
  });
  await rm(dataDir, { recursive: true, force: true });
}
