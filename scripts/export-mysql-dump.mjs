import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

const output = resolve(process.argv[2] || "database/mysql-schema.sql");
const vite = await createServer({
  configFile: resolve("vite.config.ts"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
try {
  const { initialConfig } = await vite.ssrLoadModule("/src/lib/cms.tsx");
  const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
  const sql = [
    "-- Viral Zoom CMS database export",
    "-- Generated from current project source. Choose the target database in phpMyAdmin before import.",
    "-- Requires MySQL 5.7+ or a compatible MariaDB release with JSON support.",
    "SET NAMES utf8mb4;",
    "SET time_zone = '+00:00';",
    "CREATE TABLE IF NOT EXISTS site_settings (",
    "  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,",
    "  page_meta JSON NOT NULL,",
    "  page_copy JSON NOT NULL,",
    "  page_assets JSON NOT NULL,",
    "  brand JSON NOT NULL,",
    "  hero JSON NOT NULL,",
    "  sections JSON NOT NULL,",
    "  contact JSON NOT NULL,",
    "  CONSTRAINT chk_site_settings_singleton CHECK (id = 1)",
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
    "CREATE TABLE IF NOT EXISTS content_items (",
    "  collection VARCHAR(32) NOT NULL,",
    "  item_id VARCHAR(191) NOT NULL,",
    "  position INT UNSIGNED NOT NULL,",
    "  content JSON NOT NULL,",
    "  PRIMARY KEY (collection, item_id),",
    "  KEY content_items_order (collection, position)",
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
  ];
  const pageMeta = JSON.stringify(initialConfig.pageMeta);
  const pageCopy = JSON.stringify(initialConfig.pageCopy);
  const pageAssets = JSON.stringify(initialConfig.pageAssets);
  const brand = JSON.stringify(initialConfig.brand);
  const hero = JSON.stringify(initialConfig.hero);
  const sections = JSON.stringify(initialConfig.sections);
  const contact = JSON.stringify(initialConfig.contact);
  sql.push(
    "INSERT INTO site_settings (id, page_meta, page_copy, page_assets, brand, hero, sections, contact) VALUES (1, " +
      [pageMeta, pageCopy, pageAssets, brand, hero, sections, contact].map(q).join(", ") +
      ") ON DUPLICATE KEY UPDATE page_meta=VALUES(page_meta), page_copy=VALUES(page_copy), page_assets=VALUES(page_assets), brand=VALUES(brand), hero=VALUES(hero), sections=VALUES(sections), contact=VALUES(contact);",
  );
  for (const [collection, field] of [
    ["services", "services"],
    ["projects", "portfolio"],
    ["clients", "clients"],
  ]) {
    for (const [position, item] of initialConfig[field].entries()) {
      sql.push(
        `INSERT INTO content_items (collection, item_id, position, content) VALUES (${q(collection)}, ${q(item.id)}, ${position}, ${q(JSON.stringify(item))}) ` +
          "ON DUPLICATE KEY UPDATE position=VALUES(position), content=VALUES(content);",
      );
    }
  }
  sql.push(
    "-- Imported items in the collections above are safe to re-import; existing extra records are preserved.",
    "",
  );
  await mkdir(resolve(output, ".."), { recursive: true });
  await writeFile(output, sql.join("\n"), "utf8");
  console.log(
    `Wrote ${output} with ${initialConfig.services.length} services, ${initialConfig.portfolio.length} projects, ${initialConfig.clients.length} clients, and ${Object.keys(initialConfig.pageCopy).length} bilingual page strings.`,
  );
} finally {
  await vite.close();
}
