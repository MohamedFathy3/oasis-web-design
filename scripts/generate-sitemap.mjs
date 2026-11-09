import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const configuredOrigin =
  (process.env.PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL)?.trim() ||
  "https://viralzoom.agency";

let origin;
try {
  const parsed = new URL(configuredOrigin);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/"
  ) {
    throw new Error("Use a public HTTPS origin only, without credentials or a path.");
  }
  origin = parsed.origin;
} catch (error) {
  console.error(
    `Invalid PUBLIC_SITE_URL: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}

const servicesSource = await readFile("src/lib/showcase-data.ts", "utf8");
const projectsSource = await readFile("src/lib/projects.ts", "utf8");
const starPlusSource = await readFile("src/lib/starplus-projects.ts", "utf8");
const serviceSlugs = [...servicesSource.matchAll(/slug:\s*"([^"]+)"/g)].map(
  (match) => `/services/${match[1]}`,
);
const projectSlugs = [projectsSource, starPlusSource].flatMap((source) =>
  [...source.matchAll(/slug:\s*"([^"]+)"/g)].map(
    (match) => `/projects/${encodeURIComponent(match[1])}`,
  ),
);
const paths = [
  ...new Set([
    "/",
    "/about",
    "/contact",
    "/services",
    "/projects",
    ...serviceSlugs,
    ...projectSlugs,
  ]),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
  .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
const outputDir = existsSync(".output/public")
  ? ".output/public"
  : existsSync("dist/client")
    ? "dist/client"
    : "dist";
await writeFile(resolve(outputDir, "sitemap.xml"), xml);
const robotsPath = resolve(outputDir, "robots.txt");
const robots = await readFile(robotsPath, "utf8").catch(
  () => "User-agent: *\nAllow: /\nDisallow: /admin\n",
);
const robotsWithoutSitemap = robots.replace(/^Sitemap:.*\n?/gim, "").trimEnd();
await writeFile(robotsPath, `${robotsWithoutSitemap}\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated ${paths.length} sitemap URLs for ${origin} in ${outputDir}.`);
