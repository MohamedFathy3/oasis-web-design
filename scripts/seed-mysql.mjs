import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const contentPath =
  process.env.DEFAULT_CONTENT_FILE ||
  new URL("../database/default-site-content.json", import.meta.url);
const document = JSON.parse(await readFile(contentPath, "utf8"));
const config = document.config;
const pool = mysql.createPool(
  process.env.MYSQL_URL || {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "oasis_web",
    charset: "utf8mb4",
  },
);
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.execute(
    "INSERT INTO site_settings (id, brand, hero, sections, contact, content) VALUES (1, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE brand=VALUES(brand), hero=VALUES(hero), sections=VALUES(sections), contact=VALUES(contact), content=VALUES(content)",
    [
      JSON.stringify(config.brand),
      JSON.stringify(config.hero),
      JSON.stringify(config.sections),
      JSON.stringify(config.contact),
      JSON.stringify(config.content),
    ],
  );
  await connection.execute("DELETE FROM content_items");
  for (const [collection, field] of [
    ["services", "services"],
    ["projects", "portfolio"],
    ["clients", "clients"],
  ]) {
    for (const [position, item] of config[field].entries()) {
      await connection.execute(
        "INSERT INTO content_items (collection, item_id, position, content) VALUES (?, ?, ?, ?)",
        [collection, item.id, position, JSON.stringify(item)],
      );
    }
  }
  await connection.commit();
  console.log(
    `Seeded MySQL: ${config.services.length} services, ${config.portfolio.length} projects, ${config.clients.length} clients.`,
  );
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
