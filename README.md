# Oasis Web Design

موقع Oasis Web Design ثنائي اللغة (عربي/إنجليزي) مع صفحات ديناميكية وCMS ولوحة إدارة على `/admin`.

## التقنية

- React + TanStack Start + Vite
- Node.js backend من نفس الأصل
- MySQL لتخزين إعدادات الموقع والخدمات والمشاريع والعملاء
- رفع الوسائط إلى `DATA_DIR/uploads/`

## التشغيل السريع

```bash
cp .env.example .env
npm ci
mysql -u root -p < database/schema.sql
mysql -u oasis_web -p oasis_web < database/seed.sql
npm run dev
```

تفاصيل إعداد الإنتاج موجودة في [`BACKEND.md`](./BACKEND.md). ملفات قاعدة البيانات الجاهزة موجودة في [`database/schema.sql`](./database/schema.sql) و[`database/default-site-content.json`](./database/default-site-content.json)، وسكربت تعبئة البيانات في [`scripts/seed-mysql.mjs`](./scripts/seed-mysql.mjs).
