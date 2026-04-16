# SnippetVault — Complete Viva Preparation Guide

**Project:** SnippetVault — Code Snippet Manager with Version Control  
**Course:** Software Engineering (College Project)  
**Stack:** Next.js · TypeScript · Supabase · PostgreSQL · Vercel  

---

> **How to use this doc:** Read each section. For Q&A sections, cover the answer and say it out loud before checking. The viva examiner will likely jump around topics — know every section, not just the ones that feel comfortable.

---

## TABLE OF CONTENTS

1. [Project Pitch (30-second answer)](#1-project-pitch)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [What Does the Project Do — Feature by Feature](#3-what-does-the-project-do)
4. [User Flow (What the user actually does)](#4-user-flow)
5. [System Architecture Flow](#5-system-architecture-flow)
6. [Tech Stack — What, Why, Why Not Alternatives](#6-tech-stack)
7. [Database Design Questions](#7-database-design)
8. [API Design Questions](#8-api-design)
9. [Authentication & Security Questions](#9-authentication--security)
10. [Version Control — The Core Feature](#10-version-control--the-core-feature)
11. [GitHub & Git Commands — Viva Questions](#11-github--git-commands)
12. [Frontend Questions](#12-frontend-questions)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Possible Trick Questions & Edge Cases](#14-possible-trick-questions)
15. [Code Snippets to Know by Heart](#15-code-snippets-to-know-by-heart)

---

## 1. PROJECT PITCH

**Q: Tell me about your project in 30 seconds.**

> SnippetVault is a full-stack web app for developers to save, organize, and version-control their code snippets. Think of it as a personal GitHub Gist — but with Git-like version history built in. You can create a snippet, tag it, search it, edit it, and every time you edit, it saves a new version. You can then compare any two versions side-by-side with a diff viewer, exactly like GitHub's file comparison. The whole thing runs on free infrastructure — Supabase for database and auth, Vercel for hosting — so it costs zero rupees to run.

**Q: In one line, what problem does it solve?**

> Developers waste time rewriting code they've already solved before because they have no organized, versioned place to store reusable snippets.

---

## 2. PROBLEM STATEMENT & MOTIVATION

**Q: Why did you build this? What problem does it solve?**

Developers constantly write small reusable pieces of code — utility functions, regex patterns, SQL queries, Docker configs. Currently these live in:
- Scattered text files (no search, lost easily)
- GitHub Gists (no version history with diffs)
- IDE snippets (locked to one editor)
- Notion/Google Docs (no syntax highlighting)
- Memory (unreliable — they rewrite what they already solved)

A Stack Overflow 2023 survey found developers spend ~30% of time searching for or rewriting code they've written before. For a 10-person team that's 3 full engineers' worth of productivity lost per year.

**Q: What makes SnippetVault different from GitHub Gists?**

| GitHub Gist | SnippetVault |
|---|---|
| No version diff comparison | Side-by-side diff viewer |
| No tagging/filtering system | Multi-tag AND-filter search |
| Public by default | Private by default |
| No commit messages | Each version has a commit message |
| Separate from your workflow | Designed as a side-panel tool |

**Q: Who are the target users?**

Three personas:
1. **Student Developer** — stores assignment solutions and tutorial code
2. **Professional Developer** — maintains a personal utility library across projects
3. **Technical Educator** — curates code examples for tutorials

---

## 3. WHAT DOES THE PROJECT DO

### Core Features (know all 10)

| # | Feature | How It Works |
|---|---|---|
| F1 | **User Authentication** | Email + password via Supabase Auth. JWT tokens stored in HTTP-only cookies. Email confirmation required. |
| F2 | **Snippet CRUD** | Create, Read, Update, Delete snippets with title, description, language, code, tags |
| F3 | **Version Control** | Every code edit creates a new `snippet_versions` record with auto-incremented version number and optional commit message |
| F4 | **Diff Viewer** | Select any 2 versions → side-by-side comparison, green = added, red = removed. Uses the `diff` npm library |
| F5 | **Smart Tagging** | User-created tags, many-to-many with snippets, AND-logic filtering (ALL selected tags must match) |
| F6 | **Full-Text Search** | Searches title, description, and code content with 300ms debounce |
| F7 | **Language Filtering** | Chip-based filter for 25+ languages |
| F8 | **Syntax Highlighting** | `prism-react-renderer` with Night Owl theme, 25+ languages |
| F9 | **One-Click Copy** | Clipboard button on cards and detail panel with 2-second checkmark feedback |
| F10 | **Dark/Light Mode** | System preference detection + manual toggle, persistent |

---

## 4. USER FLOW

### New User Signs Up

```
Landing Page → Click "Get Started"
  → Sign Up page → Enter email + password
  → Supabase sends confirmation email
  → User clicks email link
  → Redirected to Login page
  → Enters credentials → Dashboard
  → Empty state: "No snippets yet"
```

### Create a Snippet

```
Dashboard → "New Snippet" button
  → Dialog opens
  → Enter: title, description, language, code, tags, commit message
  → Click "Save"
  → POST /api/snippets called
  → snippet row created + version 1 created + tags linked
  → SWR mutate() refreshes the grid
  → New snippet card appears
```

### Edit and Version a Snippet

```
Click snippet card → Detail panel opens (right side)
  → Click "Edit"
  → Modify code content
  → Enter commit message (e.g., "Fixed edge case for null")
  → Click "Save"
  → PUT /api/snippets/[id] called
  → If content changed → new version_number created (v2, v3...)
  → History tab now shows the new version
```

### Compare Two Versions (Diff)

```
Detail panel → "History" tab
  → Click Version 1 → selected (highlighted)
  → Click Version 3 → selected
  → "Diff" tab appears
  → Click Diff tab
  → Side-by-side view: green lines = added, red = removed
  → "Clear Selection" to go back
```

### Search and Filter

```
Type in search bar → debounced 300ms
  → GET /api/snippets?search=<query>
  → Combine with language filter → ?search=sort&language=javascript
  → Combine with tags → ?search=sort&language=javascript&tags=abc,def
  → Grid updates with filtered results
```

---

## 5. SYSTEM ARCHITECTURE FLOW

### High-Level Architecture (3 Layers)

```
[Browser — React/Next.js] 
        ↕ HTTP REST (fetch with cookies)
[Vercel — Next.js API Routes (Serverless)]
        ↕ Supabase SDK (HTTPS)
[Supabase Cloud — PostgreSQL + Auth]
```

### Request Lifecycle (every API call)

```
1. Browser sends HTTP request with auth cookies
2. Vercel Edge receives it
3. middleware.ts runs:
   - Refreshes JWT if expired (via refresh token)
   - Redirects unauthenticated users away from /dashboard
4. API Route handler runs:
   - createClient() — reads cookies to build Supabase client
   - supabase.auth.getUser() — verifies JWT, gets user.id
   - Returns 401 if not authenticated
   - Executes DB query scoped by user_id
   - Returns JSON
5. SWR caches the response
6. React re-renders with new data
```

### Why Serverless (not a traditional Express server)?

| Traditional Server | Next.js Serverless |
|---|---|
| Requires paid hosting | Free on Vercel |
| Manual scaling | Auto-scales |
| Separate codebase | Same codebase as frontend |
| Separate deployment | Deploy with `git push` |

---

## 6. TECH STACK

### Q: What is Next.js and why did you use it?

Next.js is a React framework by Vercel. We used it because:
- **App Router** gives file-system-based routing (`app/api/snippets/route.ts` = the endpoint `/api/snippets`)
- **Server-Side Rendering** for landing page (fast load, good SEO)
- **API Routes** — backend and frontend in one codebase
- **Free deployment on Vercel** — push to GitHub = auto deploy

### Q: What is Supabase?

Supabase is an open-source Firebase alternative. It provides:
- **PostgreSQL database** (relational, structured — perfect for our linked tables)
- **Built-in Auth** (email + password, JWT, email confirmation)
- **Auto-generated REST API** (we don't use it — we use Next.js API routes instead)
- **Row Level Security** (database-level access control)
- **Free tier** — 500MB storage, 50K users, unlimited API calls

### Q: Why Supabase over Firebase?

| Firebase | Supabase |
|---|---|
| NoSQL (Firestore) — bad for relational data | PostgreSQL — perfect for our linked tables |
| Vendor lock-in (Google) | Open source, self-hostable |
| No SQL — can't do complex joins | Full SQL support |
| Expensive at scale | Free tier is very generous |

### Q: What is TypeScript? Why not plain JavaScript?

TypeScript adds static types to JavaScript. Benefits:
- Catch type errors at compile time, not at runtime
- Better autocomplete in the editor
- Our `lib/types.ts` file defines `Snippet`, `Tag`, `SnippetVersion` interfaces — used everywhere for safety
- `strict: true` in tsconfig — maximum type safety

### Q: What is Tailwind CSS?

Utility-first CSS framework. Instead of writing custom CSS classes, you apply small utility classes directly in HTML: `className="text-lg font-bold text-primary"`. No separate `.css` file needed for most styling. We combined it with shadcn/ui components (which are pre-built Radix UI primitives styled with Tailwind).

### Q: What is SWR?

SWR (Stale-While-Revalidate) is a data fetching library. It:
1. Returns cached data immediately (fast UI)
2. Sends a fetch request in the background
3. Updates the UI when new data arrives

We use it to fetch snippets from `/api/snippets`. After any create/update/delete, we call `mutate()` to trigger a re-fetch and keep the UI in sync.

### Q: What is the `diff` library used for?

The `diff` npm library implements diff algorithms. We use its `diffLines()` function to compare two versions of a snippet line by line. It returns an array of changes — each change has `added`, `removed`, or unchanged lines. We render added lines in green and removed lines in red in the diff viewer.

### Q: What is `prism-react-renderer`?

A React wrapper for the Prism syntax highlighting engine. It takes code as a string and a language name, tokenizes it, and returns colored tokens that we render. We use the Night Owl theme. Supports 25+ languages.

### Q: What is `zod`?

Zod is a TypeScript-first schema validation library. We use it in Phase 2 to validate API request bodies. For example, a `createSnippetSchema` would check that `title` is a non-empty string, `language` is in our supported list, and `content` exists. If validation fails, we return a 400 error before the DB query runs.

### Q: What is `react-hook-form`?

A library for managing form state in React. It handles form submission, validation, error messages, and reset — with minimal re-renders. We use it in the snippet create/edit dialog.

### Q: Why use `sonner` for toasts?

Sonner is a lightweight, opinionated toast notification library. It's already integrated with our stack. We call `toast.success("Snippet saved")` or `toast.error("Failed to save")` and it renders a small notification at the corner.

---

## 7. DATABASE DESIGN

### Q: What tables do you have?

Four tables:

| Table | Purpose |
|---|---|
| `snippets` | The main snippet record — title, language, current code |
| `snippet_versions` | Every historical version of a snippet's code |
| `tags` | User-created labels |
| `snippet_tags` | Junction table linking snippets to tags (many-to-many) |

Plus `auth.users` — managed by Supabase, not created by us.

### Q: What are the relationships?

```
auth.users (1) ──── (N) snippets        [one user, many snippets]
auth.users (1) ──── (N) tags            [one user, many tags]
snippets   (1) ──── (N) snippet_versions [one snippet, many versions]
snippets   (M) ──── (N) tags            [via snippet_tags junction table]
```

### Q: What is a junction table?

A junction table (also called a bridge or linking table) resolves a many-to-many relationship. One snippet can have multiple tags, and one tag can be on multiple snippets. We can't store this in either table alone. So `snippet_tags` has just two columns: `snippet_id` and `tag_id`, with a composite primary key on both. Their combination is unique and represents the link.

### Q: Why do you store `current_content` in the snippets table when you already have snippet_versions?

**Performance optimization.** The most common operation is displaying the current snippet code. If we had to always JOIN to `snippet_versions` and pick the latest version, every list query would be heavier. By caching the current content directly in `snippets`, we get fast reads without a JOIN in the common case. The `snippet_versions` table is only hit when you need history.

### Q: What is a Foreign Key?

A foreign key is a column that references the primary key of another table, enforcing referential integrity. For example, `snippet_versions.snippet_id` is a foreign key referencing `snippets.id`. This means you can't create a version for a snippet that doesn't exist, and we use `ON DELETE CASCADE` so when a snippet is deleted, all its versions are automatically deleted too.

### Q: What is ON DELETE CASCADE?

It means: when the parent row is deleted, automatically delete all child rows too. In our schema:
- Delete a `snippet` → automatically deletes all its `snippet_versions` and `snippet_tags` rows
- This keeps the database clean with no orphaned records

### Q: What is a UUID? Why not use auto-increment integers?

UUID (Universally Unique Identifier) is a 128-bit random identifier like `550e8400-e29b-41d4-a716-446655440000`. We use it because:
- **No sequential leaks** — with integers, users can guess `id=1`, `id=2`, etc. and try to access other users' data
- **Globally unique** — safe to generate on the client too if needed
- **Supabase default** — generated via `gen_random_uuid()`

### Q: What are indexes and why do you have them?

An index is a data structure that speeds up queries by allowing the database to find rows without scanning the entire table. We have indexes on:
- `snippets.user_id` — our most common query filter is by user
- `snippets.language` — language filtering
- `snippets.updated_at` — sorting by most recent
- `snippet_versions.snippet_id` — for fetching version history of a snippet
- `tags.user_id` — for fetching a user's tags

Without these, PostgreSQL would do a full table scan on every query.

### Q: Write the SQL to create the snippets table.

```sql
CREATE TABLE public.snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  current_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

---

## 8. API DESIGN

### Q: What API endpoints does your app have?

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/snippets` | List snippets (with search, language, tag filters) |
| POST | `/api/snippets` | Create new snippet |
| GET | `/api/snippets/[id]` | Get single snippet |
| PUT | `/api/snippets/[id]` | Update snippet (creates new version if code changed) |
| DELETE | `/api/snippets/[id]` | Delete snippet |
| GET | `/api/snippets/[id]/versions` | Get version history |
| GET | `/api/tags` | List user's tags |
| POST | `/api/tags` | Create new tag |

### Q: What is REST?

REST (Representational State Transfer) is an architectural style for APIs:
- Uses HTTP methods to represent actions: GET (read), POST (create), PUT (update), DELETE (delete)
- Resources are identified by URLs (`/api/snippets/[id]`)
- Stateless — each request has all needed information
- Returns JSON responses

### Q: What HTTP status codes do you use?

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | No valid session |
| 404 | Not Found | Snippet doesn't exist |
| 409 | Conflict | Duplicate tag name |
| 500 | Server Error | Database query failed |

### Q: What happens when a user calls GET /api/snippets?search=sort?

1. API route reads `searchParams.get('search')` → `"sort"`
2. Builds Supabase query: `SELECT * FROM snippets WHERE user_id = user.id`
3. Appends: `.or('title.ilike.%sort%,description.ilike.%sort%,current_content.ilike.%sort%')`
4. ILIKE = case-insensitive LIKE search
5. Fetches matching snippet_tags and tags
6. Joins them in memory to add tags array to each snippet
7. Returns `{ snippets, tags }`

### Q: What is debouncing? Why do you use it for search?

Debouncing delays a function call until after a user has stopped an activity for a set period. Without debouncing, every keystroke in the search box would fire an API call — typing "hello" = 5 API calls. With a 300ms debounce, the API is only called 300ms after the user stops typing. This reduces server load and prevents flickering UI.

```typescript
// hooks/use-debounce.ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

---

## 9. AUTHENTICATION & SECURITY

### Q: How does authentication work in your app?

1. User enters email + password on `/auth/sign-up`
2. Client calls `supabase.auth.signUp()` → Supabase creates a user in `auth.users` and sends a confirmation email
3. User clicks the email link → account confirmed
4. User logs in → `supabase.auth.signInWithPassword()` → Supabase validates credentials
5. Supabase returns a **JWT access token** + refresh token
6. `@supabase/ssr` stores these in **HTTP-only cookies** (not localStorage)
7. Every request to our API routes sends these cookies automatically

### Q: What is a JWT?

JWT (JSON Web Token) is a compact, signed token that contains user information. Structure: `header.payload.signature`. The payload contains the user's ID and expiry time. Supabase signs it with a secret. Our API routes verify the signature using `supabase.auth.getUser()` — if the signature is valid, the user is authenticated.

### Q: Why cookies instead of localStorage for tokens?

| localStorage | HTTP-only Cookies |
|---|---|
| Accessible by JavaScript | Not accessible by JS (XSS-safe) |
| XSS attack can steal tokens | XSS cannot read the token |
| Manual implementation needed | Browser sends automatically |

HTTP-only cookies are the secure standard. If a malicious script runs on the page (XSS), it cannot read HTTP-only cookies, so the auth token is safe.

### Q: What is Row Level Security (RLS)?

RLS is a PostgreSQL feature that enforces access control at the database level. Even if our API routes had a bug and forgot to filter by `user_id`, RLS policies ensure the database itself would only return rows where `auth.uid() = user_id`. It's a defense-in-depth layer.

Example RLS policy:
```sql
CREATE POLICY "Users can view own snippets"
  ON public.snippets FOR SELECT 
  USING (auth.uid() = user_id);
```

### Q: How do you prevent one user from seeing another user's snippets?

Three layers of defense:
1. **API Route Level:** Every route calls `supabase.auth.getUser()` to get the logged-in user's ID, then all queries have `.eq('user_id', user.id)`
2. **Middleware Level:** Unauthenticated users are redirected to login before they reach any data
3. **Database Level (RLS):** Even if a bug exists in our code, the database policy blocks cross-user data access

### Q: What is CSRF? How do you handle it?

CSRF (Cross-Site Request Forgery) is an attack where a malicious website tricks your browser into making a request to your app. We handle it through:
- `SameSite` cookie attribute (set by `@supabase/ssr`) — cookies aren't sent on cross-site requests
- This means a malicious site can't make authenticated requests to our API using the victim's cookies

### Q: How do you prevent SQL injection?

We use the Supabase JavaScript SDK which uses **parameterized queries** internally. We never concatenate user input directly into SQL strings. The SDK escapes all values automatically, making SQL injection impossible.

### Q: Why do you verify auth in BOTH middleware AND the API route?

| Middleware | API Route |
|---|---|
| UX purpose — redirects to login page | Security purpose — actual data gate |
| Runs before routing | Runs after routing |
| Could theoretically be bypassed with a direct API call | Cannot be bypassed — it's inside the handler |

Never trust only the middleware. A curl request directly to `/api/snippets` bypasses the middleware redirect but still hits the API route's `getUser()` check.

---

## 10. VERSION CONTROL — THE CORE FEATURE

### Q: How does version control work in SnippetVault?

Every time you edit a snippet's code and save, a new row is inserted into `snippet_versions` with:
- `snippet_id` — links to the parent snippet
- `version_number` — auto-incremented (1, 2, 3...)
- `content` — the full code at this point in time
- `commit_message` — optional note about what changed
- `created_at` — timestamp

The `snippets` table also has `current_content` updated to the latest version. So you always have the live code easily accessible AND the full history in `snippet_versions`.

### Q: How is your version control similar to Git?

| Git Concept | SnippetVault Equivalent |
|---|---|
| Commit | A version saved with a commit message |
| Commit message | `commit_message` field in `snippet_versions` |
| Diff | Side-by-side diff viewer comparing two versions |
| History / git log | History tab showing all versions with timestamps |
| Checkout (view old version) | Click any version in History tab to view its code |

### Q: How does the diff viewer work technically?

1. User selects two versions in the History tab
2. We store both selected version objects in state
3. We call `diffLines(versionA.content, versionB.content)` from the `diff` library
4. `diffLines` returns an array of change objects: `{ value: "...", added: true/false, removed: true/false }`
5. We render each change: green background for `added`, red background for `removed`, neutral for unchanged
6. This is exactly how GitHub shows file diffs

### Q: What diff algorithm does the `diff` library use?

The `diff` library implements a variation of the **Myers diff algorithm**, which is also what Git uses. It finds the **shortest edit script** — the minimum number of insertions and deletions to transform text A into text B. It runs in O(ND) time where N is the total length and D is the edit distance.

### Q: What happens to versions when a snippet is deleted?

The `snippet_versions` table has `snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE`. When the parent snippet is deleted, PostgreSQL automatically deletes all its version rows. This is handled at the database level — no extra code needed.

### Q: Can you restore an old version?

Currently, no — you can only *view* historical versions. To restore, a user would manually copy the old version's content and create a new edit. A future feature could add a "Restore this version" button that calls PUT `/api/snippets/[id]` with the old content (and creates a new version record with a message like "Restored from v2").

---

## 11. GITHUB & GIT COMMANDS

> The examiner WILL ask git questions because your project is a version control tool. Know these cold.

### Q: What is Git? How is it different from GitHub?

**Git** is a distributed version control system (created by Linus Torvalds in 2005). It tracks changes to files, allows branching and merging, and maintains a complete history of changes locally on your machine.

**GitHub** is a cloud hosting platform for Git repositories. It adds collaboration features like pull requests, code review, issues, and CI/CD on top of Git.

> Simple answer: Git is the tool, GitHub is the platform.

### Q: What is version control? Why is it important?

Version control is a system that records changes to files over time so you can recall specific versions later. Importance:
- **History** — know who changed what and when
- **Undo** — revert to any previous state if something breaks
- **Collaboration** — multiple people work on the same codebase without overwriting each other
- **Branching** — experiment in isolation without affecting the main code
- **Accountability** — every change is attributed to a person

### Q: What is the difference between `git add`, `git commit`, and `git push`?

| Command | What It Does |
|---|---|
| `git add <file>` | Stages changes — moves them to the "staging area" ready to be committed |
| `git commit -m "message"` | Saves staged changes as a snapshot in local Git history |
| `git push origin main` | Uploads local commits to the remote repository on GitHub |

Think of it as: `add` = pack your bags, `commit` = take a photo of your bags, `push` = send the photo to someone.

### Q: What is branching in Git?

A branch is an independent line of development. `main` is the primary branch. You create a feature branch (`git checkout -b feature/search`) to work on a new feature without affecting `main`. When done, you merge it back. This allows parallel development.

```bash
git checkout -b feature/search  # Create and switch to new branch
# ... make changes ...
git add .
git commit -m "feat: add search functionality"
git checkout main
git merge feature/search         # Merge feature into main
```

### Q: What is the difference between `git merge` and `git rebase`?

| `git merge` | `git rebase` |
|---|---|
| Creates a merge commit | Rewrites commit history (linear) |
| Preserves full history | Cleaner, linear history |
| Non-destructive | Changes commit SHAs |
| Safe for shared branches | Risky on shared branches |

For this project, we used the **Git Flow** branching strategy (main → develop → feature branches).

### Q: What is `git clone`?

Downloads a copy of a remote repository to your local machine, including all history.
```bash
git clone https://github.com/username/repo-name.git
```

### Q: What is `git pull`?

Fetches changes from the remote repository AND merges them into your current local branch. It's essentially `git fetch` + `git merge`.

```bash
git pull origin main
```

### Q: What is a merge conflict? How do you resolve it?

A merge conflict happens when two branches modify the same lines of a file differently, and Git can't auto-merge. Git marks the conflict in the file:
```
<<<<<<< HEAD
  your version of the line
=======
  other branch's version
>>>>>>> feature/search
```

To resolve: manually edit the file to keep the correct code, remove the markers, then:
```bash
git add <resolved-file>
git commit -m "resolve merge conflict"
```

### Q: What is `git stash`?

Temporarily saves uncommitted changes without committing them, so you can switch branches cleanly.
```bash
git stash          # Save current changes
git checkout other-branch
# ... do something ...
git checkout original-branch
git stash pop      # Restore saved changes
```

### Q: What is `git log`?

Shows the commit history of the repository.
```bash
git log                    # Full log
git log --oneline          # Compact one-line per commit
git log --oneline --graph  # Visual branch graph
```

### Q: What is `git diff`?

Shows the difference between states:
```bash
git diff                   # Unstaged changes vs last commit
git diff --staged          # Staged changes vs last commit
git diff main feature/x    # Differences between two branches
```

### Q: What is `.gitignore`?

A file that lists files/folders Git should NOT track. In our project:
```
.env.local          ← Contains secrets (Supabase keys) — never commit this
node_modules/       ← Huge folder, regenerated by npm install
.next/              ← Build output, not source code
```

### Q: What is a Pull Request (PR)?

A PR is a request to merge a feature branch into the main branch. It opens a review process where team members can comment, suggest changes, and approve before the code is merged. It's a GitHub feature, not a Git feature.

### Q: What is `git revert` vs `git reset`?

| `git revert <commit>` | `git reset <commit>` |
|---|---|
| Creates a new commit that undoes a previous commit | Moves the branch pointer backward |
| Safe for shared/public branches | Dangerous on shared branches (rewrites history) |
| History is preserved | History is lost |

Use `revert` on shared branches. Use `reset` only locally.

### Q: Explain Git's three areas.

```
Working Directory → Staging Area (Index) → Local Repository → Remote Repository
    (git add)                                 (git commit)         (git push)
```

- **Working Directory:** Files you're actively editing
- **Staging Area:** Changes ready to be committed (after `git add`)
- **Local Repository:** Committed history on your machine (after `git commit`)
- **Remote Repository:** GitHub — shared with the team (after `git push`)

### Q: How does your project's version control relate to Git's version control?

Excellent viva question. Both implement the same *concept* but at different scopes:

| Git | SnippetVault |
|---|---|
| Tracks changes to source code files | Tracks changes to code snippets |
| Uses SHA-1 hashes for commit IDs | Uses sequential integers (v1, v2, v3) |
| Stores diffs (not full copies) | Stores full content per version (simpler) |
| Distributed (every clone has full history) | Centralized (Supabase cloud) |
| Supports branching and merging | Linear history only |
| Commit messages | Commit messages ✓ |
| `git diff` | Side-by-side diff viewer ✓ |
| `git log` | History tab ✓ |
| Checkout old commit | Click version to view ✓ |

We deliberately simplified — our users are *using* snippets, not building software. Linear version history is sufficient.

---

## 12. FRONTEND QUESTIONS

### Q: What is Next.js App Router?

Next.js 16 uses the App Router (introduced in Next.js 13). Folders and files inside `app/` define routes. Special files:
- `page.tsx` — the UI for a route
- `layout.tsx` — shared wrapper around child routes
- `route.ts` — API endpoint (server-only)

```
app/
  page.tsx          → / (landing page)
  dashboard/page.tsx → /dashboard
  api/snippets/route.ts → GET/POST /api/snippets
```

### Q: What is Server-Side Rendering (SSR) vs Client-Side Rendering (CSR)?

| SSR | CSR |
|---|---|
| HTML generated on the server | HTML generated in the browser |
| Faster first load, better SEO | Fast subsequent interactions |
| `page.tsx` without `'use client'` | `'use client'` at top of file |
| Landing page, auth pages | Dashboard (interactive, SWR data fetching) |

### Q: What is `'use client'` in Next.js?

A directive at the top of a file that marks it as a client component. Client components:
- Run in the browser
- Can use React hooks (`useState`, `useEffect`)
- Can handle user interactions (clicks, input)

Server components (no directive) run on the server and can't use hooks or browser APIs.

### Q: What are React hooks? Which ones do you use?

Hooks are functions that let you use React state and lifecycle features. We use:
- `useState` — local state management (e.g., selected snippet, search query)
- `useEffect` — side effects (e.g., debounce timer)
- `useSWR` — data fetching with caching
- Custom `useDebounce` — our own hook wrapping `useState` + `useEffect`

### Q: What is component-based architecture?

Breaking the UI into self-contained, reusable pieces. Our components:
- `SnippetCard` — the grid card showing a snippet preview
- `SnippetDialog` — the create/edit modal
- `SnippetDetailPanel` — the right-side sheet
- `VersionHistory` — the history tab inside the panel
- `DiffViewer` — the side-by-side diff comparison
- `CodeEditor` — the syntax-highlighted code display/input

Each component manages its own state and receives data via props. This makes the code maintainable.

### Q: What is shadcn/ui?

shadcn/ui is NOT a traditional component library (not installed as one npm package). It's a collection of copy-paste component code built on **Radix UI** primitives (accessible, unstyled) styled with **Tailwind CSS**. You run `npx shadcn@latest add button` and it copies the component source into your `components/ui/` folder. You own the code and can modify it. We have 57 shadcn components in our project.

---

## 13. DEPLOYMENT & INFRASTRUCTURE

### Q: How is the app deployed?

```
Push code to GitHub (main branch)
  → Vercel detects the push (GitHub webhook)
  → Vercel runs `npm run build` (next build)
    - Compiles React → static HTML/JS bundles
    - Bundles API routes → serverless functions
    - Generates edge middleware
  → Deploys to Vercel's global CDN
  → Live at https://your-project.vercel.app
```

### Q: What is a serverless function?

A function that runs on-demand without a persistent server. Vercel deploys our API routes as serverless functions:
- Sleep when not used (no cost)
- Spin up when a request arrives (cold start ~100ms)
- Auto-scale to handle traffic spikes
- Free on Vercel Hobby plan

### Q: What is a CDN?

Content Delivery Network — a globally distributed network of servers. Static assets (HTML, CSS, JS bundles) are cached at edge nodes worldwide. A user in India gets the file from an Indian edge node, not from the US origin server. This dramatically reduces latency for first load.

### Q: What are environment variables? Why use them?

Environment variables store sensitive configuration outside the code. In our case:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
These are in `.env.local` which is in `.gitignore` — never committed to GitHub. If they were hardcoded in source code, anyone viewing the public repo could access our database.

### Q: Total cost of the project?

**$0.** Completely free:
- Supabase Free Plan: 500MB DB, 50K users, unlimited API calls
- Vercel Hobby Plan: 100GB bandwidth, unlimited serverless function invocations
- GitHub: free for public/private repos
- All npm packages: open source (MIT, Apache, BSD licenses)

---

## 14. POSSIBLE TRICK QUESTIONS

### Q: What happens if two users create a tag with the same name?

That's fine — tags are user-scoped. The `tags` table has a `UNIQUE (user_id, name)` constraint, which means the combination of user_id + name must be unique. Two different users can both have a tag called "utils" without conflict. The same user cannot create two tags called "utils" — the DB returns error code `23505` and our API returns a 409 Conflict.

### Q: What happens if you delete a tag that's used by snippets?

The `snippet_tags` junction table has `tag_id UUID REFERENCES tags(id) ON DELETE CASCADE`. So deleting a tag automatically removes all its associations in `snippet_tags`. The snippets themselves are not deleted — they just lose that tag.

### Q: Can a user access another user's snippet by guessing the UUID?

**No.** Multiple protections prevent this:
1. UUIDs are random 128-bit values — essentially impossible to guess
2. Every API route has `.eq('user_id', user.id)` — the query only returns rows owned by the logged-in user, even if the correct UUID is known
3. RLS policies enforce this at the database level too

### Q: What is the NEXT_PUBLIC_ prefix in environment variables?

In Next.js, environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser (client-side code). Without this prefix, variables are only available in server-side code (API routes). Our Supabase URL and Anon Key need to be accessible on both client and server, so they have the prefix.

The Anon Key is safe to be public — it only grants access controlled by RLS policies. It's not the secret service role key.

### Q: Why does your app need three different Supabase clients?

Next.js has three distinct execution environments, each with different ways to access cookies:

| Client | Environment | Cookie Access |
|---|---|---|
| `lib/supabase/client.ts` | Browser | `document.cookie` |
| `lib/supabase/server.ts` | API Routes / Server Components | `cookies()` from `next/headers` |
| `lib/supabase/middleware.ts` | Edge Middleware | `request.cookies` / `response.cookies` |

Using the wrong client in the wrong context causes authentication to break.

### Q: What if the user's session expires mid-use?

The middleware (`middleware.ts`) runs on every request and calls `updateSession()`. This checks if the JWT is expired and, if so, uses the refresh token (also in cookies) to silently get a new JWT. This happens transparently — the user never gets logged out unless both tokens expire (typically 7 days of inactivity).

### Q: What's the difference between authentication and authorization?

| Authentication | Authorization |
|---|---|
| *Who are you?* | *What are you allowed to do?* |
| Verifying identity (login) | Verifying permissions (access control) |
| `supabase.auth.getUser()` | `.eq('user_id', user.id)` in queries |

In our app: auth confirms you're logged in, authorization ensures you can only touch your own data.

### Q: Your search uses ILIKE — what's the problem with this at scale?

`ILIKE '%sort%'` cannot use a standard B-tree index because of the leading wildcard. PostgreSQL must do a full table scan. For a small prototype with thousands of snippets, this is fine. At scale (millions of rows), the solution is a **PostgreSQL `tsvector` full-text search index** using `to_tsvector()` and `to_tsquery()`, which is indexed and much faster.

### Q: What is a composite primary key?

A primary key made of two or more columns. In `snippet_tags`, the primary key is `(snippet_id, tag_id)`. This means the same snippet-tag combination can only appear once, preventing duplicate tag links. Neither column alone uniquely identifies a row — the combination does.

---

## 15. CODE SNIPPETS TO KNOW BY HEART

### The API Route Pattern (every route follows this)

```typescript
export async function GET(request: NextRequest) {
  // 1. Create server-side Supabase client
  const supabase = await createClient()
  
  // 2. Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 3. Query DB scoped to this user only
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('user_id', user.id)       // ← Always scoped
    .order('updated_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ snippets: data })
}
```

### Creating a Snippet (POST handler logic)

```typescript
// 1. Insert snippet
const { data: snippet } = await supabase
  .from('snippets')
  .insert({ user_id: user.id, title, language, current_content: content, description })
  .select()
  .single()

// 2. Insert version 1
await supabase.from('snippet_versions').insert({
  snippet_id: snippet.id,
  version_number: 1,
  content,
  commit_message: commitMessage || 'Initial version'
})

// 3. Link tags
if (tagIds.length > 0) {
  await supabase.from('snippet_tags').insert(
    tagIds.map(tag_id => ({ snippet_id: snippet.id, tag_id }))
  )
}
```

### Versioning on Update (key logic)

```typescript
// Fetch existing snippet
const { data: existing } = await supabase
  .from('snippets')
  .select('current_content')
  .eq('id', id)
  .eq('user_id', user.id)
  .single()

// Only create new version if content changed
if (content !== existing.current_content) {
  // Get latest version number
  const { data: latestVersion } = await supabase
    .from('snippet_versions')
    .select('version_number')
    .eq('snippet_id', id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  
  // Insert new version
  await supabase.from('snippet_versions').insert({
    snippet_id: id,
    version_number: (latestVersion?.version_number ?? 0) + 1,
    content,
    commit_message: commitMessage
  })
}
```

### Diff Computation

```typescript
import { diffLines } from 'diff'

const changes = diffLines(versionA.content, versionB.content)

// Render:
changes.map(change => (
  <div style={{ background: change.added ? 'green' : change.removed ? 'red' : 'transparent' }}>
    {change.value}
  </div>
))
```

### The useDebounce Hook

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)  // Cleanup on next render
  }, [value, delay])
  
  return debouncedValue
}
```

---

## QUICK FIRE ANSWERS

| Question | Answer |
|---|---|
| What does CRUD stand for? | Create, Read, Update, Delete |
| What does API stand for? | Application Programming Interface |
| What does REST stand for? | Representational State Transfer |
| What does JWT stand for? | JSON Web Token |
| What does RLS stand for? | Row Level Security |
| What does SWR stand for? | Stale-While-Revalidate |
| What does SSR stand for? | Server-Side Rendering |
| What does UUID stand for? | Universally Unique Identifier |
| What does ORM stand for? | Object-Relational Mapper |
| What does CDN stand for? | Content Delivery Network |
| What does XSS stand for? | Cross-Site Scripting |
| What does CSRF stand for? | Cross-Site Request Forgery |
| What is the diff algorithm used by Git? | Myers diff algorithm |
| What database does Supabase use? | PostgreSQL |
| What language is the frontend in? | TypeScript (and React/Next.js) |
| What port does the dev server run on? | 3000 (http://localhost:3000) |
| What command starts the dev server? | `npm run dev` |
| What command builds for production? | `npm run build` |
| How many languages does syntax highlighting support? | 25+ |
| What is the debounce delay for search? | 300ms |

---

*Good luck in your viva! You built a real, deployed, full-stack product — own that.*
