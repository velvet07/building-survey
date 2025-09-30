# 🎯 Moduláris WebApp MVP - Projekt Plan

**Verzió:** 1.1  
**Utolsó frissítés:** 2025-09-29  
**Projekt státusz:** Tervezés fázis

---

## 📋 Projekt Áttekintés

## 👥 Agent Szerepek

| Agent | Felelősségi Terület | Specialist Agent File |
|-------|---------------------|----------------------|
| 📋 **Product Manager** | Követelmények, user stories | Product-Manager-Agent.md |
| 🏗️ **System Architect** | Architektúra, tech döntések | System-Architect-Agent.md |
| 🎨 **UX/UI Designer** | UI/UX tervezés | UX-UI-Designer-Agent.md |
| 🔧 **Backend Engineer** | API, adatbázis | Backend-Engineer-Agent.md |
| 💻 **Frontend Engineer** | React/Next.js | Frontend-Engineer-Agent.md |
| 🔒 **Security Analyst** | Biztonsági audit | Security-Analyst-Agent.md |
| 🧪 **QA Tester** | Tesztelés | QA-Tester-Agent.md |
| 🚀 **DevOps Engineer** | Deployment | DevOps-Engineer-Agent.md |

*Részletes agent leírások a fenti .md fájlokban.*

### Cél
Moduláris webapplikáció alapjainak megteremtése, ahol az első modul a Projekt modul, és később további modulok aktiválhatók.

### MVP Scope (1. fázis)
- ✅ Login/Regisztráció modul
- ✅ Dashboard (alap struktúra)
- ✅ Projekt CRUD modul
- ✅ Role-based access (Admin, User, Viewer)

### Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Deployment:** Netlify
- **Nyelv:** Magyar UI

---

## 💡 Kritikus Döntési Pontok

✅ **ELDÖNTVE** - Az alábbi döntések alapján folyik a fejlesztés:

### 1. Auto Identifier formátum
**Választott megoldás:** Dátum + szekvenciális szám

**Formátum:** `PROJ-YYYYMMDD-NNN`
- Példák: `PROJ-20250929-001`, `PROJ-20250929-002`, `PROJ-20251015-001`

---

### 2. Projekt törlés típusa
**Választott megoldás:** Soft Delete

**Működés:**
- `projects` táblában `deleted_at` timestamp oszlop (nullable)
- `NULL` = aktív projekt, `NOT NULL` = törölt projekt

---

### 3. Role system kiterjedése
**Választott megoldás:** 3 Role - Admin, User, Viewer

**Jogosultságok:**
- **Admin:** Minden projekt látható/szerkeszthető, user management, modul aktiválás
- **User:** Saját projektek létrehozása/szerkesztése/törlése
- **Viewer:** Megosztott projektek megtekintése (read-only)

---

### 4. Module activation megközelítés
**Választott megoldás:** Database-Driven

**Architektúra:**
- `modules` tábla + `user_module_activations` tábla
- Admin UI-ból kapcsolgatható runtime-ban

---

## 🔄 Fejlesztési Fázisok - Agent-specifikus Feladatok

### FÁZIS 0: Alapozás és Tervezés (1-2 nap)

---

#### 📋 FELADAT #01 - Product Manager
**Feladat:** User Stories Dokumentáció Készítése

**Részfeladatok:**
- [ ] Login/Regisztráció user story-k megírása
  - "Mint felhasználó, regisztrálni szeretnék email címmel..."
  - "Mint felhasználó, be szeretnék lépni..."
- [ ] Dashboard navigáció user story-k
  - "Mint user, látni szeretném a projektek listáját..."
  - "Mint admin, látni szeretnék minden projektet..."
- [ ] Projekt CRUD user story-k
  - "Mint user, új projektet szeretnék létrehozni..."
  - "Mint user, szerkeszteni szeretném saját projektemet..."
- [ ] Role-based access user story-k
  - "Mint viewer, csak olvasni szeretném a megosztott projekteket..."

**Deliverable:**
- `docs/user-stories.md` - Minden user story acceptance criteria-val

**Időtartam:** 4 óra

---

#### 📋 FELADAT #02 - Product Manager
**Feladat:** Követelmény Specifikáció Készítése

**Részfeladatok:**
- [ ] Funkcionális követelmények dokumentálása
- [ ] Non-funkcionális követelmények (performance, security)
- [ ] Magyar UI szövegek teljes listája
  - Összes button, label, placeholder
  - Összes error message
  - Validációs szabályok szövegei
- [ ] Validációs szabályok specifikálása
  - Email formátum
  - Password minimum hossz (min. 8 karakter)
  - Projekt név hossz (min. 3, max. 100 karakter)

**Deliverable:**
- `docs/requirements.md`
- `translations/hu.json` - Magyar szövegek JSON formátumban

**Időtartam:** 4 óra

---

#### 📋 FELADAT #03 - Product Manager
**Feladat:** Role Matrix Kidolgozása

**Részfeladatok:**
- [ ] Admin jogosultságok részletes listája
  - Projektek: teljes CRUD minden projekten
  - Users: user kezelés, role módosítás
  - Modulok: aktiválás/deaktiválás
- [ ] User jogosultságok részletes listája
  - Projektek: CRUD csak saját projekteken
  - Users: saját profil szerkesztése
- [ ] Viewer jogosultságok részletes listája
  - Projektek: csak olvasás (később: megosztott projekteken)
  - Users: saját profil megtekintése

**Deliverable:**
- `docs/role-matrix.md` - Jogosultsági mátrix táblázattal

**Időtartam:** 2 óra

---

#### 🏗️ FELADAT #04 - System Architect
**Feladat:** Database Schema Tervezése

**Részfeladatok:**
- [ ] `users` tábla kiegészítése megtervezése
  - `role` enum oszlop: 'admin' | 'user' | 'viewer'
- [ ] `projects` tábla teljes sémája
  - Összes oszlop, típus, constraint
  - Foreign key kapcsolatok
  - Index-ek meghatározása
- [ ] `modules` tábla sémája
  - Modul metaadatok (name, slug, description)
  - `is_system` flag
- [ ] `user_module_activations` tábla sémája
  - Many-to-many kapcsolat user-module között
  - UNIQUE constraint

**Deliverable:**
- `supabase/schema.sql` - Teljes SQL schema CREATE TABLE statement-ekkel

**Időtartam:** 3 óra

---

#### 🏗️ FELADAT #05 - System Architect
**Feladat:** Auto Identifier Generation Logika Megtervezése

**Részfeladatok:**
- [ ] SQL Function tervezése `generate_project_identifier()` függvényhez
  - Mai dátum lekérdezése
  - Napi számláló logika
  - 3 jegyű formázás (001, 002, ...)
- [ ] BEFORE INSERT Trigger tervezése
  - Trigger neve, esemény, végrehajtási logika

**Deliverable:**
- `supabase/functions.sql` - Auto identifier SQL function és trigger

**Időtartam:** 2 óra

---

#### 🏗️ FELADAT #06 - System Architect
**Feladat:** Row Level Security Policies Tervezése

**Részfeladatok:**
- [ ] `projects` tábla SELECT policy-k
  - Admin policy (minden nem törölt projekt)
  - User policy (saját nem törölt projektek)
  - Viewer policy (placeholder - későbbi feature)
- [ ] `projects` tábla INSERT policy-k
  - Admin és User: engedélyezett
  - Viewer: tiltott
- [ ] `projects` tábla UPDATE policy-k
  - Admin: minden projekt
  - User: csak saját projekt
  - Viewer: minden tiltva
- [ ] `projects` tábla DELETE policy-k
  - Valójában UPDATE `deleted_at`
  - Admin: minden projekt
  - User: csak saját projekt
  - Viewer: minden tiltva

**Deliverable:**
- `supabase/policies.sql` - Összes RLS policy SQL formátumban

**Időtartam:** 3 óra

---

#### 🏗️ FELADAT #07 - System Architect
**Feladat:** API Endpoint Struktúra Dokumentálása

**Részfeladatok:**
- [ ] Auth endpoint-ok listája
  - `/auth/signup` (POST)
  - `/auth/login` (POST)
  - `/auth/logout` (POST)
  - `/auth/confirm` (GET)
- [ ] Project endpoint-ok listája
  - `/api/projects` (GET, POST)
  - `/api/projects/:id` (GET, PATCH, DELETE)
- [ ] Module endpoint-ok listája (későbbi feature)
  - `/api/modules` (GET)
  - `/api/user-modules` (GET, POST, DELETE)

**Deliverable:**
- `docs/api-structure.md` - API dokumentáció

**Időtartam:** 2 óra

---

#### 🏗️ FELADAT #08 - System Architect
**Feladat:** Projekt Folder Struktúra Tervezése

**Részfeladatok:**
- [ ] Next.js App Router struktúra megtervezése
  - `app/auth/` mappa struktúra
  - `app/dashboard/` mappa struktúra
  - `app/api/` mappa struktúra (ha szükséges)
- [ ] Komponens struktúra megtervezése
  - `components/auth/` komponensek listája
  - `components/layout/` komponensek listája
  - `components/projects/` komponensek listája
  - `components/ui/` közös komponensek
- [ ] Lib/utility struktúra
  - `lib/supabase.ts` - Client setup
  - `lib/auth.ts` - Auth utilities
  - `lib/projects.ts` - Project CRUD functions

**Deliverable:**
- `docs/folder-structure.md` - Teljes folder tree ASCII art-tal

**Időtartam:** 2 óra

---

#### 🏗️ FELADAT #09 - System Architect
**Feladat:** Netlify Deployment Stratégia Dokumentálása

**Részfeladatok:**
- [ ] Environment variables lista
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - További változók meghatározása
- [ ] Build settings dokumentálása
  - Build command
  - Output directory
  - Node.js verzió
- [ ] Deployment flow dokumentálása
  - Main branch auto-deploy
  - PR preview deploy stratégia
  - Rollback folyamat

**Deliverable:**
- `docs/deployment-strategy.md`

**Időtartam:** 1 óra

---

#### 🎨 FELADAT #10 - UX/UI Designer
**Feladat:** Design System Alapok Meghatározása

**Részfeladatok:**
- [ ] Color palette definiálása
  - Primary color (hex kód)
  - Secondary color
  - Success, Error, Warning, Info színek
  - Neutral színek (gray scale)
- [ ] Typography scale
  - Font family (Tailwind default vagy custom)
  - Heading méretek (h1, h2, h3, h4, h5, h6)
  - Body text méretek
  - Font weight-ek
- [ ] Spacing system
  - Margin/padding értékek (Tailwind scale)
- [ ] Border radius értékek
- [ ] Shadow értékek (Tailwind shadows)

**Deliverable:**
- `docs/design-system.md` - Tailwind config értékekkel

**Időtartam:** 3 óra

---

#### 🎨 FELADAT #11 - UX/UI Designer
**Feladat:** Komponens Stílusok Definiálása

**Részfeladatok:**
- [ ] Button stílusok
  - Primary button (Tailwind class-ok)
  - Secondary button
  - Danger button
  - Ghost/Text button
  - Loading state
  - Disabled state
- [ ] Input field stílusok
  - Default state
  - Focus state
  - Error state
  - Disabled state
  - Placeholder szöveg stílusa
- [ ] Card komponens stílus
- [ ] Modal/Dialog stílus
- [ ] Toast notification stílus

**Deliverable:**
- `docs/component-styles.md` - Minden komponens Tailwind class-okkal

**Időtartam:** 3 óra

---

#### 🎨 FELADAT #12 - UX/UI Designer
**Feladat:** Wireframe - Login Screen

**Részfeladatok:**
- [ ] Login screen layout tervezése
  - Logo pozíció
  - Email input field
  - Password input field
  - "Bejelentkezés" button
  - "Nincs még fiókod? Regisztrálj" link
  - "Elfelejtett jelszó?" link
- [ ] Mobile, Tablet, Desktop verziók
- [ ] Error state vizualizáció

**Deliverable:**
- `wireframes/login-screen.png` vagy Figma link

**Időtartam:** 2 óra

---

#### 🎨 FELADAT #13 - UX/UI Designer
**Feladat:** Wireframe - Regisztráció Screen

**Részfeladatok:**
- [ ] Regisztráció screen layout tervezése
  - Email input
  - Password input
  - Password confirmation input
  - Terms & Conditions checkbox
  - "Regisztráció" button
  - "Van már fiókod? Jelentkezz be" link
- [ ] Mobile, Tablet, Desktop verziók
- [ ] Validációs error state-ek vizualizációja

**Deliverable:**
- `wireframes/register-screen.png` vagy Figma link

**Időtartam:** 2 óra

---

#### 🎨 FELADAT #14 - UX/UI Designer
**Feladat:** Wireframe - Dashboard Layout

**Részfeladatok:**
- [ ] Dashboard layout tervezése
  - Sidebar navigáció (pozíció, szélesség, menüpontok)
  - Header (user info, logout button pozíció)
  - Content area
  - Mobile: hamburger menu tervezése
- [ ] Üres állapot tervezése (amikor nincs projekt)
  - Empty state illusztráció vagy ikon
  - "Nincs még projekted" szöveg
  - "Új projekt létrehozása" CTA button
- [ ] Projekt lista állapot tervezése
  - Projektek megjelenítése (Table vagy Card view?)

**Deliverable:**
- `wireframes/dashboard-layout-empty.png`
- `wireframes/dashboard-layout-with-projects.png`

**Időtartam:** 3 óra

---

#### 🎨 FELADAT #15 - UX/UI Designer
**Feladat:** Wireframe - Projekt Létrehozás

**Részfeladatok:**
- [ ] Projekt létrehozás UI tervezése
  - Modal vagy külön oldal? (döntés + tervezés)
  - Projekt név input field
  - Auto ID preview (read-only field vagy hint)
  - "Létrehozás" button
  - "Mégse" button
- [ ] Success feedback tervezése (toast vagy inline message)

**Deliverable:**
- `wireframes/create-project.png`

**Időtartam:** 2 óra

---

#### 🎨 FELADAT #16 - UX/UI Designer
**Feladat:** Wireframe - Projekt Szerkesztés

**Részfeladatok:**
- [ ] Projekt szerkesztés UI tervezése
  - Szerkesztő form layout
  - Projekt név input (pre-filled)
  - Auto ID megjelenítése (read-only)
  - "Mentés" button
  - "Mégse" button
- [ ] Success feedback tervezése

**Deliverable:**
- `wireframes/edit-project.png`

**Időtartam:** 1.5 óra

---

#### 🎨 FELADAT #17 - UX/UI Designer
**Feladat:** Wireframe - Projekt Törlés Confirmation

**Részfeladatok:**
- [ ] Törlés confirmation modal tervezése
  - "Biztosan törölni szeretnéd?" szöveg
  - Projekt név megjelenítése
  - "Törlés" button (danger stílus)
  - "Mégse" button

**Deliverable:**
- `wireframes/delete-project-confirmation.png`

**Időtartam:** 1 óra

---

#### 🎨 FELADAT #18 - UX/UI Designer
**Feladat:** User Flow Diagram Készítése

**Részfeladatok:**
- [ ] Regisztráció → Email confirmation → Login flow diagram
- [ ] Login → Dashboard → Projekt lista flow
- [ ] Projekt létrehozás flow
- [ ] Projekt szerkesztés flow
- [ ] Projekt törlés flow
- [ ] Admin vs User vs Viewer nézet különbségek dokumentálása

**Deliverable:**
- `docs/user-flow.md` - Flow diagramok (Mermaid, Draw.io, vagy képek)

**Időtartam:** 2 óra

---

#### 🎨 FELADAT #19 - UX/UI Designer
**Feladat:** Responsive Breakpoint-ok és Viselkedés Dokumentálása

**Részfeladatok:**
- [ ] Mobile (< 640px) viselkedés dokumentálása
  - Sidebar collapse hamburger menübe
  - Single column layout
- [ ] Tablet (640px - 1024px) viselkedés
  - Sidebar collapse vagy persistens?
- [ ] Desktop (> 1024px) viselkedés
  - Full sidebar visible

**Deliverable:**
- `docs/responsive-behavior.md`

**Időtartam:** 1 óra

---

### FÁZIS 1: Backend Alapok (2-3 nap)

---

#### 🔧 FELADAT #20 - Backend Engineer
**Feladat:** Supabase Projekt Inicializálás

**Részfeladatok:**
- [ ] Supabase projekt létrehozása Dashboard-on
- [ ] Projekt név beállítása
- [ ] Database password mentése
- [ ] Connection string dokumentálása
- [ ] API keys (anon key, service role key) dokumentálása
- [ ] Project URL dokumentálása

**Deliverable:**
- `docs/SUPABASE_SETUP.md` - Setup dokumentáció credentials-szel (GITIGNORE!)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #21 - Backend Engineer
**Feladat:** Users Tábla Kiegészítése

**Részfeladatok:**
- [ ] `role` oszlop hozzáadása
  - Típus: ENUM ('admin', 'user', 'viewer')
  - Default: 'user'
- [ ] SQL script megírása és futtatása
- [ ] Tesztelés: oszlop sikeresen létrejött

**Deliverable:**
- Frissített `supabase/schema.sql` (users tábla rész)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #22 - Backend Engineer
**Feladat:** Projects Tábla Létrehozása

**Részfeladatok:**
- [ ] `projects` tábla CREATE TABLE script megírása
  - `id` UUID primary key, default gen_random_uuid()
  - `name` TEXT NOT NULL
  - `auto_identifier` TEXT UNIQUE NOT NULL
  - `owner_id` UUID NOT NULL, foreign key -> auth.users(id)
  - `created_at` TIMESTAMPTZ DEFAULT NOW()
  - `updated_at` TIMESTAMPTZ DEFAULT NOW()
  - `deleted_at` TIMESTAMPTZ NULL
- [ ] Index-ek létrehozása
  - `owner_id` index (gyakori query)
  - `deleted_at` index (soft delete filter)
- [ ] SQL script futtatása Supabase-en
- [ ] Tesztelés: tábla és index-ek létrejöttek

**Deliverable:**
- `supabase/schema.sql` (projects tábla rész)

**Időtartam:** 1 óra

---

#### 🔧 FELADAT #23 - Backend Engineer
**Feladat:** Modules Tábla Létrehozása

**Részfeladatok:**
- [ ] `modules` tábla CREATE TABLE script
  - `id` UUID primary key
  - `name` TEXT NOT NULL
  - `slug` TEXT UNIQUE NOT NULL
  - `description` TEXT
  - `is_system` BOOLEAN DEFAULT FALSE
  - `created_at` TIMESTAMPTZ DEFAULT NOW()
- [ ] SQL script futtatása
- [ ] Tesztelés: tábla létrejött

**Deliverable:**
- `supabase/schema.sql` (modules tábla rész)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #24 - Backend Engineer
**Feladat:** User Module Activations Tábla Létrehozása

**Részfeladatok:**
- [ ] `user_module_activations` tábla CREATE TABLE script
  - `id` UUID primary key
  - `user_id` UUID NOT NULL, foreign key -> auth.users(id)
  - `module_id` UUID NOT NULL, foreign key -> modules(id)
  - `activated_at` TIMESTAMPTZ DEFAULT NOW()
  - UNIQUE constraint (user_id, module_id)
- [ ] SQL script futtatása
- [ ] Tesztelés: tábla és constraint létrejött

**Deliverable:**
- `supabase/schema.sql` (user_module_activations tábla rész)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #25 - Backend Engineer
**Feladat:** Auto Identifier Generation Function Implementálása

**Részfeladatok:**
- [ ] `generate_project_identifier()` SQL function megírása
  - Mai dátum formázása (YYYYMMDD)
  - Mai projektek számának lekérdezése
  - Új identifier generálása `PROJ-YYYYMMDD-NNN` formátumban
  - LPAD használata 3 jegyű számhoz
- [ ] Function létrehozása Supabase-en
- [ ] Tesztelés: function működik standalone hívásként

**Deliverable:**
- `supabase/functions.sql` (generate_project_identifier function)

**Időtartam:** 1.5 óra

---

#### 🔧 FELADAT #26 - Backend Engineer
**Feladat:** Auto Identifier Trigger Implementálása

**Részfeladatok:**
- [ ] BEFORE INSERT trigger létrehozása `projects` táblához
  - Trigger név: `auto_generate_project_identifier`
  - Trigger event: BEFORE INSERT
  - Meghívja a `generate_project_identifier()` function-t
- [ ] Trigger létrehozása Supabase-en
- [ ] Tesztelés: új projekt beszúrásakor auto_identifier generálódik

**Deliverable:**
- `supabase/functions.sql` (trigger definition)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #27 - Backend Engineer
**Feladat:** Updated_at Auto-Update Trigger Implementálása

**Részfeladatok:**
- [ ] `update_updated_at_column()` generic function megírása
- [ ] BEFORE UPDATE trigger létrehozása `projects` táblához
  - Trigger event: BEFORE UPDATE
  - Automatikusan frissíti `updated_at` oszlopot NOW()-ra
- [ ] Trigger létrehozása Supabase-en
- [ ] Tesztelés: projekt update esetén `updated_at` frissül

**Deliverable:**
- `supabase/functions.sql` (updated_at function és trigger)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #28 - Backend Engineer
**Feladat:** Supabase Auth Email/Password Engedélyezése

**Részfeladatok:**
- [ ] Supabase Dashboard → Authentication → Providers
- [ ] Email provider bekapcsolása
- [ ] "Confirm email" beállítás engedélyezése
- [ ] Redirect URLs beállítása
  - `http://localhost:3000/auth/callback` (development)
  - `https://<NETLIFY_URL>/auth/callback` (production - később)

**Deliverable:**
- `docs/SUPABASE_SETUP.md` - Auth config dokumentálása

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #29 - Backend Engineer
**Feladat:** Supabase Email Templates Magyar Nyelvre Fordítása

**Részfeladatok:**
- [ ] Supabase Dashboard → Authentication → Email Templates
- [ ] "Confirm signup" email template fordítása magyarra
- [ ] "Reset password" email template fordítása magyarra (későbbi feature)
- [ ] Subject és body szövegek magyar nyelvre

**Deliverable:**
- Screenshot vagy dokumentáció az email template változtatásokról

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #30 - Backend Engineer
**Feladat:** RLS Policies - Projects SELECT Policy Implementálása

**Részfeladatok:**
- [ ] Admin SELECT policy létrehozása
  - Feltétel: user role = 'admin' AND deleted_at IS NULL
- [ ] User SELECT policy létrehozása
  - Feltétel: owner_id = auth.uid() AND deleted_at IS NULL
- [ ] Policy-k aktiválása Supabase-en
- [ ] RLS engedélyezése a `projects` táblán
- [ ] Tesztelés: Admin látja az összes projektet, User csak sajátját

**Deliverable:**
- `supabase/policies.sql` (SELECT policies)

**Időtartam:** 1.5 óra

---

#### 🔧 FELADAT #31 - Backend Engineer
**Feladat:** RLS Policies - Projects INSERT Policy Implementálása

**Részfeladatok:**
- [ ] Admin és User INSERT policy létrehozása
  - Feltétel: user role IN ('admin', 'user')
- [ ] Viewer INSERT tiltása (nincs policy vagy explicit deny)
- [ ] Policy aktiválása Supabase-en
- [ ] Tesztelés: Admin és User tud projektet létrehozni, Viewer nem

**Deliverable:**
- `supabase/policies.sql` (INSERT policies)

**Időtartam:** 1 óra

---

#### 🔧 FELADAT #32 - Backend Engineer
**Feladat:** RLS Policies - Projects UPDATE Policy Implementálása

**Részfeladatok:**
- [ ] Admin UPDATE policy létrehozása
  - Feltétel: user role = 'admin'
- [ ] User UPDATE policy létrehozása
  - Feltétel: owner_id = auth.uid()
- [ ] Viewer UPDATE tiltása (nincs policy)
- [ ] Policy-k aktiválása Supabase-en
- [ ] Tesztelés: Admin bármelyik projektet szerkesztheti, User csak sajátját

**Deliverable:**
- `supabase/policies.sql` (UPDATE policies)

**Időtartam:** 1 óra

---

#### 🔧 FELADAT #33 - Backend Engineer
**Feladat:** RLS Policies - Projects DELETE (Soft Delete) Policy Implementálása

**Részfeladatok:**
- [ ] Admin UPDATE policy létrehozása `deleted_at` oszlophoz
  - Feltétel: user role = 'admin'
- [ ] User UPDATE policy létrehozása `deleted_at` oszlophoz
  - Feltétel: owner_id = auth.uid()
- [ ] Viewer DELETE tiltása (nincs policy)
- [ ] Policy-k aktiválása Supabase-en
- [ ] Tesztelés: Admin bármelyik projektet törölheti, User csak sajátját

**Deliverable:**
- `supabase/policies.sql` (DELETE/soft delete policies)

**Időtartam:** 1 óra

---

#### 🔧 FELADAT #34 - Backend Engineer
**Feladat:** Test Data Seed Script - Users

**Részfeladatok:**
- [ ] 3 test user létrehozása Supabase Auth-ban (vagy SQL script)
  - Admin: `admin@example.com` / password: `admin123` / role: 'admin'
  - User: `user@example.com` / password: `user123` / role: 'user'
  - Viewer: `viewer@example.com` / password: `viewer123` / role: 'viewer'
- [ ] User-ek role oszlopának frissítése
- [ ] SQL seed script megírása

**Deliverable:**
- `supabase/seed.sql` (users rész)

**Időtartam:** 1 óra

---

#### 🔧 FELADAT #35 - Backend Engineer
**Feladat:** Test Data Seed Script - Projects

**Részfeladatok:**
- [ ] 5 minta projekt INSERT statement megírása
  - 3 projekt admin user tulajdonában
  - 2 projekt user user tulajdonában
  - Változatos nevek
- [ ] Auto identifier manuális megadása VAGY trigger működni fog
- [ ] SQL seed script megírása és futtatása
- [ ] Tesztelés: 5 projekt létrejött

**Deliverable:**
- `supabase/seed.sql` (projects rész)

**Időtartam:** 30 perc

---

#### 🔧 FELADAT #36 - Backend Engineer
**Feladat:** Test Data Seed Script - Modules

**Részfeladatok:**
- [ ] 2 modul INSERT statement megírása
  - "Projekt modul" (slug: 'projects', is_system: true)
  - "Placeholder modul" (slug: 'placeholder', is_system: false)
- [ ] SQL seed script megírása és futtatása
- [ ] Tesztelés: 2 modul létrejött

**Deliverable:**
- `supabase/seed.sql` (modules rész)

**Időtartam:** 15 perc

---

#### 🔧 FELADAT #37 - Backend Engineer
**Feladat:** Test Data Seed Script - User Module Activations

**Részfeladatok:**
- [ ] Admin és User számára minden modul aktiválása
- [ ] Viewer számára csak "Projekt modul" aktiválása
- [ ] SQL seed script megírása és futtatása
- [ ] Tesztelés: Aktivációk létrejöttek

**Deliverable:**
- `supabase/seed.sql` (user_module_activations rész)

**Időtartam:** 15 perc

---

### FÁZIS 2: Frontend Implementáció (4-5 nap)

---

#### 💻 FELADAT #38 - Frontend Engineer
**Feladat:** Next.js Projekt Inicializálás

**Részfeladatok:**
- [ ] `npx create-next-app@latest` futtatása
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: No (használjuk az `app/` directory-t)
  - App Router: Yes
  - Import alias: `@/*`
- [ ] Git inicializálás
- [ ] `.gitignore` ellenőrzése
- [ ] Első commit

**Deliverable:**
- Inicializált Next.js projekt

**Időtartam:** 30 perc

---

#### 💻 FELADAT #39 - Frontend Engineer
**Feladat:** Folder Struktúra Létrehozása

**Részfeladatok:**
- [ ] `app/auth/login/` mappa létrehozása
- [ ] `app/auth/register/` mappa létrehozása
- [ ] `app/auth/callback/` mappa létrehozása
- [ ] `app/dashboard/` mappa létrehozása
- [ ] `app/dashboard/projects/` mappa létrehozása
- [ ] `components/auth/` mappa létrehozása
- [ ] `components/layout/` mappa létrehozása
- [ ] `components/projects/` mappa létrehozása
- [ ] `components/ui/` mappa létrehozása
- [ ] `lib/` mappa létrehozása
- [ ] `translations/` mappa létrehozása

**Deliverable:**
- Teljes folder struktúra (üres mapppák)

**Időtartam:** 15 perc

---

#### 💻 FELADAT #40 - Frontend Engineer
**Feladat:** Supabase Client Setup

**Részfeladatok:**
- [ ] `@supabase/supabase-js` npm package telepítése
- [ ] `@supabase/ssr` npm package telepítése (Next.js SSR-hez)
- [ ] `.env.local` file létrehozása
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- [ ] `lib/supabase.ts` file létrehozása
  - `createClient()` function browser-hez
  - `createServerClient()` function server components-hez
- [ ] Tesztelés: Client sikeresen inicializálódik

**Deliverable:**
- `lib/supabase.ts`
- `.env.local` (GITIGNORE!)

**Időtartam:** 1 óra

---

#### 💻 FELADAT #41 - Frontend Engineer
**Feladat:** Tailwind Config Testreszabása (Design System Alapján)

**Részfeladatok:**
- [ ] `tailwind.config.ts` frissítése
- [ ] Designer által megadott color palette hozzáadása
  - `colors.primary`, `colors.secondary`, stb.
- [ ] Typography scale finomhangolása (ha szükséges)
- [ ] Tesztelés: Custom színek használhatók

**Deliverable:**
- Frissített `tailwind.config.ts`

**Időtartam:** 30 perc

---

#### 💻 FELADAT #42 - Frontend Engineer
**Feladat:** Magyar Fordítás Utility Setup

**Részfeladatok:**
- [ ] `translations/hu.json` file létrehozása (PM által készített)
- [ ] `lib/translations.ts` utility function létrehozása
  - `t(key: string)` function magyar szöveg visszaadására
- [ ] Példa használat tesztelése

**Deliverable:**
- `translations/hu.json`
- `lib/translations.ts`

**Időtartam:** 30 perc

---

#### 💻 FELADAT #43 - Frontend Engineer
**Feladat:** Auth Utility Functions Létrehozása

**Részfeladatok:**
- [ ] `lib/auth.ts` file létrehozása
- [ ] `signUp(email, password)` async function
- [ ] `signIn(email, password)` async function
- [ ] `signOut()` async function
- [ ] `getCurrentUser()` async function
- [ ] `getUserRole()` async function (role lekérdezése DB-ből)
- [ ] Error handling minden function-ben

**Deliverable:**
- `lib/auth.ts`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #44 - Frontend Engineer
**Feladat:** LoginForm Komponens Implementálása

**Részfeladatok:**
- [ ] `components/auth/LoginForm.tsx` létrehozása
- [ ] Email input field
  - Placeholder: "Email cím"
  - Type: email
  - Required validáció
- [ ] Password input field
  - Placeholder: "Jelszó"
  - Type: password
  - Required validáció
- [ ] "Bejelentkezés" button
  - onClick: signIn function hívás
  - Loading state kezelése
- [ ] Error message megjelenítés (magyar)
- [ ] "Nincs még fiókod? Regisztrálj" link
- [ ] Tailwind styling (Designer specifikáció szerint)

**Deliverable:**
- `components/auth/LoginForm.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #45 - Frontend Engineer
**Feladat:** Login Oldal Implementálása

**Részfeladatok:**
- [ ] `app/auth/login/page.tsx` létrehozása
- [ ] LoginForm komponens importálása és használata
- [ ] Layout styling
  - Centered layout
  - Logo (ha van)
  - Responsive design
- [ ] Metadata beállítása (title, description)

**Deliverable:**
- `app/auth/login/page.tsx`

**Időtartam:** 1 óra

---

#### 💻 FELADAT #46 - Frontend Engineer
**Feladat:** RegisterForm Komponens Implementálása

**Részfeladatok:**
- [ ] `components/auth/RegisterForm.tsx` létrehozása
- [ ] Email input field
- [ ] Password input field
  - Min. 8 karakter validáció
- [ ] Password confirmation input field
  - Match validáció
- [ ] Terms & Conditions checkbox
  - "Elfogadom az Általános Szerződési Feltételeket" magyar szöveg
- [ ] "Regisztráció" button
  - onClick: signUp function hívás
  - Loading state
- [ ] Error message megjelenítés (magyar)
  - "A jelszavak nem egyeznek"
  - "Hibás email formátum"
  - stb.
- [ ] "Van már fiókod? Jelentkezz be" link
- [ ] Tailwind styling

**Deliverable:**
- `components/auth/RegisterForm.tsx`

**Időtartam:** 3 óra

---

#### 💻 FELADAT #47 - Frontend Engineer
**Feladat:** Regisztráció Oldal Implementálása

**Részfeladatok:**
- [ ] `app/auth/register/page.tsx` létrehozása
- [ ] RegisterForm komponens importálása és használata
- [ ] Layout styling (hasonló login oldalhoz)
- [ ] Metadata beállítása

**Deliverable:**
- `app/auth/register/page.tsx`

**Időtartam:** 1 óra

---

#### 💻 FELADAT #48 - Frontend Engineer
**Feladat:** Email Confirmation Callback Oldal Implementálása

**Részfeladatok:**
- [ ] `app/auth/callback/route.ts` létrehozása
- [ ] Supabase `exchangeCodeForSession()` hívás
- [ ] Success esetén redirect `/dashboard`-ra
- [ ] Error esetén redirect `/auth/login` error paraméterrel

**Deliverable:**
- `app/auth/callback/route.ts`

**Időtartam:** 1 óra

---

#### 💻 FELADAT #49 - Frontend Engineer
**Feladat:** Protected Route Middleware Implementálása

**Részfeladatok:**
- [ ] `middleware.ts` létrehozása a projekt root-ban
- [ ] Supabase session ellenőrzése
- [ ] Ha nincs session ÉS protected route → redirect `/auth/login`
- [ ] Ha van session ÉS auth route → redirect `/dashboard`
- [ ] Protected routes: `/dashboard/*`
- [ ] Public routes: `/auth/*`, `/`

**Deliverable:**
- `middleware.ts`

**Időtartam:** 1.5 óra

---

#### 💻 FELADAT #50 - Frontend Engineer
**Feladat:** Header Komponens Implementálása

**Részfeladatok:**
- [ ] `components/layout/Header.tsx` létrehozása
- [ ] User email megjelenítése (lekérdezés Supabase-ből)
- [ ] User role megjelenítése (badge: Admin, User, vagy Viewer)
- [ ] Logout button
  - onClick: signOut function + redirect login
- [ ] Tailwind styling (Designer szerint)

**Deliverable:**
- `components/layout/Header.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #51 - Frontend Engineer
**Feladat:** Sidebar Komponens Implementálása

**Részfeladatok:**
- [ ] `components/layout/Sidebar.tsx` létrehozása
- [ ] Navigációs menü
  - "Projektek" menüpont (link: `/dashboard/projects`)
  - "Modulok" menüpont (későbbi feature, placeholder)
- [ ] Active state kezelése (current route highlight)
- [ ] Tailwind styling
  - Desktop: mindig látható
  - Mobile: collapse állapot (később implementálva)

**Deliverable:**
- `components/layout/Sidebar.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #52 - Frontend Engineer
**Feladat:** Sidebar Mobile Toggle Implementálása

**Részfeladatok:**
- [ ] Hamburger menu button hozzáadása Header-hez (mobile view-ban)
- [ ] State kezelés: Sidebar open/closed
- [ ] Sidebar slide-in animáció mobilon
- [ ] Overlay background mobilon (click to close)
- [ ] Responsive breakpoint: < 768px

**Deliverable:**
- Frissített `components/layout/Header.tsx` és `Sidebar.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #53 - Frontend Engineer
**Feladat:** DashboardLayout Komponens Implementálása

**Részfeladatok:**
- [ ] `app/dashboard/layout.tsx` létrehozása
- [ ] Sidebar és Header komponensek importálása
- [ ] Layout struktúra:
  - Header: top
  - Sidebar: left
  - Children (content area): main
- [ ] Tailwind Grid vagy Flexbox layout
- [ ] Responsive layout (sidebar collapse mobilon)

**Deliverable:**
- `app/dashboard/layout.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #54 - Frontend Engineer
**Feladat:** EmptyState Komponens Implementálása

**Részfeladatok:**
- [ ] `components/ui/EmptyState.tsx` létrehozása
- [ ] Props: `title`, `description`, `actionLabel`, `onAction`
- [ ] Icon vagy illusztráció megjelenítése
- [ ] CTA button (opcionális)
- [ ] Tailwind styling (centered, responsive)

**Deliverable:**
- `components/ui/EmptyState.tsx`

**Időtartam:** 1.5 óra

---

#### 💻 FELADAT #55 - Frontend Engineer
**Feladat:** Dashboard Home Oldal Implementálása

**Részfeladatok:**
- [ ] `app/dashboard/page.tsx` létrehozása
- [ ] Üdvözlő szöveg megjelenítése
  - "Üdvözöllek, [User név]!"
- [ ] Projekt számláló megjelenítése (opcionális)
  - "Összesen X projekted van"
- [ ] "Új projekt létrehozása" CTA button
  - Link: `/dashboard/projects`
- [ ] Tailwind styling

**Deliverable:**
- `app/dashboard/page.tsx`

**Időtartam:** 1.5 óra

---

#### 💻 FELADAT #56 - Frontend Engineer
**Feladat:** Project Utility Functions Létrehozása

**Részfeladatok:**
- [ ] `lib/projects.ts` file létrehozása
- [ ] `getProjects()` async function
  - Supabase SELECT query
  - WHERE deleted_at IS NULL
  - RLS automatikusan filter role szerint
- [ ] `createProject(name)` async function
  - Supabase INSERT
- [ ] `updateProject(id, name)` async function
  - Supabase UPDATE
- [ ] `deleteProject(id)` async function
  - Valójában UPDATE deleted_at = NOW()
- [ ] Error handling minden function-ben

**Deliverable:**
- `lib/projects.ts`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #57 - Frontend Engineer
**Feladat:** ProjectList Komponens Implementálása

**Részfeladatok:**
- [ ] `components/projects/ProjectList.tsx` létrehozása
- [ ] Props: `projects` array
- [ ] Table vagy Card view (Designer döntése szerint)
- [ ] Oszlopok: Projekt név, Auto ID, Létrehozás dátuma, Műveletek
- [ ] Műveletek oszlop:
  - "Szerkesztés" button/icon
  - "Törlés" button/icon
- [ ] Empty state ha nincs projekt (EmptyState komponens használata)
- [ ] Tailwind styling (responsive table vagy card grid)

**Deliverable:**
- `components/projects/ProjectList.tsx`

**Időtartam:** 3 óra

---

#### 💻 FELADAT #58 - Frontend Engineer
**Feladat:** Projekt Lista Oldal Implementálása

**Részfeladatok:**
- [ ] `app/dashboard/projects/page.tsx` létrehozása
- [ ] `getProjects()` hívás (server component vagy useEffect)
- [ ] ProjectList komponens használata
- [ ] "Új projekt" button header-ben vagy oldal tetején
- [ ] Loading state kezelése
- [ ] Error state kezelése
- [ ] Metadata beállítása

**Deliverable:**
- `app/dashboard/projects/page.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #59 - Frontend Engineer
**Feladat:** CreateProjectModal Komponens Implementálása

**Részfeladatok:**
- [ ] `components/projects/CreateProjectModal.tsx` létrehozása
- [ ] Props: `isOpen`, `onClose`, `onSuccess`
- [ ] Modal overlay és content
- [ ] Projekt név input field
  - Validáció: min. 3 karakter, max. 100 karakter
  - Magyar placeholder és error message
- [ ] Auto ID preview (opcionális)
  - Mutatja a várható formátumot: "PROJ-20250929-XXX"
- [ ] "Létrehozás" button
  - onClick: createProject() hívás
  - Loading state
- [ ] "Mégse" button
  - onClick: onClose()
- [ ] Success esetén onSuccess() callback + modal bezárása
- [ ] Tailwind styling (Designer szerint)

**Deliverable:**
- `components/projects/CreateProjectModal.tsx`

**Időtartam:** 3 óra

---

#### 💻 FELADAT #60 - Frontend Engineer
**Feladat:** CreateProjectModal Integráció Projekt Lista Oldalon

**Részfeladatok:**
- [ ] State kezelés: modal open/closed
- [ ] "Új projekt" button onClick: modal megnyitása
- [ ] Modal component használata
- [ ] onSuccess callback: projektek lista refresh
- [ ] Toast notification megjelenítése (success)

**Deliverable:**
- Frissített `app/dashboard/projects/page.tsx`

**Időtartam:** 1 óra

---

#### 💻 FELADAT #61 - Frontend Engineer
**Feladat:** EditProjectForm Komponens Implementálása

**Részfeladatok:**
- [ ] `components/projects/EditProjectForm.tsx` létrehozása
- [ ] Props: `project`, `onClose`, `onSuccess`
- [ ] Projekt név input field (pre-filled a jelenlegi névvel)
  - Validáció: min. 3 karakter
- [ ] Auto ID megjelenítése (read-only field vagy text)
- [ ] "Mentés" button
  - onClick: updateProject() hívás
  - Loading state
  - Optimistic update (instant UI feedback)
- [ ] "Mégse" button
- [ ] Success esetén onSuccess() callback
- [ ] Tailwind styling

**Deliverable:**
- `components/projects/EditProjectForm.tsx`

**Időtartam:** 2.5 óra

---

#### 💻 FELADAT #62 - Frontend Engineer
**Feladat:** EditProjectModal vagy Oldal Implementálása

**Részfeladatok:**
- [ ] Döntés: Modal vagy külön oldal? (Designer szerint)
- [ ] **Ha Modal:**
  - `components/projects/EditProjectModal.tsx`
  - EditProjectForm beágyazása
- [ ] **Ha külön oldal:**
  - `app/dashboard/projects/[id]/edit/page.tsx`
  - EditProjectForm használata
- [ ] Integration a ProjectList-be ("Szerkesztés" button)

**Deliverable:**
- Modal vagy edit oldal implementáció

**Időtartam:** 2 óra

---

#### 💻 FELADAT #63 - Frontend Engineer
**Feladat:** DeleteConfirmationModal Komponens Implementálása

**Részfeladatok:**
- [ ] `components/projects/DeleteConfirmationModal.tsx` létrehozása
- [ ] Props: `isOpen`, `projectName`, `onConfirm`, `onCancel`
- [ ] Modal layout
  - "Biztosan törölni szeretnéd?" szöveg
  - Projekt név megjelenítése (bold vagy highlight)
  - Figyelmeztetés szöveg (opcionális)
- [ ] "Törlés" button (danger stílus - piros)
  - onClick: onConfirm()
  - Loading state
- [ ] "Mégse" button
  - onClick: onCancel()
- [ ] Tailwind styling

**Deliverable:**
- `components/projects/DeleteConfirmationModal.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #64 - Frontend Engineer
**Feladat:** DeleteConfirmationModal Integráció Projekt Lista Oldalon

**Részfeladatok:**
- [ ] State kezelés: modal open/closed + selected project
- [ ] "Törlés" button onClick: modal megnyitása
- [ ] onConfirm callback: deleteProject() hívás + lista refresh
- [ ] Toast notification (success: "Projekt törölve")
- [ ] Error handling

**Deliverable:**
- Frissített `app/dashboard/projects/page.tsx` és ProjectList komponens

**Időtartam:** 1.5 óra

---

#### 💻 FELADAT #65 - Frontend Engineer
**Feladat:** Toast Notification System Implementálása

**Részfeladatok:**
- [ ] Toast library telepítése (pl. `react-hot-toast` vagy `sonner`)
- [ ] Toast Provider setup (`app/layout.tsx`-ban)
- [ ] Toast utility functions
  - `showSuccess(message)`
  - `showError(message)`
  - `showInfo(message)`
- [ ] Magyar üzenetek minden toast-ban
- [ ] Tailwind styling (Designer által megadott toast stílus)

**Deliverable:**
- Toast system setup
- `lib/toast.ts` utility functions

**Időtartam:** 1.5 óra

---

#### 💻 FELADAT #66 - Frontend Engineer
**Feladat:** Loading Spinner Komponens Implementálása

**Részfeladatok:**
- [ ] `components/ui/LoadingSpinner.tsx` létrehozása
- [ ] Spinner animáció (CSS vagy Tailwind)
- [ ] Size variants: small, medium, large
- [ ] Color customization (optional prop)
- [ ] Használat minden loading state-ben

**Deliverable:**
- `components/ui/LoadingSpinner.tsx`

**Időtartam:** 1 óra

---

#### 💻 FELADAT #67 - Frontend Engineer
**Feladat:** Button Komponens Létrehozása (Reusable)

**Részfeladatok:**
- [ ] `components/ui/Button.tsx` létrehozása
- [ ] Props: `variant`, `size`, `disabled`, `loading`, `onClick`, `children`
- [ ] Variants: primary, secondary, danger, ghost
- [ ] Loading state: spinner + disabled
- [ ] Tailwind styling (Designer specifikáció szerint)
- [ ] Használat helyettesítése minden button helyén

**Deliverable:**
- `components/ui/Button.tsx`

**Időtartam:** 2 óra

---

#### 💻 FELADAT #68 - Frontend Engineer
**Feladat:** Input Komponens Létrehozása (Reusable)

**Részfeladatok:**
- [ ] `components/ui/Input.tsx` létrehozása
- [ ] Props: `type`, `placeholder`, `value`, `onChange`, `error`, `disabled`
- [ ] Error state styling (red border, error message alatta)
- [ ] Focus state styling
- [ ] Tailwind styling (Designer szerint)
- [ ] Használat helyettesítése minden input helyén

**Deliverable:**
- `components/ui/Input.tsx`

**Időtartam:** 2 óra

---

### FÁZIS 3: Biztonsági Audit és Tesztelés (1-2 nap)

---

#### 🔒 FELADAT #69 - Security Analyst
**Feladat:** Supabase RLS Policy Tesztelés - Admin Role

**Részfeladatok:**
- [ ] Bejelentkezés admin test userrel
- [ ] Tesztelés: Minden projekt látható a listában
- [ ] Tesztelés: Admin szerkeszthet bármely projektet
- [ ] Tesztelés: Admin törölhet bármely projektet
- [ ] Tesztelés: Admin létrehozhat új projektet
- [ ] Bug-ok dokumentálása (ha vannak)

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Admin role teszt eredmények

**Időtartam:** 1 óra

---

#### 🔒 FELADAT #70 - Security Analyst
**Feladat:** Supabase RLS Policy Tesztelés - User Role

**Részfeladatok:**
- [ ] Bejelentkezés user test userrel
- [ ] Tesztelés: CSAK saját projektek láthatók
- [ ] Tesztelés: User NEM látja admin vagy más user projektjeit
- [ ] Tesztelés: User szerkesztheti saját projektjét
- [ ] Tesztelés: User NEM szerkesztheti más user projektjét (API hívás próba)
- [ ] Tesztelés: User törölheti saját projektjét
- [ ] Tesztelés: User létrehozhat új projektet
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - User role teszt eredmények

**Időtartam:** 1.5 óra

---

#### 🔒 FELADAT #71 - Security Analyst
**Feladat:** Supabase RLS Policy Tesztelés - Viewer Role

**Részfeladatok:**
- [ ] Bejelentkezés viewer test userrel
- [ ] Tesztelés: Viewer NEM hozhat létre új projektet (UI és API szinten)
- [ ] Tesztelés: Viewer NEM szerkeszthet projektet
- [ ] Tesztelés: Viewer NEM törölhet projektet
- [ ] Tesztelés: Viewer láthat-e valamit? (később: megosztott projektek)
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Viewer role teszt eredmények

**Időtartam:** 1 óra

---

#### 🔒 FELADAT #72 - Security Analyst
**Feladat:** Nem Authentikált Hozzáférés Tesztelése

**Részfeladatok:**
- [ ] Kijelentkezés
- [ ] Tesztelés: `/dashboard` redirect `/auth/login`-ra
- [ ] Tesztelés: API endpoint-ok (Supabase) nem elérhetők session nélkül
- [ ] Tesztelés: Direct URL próbálkozás protected route-okra
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Unauthenticated access teszt eredmények

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #73 - Security Analyst
**Feladat:** Environment Variables Biztonságának Ellenőrzése

**Részfeladatok:**
- [ ] `.env.local` NEM commitolva git-be (gitignore ellenőrzés)
- [ ] `NEXT_PUBLIC_*` változók csak public adatokat tartalmaznak
- [ ] Service role key (ha van) NEM van client-side kódban
- [ ] API keys NEM jelennek meg a browser DevTools-ban
- [ ] Dokumentáció frissítése

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Environment variables security

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #74 - Security Analyst
**Feladat:** XSS Védelem Ellenőrzése

**Részfeladatok:**
- [ ] User input sanitization ellenőrzése (React automatikusan escape-eli)
- [ ] Tesztelés: Projekt név `<script>alert('XSS')</script>` próba
- [ ] Tesztelés: HTML tag-ek megjelenítése helyett escape-elődnek
- [ ] `dangerouslySetInnerHTML` használat ellenőrzése (nem szabad lennie)
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - XSS protection teszt eredmények

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #75 - Security Analyst
**Feladat:** Password Strength Requirements Ellenőrzése

**Részfeladatok:**
- [ ] Regisztráció során password hossz ellenőrzése (min. 8 karakter)
- [ ] Hibaüzenet magyar nyelven megjelenik
- [ ] Túl rövid jelszó esetén regisztráció sikertelen
- [ ] Dokumentáció: ajánlott további requirements (pl. uppercase, number)

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Password requirements teszt

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #76 - Security Analyst
**Feladat:** Supabase Rate Limiting Ellenőrzése

**Részfeladatok:**
- [ ] Supabase Dashboard → Settings → API ellenőrzése
- [ ] Rate limiting beállítások dokumentálása
- [ ] Alapértelmezett limit ellenőrzése (ha van)
- [ ] Ajánlás: További rate limiting (ha szükséges)

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Rate limiting dokumentáció

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #77 - Security Analyst
**Feladat:** Session Timeout Beállítások Ellenőrzése

**Részfeladatok:**
- [ ] Supabase Auth session timeout ellenőrzése
- [ ] Alapértelmezett session élettartam dokumentálása
- [ ] Refresh token működés ellenőrzése
- [ ] Ajánlás: Biztonságos session timeout beállítás

**Deliverable:**
- `docs/SECURITY_AUDIT.md` - Session management dokumentáció

**Időtartam:** 30 perc

---

#### 🔒 FELADAT #78 - Security Analyst
**Feladat:** GDPR Compliance Checklist Létrehozása

**Részfeladatok:**
- [ ] Privacy Policy link elhelyezése (placeholder vagy valódi link)
- [ ] Cookie consent szükségességének ellenőrzése
  - Supabase használ-e cookie-kat?
  - Third-party tracking?
- [ ] User data export funkció státusza (későbbi feature)
- [ ] Account deletion funkció státusza (későbbi feature)
- [ ] Data retention policy dokumentálása (soft delete)

**Deliverable:**
- `docs/GDPR_CHECKLIST.md` - GDPR compliance checklist

**Időtartam:** 1.5 óra

---

#### 🔒 FELADAT #79 - Security Analyst
**Feladat:** Biztonsági Audit Összefoglaló Riport Készítése

**Részfeladatok:**
- [ ] Összes teszt eredmény összegzése
- [ ] Talált sebezhetőségek listája (ha vannak)
  - Kritikus
  - Magas prioritású
  - Közepes prioritású
  - Alacsony prioritású
- [ ] Javaslatok javításra
- [ ] Sign-off (ha minden rendben)

**Deliverable:**
- `docs/SECURITY_AUDIT_SUMMARY.md`

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #80 - QA Tester
**Feladat:** Manuális Teszt - Regisztráció Flow

**Részfeladatok:**
- [ ] Valid input tesztelés
  - Email: `test@example.com`
  - Password: `ValidPassword123`
  - Password confirm: `ValidPassword123`
  - Checkbox: checked
  - Expected: Sikeres regisztráció + email confirmation prompt
- [ ] Invalid input tesztelések
  - Rossz email formátum → error message
  - Túl rövid jelszó → error message
  - Jelszavak nem egyeznek → error message
  - Checkbox nincs pipálva → form submit disabled
- [ ] Email confirmation link kattintása
- [ ] Redirect login oldalra sikeres confirmation után
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Regisztráció flow teszt eredmények

**Időtartam:** 1.5 óra

---

#### 🧪 FELADAT #81 - QA Tester
**Feladat:** Manuális Teszt - Login Flow

**Részfeladatok:**
- [ ] Valid credentials tesztelése
  - Email + helyes jelszó → sikeres belépés → redirect dashboard
- [ ] Invalid credentials tesztelések
  - Rossz jelszó → error message "Hibás email vagy jelszó"
  - Nem létező email → error message
  - Üres mezők → validációs error
- [ ] Logout funkció tesztelése
  - Logout button → kijelentkezés → redirect login
- [ ] Session persistence tesztelése
  - Bejelentkezés → böngésző újratöltése → user továbbra is bejelentkezve
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Login flow teszt eredmények

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #82 - QA Tester
**Feladat:** Manuális Teszt - Dashboard Navigáció

**Részfeladatok:**
- [ ] Dashboard home oldal betöltődése
- [ ] Sidebar menü működése
  - "Projektek" link → projektek oldal
- [ ] Header user info megjelenítése
  - Email cím helyes
  - Role badge helyes (Admin/User/Viewer)
- [ ] Logout button működése
- [ ] Mobile view tesztelése
  - Hamburger menu működése
  - Sidebar slide-in/out
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Dashboard navigáció teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #83 - QA Tester
**Feladat:** Manuális Teszt - Projekt Létrehozás

**Részfeladatok:**
- [ ] "Új projekt" button megnyitja a modal-t
- [ ] Valid projekt név beírása → "Létrehozás" button → projekt létrejön
- [ ] Auto ID generálódik (formátum: `PROJ-YYYYMMDD-NNN`)
- [ ] Toast notification megjelenik (success)
- [ ] Projekt lista frissül, új projekt látható
- [ ] Invalid input tesztelések
  - Üres név → error message
  - Túl rövid név (< 3 karakter) → error message
  - Túl hosszú név (> 100 karakter) → error message
- [ ] "Mégse" button bezárja a modal-t
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Projekt létrehozás teszt

**Időtartam:** 1.5 óra

---

#### 🧪 FELADAT #84 - QA Tester
**Feladat:** Manuális Teszt - Projekt Szerkesztés

**Részfeladatok:**
- [ ] "Szerkesztés" button megnyitja edit form/modal-t
- [ ] Jelenlegi projekt név pre-filled
- [ ] Auto ID read-only (nem szerkeszthető)
- [ ] Név módosítása → "Mentés" button → projekt frissül
- [ ] Optimistic update működik (instant feedback)
- [ ] Toast notification (success)
- [ ] Lista frissül, módosított név látható
- [ ] "Mégse" button működése
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Projekt szerkesztés teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #85 - QA Tester
**Feladat:** Manuális Teszt - Projekt Törlés

**Részfeladatok:**
- [ ] "Törlés" button megnyitja confirmation modal-t
- [ ] Modal megjeleníti projekt nevet
- [ ] "Mégse" button bezárja modal-t (projekt NEM törlődik)
- [ ] "Törlés" button → projekt soft delete (deleted_at beállítódik)
- [ ] Toast notification (success: "Projekt törölve")
- [ ] Projekt eltűnik a listából
- [ ] Database-ben projekt megmarad, de deleted_at NOT NULL
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Projekt törlés teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #86 - QA Tester
**Feladat:** Manuális Teszt - Role-Based Access (Admin)

**Részfeladatok:**
- [ ] Bejelentkezés admin userrel
- [ ] Admin látja az ÖSSZES projektet (saját + más userek projektjei)
- [ ] Admin szerkesztheti bármely projektet
- [ ] Admin törölheti bármely projektet
- [ ] Admin létrehozhat új projektet
- [ ] Header-ben "Admin" badge látható
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Admin role teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #87 - QA Tester
**Feladat:** Manuális Teszt - Role-Based Access (User)

**Részfeladatok:**
- [ ] Bejelentkezés user userrel
- [ ] User CSAK saját projektjeit látja
- [ ] User szerkesztheti saját projektjét
- [ ] User törölheti saját projektjét
- [ ] User létrehozhat új projektet
- [ ] Header-ben "User" badge látható
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - User role teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #88 - QA Tester
**Feladat:** Manuális Teszt - Role-Based Access (Viewer)

**Részfeladatok:**
- [ ] Bejelentkezés viewer userrel
- [ ] Viewer NEM látja "Új projekt" button-t (vagy disabled)
- [ ] Viewer NEM látja "Szerkesztés" button-okat (vagy disabled)
- [ ] Viewer NEM látja "Törlés" button-okat (vagy disabled)
- [ ] Projektek lista üres VAGY placeholder (később: megosztott projektek)
- [ ] Header-ben "Viewer" badge látható
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Viewer role teszt

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #89 - QA Tester
**Feladat:** Responsive Teszt - Mobile View (< 640px)

**Részfeladatok:**
- [ ] Chrome DevTools → Mobile device emulation (iPhone 12)
- [ ] Login oldal responsive
- [ ] Regisztráció oldal responsive
- [ ] Dashboard layout: sidebar collapse
- [ ] Hamburger menu működése
- [ ] Projekt lista: single column vagy horizontal scroll
- [ ] Modal-ok: full width vagy responsive width
- [ ] Button-ok elérhetők, nem túl kicsik
- [ ] Screenshot-ok készítése
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Mobile view teszt
- Screenshot-ok: `tests/screenshots/mobile/`

**Időtartam:** 2 óra

---

#### 🧪 FELADAT #90 - QA Tester
**Feladat:** Responsive Teszt - Tablet View (640px - 1024px)

**Részfeladatok:**
- [ ] Chrome DevTools → Tablet device (iPad)
- [ ] Sidebar: collapse vagy visible?
- [ ] Projekt lista: 2 column layout vagy table
- [ ] Modal-ok: centered, appropriate width
- [ ] Touch-friendly interface
- [ ] Screenshot-ok készítése
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Tablet view teszt
- Screenshot-ok: `tests/screenshots/tablet/`

**Időtartam:** 1.5 óra

---

#### 🧪 FELADAT #91 - QA Tester
**Feladat:** Responsive Teszt - Desktop View (> 1024px)

**Részfeladatok:**
- [ ] Full desktop view (1920x1080)
- [ ] Sidebar: always visible
- [ ] Projekt lista: table view vagy multi-column cards
- [ ] Layout nem túl wide (max-width container?)
- [ ] Modal-ok: centered, appropriate max-width
- [ ] Screenshot-ok készítése
- [ ] Bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Desktop view teszt
- Screenshot-ok: `tests/screenshots/desktop/`

**Időtartam:** 1 óra

---

#### 🧪 FELADAT #92 - QA Tester
**Feladat:** Browser Compatibility Teszt

**Részfeladatok:**
- [ ] Chrome (latest) - teljes flow tesztelése
- [ ] Firefox (latest) - teljes flow tesztelése
- [ ] Safari (latest) - teljes flow tesztelése (ha Mac elérhető)
- [ ] Edge (latest) - teljes flow tesztelése
- [ ] Minden böngészőben: Login, CRUD műveletek, Logout
- [ ] Browser-specifikus bug-ok dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Browser compatibility teszt

**Időtartam:** 2 óra

---

#### 🧪 FELADAT #93 - QA Tester
**Feladat:** Magyar Lokalizáció Tesztelése

**Részfeladatok:**
- [ ] Összes UI elem magyarul jelenik meg
  - Button-ok, label-ek, placeholder-ek
  - Navigációs menü
  - Toast üzenetek
- [ ] Error message-ek magyarul
  - Validációs hibák
  - API error-ok
  - Network error-ok
- [ ] Ékezetes karakterek helyes renderelése (á, é, í, ó, ö, ő, ú, ü, ű)
- [ ] Helyesírás ellenőrzése
- [ ] Következetesség ellenőrzése (pl. "Projekt" vs "Project")
- [ ] Bug-ok és helyesírási hibák dokumentálása

**Deliverable:**
- `docs/TEST_REPORT.md` - Lokalizáció teszt
- Helyesírási javítások listája (ha vannak)

**Időtartam:** 1.5 óra

---

#### 🧪 FELADAT #94 - QA Tester
**Feladat:** Playwright E2E Teszt - Auth Flow

**Részfeladatok:**
- [ ] Playwright setup (ha még nincs)
- [ ] E2E test file: `tests/e2e/auth.spec.ts`
- [ ] Test case: Sikeres regisztráció
  - Navigate to register page
  - Fill form
  - Click register button
  - Assert: confirmation message
- [ ] Test case: Sikeres login
  - Navigate to login page
  - Fill credentials
  - Click login button
  - Assert: redirected to dashboard
- [ ] Test case: Logout
  - Click logout button
  - Assert: redirected to login
- [ ] Test futtatása: `npm run test:e2e`

**Deliverable:**
- `tests/e2e/auth.spec.ts`

**Időtartam:** 3 óra

---

#### 🧪 FELADAT #95 - QA Tester
**Feladat:** Playwright E2E Teszt - Projekt CRUD

**Részfeladatok:**
- [ ] E2E test file: `tests/e2e/projects.spec.ts`
- [ ] Test case: Projekt létrehozás
  - Login
  - Navigate to projects
  - Click "Új projekt"
  - Fill name
  - Click "Létrehozás"
  - Assert: toast notification
  - Assert: project appears in list
- [ ] Test case: Projekt szerkesztés
  - Edit button click
  - Change name
  - Click "Mentés"
  - Assert: updated name visible
- [ ] Test case: Projekt törlés
  - Delete button click
  - Confirm deletion
  - Assert: project removed from list
- [ ] Test futtatása

**Deliverable:**
- `tests/e2e/projects.spec.ts`

**Időtartam:** 4 óra

---

#### 🧪 FELADAT #96 - QA Tester
**Feladat:** Playwright E2E Teszt - Role-Based Access

**Részfeladatok:**
- [ ] E2E test file: `tests/e2e/roles.spec.ts`
- [ ] Test case: Admin látja az összes projektet
  - Login as admin
  - Assert: all projects visible
- [ ] Test case: User csak saját projektjeit látja
  - Login as user
  - Assert: only owned projects visible
- [ ] Test case: Viewer nem hozhat létre projektet
  - Login as viewer
  - Assert: "Új projekt" button disabled or hidden
- [ ] Test futtatása

**Deliverable:**
- `tests/e2e/roles.spec.ts`

**Időtartam:** 3 óra

---

#### 🧪 FELADAT #97 - QA Tester
**Feladat:** QA Teszt Összefoglaló Riport Készítése

**Részfeladatok:**
- [ ] Összes manuális teszt eredmény összegzése
- [ ] E2E teszt eredmények összegzése
- [ ] Talált bug-ok listája
  - Kritikus (blocker)
  - Magas prioritású
  - Közepes prioritású
  - Alacsony prioritású (nice to have fixes)
- [ ] Bug-ok státusza (open, fixed, won't fix)
- [ ] Screenshot-ok csatolása
- [ ] Sign-off (ha minden kritikus bug javítva)

**Deliverable:**
- `docs/QA_TEST_SUMMARY.md`

**Időtartam:** 2 óra

---

### FÁZIS 4: Deployment és Monitoring (1 nap)

---

#### 🚀 FELADAT #98 - DevOps Engineer
**Feladat:** GitHub Repository Setup

**Részfeladatok:**
- [ ] GitHub repository létrehozása (ha még nincs)
- [ ] Local git repo push to GitHub
- [ ] Branch protection beállítása `main` branch-re
  - Require pull request reviews
  - Require status checks to pass
- [ ] README.md létrehozása projekt leírással

**Deliverable:**
- GitHub repository URL
- `README.md`

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #99 - DevOps Engineer
**Feladat:** Netlify Projekt Létrehozása és GitHub Integráció

**Részfeladatok:**
- [ ] Netlify account létrehozása (ha nincs)
- [ ] "New site from Git" → GitHub repo kiválasztása
- [ ] Branch selection: `main`
- [ ] Build settings beállítása
  - Build command: `npm run build` vagy `next build`
  - Publish directory: `.next`
  - Node version: 18 vagy 20 (specify)
- [ ] Deploy button → Initial deploy

**Deliverable:**
- Netlify site URL (pl. `https://random-name.netlify.app`)

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #100 - DevOps Engineer
**Feladat:** Netlify Environment Variables Konfiguráció

**Részfeladatok:**
- [ ] Netlify Dashboard → Site settings → Environment variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` hozzáadása
  - Value: Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` hozzáadása
  - Value: Supabase anon key
- [ ] Egyéb szükséges environment variable-ök hozzáadása (ha vannak)
- [ ] Redeploy trigger environment variable változások után

**Deliverable:**
- Dokumentáció: Environment variables listája

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #101 - DevOps Engineer
**Feladat:** Supabase Redirect URLs Frissítése Netlify URL-lel

**Részfeladatok:**
- [ ] Supabase Dashboard → Authentication → URL Configuration
- [ ] Site URL hozzáadása: `https://<NETLIFY_URL>`
- [ ] Redirect URLs hozzáadása:
  - `https://<NETLIFY_URL>/auth/callback`
  - `https://<NETLIFY_URL>/**` (wildcard preview deploys-hoz)
- [ ] Tesztelés: Login és registration működik production URL-en

**Deliverable:**
- Frissített Supabase redirect URLs dokumentáció

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #102 - DevOps Engineer
**Feladat:** Netlify Deploy Settings Finomhangolása

**Részfeladatok:**
- [ ] Auto-publish: Enabled (main branch minden push-ra auto-deploy)
- [ ] Deploy notifications: Email vagy Slack (opcionális)
- [ ] Build hooks: Webhook URL generálása (későbbi használatra)
- [ ] Deploy contexts:
  - Production: `main` branch
  - Branch deploys: All branches (opcionális)
  - Deploy previews: PR-ekhez enabled

**Deliverable:**
- Deploy settings dokumentáció

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #103 - DevOps Engineer
**Feladat:** Custom Domain Setup (Opcionális)

**Részfeladatok:**
- [ ] **Ha van custom domain:**
  - Netlify Dashboard → Domain settings
  - Add custom domain
  - DNS konfiguráció (CNAME vagy A record)
  - SSL certificate automatikus provisioning (Let's Encrypt)
  - HTTPS enforce beállítása
- [ ] **Ha nincs custom domain:**
  - Dokumentálni a lépéseket későbbi használatra

**Deliverable:**
- Custom domain setup dokumentáció (ha alkalmazható)

**Időtartam:** 1 óra (ha van domain)

---

#### 🚀 FELADAT #104 - DevOps Engineer
**Feladat:** Netlify Analytics Engedélyezése

**Részfeladatok:**
- [ ] Netlify Dashboard → Analytics
- [ ] Analytics engedélyezése (ha elérhető a plan-ben)
- [ ] Monitoring dashboard áttekintése
  - Page views
  - Unique visitors
  - Top pages
  - Bandwidth usage

**Deliverable:**
- Analytics setup dokumentáció

**Időtartam:** 15 perc

---

#### 🚀 FELADAT #105 - DevOps Engineer
**Feladat:** Error Tracking Setup (Opcionális - Sentry)

**Részfeladatok:**
- [ ] **Opcionális Sentry integráció:**
  - Sentry account létrehozása
  - Next.js projekt létrehozása Sentry-ben
  - `@sentry/nextjs` package telepítése
  - `sentry.client.config.ts` és `sentry.server.config.ts` setup
  - Environment variables: `SENTRY_DSN`
  - Test error trigger
- [ ] **Ha nem használunk Sentry:**
  - Dokumentálni későbbi integrációhoz

**Deliverable:**
- Sentry setup dokumentáció (ha használjuk)

**Időtartam:** 1 óra (ha használjuk Sentry-t)

---

#### 🚀 FELADAT #106 - DevOps Engineer
**Feladat:** `netlify.toml` Konfiguráció File Létrehozása

**Részfeladatok:**
- [ ] `netlify.toml` file létrehozása projekt root-ban
- [ ] Build settings:
  ```toml
  [build]
    command = "npm run build"
    publish = ".next"
  ```
- [ ] Redirects és headers (ha szükséges)
- [ ] Environment-specific settings (production, preview)
- [ ] File commit és push

**Deliverable:**
- `netlify.toml`

**Időtartam:** 30 perc

---

#### 🚀 FELADAT #107 - DevOps Engineer
**Feladat:** Production Deployment Tesztelése

**Részfeladatok:**
- [ ] Teljes application flow tesztelése production URL-en
  - Regisztráció
  - Email confirmation (email érkezik?)
  - Login
  - Dashboard navigáció
  - Projekt CRUD műveletek
  - Logout
- [ ] Performance ellenőrzése
  - Page load time elfogadható?
  - Images optimalizáltak?
- [ ] Console errors ellenőrzése (browser DevTools)
- [ ] Bug-ok dokumentálása (ha vannak)

**Deliverable:**
- Production deployment teszt riport

**Időtartam:** 1.5 óra

---

#### 🚀 FELADAT #108 - DevOps Engineer
**Feladat:** Deployment Dokumentáció Írása

**Részfeladatok:**
- [ ] `docs/DEPLOYMENT.md` file létrehozása
- [ ] Lépésről-lépésre deploy guide:
  1. GitHub push
  2. Netlify auto-deploy
  3. Environment variables ellenőrzése
  4. Supabase redirect URLs frissítése
- [ ] Rollback eljárás dokumentálása
  - Netlify Dashboard → Deploys → Previous deploy → Publish
- [ ] Environment variable változtatás folyamat
- [ ] Troubleshooting gyakori problémák

**Deliverable:**
- `docs/DEPLOYMENT.md`

**Időtartam:** 1.5 óra

---

#### 🚀 FELADAT #109 - DevOps Engineer
**Feladat:** CI/CD Pipeline Setup (Opcionális - GitHub Actions)

**Részfeladatok:**
- [ ] **Opcionális GitHub Actions workflow:**
  - `.github/workflows/ci.yml` létrehozása
  - Workflow steps:
    - Install dependencies
    - Run linter
    - Run TypeScript check
    - Run tests (E2E playwright tests)
    - Deploy to Netlify (ha success)
  - Workflow trigger: PR és push to main
- [ ] **Ha nem használunk CI/CD:**
  - Dokumentálni későbbi setup-hoz

**Deliverable:**
- `.github/workflows/ci.yml` (ha használjuk)

**Időtartam:** 2 óra (ha használjuk CI/CD-t)

---

#### 🚀 FELADAT #110 - DevOps Engineer
**Feladat:** Monitoring és Alerting Setup (Opcionális)

**Részfeladatok:**
- [ ] **Uptime monitoring (opcionális):**
  - UptimeRobot vagy Pingdom account
  - Monitor setup: https://<NETLIFY_URL>
  - Alert notification: email vagy SMS
- [ ] **Performance monitoring:**
  - Lighthouse CI (opcionális)
  - Web Vitals tracking
- [ ] Dokumentáció későbbi használatra

**Deliverable:**
- Monitoring setup dokumentáció

**Időtartam:** 1 óra (ha használjuk)

---

## 📊 Összesített Timeline

| Fázis | Időtartam | Agent-ek Száma | Összesített Agent Órák |
|-------|-----------|----------------|------------------------|
| **FÁZIS 0: Alapozás** | 1-2 nap | 3 (PM, Architect, Designer) | ~40 óra |
| **FÁZIS 1: Backend** | 2-3 nap | 1 (Backend Engineer) | ~20 óra |
| **FÁZIS 2: Frontend** | 4-5 nap | 1 (Frontend Engineer) | ~65 óra |
| **FÁZIS 3: Security & QA** | 1-2 nap | 2 (Security, QA) | ~35 óra |
| **FÁZIS 4: Deployment** | 1 nap | 1 (DevOps Engineer) | ~12 óra |
| **ÖSSZESEN** | **9-13 nap** | **8 agent** | **~172 óra** |

---

## 🔄 Munkafolyamat Függőségek

```
FÁZIS 0 (Párhuzamos - 3 agent dolgozik egyszerre)
├─ Product Manager: Feladat #01-03 → 
├─ System Architect: Feladat #04-09 → 
└─ UX/UI Designer: Feladat #10-19 →

FÁZIS 1 (Soros - 1 agent)
└─ Backend Engineer: Feladat #20-37 →

FÁZIS 2 (Soros - 1 agent, de sok feladat)
└─ Frontend Engineer: Feladat #38-68 →

FÁZIS 3 (Párhuzamos - 2 agent dolgozik egyszerre)
├─ Security Analyst: Feladat #69-79 →
└─ QA Tester: Feladat #80-97 →

FÁZIS 4 (Soros - 1 agent)
└─ DevOps Engineer: Feladat #98-110
```

---

## ✅ Definition of Done (DoD) - MVP Kész

A projekt akkor tekinthető késznek, ha:

### Auth & Session
- [ ] ✅ User regisztrálhat email/password-del
- [ ] ✅ Email confirmation működik
- [ ] ✅ User be tud lépni valid credentials-szel
- [ ] ✅ Session persistence működik (refresh után is bejelentkezve)
- [ ] ✅ Logout működik és redirect login-ra

### Dashboard & Navigation
- [ ] ✅ Dashboard elérhető belépés után
- [ ] ✅ Sidebar navigáció működik (desktop & mobile)
- [ ] ✅ Header user info helyes (email + role badge)

### Projekt CRUD
- [ ] ✅ User létrehozhat projektet
- [ ] ✅ Auto ID generálódiks