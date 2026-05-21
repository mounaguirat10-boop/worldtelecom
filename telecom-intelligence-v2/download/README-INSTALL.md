# 🌐 WORLD TELECOM - TelecomIntelligence

## التثبيت / Installation

### 1. تثبيت الحزم / Installer les dépendances
```bash
npm install
# أو / ou
bun install
```

### 2. إعداد قاعدة البيانات / Configurer la base de données
```bash
npx prisma generate
npx prisma db push
```

### 3. بناء المشروع / Build le projet
```bash
npx next build
```

### 4. تشغيل الخادم / Démarrer le serveur

**وضع التطوير / Mode développement :**
```bash
npx next dev -p 3000 -H 0.0.0.0
```

**وضع الإنتاج / Mode production :**
```bash
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js
```

### 5. الوصول / Accès
- **مباشر / Direct** : http://localhost:3000
- **عبر Caddy / Via Caddy** : http://localhost:81

---

## الأقسام / Sections

| القسم | Description |
|-------|-------------|
| 📊 لوحة القيادة | Dashboard - إحصائيات ديناميكية |
| 📈 تحليلات الأعمال | BI Analytics - رسوم بيانية |
| 🤖 الذكاء الاصطناعي | AI Intelligence - مساعد ذكي |
| 📦 إدارة المخزون | Inventory - إدارة المنتجات |
| 📷 Scanner Produit | مسح الباركود |
| 🌐 عمليات الشبكة | Network Ops - مراقبة الشبكة |
| ❤️ تجربة العملاء | Customer Experience - تذاكر دعم |
| 🔔 الإشعارات | Notifications - تنبيهات |
| 📧 البريد الإلكتروني | Email - رسائل ومسودات |
| 🗄️ إدارة البيانات | Data Management - مركز بيانات |

## اللغات / Langues
- 🇹🇳 العربية (RTL)
- 🇫🇷 Français (LTR)
- 🇬🇧 English (LTR)

## التقنيات / Technologies
- Next.js 16 + TypeScript
- Prisma + SQLite
- Tailwind CSS 4 + shadcn/ui
- Recharts + Framer Motion
- i18n (AR/FR/EN)
