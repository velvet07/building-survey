# User Stories - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Product Manager

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza az MVP első verziójához szükséges összes user story-t acceptance criteria-val.

---

## 🔐 Autentikáció (Authentication)

### US-001: Felhasználói Regisztráció

**Mint** új felhasználó,
**Szeretnék** regisztrálni email címmel és jelszóval,
**Hogy** hozzáférhessek az alkalmazáshoz.

#### Acceptance Criteria
- ✅ Regisztrációs form tartalmaz email input mezőt
- ✅ Regisztrációs form tartalmaz jelszó input mezőt (min. 8 karakter)
- ✅ Regisztrációs form tartalmaz jelszó megerősítő mezőt
- ✅ Regisztrációs form tartalmaz "Általános Szerződési Feltételek elfogadása" checkbox-ot
- ✅ Email formátum validálása (valós email cím formátum)
- ✅ Jelszó hossz validálása (minimum 8 karakter)
- ✅ Két jelszó egyezésének ellenőrzése
- ✅ Checkbox kötelező pipálása regisztráció előtt
- ✅ Sikeres regisztráció után email confirmation küldése
- ✅ Hibaüzenetek magyar nyelven jelennek meg
- ✅ "Van már fiókod? Jelentkezz be" link a login oldalra visz

**Prioritás:** P0 (Critical)
**Időbecslés:** 3 óra

---

### US-002: Email Megerősítés

**Mint** regisztrált felhasználó,
**Szeretnék** megerősítő emailt kapni,
**Hogy** aktiválhassam a fiókomat.

#### Acceptance Criteria
- ✅ Regisztráció után automatikusan email küldése
- ✅ Email tartalmazza a megerősítő linket
- ✅ Email magyar nyelven van
- ✅ Megerősítő link kattintás után fiók aktiválódik
- ✅ Sikeres megerősítés után redirect login oldalra
- ✅ Üzenet megjelenítése: "Email cím sikeresen megerősítve"

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

### US-003: Bejelentkezés

**Mint** regisztrált felhasználó,
**Szeretnék** bejelentkezni email címmel és jelszóval,
**Hogy** hozzáférjek a dashboard-hoz.

#### Acceptance Criteria
- ✅ Login form tartalmaz email input mezőt
- ✅ Login form tartalmaz jelszó input mezőt
- ✅ "Bejelentkezés" button működik
- ✅ Valid credentials esetén sikeres belépés
- ✅ Sikeres belépés után redirect `/dashboard`-ra
- ✅ Invalid credentials esetén hibaüzenet: "Hibás email cím vagy jelszó"
- ✅ Email vagy jelszó mező üres esetén validációs hibaüzenet
- ✅ "Nincs még fiókod? Regisztrálj" link a regisztrációs oldalra visz
- ✅ Session persistence: böngésző újratöltése után is bejelentkezve marad

**Prioritás:** P0 (Critical)
**Időbecslés:** 2 óra

---

### US-004: Kijelentkezés

**Mint** bejelentkezett felhasználó,
**Szeretnék** kijelentkezni,
**Hogy** biztonságosan zárjam le a munkamenetemet.

#### Acceptance Criteria
- ✅ "Kijelentkezés" button látható a header-ben
- ✅ Kijelentkezés gomb kattintásra session törlődik
- ✅ Kijelentkezés után redirect `/auth/login`-ra
- ✅ Kijelentkezés után protected route-ok nem elérhetők

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

## 📊 Dashboard Navigáció

### US-005: Dashboard Home Nézet

**Mint** bejelentkezett felhasználó,
**Szeretnék** látni a dashboard home oldalt,
**Hogy** áttekintést kapjak a projektjeimről.

#### Acceptance Criteria
- ✅ Sikeres belépés után `/dashboard` oldal betöltődik
- ✅ Dashboard tartalmaz sidebar-t navigációval
- ✅ Dashboard tartalmaz header-t user info-val
- ✅ Dashboard welcome message megjelenítése: "Üdvözöllek, [User név/email]!"
- ✅ Dashboard tartalmaz CTA button-t: "Új projekt létrehozása"
- ✅ Projekt számlálás megjelenítése (opcionális): "Összesen X projekted van"

**Prioritás:** P0 (Critical)
**Időbecslés:** 2 óra

---

### US-006: Sidebar Navigáció

**Mint** bejelentkezett felhasználó,
**Szeretnék** navigálni a sidebar-ból,
**Hogy** elérjem a különböző funkciókat.

#### Acceptance Criteria
- ✅ Sidebar tartalmazza a "Projektek" menüpontot
- ✅ "Projektek" menüpont kattintásra navigál `/dashboard/projects`-re
- ✅ Aktív menüpont vizuálisan kiemelve (highlight)
- ✅ Desktop view-ban (> 1024px) sidebar mindig látható
- ✅ Tablet/Mobile view-ban (< 1024px) sidebar collapse-elve van
- ✅ Mobile view-ban hamburger menu ikon megjelenítése
- ✅ Hamburger menu kattintásra sidebar slide-in animáció

**Prioritás:** P0 (Critical)
**Időbecslés:** 3 óra

---

### US-007: Header User Info

**Mint** bejelentkezett felhasználó,
**Szeretném** látni a felhasználói információimat a header-ben,
**Hogy** tudjam, melyik fiókba vagyok bejelentkezve.

#### Acceptance Criteria
- ✅ Header jobb felső sarkában user email cím megjelenítése
- ✅ Header jobb felső sarkában role badge megjelenítése (Admin / User / Viewer)
- ✅ Role badge színkódolva van (pl. Admin: piros, User: kék, Viewer: szürke)
- ✅ "Kijelentkezés" button látható a header-ben

**Prioritás:** P1 (High)
**Időbecslés:** 1.5 óra

---

## 📁 Projekt CRUD Műveletek

### US-008: Projektek Listázása

**Mint** bejelentkezett felhasználó,
**Szeretném** látni a projektjeim listáját,
**Hogy** áttekintést kapjak a meglévő projektjeimről.

#### Acceptance Criteria
- ✅ `/dashboard/projects` oldalon projektek lista megjelenítése
- ✅ Projekt lista tartalmazza: Projekt név, Auto ID, Létrehozás dátuma, Műveletek oszlopokat
- ✅ Ha nincs projekt, empty state megjelenítése:
  - "Nincs még projekted" szöveg
  - "Új projekt létrehozása" CTA button
- ✅ Ha vannak projektek, table vagy card layout megjelenítése
- ✅ Törölt projektek (deleted_at != NULL) NEM jelennek meg a listában
- ✅ Role-based filter automatikus (User csak saját projektjeit látja, Admin mindet)

**Prioritás:** P0 (Critical)
**Időbecslés:** 3 óra

---

### US-009: Projekt Létrehozása

**Mint** bejelentkezett user vagy admin,
**Szeretnék** új projektet létrehozni,
**Hogy** új munkafolyamatot kezdjek.

#### Acceptance Criteria
- ✅ "Új projekt" button látható a projektek lista oldalon
- ✅ "Új projekt" button kattintásra modal megnyílik
- ✅ Modal tartalmaz "Projekt név" input mezőt
- ✅ Projekt név validálása:
  - Minimum 3 karakter
  - Maximum 100 karakter
  - Nem lehet üres
- ✅ Hibás input esetén hibaüzenet magyar nyelven
- ✅ Auto ID előnézet megjelenítése (opcionális): "PROJ-YYYYMMDD-XXX"
- ✅ "Létrehozás" button kattintásra projekt létrejön
- ✅ Loading state a button-on (spinner + disabled)
- ✅ Sikeres létrehozás után toast notification: "Projekt sikeresen létrehozva"
- ✅ Modal automatikusan bezáródik
- ✅ Projekt lista automatikusan frissül, új projekt látható
- ✅ "Mégse" button bezárja a modal-t

**Prioritás:** P0 (Critical)
**Időbecslés:** 4 óra

---

### US-010: Projekt Szerkesztése

**Mint** bejelentkezett user vagy admin,
**Szeretném** szerkeszteni a projektemet,
**Hogy** frissítsem a projekt adatait.

#### Acceptance Criteria
- ✅ "Szerkesztés" button/icon látható minden projektnél a Műveletek oszlopban
- ✅ "Szerkesztés" button kattintásra edit form/modal megnyílik
- ✅ Projekt név mező pre-filled a jelenlegi névvel
- ✅ Auto ID read-only mezőként vagy text-ként megjelenítve (nem szerkeszthető)
- ✅ Projekt név validálása (ugyanazok a szabályok, mint létrehozásnál)
- ✅ "Mentés" button kattintásra projekt frissül
- ✅ Optimistic update: instant feedback a UI-ban
- ✅ Sikeres mentés után toast notification: "Projekt sikeresen frissítve"
- ✅ Modal/form bezáródik
- ✅ Projekt lista frissül
- ✅ "Mégse" button bezárja a form-ot

**Prioritás:** P0 (Critical)
**Időbecslés:** 3 óra

---

### US-011: Projekt Törlése

**Mint** bejelentkezett user vagy admin,
**Szeretném** törölni a projektemet,
**Hogy** eltávolítsam a már nem szükséges projekteket.

#### Acceptance Criteria
- ✅ "Törlés" button/icon látható minden projektnél a Műveletek oszlopban
- ✅ "Törlés" button kattintásra confirmation modal megnyílik
- ✅ Confirmation modal tartalmazza:
  - "Biztosan törölni szeretnéd?" kérdés
  - Projekt neve kiemelt formában
  - "Törlés" button (danger/piros stílus)
  - "Mégse" button
- ✅ "Mégse" button bezárja a modal-t, projekt NEM törlődik
- ✅ "Törlés" button kattintásra soft delete végrehajtódik (deleted_at oszlop beállítva)
- ✅ Sikeres törlés után toast notification: "Projekt törölve"
- ✅ Projekt eltűnik a listából
- ✅ Database-ben projekt megmarad, csak deleted_at != NULL

**Prioritás:** P0 (Critical)
**Időbecslés:** 3 óra

---

## 👥 Role-Based Access Control

### US-012: Admin - Minden Projekt Látható

**Mint** admin felhasználó,
**Szeretném** látni az összes projektet (minden user projektjét),
**Hogy** áttekintést kapjak a teljes rendszerről.

#### Acceptance Criteria
- ✅ Admin user belépés után `/dashboard/projects` oldalon minden projekt látható
- ✅ Nem csak admin saját projektjei, hanem minden user projektje is
- ✅ Projektek listájában látható az owner (tulajdonos) neve vagy email címe (opcionális)
- ✅ Admin role badge látható a header-ben: "Admin"

**Prioritás:** P0 (Critical)
**Időbecslés:** 2 óra

---

### US-013: Admin - Minden Projekt Szerkeszthető

**Mint** admin felhasználó,
**Szeretném** szerkeszteni bármely projektet,
**Hogy** javíthassam a projekt adatait szükség esetén.

#### Acceptance Criteria
- ✅ Admin látja a "Szerkesztés" button-t minden projektnél
- ✅ Admin sikeres szerkeszthet bármely projektet (owner_id != admin user sem probléma)
- ✅ Supabase RLS policy engedélyezi az admin számára az UPDATE műveletet
- ✅ Sikeres szerkesztés után toast notification

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

### US-014: Admin - Minden Projekt Törölhető

**Mint** admin felhasználó,
**Szeretném** törölni bármely projektet,
**Hogy** eltávolíthassam a rendszerből a nem szükséges projekteket.

#### Acceptance Criteria
- ✅ Admin látja a "Törlés" button-t minden projektnél
- ✅ Admin sikeresen törölhet bármely projektet (owner_id != admin user sem probléma)
- ✅ Supabase RLS policy engedélyezi az admin számára a soft delete műveletet
- ✅ Sikeres törlés után toast notification

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

### US-015: User - Csak Saját Projektek Láthatók

**Mint** user felhasználó,
**Szeretném** látni a saját projektjeimet,
**Hogy** ne lássam más felhasználók projektjeit.

#### Acceptance Criteria
- ✅ User belépés után `/dashboard/projects` oldalon CSAK saját projektek láthatók
- ✅ Más user projektjei NEM láthatók
- ✅ Admin projektjei NEM láthatók
- ✅ Supabase RLS policy automatikusan filtert alkalmaz: owner_id = current_user_id
- ✅ User role badge látható a header-ben: "User"

**Prioritás:** P0 (Critical)
**Időbecslés:** 2 óra

---

### US-016: User - Csak Saját Projektek Szerkeszthetők

**Mint** user felhasználó,
**Szeretném** szerkeszteni a saját projektjeimet,
**De** ne tudjak más user projektjét szerkeszteni.

#### Acceptance Criteria
- ✅ User látja a "Szerkesztés" button-t a saját projektjeinél
- ✅ User sikeresen szerkesztheti saját projektjeit
- ✅ Ha user megpróbál API hívást küldeni más user projektjének szerkesztésére, RLS policy tiltja
- ✅ Unauthorized művelet esetén hibaüzenet

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

### US-017: User - Csak Saját Projektek Törölhetők

**Mint** user felhasználó,
**Szeretném** törölni a saját projektjeimet,
**De** ne tudjak más user projektjét törölni.

#### Acceptance Criteria
- ✅ User látja a "Törlés" button-t a saját projektjeinél
- ✅ User sikeresen törölheti saját projektjeit (soft delete)
- ✅ Ha user megpróbál API hívást küldeni más user projektjének törlésére, RLS policy tiltja
- ✅ Unauthorized művelet esetén hibaüzenet

**Prioritás:** P0 (Critical)
**Időbecslés:** 1 óra

---

### US-018: Viewer - Nem Hozhat Létre Projektet

**Mint** viewer felhasználó,
**NEM szeretnék** projektet létrehozni,
**Mert** csak olvasási jogom van.

#### Acceptance Criteria
- ✅ Viewer belépés után "Új projekt" button NINCS megjelenítve (vagy disabled)
- ✅ Ha viewer megpróbál API hívást küldeni projekt létrehozásra, RLS policy tiltja
- ✅ Unauthorized művelet esetén hibaüzenet: "Nincs jogosultságod projekt létrehozásához"
- ✅ Viewer role badge látható a header-ben: "Viewer"

**Prioritás:** P1 (High)
**Időbecslés:** 1 óra

---

### US-019: Viewer - Nem Szerkeszthet Projektet

**Mint** viewer felhasználó,
**NEM szeretnék** projektet szerkeszteni,
**Mert** csak olvasási jogom van.

#### Acceptance Criteria
- ✅ Viewer számára "Szerkesztés" button NINCS megjelenítve (vagy disabled)
- ✅ Ha viewer megpróbál API hívást küldeni projekt szerkesztésre, RLS policy tiltja
- ✅ Unauthorized művelet esetén hibaüzenet

**Prioritás:** P1 (High)
**Időbecslés:** 30 perc

---

### US-020: Viewer - Nem Törölhet Projektet

**Mint** viewer felhasználó,
**NEM szeretnék** projektet törölni,
**Mert** csak olvasási jogom van.

#### Acceptance Criteria
- ✅ Viewer számára "Törlés" button NINCS megjelenítve (vagy disabled)
- ✅ Ha viewer megpróbál API hívást küldeni projekt törlésre, RLS policy tiltja
- ✅ Unauthorized művelet esetén hibaüzenet

**Prioritás:** P1 (High)
**Időbecslés:** 30 perc

---

### US-021: Viewer - Megosztott Projektek Megtekintése (Later Feature)

**Mint** viewer felhasználó,
**Szeretnék** megtekinteni a velem megosztott projekteket,
**Hogy** láthassam a projektek adatait read-only módban.

#### Acceptance Criteria
- ⏸️ **Későbbi feature (MVP-n kívül)**
- Projekt megosztási mechanizmus implementálása szükséges
- Viewer láthatja a megosztott projekteket, de nem szerkesztheti

**Prioritás:** P3 (Future)
**Időbecslés:** TBD

---

## 📊 Összefoglalás

**Összes User Story:** 21 (20 MVP + 1 későbbi feature)
**Critical Priority (P0):** 18
**High Priority (P1):** 3
**Future (P3):** 1

**Becsült összesített idő (MVP):** ~40 óra (Product Manager munka)

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis