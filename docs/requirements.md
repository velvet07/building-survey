# Követelmény Specifikáció - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Product Manager

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza a Moduláris WebApp MVP projekthez szükséges funkcionális és non-funkcionális követelményeket.

---

## 🎯 Funkcionális Követelmények

### 1. Autentikáció és Hozzáférés Kezelés

#### FR-001: Felhasználói Regisztráció
- A rendszernek lehetővé kell tennie új felhasználók regisztrációját email cím és jelszó megadásával
- Email formátum validáció kötelező
- Jelszó minimum 8 karakter hosszú legyen
- Jelszó megerősítés kötelező (két jelszó egyezésének ellenőrzése)
- Általános Szerződési Feltételek elfogadása kötelező (checkbox)
- Sikeres regisztráció után email confirmation küldése

#### FR-002: Email Megerősítés
- Regisztráció után automatikus email küldése magyar nyelven
- Email tartalmaz megerősítő linket
- Megerősítő link kattintásával fiók aktiválása
- Sikeres aktiválás után redirect login oldalra

#### FR-003: Bejelentkezés
- A rendszernek lehetővé kell tennie bejelentkezést email és jelszó párossal
- Valid credentials esetén sikeres belépés és redirect dashboard-ra
- Invalid credentials esetén hibaüzenet megjelenítése
- Session persistence biztosítása (böngésző újratöltése után is bejelentkezve)

#### FR-004: Kijelentkezés
- A rendszernek biztosítania kell kijelentkezési funkciót
- Kijelentkezés után session törlése és redirect login oldalra

---

### 2. Dashboard és Navigáció

#### FR-005: Dashboard Home Oldal
- Sikeres belépés után dashboard home oldal betöltése
- Welcome message megjelenítése user email-lel vagy névvel
- "Új projekt létrehozása" CTA button
- Projekt számlálás megjelenítése (opcionális)

#### FR-006: Sidebar Navigáció
- Bal oldali sidebar navigáció "Projektek" menüponttal
- Desktop view-ban (> 1024px) sidebar mindig látható
- Mobile/Tablet view-ban (< 1024px) sidebar collapse-elve, hamburger menu
- Aktív menüpont vizuális kiemelése

#### FR-007: Header
- Jobb felső sarok: user email cím megjelenítése
- Jobb felső sarok: role badge (Admin / User / Viewer)
- "Kijelentkezés" button

---

### 3. Projekt CRUD Műveletek

#### FR-008: Projektek Listázása
- Projektek lista megjelenítése table vagy card layout-ban
- Oszlopok: Projekt név, Auto ID, Létrehozás dátuma, Műveletek
- Empty state megjelenítése, ha nincs projekt
- Törölt projektek (deleted_at != NULL) NEM jelennek meg
- Role-based filter: User csak saját projektjeit látja, Admin mindet

#### FR-009: Projekt Létrehozása
- "Új projekt" button megnyitja a létrehozó modal-t
- Projekt név input mező kötelező
- Projekt név validáció:
  - Minimum 3 karakter
  - Maximum 100 karakter
- Auto ID automatikus generálás formátum: `PROJ-YYYYMMDD-NNN`
- Sikeres létrehozás után toast notification
- Modal bezáródás és lista frissítés

#### FR-010: Projekt Szerkesztése
- "Szerkesztés" button minden projektnél (jogosultság alapján)
- Edit form/modal megnyitása a projekt adataival
- Projekt név szerkesztése (Auto ID read-only)
- Validáció ugyanaz, mint létrehozásnál
- Optimistic update a UI-ban
- Sikeres mentés után toast notification

#### FR-011: Projekt Törlése (Soft Delete)
- "Törlés" button minden projektnél (jogosultság alapján)
- Confirmation modal megjelenítése:
  - "Biztosan törölni szeretnéd?" kérdés
  - Projekt név kiemelése
  - "Törlés" (danger) és "Mégse" button-ok
- Sikeres törlés után soft delete (deleted_at oszlop beállítása)
- Toast notification
- Projekt eltűnik a listából

---

### 4. Role-Based Access Control (RBAC)

#### FR-012: Admin Jogosultságok
- Admin látja az ÖSSZES projektet (minden user projektjét)
- Admin szerkeszthet BÁRMELY projektet
- Admin törölhet BÁRMELY projektet (soft delete)
- Admin létrehozhat új projektet
- Admin role badge megjelenítése a header-ben

#### FR-013: User Jogosultságok
- User CSAK saját projektjeit látja
- User szerkesztheti saját projektjeit
- User törölheti saját projektjeit (soft delete)
- User létrehozhat új projektet
- User role badge megjelenítése a header-ben

#### FR-014: Viewer Jogosultságok
- Viewer NEM hozhat létre új projektet (button hidden/disabled)
- Viewer NEM szerkeszthet projektet
- Viewer NEM törölhet projektet
- Viewer később láthatja a megosztott projekteket (későbbi feature)
- Viewer role badge megjelenítése a header-ben

---

### 5. Auto Identifier Generation

#### FR-015: Projekt Auto ID Generálás
- Formátum: `PROJ-YYYYMMDD-NNN`
- Dátum: mai dátum (YYYYMMDD)
- Szekvenciális szám: napi projektek száma alapján, 3 jegyű (001, 002, ...)
- Példák: `PROJ-20250929-001`, `PROJ-20250929-002`
- Auto ID generálás database trigger-rel (BEFORE INSERT)

---

## 🔒 Non-Funkcionális Követelmények

### 1. Biztonság

#### NFR-001: Supabase RLS (Row Level Security)
- `projects` táblán RLS policies engedélyezése
- SELECT policy:
  - Admin: minden nem törölt projekt
  - User: csak saját nem törölt projektek
- INSERT policy:
  - Admin és User: engedélyezett
  - Viewer: tiltott
- UPDATE policy:
  - Admin: minden projekt
  - User: csak saját projekt
  - Viewer: tiltott
- DELETE policy (soft delete):
  - Admin: minden projekt
  - User: csak saját projekt
  - Viewer: tiltott

#### NFR-002: Session Management
- Supabase Auth session kezelés
- Session persistence (refresh után is bejelentkezve)
- Secure session storage (HttpOnly cookies, ha alkalmazható)

#### NFR-003: Input Validáció
- Client-side validáció minden input mezőnél
- Server-side validáció Supabase RLS-sel
- XSS védelem (React automatikus escape)
- SQL injection védelem (Supabase ORM használat)

#### NFR-004: Password Követelmények
- Minimum 8 karakter hossz
- Email formátum validáció

---

### 2. Performance

#### NFR-005: Oldal Betöltési Idő
- Dashboard betöltés < 2 másodperc (átlagos internet kapcsolattal)
- Projekt lista betöltés < 1 másodperc

#### NFR-006: Optimistic UI Updates
- Projekt szerkesztésnél instant feedback a UI-ban
- Async műveletek loading state-tel

---

### 3. Usability

#### NFR-007: Responsive Design
- Mobile view (< 640px): single column layout, sidebar collapse
- Tablet view (640px - 1024px): responsive layout
- Desktop view (> 1024px): full sidebar, multi-column layout

#### NFR-008: Magyar Lokalizáció
- Teljes UI magyar nyelven
- Minden button, label, placeholder magyar
- Minden error message magyar
- Email template-ek magyarul

#### NFR-009: Loading States
- Minden async művelet során loading spinner megjelenítése
- Button loading state: spinner + disabled

#### NFR-010: Toast Notifications
- Sikeres műveletek után success toast (zöld)
- Hibák után error toast (piros)
- Toast auto-dismiss 3-5 másodperc után

---

### 4. Karbantarthatóság

#### NFR-011: Code Quality
- TypeScript használata (type safety)
- ESLint és Prettier konfiguráció
- Komponens-alapú architektúra (React/Next.js)

#### NFR-012: Documentation
- README.md projekt leírással
- Deployment dokumentáció
- API dokumentáció

---

### 5. Deployment

#### NFR-013: Netlify Deployment
- Main branch auto-deploy
- Environment variables biztonságos kezelése
- PR preview deploy (opcionális)

#### NFR-014: Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `.env.local` gitignore-ban

---

## ✅ Validációs Szabályok

### Email Formátum
```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```
- Nem tartalmazhat szóközt
- Tartalmaznia kell @ jelet
- Tartalmaznia kell domain-t (pl. example.com)

### Jelszó Validáció
- **Minimum hossz:** 8 karakter
- **Megengedett karakterek:** Bármilyen karakter (betű, szám, speciális karakter)
- **Kötelező elemek (későbbi feature):**
  - Legalább 1 nagybetű
  - Legalább 1 kisbetű
  - Legalább 1 szám

### Projekt Név Validáció
- **Minimum hossz:** 3 karakter
- **Maximum hossz:** 100 karakter
- **Megengedett karakterek:** Bármilyen UTF-8 karakter (magyar ékezetes karakterek is)
- **Nem lehet üres**

---

## 📊 Magyar UI Szövegek Referencia

Az összes magyar szöveg a `translations/hu.json` fájlban található.

**Fő kategóriák:**
- Auth (Login, Register, Logout)
- Dashboard (Welcome, Navigation)
- Projects (CRUD műveletek)
- Validation (Hibaüzenetek)
- Notifications (Toast üzenetek)
- Common (Gombok, label-ek)

---

## 🔄 Függőségek és Integrációk

### Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Deployment:** Netlify
- **Nyelv:** Magyar UI, English Code

### External Services
- Supabase Auth (email/password authentication)
- Supabase PostgreSQL (database)
- Netlify Hosting

---

## ✅ Acceptance Criteria (MVP Kész)

Az MVP akkor tekinthető késznek, ha:

### Auth & Session
- ✅ User regisztrálhat email/password-del
- ✅ Email confirmation működik
- ✅ User be tud lépni valid credentials-szel
- ✅ Session persistence működik
- ✅ Logout működik

### Dashboard & Navigation
- ✅ Dashboard elérhető belépés után
- ✅ Sidebar navigáció működik
- ✅ Header user info helyes

### Projekt CRUD
- ✅ User létrehozhat projektet
- ✅ Auto ID generálódik
- ✅ User szerkesztheti projektjét
- ✅ User törölheti projektjét (soft delete)
- ✅ Projekt lista megjelenítése

### Role-Based Access
- ✅ Admin látja az összes projektet
- ✅ User csak saját projektjeit látja
- ✅ Viewer nem hozhat létre/szerkeszthet/törölhet projektet

### Non-Functional
- ✅ Supabase RLS policies működnek
- ✅ Teljes UI magyarul
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications működnek
- ✅ Loading states megjelenítése

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis