<div align="center">

# ⚡ SnippetVault

**A personal code vault for developers — with built-in version history, diff comparison, instant search, and smart tagging.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Cost](https://img.shields.io/badge/infrastructure%20cost-%240-brightgreen)](https://supabase.com/pricing)

[🚀 Live Demo](#) · [📖 Documentation](./docs/PRD.md) · [🐛 Report Bug](https://github.com/Sangitaswain/Snippet-Vault/issues) · [✨ Request Feature](https://github.com/Sangitaswain/Snippet-Vault/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🧠 About the Project

Developers constantly write, reuse, and evolve small pieces of code — utility functions, regex patterns, SQL templates, config blocks. The problem? That code ends up scattered across text files, Notion docs, GitHub Gists, and notes apps with no syntax highlighting, no search, and no version history.

**SnippetVault** solves this. It's a full-stack web app that acts as your **personal code library with Git-like version control** built in.

> *"Like a personal GitHub Gist — but with commit messages, side-by-side diffs, smart tagging, and a beautiful UI."*

**What makes it different:**

| Problem | SnippetVault Solution |
|---|---|
| Scattered text files | Centralized, searchable vault |
| GitHub Gists — no diff viewer | Version history + line-by-line diff |
| IDE snippets — not portable | Cloud-synced, browser-accessible |
| Notion/Docs — no syntax highlighting | 25+ language syntax highlighting |
| No organization | Tags, filters, and instant search |

**Status:** ✅ Prototype complete and deployed. Built as a Software Engineering course prototype demonstrating full-stack development — authentication, CRUD, real-time search, version control, and diff algorithms.

**Cost:** 💚 **$0** — 100% free-tier infrastructure (Supabase Free Plan + Vercel Hobby Plan). No credit card. Free forever.

---

## ✨ Key Features

### 🔐 Authentication
- Email/password sign-up and login via **Supabase Auth**
- Secure session management with **HTTP-only cookie tokens**
- Route protection via **Next.js Middleware**
- Email confirmation flow + sign-out

### 📝 Snippet Management (Full CRUD)
- Create snippets with **title, description, language, code, and tags**
- View snippets as cards (with 6-line previews) or in a detail panel
- Edit any snippet — metadata or code — with confirmation
- Delete with a confirmation dialog (cascades to versions and tags)

### 🕰️ Version Control System
- Every code edit automatically creates a **new versioned snapshot**
- Auto-incrementing version numbers (`v1`, `v2`, `v3`...)
- Optional **commit messages** (defaults to `"Version N"`)
- Full version history list inside the detail panel
- Browse any historical version's exact content

### ↔️ Side-by-Side Diff Viewer
- Select any two versions from the history panel
- Visual diff with **green lines (added)** and **red lines (removed)**
- Powered by the `diff` library using `diffLines()` algorithm

### 🔍 Instant Search & Filtering
- Full-text search across **title, description, and code content**
- **Debounced input** (300ms) — no page reloads, no lag
- Filter by **language** (chip-based quick filters + full dropdown)
- Filter by **tags** (AND logic — all selected tags must match)
- Combine search + language + tag filters simultaneously

### 🏷️ Smart Tagging
- User-created tags with their own namespace (no collisions)
- Many-to-many relationship (snippets ↔ tags)
- One-click tag filter in the sidebar
- Create tags inline while saving a snippet

### 💻 Code Display
- Syntax highlighting via **prism-react-renderer** (Night Owl theme)
- Supports **25+ languages**: JS, TS, Python, Rust, Go, CSS, HTML, SQL, Bash, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Scala, Haskell, Lua, Perl, R, Assembly, JSON, YAML, Markdown, Plain Text
- **One-click copy to clipboard** — appears on card hover + in detail view
- Visual checkmark confirmation (2-second feedback)

### 🌙 Dark / Light Mode
- System-preference-aware theme detection
- Manual toggle in the sidebar
- Persistent across sessions via `next-themes`

### 🌐 Cross-Device Sync
- All snippets stored securely in **Supabase (PostgreSQL)**
- Sign in from any browser — your entire vault is instantly available

---

## 🛠 Tech Stack

> 💸 **Total infrastructure cost: $0** — every dependency is open-source or free-tier.

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2 | React framework — App Router, API routes, SSR |
| **React** | 19 | UI library |
| **TypeScript** | 5.7 | Static typing (strict mode, no `any`) |
| **Tailwind CSS** | 4.2 | Utility-first styling + custom design tokens |
| **shadcn/ui** | Latest | Radix UI primitives styled with Tailwind |
| **Lucide React** | 0.564 | Icon library |
| **SWR** | 2.2 | Data fetching with caching & revalidation |
| **prism-react-renderer** | 2.4 | Syntax highlighting for 25+ languages |
| **diff** | 7.0 | Line-by-line diff computation |
| **react-hook-form** | 7.54 | Performant form state management |
| **zod** | 3.24 | Runtime schema validation |
| **date-fns** | 4.1 | Lightweight date formatting |
| **next-themes** | 0.4 | Dark/light mode |
| **sonner** | 1.7 | Toast notifications |
| **html-to-image** | 1.11 | Export snippet as image |

### Backend & Infrastructure

| Technology | Purpose | Free Tier |
|---|---|---|
| **Supabase** | PostgreSQL DB + Auth + REST API | 500 MB DB, 50K users |
| **Supabase Auth** | Email/password auth with JWT | 50K monthly active users |
| **@supabase/ssr** | Server-side Supabase client (cookie-based) | — |
| **Vercel** | Hosting & CI/CD deployment | 100 GB bandwidth |
| **Vercel Analytics** | Performance monitoring | 2,500 events/month |

---

## 📁 Project Structure

```
/
├── middleware.ts              ← Route protection + Supabase session refresh
├── app/
│   ├── layout.tsx             ← Root layout (fonts, theme provider, toaster)
│   ├── page.tsx               ← Landing page (hero, features, CTA)
│   ├── globals.css            ← Design tokens + Tailwind configuration
│   ├── auth/
│   │   ├── login/             ← Login page
│   │   ├── sign-up/           ← Sign-up page
│   │   ├── sign-up-success/   ← Post-registration confirmation screen
│   │   └── error/             ← Auth error page
│   ├── dashboard/             ← Main app (CSR, 'use client')
│   └── api/
│       ├── snippets/          ← GET (list+filter), POST (create)
│       │   └── [id]/          ← GET, PUT, DELETE single snippet
│       │       └── versions/  ← GET version history
│       ├── tags/              ← GET, POST tags
│       └── collections/       ← Collections API
├── components/
│   ├── ui/                    ← 57 shadcn/ui primitive components
│   ├── code-editor.tsx        ← Syntax-highlighted editor (read/write modes)
│   ├── command-palette.tsx    ← ⌘K command palette
│   ├── dashboard-header.tsx   ← Top bar with search
│   ├── dashboard-sidebar.tsx  ← Navigation, tag filters, language filters
│   ├── diff-viewer.tsx        ← Side-by-side version diff
│   ├── export-image-modal.tsx ← Export snippet as a shareable image
│   ├── language-filter.tsx    ← Language chip filters
│   ├── scroll-reveal.tsx      ← Scroll-triggered animation wrapper
│   ├── settings-sheet.tsx     ← User settings panel
│   ├── snippet-card.tsx       ← Card with preview + hover actions
│   ├── snippet-detail-panel.tsx ← Right-panel: code view + history
│   ├── snippet-dialog.tsx     ← Create/edit modal with form
│   ├── tag-filter.tsx         ← Tag filter component
│   ├── theme-provider.tsx     ← next-themes wrapper
│   ├── theme-toggle.tsx       ← Dark/light toggle button
│   └── version-history.tsx    ← Version list + diff selection
├── hooks/
│   └── use-debounce.ts        ← 300ms debounce hook for search
├── lib/
│   ├── types.ts               ← Shared TypeScript interfaces + Language enum
│   ├── utils.ts               ← cn() class merging helper
│   └── supabase/
│       ├── client.ts          ← Browser-side Supabase client
│       ├── server.ts          ← Server-side client (API routes)
│       └── middleware.ts      ← Middleware client + updateSession()
├── docs/
│   ├── PRD.md                 ← Product Requirements Document
│   ├── IMPLEMENTATION_PLAN.md ← Step-by-step build plan
│   ├── BACKEND_PLAN.md        ← Architecture, schema, API specs
│   ├── FRONTEND_PLAN.md       ← Component hierarchy, state, styling
│   └── UI_REDESIGN.md         ← Design spec for Phase 2 redesign
└── CLAUDE.md                  ← AI assistant project instructions
```

---

## 🗄 Database Schema

```
auth.users                     ← Managed by Supabase Auth
    │
    ├── snippets
    │   ├── id              UUID (PK)
    │   ├── user_id         UUID (FK → auth.users)
    │   ├── title           text
    │   ├── description     text (nullable)
    │   ├── language        text
    │   ├── current_content text
    │   ├── is_pinned       boolean
    │   ├── is_public       boolean
    │   ├── share_slug      text (nullable)
    │   ├── collection_id   UUID (FK → collections, nullable)
    │   ├── created_at      timestamptz
    │   └── updated_at      timestamptz
    │           │
    │           ├── snippet_versions
    │           │   ├── id              UUID (PK)
    │           │   ├── snippet_id      UUID (FK → snippets)
    │           │   ├── version_number  integer
    │           │   ├── content         text
    │           │   ├── commit_message  text (nullable)
    │           │   └── created_at      timestamptz
    │           │
    │           └── snippet_tags  (junction)
    │               ├── snippet_id  UUID (FK)
    │               └── tag_id      UUID (FK)
    │
    ├── tags
    │   ├── id        UUID (PK)
    │   ├── user_id   UUID (FK → auth.users)
    │   └── name      text
    │
    └── collections
        ├── id        UUID (PK)
        ├── user_id   UUID (FK → auth.users)
        ├── name      text
        └── color     text
```

> All tables have **Row Level Security (RLS)** enabled. All queries are scoped by `user_id` — users can only ever access their own data.

---

## 📡 API Reference

All endpoints require a valid Supabase session cookie. Unauthenticated requests return `401 Unauthorized`.

### Snippets

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/snippets` | `search`, `language`, `tags` | List snippets with optional filters |
| `POST` | `/api/snippets` | — | Create a new snippet (also creates v1) |
| `GET` | `/api/snippets/[id]` | — | Fetch a single snippet with tags |
| `PUT` | `/api/snippets/[id]` | — | Update snippet (code change → new version) |
| `DELETE` | `/api/snippets/[id]` | — | Delete snippet + cascade versions/tags |

### Versions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/snippets/[id]/versions` | Get full version history for a snippet |

### Tags

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tags` | List all tags for the authenticated user |
| `POST` | `/api/tags` | Create a new tag |

### Request / Response Format

**POST `/api/snippets`**
```json
// Request body
{
  "title": "Debounce utility",
  "description": "Generic debounce for any function",
  "language": "typescript",
  "content": "function debounce(...",
  "commitMessage": "Initial version",
  "tagIds": ["uuid-1", "uuid-2"]
}

// Response
{ "snippet": { "id": "...", "title": "...", ... } }
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** account (free) → [supabase.com](https://supabase.com)

### 1. Clone the repository

```bash
git clone https://github.com/Sangitaswain/Snippet-Vault.git
cd Snippet-Vault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following schema:

```sql
-- Snippets table
create table snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  language text not null default 'text',
  current_content text not null default '',
  is_pinned boolean not null default false,
  is_public boolean not null default false,
  share_slug text unique,
  collection_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Snippet versions table
create table snippet_versions (
  id uuid primary key default gen_random_uuid(),
  snippet_id uuid references snippets(id) on delete cascade not null,
  version_number integer not null,
  content text not null,
  commit_message text,
  created_at timestamptz default now()
);

-- Tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Snippet-Tag junction table
create table snippet_tags (
  snippet_id uuid references snippets(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (snippet_id, tag_id)
);

-- Collections table
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table snippets enable row level security;
alter table snippet_versions enable row level security;
alter table tags enable row level security;
alter table snippet_tags enable row level security;
alter table collections enable row level security;

-- RLS Policies
create policy "Users can manage their own snippets"
  on snippets for all using (auth.uid() = user_id);

create policy "Users can manage their own versions"
  on snippet_versions for all using (
    auth.uid() = (select user_id from snippets where id = snippet_id)
  );

create policy "Users can manage their own tags"
  on tags for all using (auth.uid() = user_id);

create policy "Users can manage their own snippet_tags"
  on snippet_tags for all using (
    auth.uid() = (select user_id from snippets where id = snippet_id)
  );

create policy "Users can manage their own collections"
  on collections for all using (auth.uid() = user_id);
```

3. In Project Settings → **Auth**, enable **Email confirmations** if desired.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these values from: **Supabase Dashboard → Project Settings → API**

> ⚠️ Never commit `.env.local` to version control. It's already listed in `.gitignore`.

---

## 💻 Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Type-check + lint
npm run lint

# Build production bundle (must exit 0 before deploying)
npm run build

# Start production server
npm run start
```

---

## 🌐 Deployment

The project is configured for **automatic deployment on Vercel**.

### Deploy to Vercel

1. Push to the `main` branch on GitHub
2. Connect the repository to [Vercel](https://vercel.com) (one-time setup)
3. Add the environment variables in **Vercel → Project → Settings → Environment Variables**
4. Every subsequent push to `main` auto-deploys

```
GitHub push → Vercel builds → Auto-deploys → Live in ~30 seconds
```

### Manual Deploy

```bash
npm install -g vercel
vercel --prod
```

---

## 🔒 Security

| Layer | Mechanism |
|---|---|
| **Authentication** | Supabase Auth — email verification, JWT tokens in HTTP-only cookies |
| **Session Management** | `middleware.ts` refreshes session on every request |
| **API Authorization** | Every route calls `supabase.auth.getUser()` before any DB access |
| **Data Isolation** | All queries include `.eq('user_id', user.id)` — strict per-user scoping |
| **Row Level Security** | Supabase RLS policies enforce access control at the database level |
| **SQL Injection** | Supabase parameterized queries prevent injection attacks |
| **CSRF Protection** | SameSite cookie attributes (handled automatically by `@supabase/ssr`) |
| **Input Validation** | Zod schemas validate all API request bodies |

---

## 🗺 Roadmap

### ✅ Phase 1 — Core Prototype (Complete)
- [x] User authentication (sign-up, login, session management)
- [x] Full snippet CRUD with tag management
- [x] Version control system with automatic versioning
- [x] Side-by-side diff viewer
- [x] Full-text search (debounced) + language + tag filtering
- [x] Syntax highlighting for 25+ languages
- [x] Dark/light mode
- [x] One-click copy to clipboard
- [x] Deployed to Vercel

### 🔄 Phase 2 — Backend + UI Polish (In Progress)
- [ ] Zod input validation on all API routes
- [ ] Verified RLS policy coverage on all tables
- [ ] Single-query JOIN for snippet listing (performance)
- [ ] Success/error toast notifications
- [ ] UI redesign: glassmorphism, violet/cyan design system
- [ ] Landing page redesign (gradient hero)
- [ ] Dashboard & snippet card redesign

### 🔭 Phase 3 — Future Vision *(Not currently planned)*
- [ ] AI auto-tagging (would require OpenAI API)
- [ ] Natural language search with semantic embeddings
- [ ] Collections / folder organization
- [ ] Import from GitHub Gists
- [ ] Public snippet sharing via link
- [ ] VS Code extension
- [ ] Browser extension

---

## 🏗 Development Guidelines

### Code Conventions

| Rule | Detail |
|---|---|
| **TypeScript strict mode** | No `any` types — use interfaces from `lib/types.ts` |
| **Auth check in every API route** | Call `supabase.auth.getUser()` at the top of every handler |
| **User-scoped queries** | Always add `.eq('user_id', user.id)` — never return other users' data |
| **Class composition** | Use the `cn()` helper from `lib/utils.ts` to merge Tailwind classes |
| **Supabase client selection** | Browser components → `client.ts` · API routes → `server.ts` · Middleware → `middleware.ts` |
| **Data sync** | After any create/update/delete, call SWR `mutate()` to refresh the UI |

### Commit Message Format

```
type(scope): short description

Types: feat, fix, chore, docs, style, refactor, test, perf, security, design, deploy
```

**Examples:**
```bash
feat(api): add Zod validation to POST /api/snippets
design(card): apply glassmorphism and hover glow to snippet cards
security: verify RLS is active on all tables in Supabase
fix(search): debounce not clearing on language filter change
```

---

## 📚 Documentation

Full project documentation lives in the [`docs/`](./docs/) folder:

| Document | Description |
|---|---|
| [`docs/PRD.md`](./docs/PRD.md) | Product Requirements Document — vision, users, features, data model, API |
| [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) | Step-by-step build plan with commit messages |
| [`docs/BACKEND_PLAN.md`](./docs/BACKEND_PLAN.md) | Architecture, schema, auth flow, API route specs, security |
| [`docs/FRONTEND_PLAN.md`](./docs/FRONTEND_PLAN.md) | Component hierarchy, state management, SWR, types, styling |
| [`docs/UI_REDESIGN.md`](./docs/UI_REDESIGN.md) | Phase 2 design spec — color palette, glassmorphism, animation specs |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes following the [code conventions](#development-guidelines)
4. Run `npm run lint` and `npm run build` — both must pass
5. Commit using the [commit format](#commit-message-format)
6. Open a Pull Request against `main`

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ by [Sangita Swain](https://github.com/Sangitaswain)**

*Free forever. No credit card. No limits.*

</div>
