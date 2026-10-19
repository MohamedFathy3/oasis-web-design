# Backend and Node.js + MySQL deployment

The site runs on a Node.js SSR/API server. MySQL is the operational source of public site content: bilingual text for every public route, per-route SEO/social metadata, page media URLs, brand identity, homepage settings, contact data, services, projects, client records and nested galleries/showcases. Public routes are rendering templates; their published content and detail-page SEO are loaded from MySQL-backed server functions. `/admin` edits and saves the CMS document through authenticated APIs. `localStorage` is not used as the published-content source. Uploaded images/videos are saved under `DATA_DIR/uploads/`, with URLs stored in MySQL. Bundled site media under `public/media/` must be deployed along with the code.

## MySQL import

1. Create an empty MySQL database with `utf8mb4` (for example `viralzoom`) and a restricted user with privileges on that database.
2. Import [`database/mysql-schema.sql`](./database/mysql-schema.sql) in phpMyAdmin or the host's MySQL import tool. It contains the schema and a snapshot of the website data currently in this repository: per-route bilingual SEO data, all default bilingual copy, brand and homepage configuration, services, projects, clients, galleries, social showcase entries, contact values and media URLs. It contains no credentials.
3. Set the connection variables in the server environment. Do not put the real `.env` in Git.

Regenerate the SQL snapshot from source after editing the default CMS seed with:

```bash
npm run db:export
```

The generated SQL uses upserts for records represented in the seed. Re-importing it updates those seeded rows to the current seed values, while additional content records are preserved. Back up the database before importing an updated snapshot into an existing site.

## Environment

Copy `.env.example` and configure `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and optionally `MYSQL_POOL_SIZE`. Also set a new strong `ADMIN_PASSWORD`, a random `SESSION_SECRET` of at least 32 characters, and the real `PUBLIC_SITE_URL`. `DATA_DIR` stores uploaded files only; it must be on persistent disk and backed up separately from MySQL.

The project requires Node.js 22.5 or newer. Install dependencies, build and run:

```bash
npm install
npm run build
npm start
```

For local development use `npm run dev`. Configure the hosting control panel's Node application/root and startup command to point to the project and `npm start`; keep the process running behind the provider's reverse proxy. The API health endpoint is `GET /api/health` and reports `storage: mysql` after a successful connection.

## CMS and API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Node/MySQL service status |
| GET | `/api/auth/session` | Public | Admin session status |
| POST | `/api/auth/login` | Public | Admin login; sets an HttpOnly cookie |
| POST | `/api/auth/logout` | Session | End admin session |
| GET/PUT | `/api/site` | Public/admin | Read published CMS or save full CMS document |
| GET/POST/PUT/DELETE | `/api/services` | Public/admin | Service records |
| GET/POST/PUT/DELETE | `/api/projects` | Public/admin | Project records |
| GET/POST/PUT/DELETE | `/api/clients` | Public/admin | Client records |
| POST | `/api/uploads` | Admin | JPG/PNG/WebP/GIF (10 MB) or MP4/WebM (100 MB) |
| GET | `/uploads/:filename` | Public | Uploaded media |
| GET | `/sitemap.xml`, `/robots.txt` | Public | SEO discovery endpoints |

`/admin` is the content management interface. The **Page copy** section edits bilingual text, SEO/social metadata and page media for all pages; homepage, brand, contact and the services/projects/clients sections have their own controls. Detail-page SEO is derived from the corresponding MySQL record's bilingual name and description. Use the server-configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`; do not deploy the sample password.

## Tests

Run `npm test` for routing/unit tests. The API integration suite requires a dedicated, disposable test database; do not point it at a production database. Set `MYSQL_TEST_HOST`, `MYSQL_TEST_PORT`, `MYSQL_TEST_DATABASE`, `MYSQL_TEST_USER`, and `MYSQL_TEST_PASSWORD`, then run `npm run build && npm run test:api`. The test refuses database names that do not clearly include `test`, `_ci`, or `_tmp`. Without those variables, the integration test reports that it was skipped.

## Backups and SEO

Back up MySQL with the hosting provider's export or `mysqldump`, and back up `DATA_DIR/uploads/` separately. After deployment, verify the actual HTTPS origin, then submit `https://your-domain.example/sitemap.xml` in Google Search Console after domain ownership verification.
