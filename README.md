# Viral Zoom — Website

Arabic/English creative and digital marketing website built with React, TanStack Start, and a Node.js SSR/API server. Published page copy, SEO/social metadata, page media URLs, services, projects, clients, and contact data are served from MySQL; administrators edit them in `/admin`.

## Local development

```bash
cp .env.example .env
# Set MySQL credentials and new admin/session secrets in .env.
npm install
npm run dev
```

## MySQL database

Import [`database/mysql-schema.sql`](./database/mysql-schema.sql) into your MySQL database before starting the production server. It contains the current repository's seed data. Configure `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` at runtime. To rebuild the SQL export from source, use `npm run db:export`.

## Production

```bash
npm run build
npm start
```

See [`BACKEND.md`](./BACKEND.md) for MySQL import, environment configuration, hosting steps, API details, media storage and backups. The host must run Node.js 22.5 or newer and provide a persistent directory for uploaded media.
