# Frontend Setup Guide - FÁZIS 2

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Frontend Engineer

---

## 📋 Áttekintés

Ez a dokumentum végigvezet a Next.js 14 projekt inicializálásán és a teljes frontend setup folyamaton.

---

## 🚀 1. Next.js Projekt Inicializálás

### 1.1 Create Next.js App

```bash
# Navigate to project directory
cd /home/velvet/building-survey

# Create Next.js app (current directory)
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src --import-alias "@/*"
```

**Válaszok az interaktív kérdésekre:**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: No
- ✅ App Router: Yes
- ✅ Import alias: `@/*`

### 1.2 Dependencies Telepítése

```bash
# Supabase packages
npm install @supabase/supabase-js @supabase/ssr

# Toast notifications
npm install react-hot-toast

# Utility libraries
npm install clsx tailwind-merge

# Dev dependencies
npm install -D @types/node
```

---

## 📁 2. Folder Struktúra Létrehozása

```bash
# App routes
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/auth/callback
mkdir -p app/dashboard
mkdir -p app/dashboard/projects

# Components
mkdir -p components/auth
mkdir -p components/layout
mkdir -p components/projects
mkdir -p components/ui

# Lib
mkdir -p lib

# Hooks
mkdir -p hooks

# Types
mkdir -p types

# Public assets
mkdir -p public/images
mkdir -p public/icons
```

---

## 🔧 3. Konfigurációs Fájlok

### 3.1 `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 `.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 `.gitignore` kiegészítés

```
# Supabase
.env.local
.env*.local
docs/SUPABASE_SETUP.md

# Next.js
.next/
out/
build/
dist/

# Testing
coverage/
.nyc_output/

# Misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## 🎨 4. Tailwind Config

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
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#64748b',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          DEFAULT: '#10b981',
          500: '#10b981',
          600: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 📦 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔌 6. Core Library Files

A következő fájlok létrehozása szükséges (példa kód a következő szekciókban):

### 6.1 `lib/supabase.ts` - Supabase Client

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 6.2 `lib/supabaseServer.ts` - Server Client

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### 6.3 `lib/utils.ts` - Utility Functions

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
```

### 6.4 `lib/translations.ts` - Translation Utility

```typescript
import translations from '@/translations/hu.json';

type TranslationKey = string;

export function t(key: TranslationKey): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
```

---

## 🔐 7. Auth Functions

### `lib/auth.ts`

```typescript
import { createClient } from './supabase';

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getUserRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return data?.role || null;
}
```

---

## 📊 8. Project CRUD Functions

### `lib/projects.ts`

```typescript
import { createClient } from './supabase';

export async function getProjects() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createProject(name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: new Error('Unauthorized') };

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  return { data, error };
}

export async function updateProject(id: string, name: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProject(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
```

---

## 🛡️ 9. Middleware (Protected Routes)

### `middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes (already logged in)
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

## 🎯 10. TypeScript Types

### `types/database.types.ts`

```typescript
// Generate with: npx supabase gen types typescript --project-id xxxxx

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'user' | 'viewer'
        }
        Update: {
          email?: string
          role?: 'admin' | 'user' | 'viewer'
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          auto_identifier: string
          owner_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          name: string
          owner_id: string
        }
        Update: {
          name?: string
        }
      }
    }
  }
}
```

### `types/project.types.ts`

```typescript
export interface Project {
  id: string;
  name: string;
  auto_identifier: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

---

## ✅ 11. Setup Verification Checklist

- [ ] Next.js projekt inicializálva
- [ ] Dependencies telepítve
- [ ] `.env.local` konfigurálva
- [ ] Folder struktúra létrehozva
- [ ] `tailwind.config.ts` testreszabva
- [ ] `lib/supabase.ts` létrehozva
- [ ] `lib/auth.ts` létrehozva
- [ ] `lib/projects.ts` létrehozva
- [ ] `lib/translations.ts` létrehozva
- [ ] `middleware.ts` létrehozva
- [ ] TypeScript types létrehozva

---

## 🚀 12. Development Server Indítás

```bash
npm run dev
```

**URL:** http://localhost:3000

---

## 📝 13. Következő Lépések

A következő fájlok létrehozása szükséges (részletes kód a `FRONTEND_COMPONENTS.md`-ben):

### Komponensek
1. UI komponensek (Button, Input, Modal, Toast, Badge, Card)
2. Auth komponensek (LoginForm, RegisterForm)
3. Layout komponensek (Header, Sidebar, DashboardLayout)
4. Project komponensek (ProjectList, CreateModal, EditModal, DeleteModal)

### Oldalak
1. `app/(auth)/login/page.tsx`
2. `app/(auth)/register/page.tsx`
3. `app/auth/callback/route.ts`
4. `app/dashboard/page.tsx`
5. `app/dashboard/projects/page.tsx`
6. `app/layout.tsx` (root layout)
7. `app/dashboard/layout.tsx`

---

**Setup Status:** ❌ Pending
**Components Status:** ❌ Pending