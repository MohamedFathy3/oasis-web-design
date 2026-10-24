# Backend وتشغيل Oasis Web Design

يقدّم backend بـ **Node.js** صفحات التطبيق وواجهات API من الأصل نفسه. محتوى CMS يُحفظ في **MySQL** داخل جدولي `site_settings` و`content_items`، والملفات المرفوعة في `DATA_DIR/uploads/`؛ لذلك يرى جميع الزوار التعديلات نفسها. لا تُخزّن بيانات المحتوى أو جلسة المدير في `localStorage`.

## إعداد MySQL وPrisma والبيانات الافتراضية

1. أنشئ قاعدة البيانات من لوحة الاستضافة أولًا؛ المستخدم المشترك لا يحتاج ولا يملك عادة صلاحية `CREATE DATABASE`.

2. انسخ `.env.example` إلى `.env` وضع بيانات الاتصال وكلمة مرور المدير. يجب أن يحتوي `.env` على `DATABASE_URL`، مثل:

```env
DATABASE_URL="mysql://viralzoom:PASSWORD@localhost:3306/viralzoom_oasis_web"
```

3. ثبّت الحزم وطبّق migrations:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
```

4. حمّل البيانات الافتراضية عبر Prisma:

```bash
npx prisma db seed
```

في الاستضافة المشتركة، لا تستخدم `prisma migrate dev` على السيرفر. هذا الأمر مخصص للتطوير المحلي فقط.
بعد نشر تحديثات تغيّر قاعدة البيانات، شغّل `npm run db:migrate` على قاعدة البيانات المستخدمة من التطبيق.

### الاستيراد من phpMyAdmin

قاعدة البيانات التي يستخدمها الإعداد الافتراضي هي `viralzoom`. للاستيراد من phpMyAdmin:

1. أنشئ أو اختر قاعدة `viralzoom`.
2. من تبويب **Import**، ارفع `database/viralzoom_phpmyadmin_shared_host.sql` ثم نفّذ الاستيراد. هذا الملف لا ينشئ قاعدة البيانات أو يختارها تلقائيًا، ولذلك يعمل مع الاستضافات التي لا تسمح بذلك.
3. على MySQL محلي بصلاحية إنشاء قواعد البيانات، يمكن بدلًا منه استيراد `database/viralzoom_phpmyadmin.sql`؛ فهو ينشئ ويختار قاعدة `viralzoom`.

ملفا SQL ينشئان الجداول ويستوردان المحتوى الافتراضي، ويستبدلان محتوى `site_settings` و`content_items`. خذ نسخة احتياطية قبل الاستيراد إذا كانت القاعدة تحتوي على تعديلات تريد الاحتفاظ بها. ملفات الوسائط المرفوعة ليست ضمن قاعدة البيانات.

إذا استوردت الجداول يدويًا وتريد تشغيل أوامر Prisma migrations بعد ذلك لأول مرة، سجّل الـ migration الحالية كـ baseline ثم تحقق:

```bash
npx prisma migrate resolve --applied 20261020142000_init_mysql
npm run db:migrate
```

الطريقة القديمة ما زالت متاحة كخيار احتياطي:

```bash
mysql -u root -p < database/schema.sql
```

```bash
mysql -u oasis_web -p oasis_web < database/seed.sql
```

أو استخدم سكربت MySQL القديم:

```bash
npm run db:seed:legacy
```

يمكن بدل المتغيرات المنفصلة استخدام `MYSQL_URL=mysql://user:password@host:3306/oasis_web`.

يستخدم التطبيق Prisma Client مع MariaDB adapter. ويدعم أيضًا `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` و`MYSQL_CONNECTION_LIMIT` كبديل متوافق؛ لكن أوامر Prisma تحتاج `DATABASE_URL`. يظل `database/default-site-content.json` نسخة البيانات الافتراضية القابلة لإعادة الـ seed.

## تشغيل وبناء الإنتاج

```bash
npm ci
npm run build
npm start
```

الخادم يحتاج Node.js 22.5 أو أحدث. يجب أن تكون MySQL قاعدة مشتركة ودائمة، وأن يكون `DATA_DIR` على قرص دائم للوسائط المرفوعة. احتفظ بنسخة احتياطية من جداول MySQL ومجلد `uploads` معًا.

### إرسال رسائل نموذج التواصل

تُحفظ رسائل نموذج التواصل أولًا في جدول `contact_messages` وتظهر في قسم **الرسائل** داخل `/admin`، حتى إذا تعذر إرسال إشعار البريد. يتطلب ذلك تطبيق Prisma migrations باستخدام `npm run db:migrate`. يمكن للمدير قراءة الرسائل وتعليمها كمقروءة أو حذفها. بعد الحفظ، يحاول التطبيق إرسال إشعار SMTP إلى `CONTACT_EMAIL`؛ فشل الإشعار لا يحذف الرسالة المحفوظة.

أضف إعدادات صندوق البريد في متغيرات بيئة الاستضافة، ولا تضع كلمة مرور البريد في Git:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@viralzoom.agency
SMTP_PASSWORD=كلمة-مرور-صندوق-البريد
CONTACT_EMAIL=info@viralzoom.agency
```

`SMTP_USER` هو عنوان صندوق البريد الذي أُنشئ في Hostinger، وليس كلمة مرور حساب الاستضافة. المنفذ 465 يستخدم اتصال SSL/TLS. أعد تشغيل التطبيق بعد إضافة القيم.

استجابة النجاح تعني أن خادم SMTP قبل الرسالة، ولا تضمن وصولها إلى صندوق الوارد. إذا ظهرت الرسالة كمرسلة ولم تصل، فتحقق من مجلد Spam وسجلات تسليم البريد وإعدادات SPF وDKIM في Hostinger.

لوحة الإدارة: `/admin`. استخدم البريد الموجود في `ADMIN_EMAIL` وكلمة المرور الموجودة في `ADMIN_PASSWORD`. لا تضع كلمة المرور أو `SESSION_SECRET` في Git.

## API

تبقى واجهات API نفسها: `/api/site`, `/api/services`, `/api/projects`, `/api/clients`, `/api/uploads`, `/api/contact`, `/api/auth/*`, `/api/health`, بالإضافة إلى sitemap وrobots الديناميكيين. رسائل التواصل وعمليات إدارتها تتطلب جلسة المدير.

لاختبار API الكامل، جهّز قاعدة MySQL اختبارية ثم شغّل:

```bash
npm run build && MYSQL_DATABASE=oasis_web_test npm run test:api
```
