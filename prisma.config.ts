import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  `mysql://${encodeURIComponent(process.env.MYSQL_USER || "root")}:${encodeURIComponent(process.env.MYSQL_PASSWORD || "")}@${process.env.MYSQL_HOST || "127.0.0.1"}:${process.env.MYSQL_PORT || "3306"}/${encodeURIComponent(process.env.MYSQL_DATABASE || "viralzoom")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
