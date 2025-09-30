# Supabase Setup Guide - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Backend Engineer

---

## ⚠️ FIGYELEM - GITIGNORE

**Ez a fájl SOHA NE kerüljön git repository-ba!**
Tartalmaz érzékeny credential adatokat.

Adj hozzá a `.gitignore`-hoz:
```
docs/SUPABASE_SETUP.md
```

---

## 📋 Áttekintés

Ez a dokumentum lépésről-lépésre végigvezet a Supabase projekt létrehozásán és konfigurálásán.

---

## 🚀 1. Supabase Projekt Létrehozása

### 1.1 Supabase Account
1. Navigate to https://supabase.com
2. Sign up / Log in (GitHub account ajánlott)

### 1.2 Új Projekt Létrehozása
1. Dashboard → "New Project"
2. **Organization:** Válassz vagy hozz létre egy organization-t
3. **Project Name:** `building-survey` vagy `building-survey-mvp`
4. **Database Password:** Generálj erős jelszót (mentsd el!)
   ```
   Példa: J8kL#mN9pQ2rS5tU7vW0xY3zA6b
   ```
5. **Region:** Válaszd a legközelebbi régiót (pl. `eu-central-1` Frankfurt)
6. **Pricing Plan:** Free tier (MVP-hez elegendő)
7. Click "Create new project"

### 1.3 Várj a Projekt Inicializálásra
- Időtartam: ~2-3 perc
- Status: "Setting up project..." → "Project is ready"

---

## 🔑 2. Credentials Mentése

### 2.1 Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

**Hol találod:**
- Dashboard → Settings → API → Project URL

### 2.2 API Keys

#### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4IiwiYXVkIjoicmVhY3QtanMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODMwODQ4MCwiZXhwIjoxOTUzODg0NDgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Használat:** Frontend (browser-side), RLS-sel védett

#### Service Role Key (Secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4IiwiYXVkIjoicmVhY3QtanMiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4MzA4NDgwLCJleHAiOjE5NTM4ODQ0ODB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Használat:** Backend only (SOHA ne használd client-side!)

**Hol találod:**
- Dashboard → Settings → API → Project API keys

### 2.3 Database Connection String

#### Direct Connection (PostgreSQL)
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

#### Connection Pooler (Recommended for production)
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

**Hol találod:**
- Dashboard → Settings → Database → Connection string

---

## 📝 3. `.env.local` File Setup

### 3.1 Projekt Root-ban Hozd Létre

```bash
touch .env.local
```

### 3.2 Add Hozzá a Credentials-t

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Service Role Key (Backend Only)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Ellenőrizd a `.gitignore`-t

```bash
# .gitignore
.env.local
.env*.local
docs/SUPABASE_SETUP.md
```

---

## 🗄️ 4. Database Schema Setup

### 4.1 SQL Editor Megnyitása
- Dashboard → SQL Editor

### 4.2 Schema Script Futtatása

**Fájl:** `supabase/schema.sql`

**Lépések:**
1. Copy teljes `schema.sql` tartalom
2. Paste SQL Editor-ba
3. Run (vagy Ctrl+Enter)
4. Várj a sikeres végrehajtásra

**Ellenőrzés:**
- Dashboard → Table Editor
- Láthatóak: `profiles`, `projects`, `modules`, `user_module_activations`

### 4.3 Functions Script Futtatása

**Fájl:** `supabase/functions.sql`

**Lépések:**
1. Copy teljes `functions.sql` tartalom
2. Paste SQL Editor-ba (új query)
3. Run
4. Ellenőrizd a function-öket: Database → Functions

### 4.4 Policies Script Futtatása

**Fájl:** `supabase/policies.sql`

**Lépések:**
1. Copy teljes `policies.sql` tartalom
2. Paste SQL Editor-ba
3. Run
4. Ellenőrizd: Authentication → Policies

---

## 🔐 5. Authentication Setup

### 5.1 Email Provider Engedélyezése

**Dashboard → Authentication → Providers:**
1. **Email:** Enabled ✅
2. **Confirm email:** Enabled ✅
3. **Secure email change:** Enabled (ajánlott)

### 5.2 Redirect URLs Beállítása

**Dashboard → Authentication → URL Configuration:**

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**Megjegyzés:** Production deploy után frissítsd ezeket a Netlify URL-re!

---

## 📧 6. Email Templates Magyar Fordítása

### 6.1 Confirm Signup Email

**Dashboard → Authentication → Email Templates → Confirm signup**

**Subject:**
```
Email cím megerősítése
```

**Email Body (HTML):**
```html
<h2>Erősítsd meg az email címedet</h2>
<p>Köszönjük a regisztrációt!</p>
<p>Kattints az alábbi linkre az email címed megerősítéséhez:</p>
<p><a href="{{ .ConfirmationURL }}">Email cím megerősítése</a></p>
<p>Ha nem te regisztráltál, kérjük hagyd figyelmen kívül ezt az emailt.</p>
```

### 6.2 Reset Password Email (Későbbi Feature)

**Subject:**
```
Jelszó visszaállítása
```

**Email Body:**
```html
<h2>Jelszó visszaállítása</h2>
<p>Jelszó visszaállítási kérelmet kaptunk.</p>
<p>Kattints az alábbi linkre új jelszó beállításához:</p>
<p><a href="{{ .ConfirmationURL }}">Jelszó visszaállítása</a></p>
<p>Ha nem te kérted, hagyd figyelmen kívül ezt az emailt.</p>
```

---

## 🧪 7. Test Data Seed (Opcionális)

### 7.1 Seed Script Futtatása

**Fájl:** `supabase/seed.sql`

**Lépések:**
1. Copy `seed.sql` tartalom
2. Paste SQL Editor-ba
3. Run

**Test Users:**
- `admin@example.com` / `admin123` (role: admin)
- `user@example.com` / `user123` (role: user)
- `viewer@example.com` / `viewer123` (role: viewer)

**Test Projects:**
- 5 példa projekt különböző owner-ekkel

---

## ✅ 8. Verifikáció és Tesztelés

### 8.1 Table Editor Check
- [ ] `profiles` tábla létezik
- [ ] `projects` tábla létezik
- [ ] `modules` tábla létezik (2 system modul)
- [ ] `user_module_activations` tábla létezik

### 8.2 Functions Check
- [ ] `generate_project_identifier()` létezik
- [ ] `get_current_user_role()` létezik
- [ ] További 8 helper function

### 8.3 Policies Check
- [ ] `profiles` táblán RLS enabled + 4 policy
- [ ] `projects` táblán RLS enabled + 6 policy
- [ ] `modules` táblán RLS enabled + 4 policy
- [ ] `user_module_activations` táblán RLS enabled + 5 policy

### 8.4 Auth Check
- [ ] Email provider enabled
- [ ] Redirect URLs konfigurálva
- [ ] Email templates magyarul

---

## 🔧 9. Troubleshooting

### Error: "permission denied for schema public"
**Megoldás:** Check hogy a user-nek van-e CREATE jogosultsága
```sql
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
```

### Error: "relation already exists"
**Megoldás:** Töröld a létező táblákat és futtasd újra
```sql
DROP TABLE IF EXISTS user_module_activations CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

### Error: "function does not exist"
**Megoldás:** Ellenőrizd a function syntax-ot és futtasd újra a `functions.sql`-t

---

## 📊 10. Supabase Dashboard Overview

### Főbb Menük
- **Table Editor:** Táblák megtekintése, manuális módosítás
- **Authentication:** User-ek, providers, policies
- **Storage:** File upload (későbbi feature)
- **SQL Editor:** SQL query-k futtatása
- **Database:** Schema, functions, triggers, webhooks
- **API Docs:** Auto-generated API documentation

---

## 🔗 11. Hasznos Linkek

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript/introduction
- **Next.js + Supabase:** https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## 📝 12. Credentials Backup

**FONTOS:** Mentsd el ezeket a credential-eket biztonságos helyre (pl. password manager)!

```yaml
Project Name: building-survey
Project URL: https://xxxxxxxxxxxxx.supabase.co
Database Password: [YOUR_PASSWORD]
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Region: eu-central-1
```

---

**Setup Completed:** ❌ (Pending setup)
**Verified:** ❌ (Pending verification)