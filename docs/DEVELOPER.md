# 👨‍💻 Fejlesztői dokumentáció

## 📁 Projekt struktúra

```
building-survey/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth layout (login, register)
│   ├── dashboard/                # Dashboard layout
│   │   ├── (keret)/             # Standard layout with sidebar
│   │   │   ├── projects/        # Project management
│   │   │   ├── users/           # User management (admin only)
│   │   │   └── admin/           # Admin tools
│   │   └── (fullscreen)/        # Fullscreen layout (drawing canvas)
│   ├── api/                     # API routes
│   │   ├── upload/              # Photo upload (local storage)
│   │   ├── files/               # Photo serving
│   │   └── health/              # Health check
│   └── actions/                 # Server Actions (users, etc.)
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── drawings/                # Drawing module components
│   ├── forms/                   # Dynamic form components
│   ├── photos/                  # Photo gallery components
│   ├── projects/                # Project components
│   └── users/                   # User management components
├── lib/                         # Libraries and utilities
│   ├── supabase/               # Supabase client setup
│   ├── drawings/               # Drawing module logic
│   ├── photos/                 # Photo module logic
│   └── projects.ts             # Project CRUD
├── hooks/                       # Custom React hooks
│   └── useUserRole.ts          # Role-based permissions
├── types/                       # TypeScript type definitions
├── supabase/                    # Database schema and migrations
│   ├── schema.sql              # Main database schema
│   ├── schema_drawings.sql     # Drawing module schema
│   ├── policies.sql            # RLS policies
│   ├── functions.sql           # Database functions
│   └── migrations/             # Database migrations
├── docker/                      # Docker configuration
│   └── postgres/init/          # PostgreSQL init scripts
├── setup/                       # PHP admin setup wizard
├── docs/                        # Documentation
│   └── USER_GUIDE.md           # User manual (Hungarian)
├── docker-compose.yml           # Docker services configuration
├── Dockerfile                   # Next.js app container
└── INSTALL.md                   # Installation guide

```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (cloud)
- **Database**: PostgreSQL 15 (self-hosted via Docker)
- **Canvas**: Konva.js + React-Konva (rajzolás)
- **PDF Export**: jsPDF
- **Image Processing**: Sharp (thumbnail generation)
- **Deployment**: Docker + Docker Compose

## 🔑 Környezeti változók

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# .env.docker (production)
POSTGRES_PASSWORD=your-secure-password
POSTGRES_USER=postgres
POSTGRES_DB=building_survey
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🏗️ Fejlesztési környezet beállítása

### 1. Klónozás és függőségek telepítése

```bash
git clone https://github.com/velvet07/building-survey.git
cd building-survey
npm install
```

### 2. Supabase projekt létrehozása

1. Menj a https://supabase.com oldalra
2. Hozz létre új projektet
3. Másold ki az API kulcsokat (Settings > API)
4. Futtasd le az adatbázis sémát (Database > SQL Editor)

### 3. Adatbázis séma telepítése

```bash
# Supabase SQL Editor-ban futtasd le sorrendben:
1. supabase/schema.sql
2. supabase/schema_drawings.sql
3. supabase/functions.sql
4. supabase/functions_drawings.sql
5. supabase/policies.sql
6. supabase/policies_drawings.sql
7. supabase/migrations/add-slugs-and-local-storage.sql
8. supabase/seed.sql (opcionális - kezdő adatok)
9. supabase/seed_drawings.sql (opcionális)
```

### 4. Környezeti változók beállítása

```bash
cp .env.example .env.local
# Szerkeszd a .env.local file-t a saját Supabase kulcsaiddal
```

### 5. Development szerver indítása

```bash
npm run dev
# Böngészőben: http://localhost:3000
```

## 🎨 Modulok áttekintése

### 1. **User Management (Felhasználó kezelés)**
- **Fájlok**: `app/dashboard/(keret)/users/`, `components/users/`, `app/actions/users.ts`
- **Funkciók**: User létrehozás, szerkesztés, törlés, role módosítás
- **Role-ok**: admin, user, viewer

### 2. **Projects (Projektek)**
- **Fájlok**: `app/dashboard/(keret)/projects/`, `components/projects/`, `lib/projects.ts`
- **Funkciók**: Projekt létrehozás, szerkesztés, törlés, auto-identifier generálás
- **URL struktúra**: `/projects/{auto-identifier}` (pl. `proj-20251025-001`)

### 3. **Drawings (Rajzok)**
- **Fájlok**: `app/dashboard/(fullscreen)/projects/[id]/drawings/`, `components/drawings/`, `lib/drawings/`
- **Funkciók**: Canvas rajzolás, PDF export, A4/A3 papír méret
- **URL struktúra**: `/projects/{id}/drawings/{slug}` (pl. `alaprajz-pince`)
- **Eszközök**: Toll, radír, pan, zoom
- **Touch gestures**: Pinch-to-zoom, two-finger pan

### 4. **Forms (Űrlapok)**
- **Fájlok**: `app/dashboard/(keret)/projects/[id]/forms/`, `components/forms/`
- **Modulok**: Aquapol űrlap (dinamikus form builder)
- **Funkciók**: Auto-save, read-only mode (viewer role)

### 5. **Photos (Fotók)**
- **Fájlok**: `app/dashboard/(keret)/projects/[id]/photos/`, `components/photos/`, `lib/photos/`
- **Storage**: Lokális Docker volume (`/app/uploads`)
- **Funkciók**: Upload, thumbnail generálás, galéria, letöltés, törlés
- **API**: `/api/upload` (POST), `/api/files/{filename}` (GET)

## 🔐 Role-Based Access Control (RBAC)

### Admin
- ✅ Összes funkció elérhető
- ✅ User management
- ✅ Minden projekt szerkeszthető

### User
- ✅ Saját projektek kezelése
- ✅ Rajzok, űrlapok, fotók - teljes hozzáférés
- ❌ Más userek projektjei nem láthatók
- ❌ User management nem elérhető

### Viewer
- ✅ **Minden** projekt megtekintése (read-only)
- ✅ PDF export, fotó letöltés
- ❌ Szerkesztés, törlés, létrehozás tiltva

### Implementáció

**Hook használata:**
```typescript
import { useUserRole } from '@/hooks/useUserRole';

function MyComponent() {
  const { isAdmin, canEdit, canDelete } = useUserRole();

  return (
    <>
      {canEdit && <EditButton />}
      {isAdmin && <AdminPanel />}
    </>
  );
}
```

**RLS Policies:**
- Projects: User látja saját, Viewer/Admin mindent
- Drawings: Ugyanaz mint projects
- Photos: Ugyanaz mint projects

## 🗄️ Adatbázis táblák

### Főbb táblák
- `auth.users` - Supabase auth táblája
- `public.profiles` - User profilok és role-ok
- `public.projects` - Projektek
- `public.drawings` - Rajzok (canvas data JSONB)
- `public.photos` - Fotók (local storage)
- `public.project_form_responses` - Űrlap válaszok
- `public.modules` - Aktiválható modulok
- `public.user_module_activations` - User-modul kapcsolatok

### Főbb funkciók/triggerek
- `handle_new_user()` - Auto-create profile on registration
- `auto_generate_project_identifier()` - Auto-generate `proj-YYYYMMDD-NNN`
- `auto_generate_drawing_slug()` - Auto-generate slug from drawing name
- `update_updated_at_column()` - Auto-update `updated_at` timestamp

## 🚀 Új funkció hozzáadása

### 1. Server Action létrehozása

```typescript
// app/actions/my-feature.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function myAction(data: any) {
  const supabase = createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Your logic here
  const result = await supabase.from('my_table').insert(data);

  return result;
}
```

### 2. Komponens létrehozása

```typescript
// components/my-feature/MyComponent.tsx
'use client';

import { useState } from 'react';
import { myAction } from '@/app/actions/my-feature';

export default function MyComponent() {
  const [data, setData] = useState(null);

  const handleSubmit = async () => {
    await myAction({ name: 'test' });
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### 3. Route létrehozása

```typescript
// app/dashboard/(keret)/my-feature/page.tsx
import MyComponent from '@/components/my-feature/MyComponent';

export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
      <MyComponent />
    </div>
  );
}
```

## 📦 Build és Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker Build
```bash
docker-compose up -d --build
```

### Type Check
```bash
npm run type-check
```

## 🐛 Debugging

### Common Issues

**1. Supabase connection error**
```bash
# Check environment variables
cat .env.local
# Verify Supabase project URL and API keys
```

**2. RLS policy blocking queries**
```sql
-- Check current user role
SELECT role FROM public.profiles WHERE id = auth.uid();

-- Temporarily disable RLS for testing (NOT in production!)
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
```

**3. Canvas not rendering**
```bash
# Canvas uses client-side only libraries
# Make sure component uses 'use client' directive
# Check dynamic import with ssr: false
```

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Formatting**: 2 spaces, single quotes, semicolons
- **Components**: PascalCase
- **Files**: kebab-case (pl. `user-card.tsx`)
- **Naming**: Descriptive, Hungarian variable names OK for business logic

## 🔗 Hasznos linkek

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Konva.js Documentation](https://konvajs.org/docs/)
- [React-Konva Documentation](https://konvajs.org/docs/react/)

## 🆘 Support

Issues és kérdések: [GitHub Issues](https://github.com/velvet07/building-survey/issues)
