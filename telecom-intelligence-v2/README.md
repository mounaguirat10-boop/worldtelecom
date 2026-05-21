# TelecomIntelligence — WORLD TELECOM Dashboard

A comprehensive digital dashboard for telecom management, built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard** — KPIs, revenue charts, customer growth, network performance
- 📈 **BI Analytics** — Revenue analytics, market share, ARPU/NPS trends
- 🤖 **AI Intelligence** — AI chatbot, investment recommendations, computer vision QC
- 📦 **Inventory** — Stock levels, supply chain, barcode scanner
- 🌐 **Network Ops** — Bandwidth, uptime monitoring, incident tracking
- 💬 **Customer Experience** — NPS, support tickets, satisfaction trends
- 🔔 **Notifications** — Real-time notification feed
- 📧 **Email** — Compose, inbox, drafts, filters
- 🗄️ **Data Management** — Full CRUD for all entities

## Multilingual
Supports **Arabic (RTL)**, **French**, and **English** with automatic direction switching.

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Prisma](https://www.prisma.io/) + SQLite — Database
- [Recharts](https://recharts.org/) — Charts
- [Framer Motion](https://www.framer.com/motion/) — Animations

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [Bun](https://bun.sh/) (recommended) or npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/telecom-intelligence.git
cd telecom-intelligence

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up the database
bun run db:push
# or: npm run db:push

# Start development server
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun run start
```

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (REST)
│   ├── globals.css   # Global styles & dark theme
│   ├── layout.tsx    # Root layout (RTL/LTR)
│   └── page.tsx      # Main page with sidebar navigation
├── components/
│   ├── telecom/      # Dashboard section components
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks
└── lib/
    ├── db.ts         # Prisma client
    ├── i18n/         # Translations (AR/FR/EN)
    └── utils.ts
prisma/
└── schema.prisma     # Database schema
```

## License

MIT
