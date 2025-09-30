# Projekt Folder Struktúra - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** System Architect

---

## 📁 Teljes Folder Tree

```
building-survey/
├── .claude/                          # Claude Code config
│   ├── agents/                       # Custom agents
│   └── settings.local.json           # Local settings
├── .github/                          # GitHub config
│   └── workflows/                    # GitHub Actions (opcionális)
│       └── ci.yml                    # CI/CD pipeline
├── .next/                            # Next.js build output (gitignored)
├── app/                              # Next.js 14 App Router
│   ├── (auth)/                       # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── register/
│   │       └── page.tsx              # Register page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # Email confirmation callback
│   ├── dashboard/                    # Dashboard route group
│   │   ├── layout.tsx                # Dashboard layout (sidebar + header)
│   │   ├── page.tsx                  # Dashboard home
│   │   └── projects/
│   │       ├── page.tsx              # Projects list
│   │       ├── [id]/
│   │       │   ├── page.tsx          # Project detail (opcionális)
│   │       │   └── edit/
│   │       │       └── page.tsx      # Project edit page
│   │       └── new/
│   │           └── page.tsx          # Project create page (ha külön oldal)
│   ├── api/                          # API routes (opcionális)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # Auth callback API
│   │   └── projects/
│   │       └── [id]/
│   │           └── route.ts          # Project CRUD API (ha szükséges)
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page (redirect)
├── components/                       # React components
│   ├── auth/
│   │   ├── LoginForm.tsx             # Login form component
│   │   ├── RegisterForm.tsx          # Register form component
│   │   └── AuthGuard.tsx             # Protected route wrapper (opcionális)
│   ├── layout/
│   │   ├── Header.tsx                # Dashboard header (user info + logout)
│   │   ├── Sidebar.tsx               # Dashboard sidebar navigation
│   │   ├── Footer.tsx                # Footer (opcionális)
│   │   └── DashboardLayout.tsx       # Dashboard layout wrapper
│   ├── projects/
│   │   ├── ProjectList.tsx           # Projects table/card list
│   │   ├── ProjectCard.tsx           # Single project card
│   │   ├── ProjectTable.tsx          # Projects table view
│   │   ├── CreateProjectModal.tsx    # Create project modal
│   │   ├── EditProjectForm.tsx       # Edit project form
│   │   ├── EditProjectModal.tsx      # Edit project modal
│   │   ├── DeleteConfirmationModal.tsx # Delete confirmation
│   │   └── EmptyProjectState.tsx     # Empty state when no projects
│   ├── ui/                           # Reusable UI components
│   │   ├── Button.tsx                # Button component (variants)
│   │   ├── Input.tsx                 # Input field component
│   │   ├── Modal.tsx                 # Modal wrapper
│   │   ├── Toast.tsx                 # Toast notification
│   │   ├── LoadingSpinner.tsx        # Loading spinner
│   │   ├── EmptyState.tsx            # Generic empty state
│   │   ├── Badge.tsx                 # Badge component (role badge)
│   │   └── Card.tsx                  # Card wrapper
│   └── modules/                      # Module components (későbbi feature)
│       ├── ModuleList.tsx
│       └── ModuleCard.tsx
├── lib/                              # Utility functions és helpers
│   ├── supabase.ts                   # Supabase client setup
│   ├── supabaseServer.ts             # Supabase server client (SSR)
│   ├── auth.ts                       # Auth utility functions
│   ├── projects.ts                   # Project CRUD functions
│   ├── modules.ts                    # Module functions (későbbi)
│   ├── translations.ts               # Translation utility
│   └── utils.ts                      # Generic utilities (cn, formatDate, stb.)
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                    # Auth hook (getCurrentUser, role)
│   ├── useProjects.ts                # Projects data fetching hook
│   ├── useModules.ts                 # Modules hook (későbbi)
│   └── useToast.ts                   # Toast notification hook
├── types/                            # TypeScript type definitions
│   ├── database.types.ts             # Supabase generated types
│   ├── project.types.ts              # Project types
│   ├── user.types.ts                 # User types
│   └── module.types.ts               # Module types
├── middleware.ts                     # Next.js middleware (protected routes)
├── translations/                     # Translation files
│   └── hu.json                       # Magyar fordítások
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── docs/                             # Dokumentáció
│   ├── user-stories.md
│   ├── requirements.md
│   ├── role-matrix.md
│   ├── api-structure.md
│   ├── folder-structure.md
│   ├── deployment-strategy.md
│   ├── design-system.md
│   ├── component-styles.md
│   ├── user-flow.md
│   ├── responsive-behavior.md
│   ├── SUPABASE_SETUP.md             # Supabase setup guide (credentials)
│   ├── SECURITY_AUDIT.md             # Security audit report
│   ├── TEST_REPORT.md                # QA test report
│   └── QA_TEST_SUMMARY.md            # QA summary
├── supabase/                         # Supabase config és SQL
│   ├── schema.sql                    # Database schema
│   ├── functions.sql                 # Database functions
│   ├── policies.sql                  # RLS policies
│   └── seed.sql                      # Test data seed
├── wireframes/                       # UI wireframes (PNG/Figma)
│   ├── login-screen.png
│   ├── register-screen.png
│   ├── dashboard-layout-empty.png
│   ├── dashboard-layout-with-projects.png
│   ├── create-project.png
│   ├── edit-project.png
│   └── delete-project-confirmation.png
├── tests/                            # Tests (E2E, unit)
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   ├── projects.spec.ts
│   │   └── roles.spec.ts
│   ├── unit/                         # Unit tests (Jest/Vitest)
│   │   ├── auth.test.ts
│   │   └── projects.test.ts
│   └── screenshots/                  # Test screenshots
│       ├── mobile/
│       ├── tablet/
│       └── desktop/
├── .env.local                        # Environment variables (GITIGNORED!)
├── .env.example                      # Example env file (safe to commit)
├── .gitignore                        # Git ignore rules
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind CSS config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
├── package-lock.json                 # Lock file
├── postcss.config.js                 # PostCSS config
├── netlify.toml                      # Netlify deployment config
├── playwright.config.ts              # Playwright config (E2E tests)
├── README.md                         # Project README
└── projektfeladat.md                 # Project task list

```

---

## 📂 Folder Magyarázatok

### `/app` - Next.js App Router

Next.js 14 App Router struktúra. File-based routing.

**Route Groups:**
- `(auth)` → Auth pages (login, register) - nincs layout
- `dashboard` → Dashboard pages - van layout (sidebar + header)

**Fő route-ok:**
- `/` → Home (redirect `/dashboard` vagy `/login`)
- `/login` → Login page
- `/register` → Register page
- `/auth/callback` → Email confirmation callback
- `/dashboard` → Dashboard home
- `/dashboard/projects` → Projects list
- `/dashboard/projects/[id]` → Project detail (opcionális)
- `/dashboard/projects/[id]/edit` → Project edit

---

### `/components` - React Komponensek

**Struktúra:**
- `auth/` → Authentication komponensek
- `layout/` → Layout komponensek (Header, Sidebar)
- `projects/` → Project-specifikus komponensek
- `ui/` → Reusable UI komponensek (Button, Input, Modal, stb.)
- `modules/` → Module komponensek (későbbi feature)

**Naming Convention:**
- PascalCase: `LoginForm.tsx`
- Props interface: `LoginFormProps`
- Export: `export default LoginForm;`

---

### `/lib` - Utility Functions

**Főbb fájlok:**
- `supabase.ts` → Supabase client (browser-side)
- `supabaseServer.ts` → Supabase client (server-side, SSR)
- `auth.ts` → Auth utility functions (signUp, signIn, signOut, getCurrentUser)
- `projects.ts` → Project CRUD functions (getProjects, createProject, updateProject, deleteProject)
- `translations.ts` → Translation utility (`t(key)` function)
- `utils.ts` → Generic utilities (cn, formatDate, stb.)

---

### `/hooks` - Custom React Hooks

**Főbb hooks:**
- `useAuth.ts` → Current user, role, loading state
- `useProjects.ts` → Projects data fetching, mutations
- `useModules.ts` → Modules data (későbbi)
- `useToast.ts` → Toast notification management

---

### `/types` - TypeScript Types

**Főbb type fájlok:**
- `database.types.ts` → Supabase generated types (`supabase gen types typescript`)
- `project.types.ts` → Project type definitions
- `user.types.ts` → User, Profile type definitions
- `module.types.ts` → Module type definitions

---

### `/middleware.ts` - Route Protection

Next.js middleware a protected route-ok védelmére.

**Funkció:**
- Ellenőrzi, van-e session
- Ha nincs session + protected route → redirect `/login`
- Ha van session + auth route (login/register) → redirect `/dashboard`

**Protected routes:**
- `/dashboard/*`

**Public routes:**
- `/login`
- `/register`
- `/auth/callback`

---

### `/translations` - Fordítások

**Fájlok:**
- `hu.json` → Magyar fordítások (összes UI szöveg)

**Használat:**
```typescript
import { t } from '@/lib/translations';

const loginText = t('auth.login.title'); // "Bejelentkezés"
```

---

### `/public` - Static Assets

**Tartalom:**
- Images (logo, illusztrációk)
- Icons (favicon, app icons)
- Fonts (ha custom font)

---

### `/docs` - Dokumentáció

**Főbb dokumentumok:**
- Product Management: user-stories.md, requirements.md, role-matrix.md
- Architecture: api-structure.md, folder-structure.md, deployment-strategy.md
- Design: design-system.md, component-styles.md, user-flow.md, responsive-behavior.md
- Setup: SUPABASE_SETUP.md
- Testing: SECURITY_AUDIT.md, TEST_REPORT.md, QA_TEST_SUMMARY.md

---

### `/supabase` - Database SQL

**Fájlok:**
- `schema.sql` → Teljes database schema (tables, indexes, triggers)
- `functions.sql` → Database functions (auto_identifier generation, stb.)
- `policies.sql` → RLS policies (role-based access)
- `seed.sql` → Test data seed

---

### `/wireframes` - UI Wireframes

**Fájlok (PNG vagy Figma link):**
- Login screen
- Register screen
- Dashboard layout (empty + with projects)
- Create project modal
- Edit project modal
- Delete confirmation modal

---

### `/tests` - Tests

**E2E Tests (Playwright):**
- `e2e/auth.spec.ts` → Login, register, logout flow
- `e2e/projects.spec.ts` → Project CRUD flow
- `e2e/roles.spec.ts` → Role-based access tests

**Unit Tests (Jest/Vitest - opcionális):**
- `unit/auth.test.ts` → Auth utility functions
- `unit/projects.test.ts` → Project utility functions

---

## 🔧 Config Fájlok

### `.env.local` (GITIGNORED!)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### `.env.example` (Safe to commit)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### `next.config.js`

```javascript
module.exports = {
  reactStrictMode: true,
  // Egyéb config
};
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#...', // Designer által megadott színek
        secondary: '#...',
      },
    },
  },
  plugins: [],
};
export default config;
```

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ Folder Struktúra Best Practices

1. **Component Colocation:** Komponensek a feature-jük szerint csoportosítva (`auth/`, `projects/`)
2. **Reusable UI:** Generic UI komponensek külön `ui/` mappában
3. **Utility Functions:** Business logic külön `lib/` mappában
4. **Type Safety:** TypeScript type-ok külön `types/` mappában
5. **Dokumentáció:** Minden dokumentum a `docs/` mappában
6. **Testing:** E2E és unit testek külön mappákban
7. **Gitignore:** Sensit

ive fájlok (`.env.local`, `node_modules/`, `.next/`) gitignore-ban

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis