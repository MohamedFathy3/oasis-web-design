import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const parsed = connectionUrl ? new URL(connectionUrl) : null;
const adapter = new PrismaMariaDb({
  host: parsed?.hostname || process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(parsed?.port || process.env.MYSQL_PORT || 3306),
  user: decodeURIComponent(parsed?.username || process.env.MYSQL_USER || "root"),
  password: decodeURIComponent(parsed?.password || process.env.MYSQL_PASSWORD || ""),
  database: decodeURIComponent(
    parsed?.pathname.replace(/^\//, "") || process.env.MYSQL_DATABASE || "viralzoom",
  ),
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
});
const prisma = new PrismaClient({ adapter });
const contentPath =
  process.env.DEFAULT_CONTENT_FILE ||
  new URL("../database/default-site-content.json", import.meta.url);
const document = JSON.parse(await readFile(contentPath, "utf8")) as {
  config: {
    brand: unknown;
    hero: unknown;
    sections: unknown;
    contact: unknown;
    content: unknown;
    services: Array<{ id: string }>;
    portfolio: Array<{ id: string }>;
    clients: Array<{ id: string }>;
  };
};
const { config } = document;

try {
  await prisma.$transaction(async (tx) => {
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
    const rows = [
      ...config.services.map((item, position) => ({
        collection: "services",
        itemId: item.id,
        position,
        content: JSON.stringify(item),
      })),
      ...config.portfolio.map((item, position) => ({
        collection: "projects",
        itemId: item.id,
        position,
        content: JSON.stringify(item),
      })),
      ...config.clients.map((item, position) => ({
        collection: "clients",
        itemId: item.id,
        position,
        content: JSON.stringify(item),
      })),
    ];
    await tx.contentItem.createMany({ data: rows });
  });
  console.log(
    `Seeded MySQL with Prisma: ${config.services.length} services, ${config.portfolio.length} projects, ${config.clients.length} clients.`,
  );
} finally {
  await prisma.$disconnect();
}
