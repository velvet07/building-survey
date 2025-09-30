# Frontend Oldalak - FÁZIS 2

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Frontend Engineer

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza az összes Next.js oldal (page.tsx) és layout implementációját.

---

## 🔐 Auth Oldalak

### 1. Login Oldal

**Fájl:** `app/(auth)/login/page.tsx`

```typescript
import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Bejelentkezés | Épületfelmérő Rendszer',
  description: 'Jelentkezz be a fiókodba',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Bejelentkezés
          </h1>
          <p className="text-secondary-600">
            Jelentkezz be a fiókodba
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Még nincs fiókod?{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Regisztráció
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
```

---

### 2. Register Oldal

**Fájl:** `app/(auth)/register/page.tsx`

```typescript
import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Regisztráció | Épületfelmérő Rendszer',
  description: 'Hozz létre egy új fiókot',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Regisztráció
          </h1>
          <p className="text-secondary-600">
            Hozz létre egy új fiókot
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Már van fiókod?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Bejelentkezés
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
```

---

### 3. Auth Callback Route

**Fájl:** `app/auth/callback/route.ts`

```typescript
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after email confirmation
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

---

## 🏠 Dashboard Oldalak

### 4. Dashboard Home

**Fájl:** `app/dashboard/page.tsx`

```typescript
import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Dashboard | Épületfelmérő Rendszer',
  description: 'Főoldal és statisztikák',
};

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Üdvözlünk az Épületfelmérő Rendszerben!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stat Card 1 */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Projektek</p>
              <p className="text-2xl font-bold text-secondary-900">-</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Stat Card 2 */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Aktív felmérések</p>
              <p className="text-2xl font-bold text-secondary-900">-</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Stat Card 3 */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Befejezett</p>
              <p className="text-2xl font-bold text-secondary-900">-</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Gyors műveletek
        </h2>
        <div className="space-y-3">
          <Link href="/dashboard/projects">
            <Button variant="primary" className="w-full justify-start">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Új projekt létrehozása
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button variant="secondary" className="w-full justify-start">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projektek megtekintése
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
```

---

### 5. Projects List Page

**Fájl:** `app/dashboard/projects/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { Project } from '@/types/project.types';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Projektek
          </h1>
          <p className="text-secondary-600">
            Kezelje projektjeit és felméréseit
          </p>
        </div>

        <Button onClick={handleCreate}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új projekt
        </Button>
      </div>

      <ProjectList
        key={refreshKey}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        project={selectedProject}
      />

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleSuccess}
        project={selectedProject}
      />
    </div>
  );
}
```

---

## 📐 Layouts

### 6. Root Layout

**Fájl:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Épületfelmérő Rendszer',
  description: 'Moduláris épületfelmérő és dokumentációs rendszer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={inter.variable}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
```

---

### 7. Auth Layout (Optional)

**Fájl:** `app/(auth)/layout.tsx`

```typescript
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary-50">
      {children}
    </div>
  );
}
```

---

### 8. Dashboard Layout

**Fájl:** `app/dashboard/layout.tsx`

```typescript
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

---

## 🎨 Global Styles

### 9. Globals CSS

**Fájl:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: var(--font-inter), system-ui, sans-serif;
  }

  body {
    @apply bg-secondary-50 text-secondary-900;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 🔧 Additional Files

### 10. Middleware

**Fájl:** `middleware.ts` (project root)

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

### 11. TypeScript Config

**Fájl:** `tsconfig.json` (már létezik, de ellenőrizd)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 12. Next Config

**Fájl:** `next.config.js` (már létezik, de ellenőrizd)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

---

### 13. PostCSS Config

**Fájl:** `postcss.config.js` (már létezik)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## ✅ File Structure Checklist

```
building-survey/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx ✅
│   │   ├── login/
│   │   │   └── page.tsx ✅
│   │   └── register/
│   │       └── page.tsx ✅
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts ✅
│   ├── dashboard/
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx ✅
│   │   └── projects/
│   │       └── page.tsx ✅
│   ├── layout.tsx ✅
│   └── globals.css ✅
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx ✅
│   │   └── RegisterForm.tsx ✅
│   ├── layout/
│   │   ├── Header.tsx ✅
│   │   ├── Sidebar.tsx ✅
│   │   └── DashboardLayout.tsx ✅
│   ├── projects/
│   │   ├── ProjectCard.tsx ✅
│   │   ├── ProjectList.tsx ✅
│   │   ├── CreateProjectModal.tsx ✅
│   │   ├── EditProjectModal.tsx ✅
│   │   └── DeleteProjectModal.tsx ✅
│   └── ui/
│       ├── Badge.tsx ✅
│       ├── Button.tsx ✅
│       ├── Card.tsx ✅
│       ├── EmptyState.tsx ✅
│       ├── Input.tsx ✅
│       ├── LoadingSpinner.tsx ✅
│       └── Modal.tsx ✅
├── lib/
│   ├── auth.ts ✅
│   ├── projects.ts ✅
│   ├── supabase.ts ✅
│   ├── supabaseServer.ts ✅
│   ├── translations.ts ✅
│   └── utils.ts ✅
├── types/
│   ├── database.types.ts ✅
│   └── project.types.ts ✅
├── translations/
│   └── hu.json ✅
├── middleware.ts ✅
├── tailwind.config.ts ✅
├── tsconfig.json ✅
├── next.config.js ✅
├── postcss.config.js ✅
├── package.json ✅
└── .env.local ✅
```

---

## 🚀 Development Server

### Indítás

```bash
npm run dev
```

**URL:** http://localhost:3000

### Test Flow

1. Nyisd meg: http://localhost:3000/register
2. Regisztrálj egy test user-t: `test@example.com` / `test1234`
3. Ellenőrizd az emailt (Supabase Dashboard → Authentication → Email logs)
4. Kattints a megerősítő linkre
5. Bejelentkezés: http://localhost:3000/login
6. Dashboard: http://localhost:3000/dashboard
7. Projektek: http://localhost:3000/dashboard/projects
8. Hozz létre egy új projektet
9. Szerkeszd a projektet
10. Töröld a projektet

---

## 🧪 Manual Testing Checklist

### Authentication
- [ ] Regisztráció működik
- [ ] Email megerősítés működik
- [ ] Bejelentkezés működik
- [ ] Hibás jelszó esetén error message
- [ ] Kijelentkezés működik

### Protected Routes
- [ ] `/dashboard` redirect `/login`-ra ha nincs session
- [ ] `/login` redirect `/dashboard`-ra ha van session

### Projects CRUD
- [ ] Projekt lista betöltődik
- [ ] Új projekt létrehozás
- [ ] Auto identifier generálódik (PROJ-YYYYMMDD-NNN)
- [ ] Projekt szerkesztés
- [ ] Projekt törlés (soft delete)
- [ ] Toast notification-ök megjelennek

### UI/UX
- [ ] Responsive design mobile-on
- [ ] Responsive design tablet-en
- [ ] Button hover states
- [ ] Loading spinners megjelennek
- [ ] Empty state megjelenik ha nincs projekt
- [ ] Modal-ok bezárhatók X gombbal és backdrop click-kel

### Role-Based Access (Admin/User)
- [ ] Admin látja az összes projektet
- [ ] User csak saját projektjeit látja
- [ ] User nem szerkeszthet admin projekteket

---

## 📝 Következő Lépések (FÁZIS 3 & 4)

### FÁZIS 3 - Security & QA
- Security Analyst: RLS policy audit, XSS/CSRF védelem
- QA Tester: Automated testing, E2E tests, Bug fixes

### FÁZIS 4 - Deployment
- DevOps Engineer: Netlify deployment, Environment setup, Monitoring

---

**Oldalak státusz:** ✅ Dokumentálva (Implementáció pending)
**FÁZIS 2 státusz:** ✅ Dokumentáció kész