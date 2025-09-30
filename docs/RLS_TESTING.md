# RLS Policies Tesztelési Útmutató

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Backend Engineer

---

## 📋 Áttekintés

Ez a dokumentum részletes útmutatót ad a Row Level Security (RLS) policies teszteléséhez.

---

## 🎯 Tesztelési Stratégia

### Tesztelési Szintek
1. **SQL Level:** Direct SQL query-k a Supabase SQL Editor-ban
2. **API Level:** Supabase Client SDK hívások
3. **Frontend Level:** Tényleges UI interakció

---

## 🔧 SQL Level Testing

### Setup Test Environment

**1. Create Test Users (Ha még nem léteznek)**
```sql
-- Ellenőrizd létező test user-eket
SELECT email, id FROM auth.users WHERE email LIKE '%@example.com';
```

**2. Get User IDs**
```sql
-- Admin user ID
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- User user ID
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Viewer user ID
SELECT id, email FROM auth.users WHERE email = 'viewer@example.com';
```

---

## 📊 Projects Tábla RLS Testing

### Test 1: Admin látja az összes projektet

**Lépések:**
1. Supabase Dashboard → Authentication → Users
2. Copy admin user ID
3. SQL Editor-ban futtasd:

```sql
-- Set session as admin user
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Query projects
SELECT name, auto_identifier, owner_id, deleted_at
FROM public.projects;

-- Expected: Minden nem törölt projekt látható (admin + user projektek is)
```

---

### Test 2: User csak saját projektjeit látja

```sql
-- Set session as regular user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Query projects
SELECT name, auto_identifier, owner_id, deleted_at
FROM public.projects;

-- Expected: Csak az owner_id = USER_USER_ID projektek
```

---

### Test 3: Viewer nem lát projekteket (MVP)

```sql
-- Set session as viewer user
SET LOCAL request.jwt.claims.sub = 'VIEWER_USER_ID_HERE';

-- Query projects
SELECT name, auto_identifier, owner_id, deleted_at
FROM public.projects;

-- Expected: Üres eredmény (0 rows)
```

---

### Test 4: Admin létrehozhat projektet

```sql
-- Set session as admin
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Insert project
INSERT INTO public.projects (name, owner_id)
VALUES ('Test Admin Project', 'ADMIN_USER_ID_HERE')
RETURNING *;

-- Expected: Success, auto_identifier generated
```

---

### Test 5: User létrehozhat projektet

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Insert project
INSERT INTO public.projects (name, owner_id)
VALUES ('Test User Project', 'USER_USER_ID_HERE')
RETURNING *;

-- Expected: Success
```

---

### Test 6: Viewer NEM hozhat létre projektet

```sql
-- Set session as viewer
SET LOCAL request.jwt.claims.sub = 'VIEWER_USER_ID_HERE';

-- Attempt to insert project
INSERT INTO public.projects (name, owner_id)
VALUES ('Test Viewer Project', 'VIEWER_USER_ID_HERE');

-- Expected: Error - "new row violates row-level security policy"
```

---

### Test 7: Admin szerkeszthet bármely projektet

```sql
-- Set session as admin
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Update user's project
UPDATE public.projects
SET name = 'Updated by Admin'
WHERE owner_id = 'USER_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1
RETURNING *;

-- Expected: Success (admin can update any project)
```

---

### Test 8: User CSAK saját projektjét szerkesztheti

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Try to update admin's project
UPDATE public.projects
SET name = 'Hacked by User'
WHERE owner_id = 'ADMIN_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1;

-- Expected: 0 rows affected (RLS policy blocks)

-- Update own project
UPDATE public.projects
SET name = 'Updated Own Project'
WHERE owner_id = 'USER_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1
RETURNING *;

-- Expected: Success
```

---

### Test 9: Viewer NEM szerkeszthet projektet

```sql
-- Set session as viewer
SET LOCAL request.jwt.claims.sub = 'VIEWER_USER_ID_HERE';

-- Attempt to update any project
UPDATE public.projects
SET name = 'Hacked by Viewer'
WHERE deleted_at IS NULL
LIMIT 1;

-- Expected: 0 rows affected (RLS policy blocks)
```

---

### Test 10: Soft Delete - Admin törölhet bármit

```sql
-- Set session as admin
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Soft delete user's project
UPDATE public.projects
SET deleted_at = NOW()
WHERE owner_id = 'USER_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1
RETURNING name, deleted_at;

-- Expected: Success (deleted_at NOT NULL)
```

---

### Test 11: Soft Delete - User csak sajátját törölheti

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Try to delete admin's project
UPDATE public.projects
SET deleted_at = NOW()
WHERE owner_id = 'ADMIN_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1;

-- Expected: 0 rows affected

-- Delete own project
UPDATE public.projects
SET deleted_at = NOW()
WHERE owner_id = 'USER_USER_ID_HERE'
  AND deleted_at IS NULL
LIMIT 1
RETURNING name, deleted_at;

-- Expected: Success
```

---

## 👤 Profiles Tábla RLS Testing

### Test 12: User láthatja saját profil adatait

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Query own profile
SELECT email, role FROM public.profiles WHERE id = 'USER_USER_ID_HERE';

-- Expected: Success (own profile visible)
```

---

### Test 13: User NEM láthatja más user profilját

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Try to query admin profile
SELECT email, role FROM public.profiles WHERE id = 'ADMIN_USER_ID_HERE';

-- Expected: 0 rows (RLS blocks)
```

---

### Test 14: Admin láthatja minden user profilját

```sql
-- Set session as admin
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Query all profiles
SELECT email, role FROM public.profiles;

-- Expected: All profiles visible
```

---

### Test 15: User NEM változtathatja meg saját role-ját

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Attempt to change own role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_USER_ID_HERE';

-- Expected: Error or 0 rows affected (role change blocked by WITH CHECK)
```

---

### Test 16: Admin változtathatja bármely user role-ját

```sql
-- Set session as admin
SET LOCAL request.jwt.claims.sub = 'ADMIN_USER_ID_HERE';

-- Change user role to viewer
UPDATE public.profiles
SET role = 'viewer'
WHERE id = 'USER_USER_ID_HERE'
RETURNING email, role;

-- Expected: Success

-- Change back to user
UPDATE public.profiles
SET role = 'user'
WHERE id = 'USER_USER_ID_HERE';
```

---

## 🔧 Modules & Activations RLS Testing

### Test 17: Minden user láthatja a modulokat

```sql
-- Set session as viewer
SET LOCAL request.jwt.claims.sub = 'VIEWER_USER_ID_HERE';

-- Query modules
SELECT name, slug, is_system FROM public.modules;

-- Expected: All modules visible
```

---

### Test 18: User aktiválhat modulokat magának

```sql
-- Set session as user
SET LOCAL request.jwt.claims.sub = 'USER_USER_ID_HERE';

-- Get analytics module ID
SELECT id FROM public.modules WHERE slug = 'analytics';

-- Activate module
INSERT INTO public.user_module_activations (user_id, module_id)
VALUES ('USER_USER_ID_HERE', 'ANALYTICS_MODULE_ID_HERE')
RETURNING *;

-- Expected: Success
```

---

### Test 19: Viewer NEM aktiválhat modulokat

```sql
-- Set session as viewer
SET LOCAL request.jwt.claims.sub = 'VIEWER_USER_ID_HERE';

-- Attempt to activate module
INSERT INTO public.user_module_activations (user_id, module_id)
VALUES ('VIEWER_USER_ID_HERE', 'ANALYTICS_MODULE_ID_HERE');

-- Expected: Error - "new row violates row-level security policy"
```

---

## 🌐 API Level Testing (Supabase Client)

### Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);
```

---

### Test 20: Login and Query Projects

```typescript
// Login as admin
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'admin123'
});

// Query projects
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .is('deleted_at', null);

console.log('Projects:', projects);
// Expected: All projects visible
```

---

### Test 21: User Cannot Update Admin's Project

```typescript
// Login as user
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'user123'
});

// Try to update admin's project
const { data, error } = await supabase
  .from('projects')
  .update({ name: 'Hacked' })
  .eq('owner_id', 'ADMIN_USER_ID')
  .select();

console.log('Error:', error); // Expected: No error, but 0 rows updated
console.log('Data:', data); // Expected: []
```

---

## ✅ RLS Testing Checklist

### Projects Table
- [ ] Admin látja az összes projektet
- [ ] User csak saját projektjeit látja
- [ ] Viewer nem lát projekteket
- [ ] Admin létrehozhat projektet
- [ ] User létrehozhat projektet
- [ ] Viewer NEM hozhat létre projektet
- [ ] Admin szerkeszthet bármely projektet
- [ ] User csak saját projektjét szerkesztheti
- [ ] Viewer NEM szerkeszthet projektet
- [ ] Admin törölhet (soft delete) bármely projektet
- [ ] User csak saját projektjét törölheti
- [ ] Viewer NEM törölhet projektet

### Profiles Table
- [ ] User láthatja saját profil adatait
- [ ] User NEM láthatja más user profilját
- [ ] Admin láthatja minden user profilját
- [ ] User NEM változtathatja saját role-ját
- [ ] Admin változtathatja bármely user role-ját

### Modules Table
- [ ] Minden user láthatja a modulokat
- [ ] Admin létrehozhat modulokat
- [ ] User NEM hozhat létre modulokat
- [ ] Viewer NEM hozhat létre modulokat

### User Module Activations
- [ ] User láthatja saját aktivációit
- [ ] Admin láthatja minden aktivációt
- [ ] User aktiválhat modulokat magának
- [ ] Viewer NEM aktiválhat modulokat

---

## 🐛 Troubleshooting

### RLS Policy nem működik

**Probléma:** User látja más user projektjeit
**Megoldás:**
1. Ellenőrizd: RLS enabled a táblán
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'projects';
```

2. Ellenőrizd: Policy létezik
```sql
SELECT * FROM pg_policies WHERE tablename = 'projects';
```

3. Re-apply policies script

---

### Session nem működik SQL tesztelésnél

**Probléma:** `SET LOCAL request.jwt.claims.sub` nem működik
**Megoldás:** Használj Supabase Client SDK-t API level teszteléshez

---

**Testing Complete:** ❌ (Pending testing)
**All Tests Pass:** ❌ (Pending verification)