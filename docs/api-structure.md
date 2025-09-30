# API Endpoint Struktúra - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** System Architect

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza az MVP API endpoint struktúráját. A projekt Supabase-t használ backend-ként, így a legtöbb API hívás Supabase Client SDK-n keresztül történik.

---

## 🔐 Autentikáció API

### Supabase Auth API (Built-in)

Supabase beépített Auth API-ját használjuk, Next.js-ből a `@supabase/ssr` package-en keresztül.

#### 1. Regisztráció

**Endpoint:** Supabase Auth API
**Method:** `supabase.auth.signUp()`
**Client Function:** `lib/auth.ts` → `signUp(email, password)`

**Request:**
```typescript
{
  email: string;        // Email cím
  password: string;     // Jelszó (min. 8 karakter)
}
```

**Response (Success):**
```typescript
{
  user: {
    id: string;
    email: string;
    email_confirmed_at: null;  // Email megerősítésre vár
    ...
  }
}
```

**Response (Error):**
```typescript
{
  error: {
    message: string;  // Hibaüzenet
    status: number;   // HTTP status code
  }
}
```

---

#### 2. Bejelentkezés

**Endpoint:** Supabase Auth API
**Method:** `supabase.auth.signInWithPassword()`
**Client Function:** `lib/auth.ts` → `signIn(email, password)`

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (Success):**
```typescript
{
  user: {
    id: string;
    email: string;
    email_confirmed_at: string;
    ...
  },
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    ...
  }
}
```

**Response (Error):**
```typescript
{
  error: {
    message: "Invalid login credentials";
    status: 400;
  }
}
```

---

#### 3. Kijelentkezés

**Endpoint:** Supabase Auth API
**Method:** `supabase.auth.signOut()`
**Client Function:** `lib/auth.ts` → `signOut()`

**Request:** N/A

**Response (Success):**
```typescript
{
  error: null;
}
```

---

#### 4. Email Confirmation Callback

**Endpoint:** `/auth/callback`
**Method:** GET (Next.js Route Handler)
**File:** `app/auth/callback/route.ts`

**Query Params:**
```typescript
{
  code: string;           // Email confirmation code
  type: "signup" | ...;   // Confirmation type
}
```

**Működés:**
1. Supabase küld egy email-t confirmation linkkel
2. User kattint a linkre
3. Redirect `/auth/callback?code=...`
4. Backend kicseréli a code-ot session-re
5. Redirect `/dashboard` vagy `/auth/login`

---

#### 5. Aktuális User Lekérdezése

**Endpoint:** Supabase Auth API
**Method:** `supabase.auth.getUser()`
**Client Function:** `lib/auth.ts` → `getCurrentUser()`

**Request:** N/A (session-based)

**Response (Success):**
```typescript
{
  user: {
    id: string;
    email: string;
    ...
  }
}
```

---

#### 6. User Role Lekérdezése

**Endpoint:** Supabase Database API
**Method:** `supabase.from('profiles').select('role')`
**Client Function:** `lib/auth.ts` → `getUserRole()`

**Request:** N/A (session-based, current user)

**Response (Success):**
```typescript
{
  data: {
    role: "admin" | "user" | "viewer";
  }
}
```

---

## 📁 Projektek API

### Supabase Database API (RLS-sel védett)

Összes projekt endpoint Supabase Client SDK-n keresztül működik, RLS policy-k automatikusan szűrik a jogosultságokat.

#### 1. Projektek Listázása

**Endpoint:** Supabase Database API
**Method:** `supabase.from('projects').select()`
**Client Function:** `lib/projects.ts` → `getProjects()`

**Request:** N/A (automatikus RLS filter)

**Query:**
```typescript
supabase
  .from('projects')
  .select('*')
  .is('deleted_at', null)  // Csak aktív projektek
  .order('created_at', { ascending: false });
```

**Response (Success):**
```typescript
{
  data: [
    {
      id: string;                // UUID
      name: string;              // Projekt név
      auto_identifier: string;   // PROJ-YYYYMMDD-NNN
      owner_id: string;          // Tulajdonos user ID
      created_at: string;        // ISO timestamp
      updated_at: string;        // ISO timestamp
      deleted_at: null;          // NULL = aktív
    },
    ...
  ]
}
```

**Megjegyzés:** RLS automatikusan filter:
- Admin → minden projekt
- User → csak saját projektek (owner_id = current_user)
- Viewer → üres lista (MVP-ben)

---

#### 2. Projekt Létrehozása

**Endpoint:** Supabase Database API
**Method:** `supabase.from('projects').insert()`
**Client Function:** `lib/projects.ts` → `createProject(name)`

**Request:**
```typescript
{
  name: string;  // Projekt név (3-100 karakter)
}
```

**Insert Query:**
```typescript
supabase
  .from('projects')
  .insert({
    name: projectName,
    owner_id: currentUserId,
    // auto_identifier automatikusan generálódik (trigger)
  })
  .select()  // Return created project
  .single();
```

**Response (Success):**
```typescript
{
  data: {
    id: string;
    name: string;
    auto_identifier: "PROJ-20250929-001";  // Auto-generated
    owner_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  }
}
```

**Response (Error - Validation):**
```typescript
{
  error: {
    message: "new row violates check constraint";
    code: "23514";  // PostgreSQL check constraint error
  }
}
```

**Response (Error - Permission):**
```typescript
{
  error: {
    message: "new row violates row-level security policy";
    code: "42501";
  }
}
```

---

#### 3. Projekt Szerkesztése

**Endpoint:** Supabase Database API
**Method:** `supabase.from('projects').update()`
**Client Function:** `lib/projects.ts` → `updateProject(id, name)`

**Request:**
```typescript
{
  id: string;    // Projekt UUID
  name: string;  // Új név (3-100 karakter)
}
```

**Update Query:**
```typescript
supabase
  .from('projects')
  .update({ name: newName })
  .eq('id', projectId)
  .select()
  .single();
```

**Response (Success):**
```typescript
{
  data: {
    id: string;
    name: string;              // Frissített név
    auto_identifier: string;   // Változatlan
    owner_id: string;
    created_at: string;
    updated_at: string;        // Auto-update trigger
    deleted_at: null;
  }
}
```

**Megjegyzés:** RLS policy automatikusan ellenőrzi:
- Admin → frissítheti bármely projektet
- User → csak saját projektjét frissítheti
- Viewer → tiltott

---

#### 4. Projekt Törlése (Soft Delete)

**Endpoint:** Supabase Database API
**Method:** `supabase.from('projects').update()`
**Client Function:** `lib/projects.ts` → `deleteProject(id)`

**Request:**
```typescript
{
  id: string;  // Projekt UUID
}
```

**Update Query (Soft Delete):**
```typescript
supabase
  .from('projects')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', projectId)
  .select()
  .single();
```

**Response (Success):**
```typescript
{
  data: {
    id: string;
    name: string;
    auto_identifier: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;  // NOT NULL = törölt
  }
}
```

**Megjegyzés:** RLS policy automatikusan ellenőrzi:
- Admin → törölheti bármely projektet
- User → csak saját projektjét törölheti
- Viewer → tiltott

---

#### 5. Egyedi Projekt Lekérdezése

**Endpoint:** Supabase Database API
**Method:** `supabase.from('projects').select()`
**Client Function:** `lib/projects.ts` → `getProjectById(id)`

**Request:**
```typescript
{
  id: string;  // Projekt UUID
}
```

**Query:**
```typescript
supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .is('deleted_at', null)
  .single();
```

**Response (Success):**
```typescript
{
  data: {
    id: string;
    name: string;
    auto_identifier: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  }
}
```

**Response (Not Found / No Permission):**
```typescript
{
  data: null;
  error: {
    message: "Row not found";
  }
}
```

---

## 🔧 Modulok API (Későbbi Feature)

### MVP-ben placeholder, később implementálva

#### 1. Modulok Listázása

**Endpoint:** Supabase Database API
**Method:** `supabase.from('modules').select()`
**Client Function:** `lib/modules.ts` → `getModules()`

**Query:**
```typescript
supabase
  .from('modules')
  .select('*')
  .order('name', { ascending: true });
```

**Response:**
```typescript
{
  data: [
    {
      id: string;
      name: string;
      slug: string;
      description: string;
      is_system: boolean;
      created_at: string;
    },
    ...
  ]
}
```

---

#### 2. User Aktivált Modulok Lekérdezése

**Endpoint:** Supabase Database API
**Method:** Custom function `get_user_active_modules()`
**Client Function:** `lib/modules.ts` → `getUserActiveModules()`

**Query:**
```typescript
supabase.rpc('get_user_active_modules');
```

**Response:**
```typescript
{
  data: [
    {
      module_id: string;
      module_name: string;
      module_slug: string;
      module_description: string;
      activated_at: string;
    },
    ...
  ]
}
```

---

#### 3. Modul Aktiválás

**Endpoint:** Supabase Database API
**Method:** Custom function `activate_module_for_user()`
**Client Function:** `lib/modules.ts` → `activateModule(moduleId)`

**Request:**
```typescript
{
  moduleId: string;
}
```

**Query:**
```typescript
supabase.rpc('activate_module_for_user', { p_module_id: moduleId });
```

**Response:**
```typescript
{
  data: true  // Success
}
```

---

#### 4. Modul Deaktiválás

**Endpoint:** Supabase Database API
**Method:** Custom function `deactivate_module_for_user()`
**Client Function:** `lib/modules.ts` → `deactivateModule(moduleId)`

**Request:**
```typescript
{
  moduleId: string;
}
```

**Query:**
```typescript
supabase.rpc('deactivate_module_for_user', { p_module_id: moduleId });
```

**Response:**
```typescript
{
  data: true  // Success
}
```

---

## 📊 Egyéb API Endpoint-ok

### 1. Projekt Statisztikák

**Endpoint:** Supabase Database API
**Method:** Custom function `get_project_statistics()`
**Client Function:** `lib/projects.ts` → `getProjectStatistics()`

**Query:**
```typescript
supabase.rpc('get_project_statistics');
```

**Response:**
```typescript
{
  data: {
    total_projects: number;
    active_projects: number;
    deleted_projects: number;
    projects_created_today: number;
    projects_created_this_week: number;
    projects_created_this_month: number;
  }
}
```

---

## 🚀 Next.js API Routes (Opcionális)

Ha szükség van custom server-side logic-ra, Next.js API route-okat használhatunk.

### Placeholder API Route Struktura

```
app/api/
├── auth/
│   └── callback/
│       └── route.ts       # Email confirmation callback
├── projects/
│   ├── route.ts           # GET /api/projects, POST /api/projects
│   └── [id]/
│       └── route.ts       # GET /api/projects/:id, PATCH /api/projects/:id
└── modules/
    └── route.ts           # GET /api/modules
```

**Megjegyzés:** MVP-ben valószínűleg NINCS szükség custom API route-okra, mert Supabase Client SDK közvetlenül hívható a frontend-ről RLS-sel védve.

---

## 🔒 Biztonsági Megfontolások

### 1. RLS (Row Level Security)
- Minden Supabase query automatikusan RLS policy-k szerint filter
- Backend szinten kikényszerített jogosultságok
- Nincs szükség manuális permission check-re a frontend-en (RLS teszi meg)

### 2. Session Management
- Supabase Auth session automatikusan kezelt
- HttpOnly cookies (biztonságos)
- Refresh token auto-refresh

### 3. CORS
- Supabase automatikusan kezeli a CORS-t
- Netlify deployment domain whitelistelve Supabase-ben

### 4. Rate Limiting
- Supabase beépített rate limiting
- Opcionális: Netlify Edge Function rate limiting

---

## 📝 Error Handling

### Általános Error Response Formátum

```typescript
{
  error: {
    message: string;       // Human-readable error message
    code: string;          // Error code (PostgreSQL vagy Supabase)
    details: string | null;
    hint: string | null;
  }
}
```

### Gyakori HTTP Status Code-ok

| Status Code | Jelentés | Példa |
|-------------|----------|-------|
| 200 | OK | Sikeres GET/UPDATE/DELETE |
| 201 | Created | Sikeres POST (create) |
| 400 | Bad Request | Validációs hiba |
| 401 | Unauthorized | Nincs bejelentkezve |
| 403 | Forbidden | RLS policy tiltja |
| 404 | Not Found | Projekt nem létezik |
| 409 | Conflict | Unique constraint violation (pl. duplicate auto_identifier) |
| 500 | Internal Server Error | Database error |

---

## ✅ API Testing

### Manuális Testing (Browser Console vagy Postman)

```typescript
// 1. Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// 2. Get Projects
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .is('deleted_at', null);

// 3. Create Project
const { data: newProject } = await supabase
  .from('projects')
  .insert({ name: 'Test Project' })
  .select()
  .single();

// 4. Update Project
const { data: updatedProject } = await supabase
  .from('projects')
  .update({ name: 'Updated Name' })
  .eq('id', projectId)
  .select()
  .single();

// 5. Soft Delete Project
const { data: deletedProject } = await supabase
  .from('projects')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', projectId)
  .select()
  .single();
```

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis