# Role Matrix - Jogosultsági Mátrix

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Product Manager

---

## 📋 Áttekintés

Ez a dokumentum részletesen tartalmazza a három szerepkör (Admin, User, Viewer) jogosultságait a moduláris webapp MVP rendszerében.

---

## 👥 Szerepkörök Áttekintése

| Szerepkör | Szint | Leírás |
|-----------|-------|--------|
| **Admin** | Legmagasabb | Teljes hozzáférés az alkalmazáshoz, minden projektet lát és kezelhet, user management jogosultság |
| **User** | Közepes | Normál felhasználó, saját projektek teljes kezelése, új projektek létrehozása |
| **Viewer** | Alapszintű | Csak olvasási jogosultság, későbbi fázisban megosztott projektek megtekintése |

---

## 🔐 Jogosultsági Mátrix - Projektek

| Művelet | Admin | User | Viewer | Megjegyzés |
|---------|-------|------|--------|-----------|
| **Projektek listázása** | ✅ Minden projekt | ✅ Saját projektek | ❌ Nincs projekt (MVP) | Viewer később megosztott projekteket láthat |
| **Projekt létrehozása** | ✅ Igen | ✅ Igen | ❌ Nem | Viewer számára button hidden/disabled |
| **Saját projekt szerkesztése** | ✅ Igen | ✅ Igen | ❌ Nem | - |
| **Más user projektjének szerkesztése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin szerkeszthet bármely projektet |
| **Saját projekt törlése (soft delete)** | ✅ Igen | ✅ Igen | ❌ Nem | - |
| **Más user projektjének törlése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin törölhet bármely projektet |
| **Projekt adatok megtekintése** | ✅ Minden projekt | ✅ Saját projektek | ❌ Nincs (MVP) | - |
| **Projekt tulajdonos láthatósága** | ✅ Igen | ❌ Nem (csak saját) | ❌ Nem | Admin látja, ki a projekt tulajdonosa |

---

## 👤 Jogosultsági Mátrix - User Management

| Művelet | Admin | User | Viewer | Megjegyzés |
|---------|-------|------|--------|-----------|
| **Saját profil megtekintése** | ✅ Igen | ✅ Igen | ✅ Igen | Minden user látja saját email és role-ját |
| **Saját profil szerkesztése** | ✅ Igen | ✅ Igen | ⏸️ Részleges | Viewer csak email módosítás (későbbi feature) |
| **Más user profiljának megtekintése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin láthatja más userek adatait |
| **Más user profiljának szerkesztése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin módosíthatja más user adatait |
| **User role megváltoztatása** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin változtathatja meg a role-okat |
| **User törlése/deaktiválása** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin törölhet usereket |
| **User lista megtekintése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin láthatja az összes usert |

**Megjegyzés:** User Management funkciók később kerülnek implementálásra (MVP-n kívül).

---

## 🔧 Jogosultsági Mátrix - Modulok

| Művelet | Admin | User | Viewer | Megjegyzés |
|---------|-------|------|--------|-----------|
| **Modulok listázása** | ✅ Igen | ✅ Igen | ✅ Igen | Minden user látja az elérhető modulokat |
| **Modul aktiválása (saját fiókhoz)** | ✅ Igen | ✅ Igen | ❌ Nem | Viewer nem aktiválhat modulokat |
| **Modul deaktiválása (saját fiókhoz)** | ✅ Igen | ✅ Igen | ❌ Nem | Viewer nem deaktiválhat modulokat |
| **Modul aktiválása (más user fiókjához)** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin aktiválhat másoknak modulokat |
| **Rendszer modul létrehozása/törlése** | ✅ Igen | ❌ Nem | ❌ Nem | Csak admin kezelhet system modulokat |

**Megjegyzés:** Modul kezelés funkciók később kerülnek implementálásra (MVP-n kívül).

---

## 📊 Részletes Role Leírások

### 🔴 Admin Role

**Cél:** Teljes rendszer adminisztráció, minden funkció és adat kezelése.

#### Projektek
- ✅ Látja az **összes projektet** (minden user projektjét)
- ✅ Létrehozhat új projektet (saját név alatt)
- ✅ Szerkeszthet **bármely projektet** (beleértve más userek projektjeit is)
- ✅ Törölhet **bármely projektet** (soft delete)
- ✅ Látja a projekt tulajdonosát (owner email vagy név)

#### User Management (későbbi feature)
- ✅ Látja az összes regisztrált usert
- ✅ Módosíthatja más userek role-ját (Admin/User/Viewer)
- ✅ Törölhet vagy deaktiválhat usereket
- ✅ Visszaállíthatja más userek jelszavát (admin funkció)

#### Modulok (későbbi feature)
- ✅ Aktiválhat/deaktiválhat modulokat saját fiókjához
- ✅ Aktiválhat/deaktiválhat modulokat más userek fiókjához
- ✅ Létrehozhat új system modulokat
- ✅ Törölhet system modulokat

#### Dashboard & UI
- ✅ Header-ben "Admin" badge látható (piros háttér)
- ✅ Minden menüpont elérhető (Projektek, Modulok, User Management)

---

### 🔵 User Role

**Cél:** Normál felhasználó, saját projektek teljes kezelése.

#### Projektek
- ✅ Látja **csak saját projektjeit** (owner_id = current_user_id)
- ✅ Létrehozhat új projektet (saját név alatt)
- ✅ Szerkesztheti saját projektjeit
- ✅ Törölheti saját projektjeit (soft delete)
- ❌ NEM látja más userek projektjeit
- ❌ NEM szerkesztheti más userek projektjeit
- ❌ NEM törölheti más userek projektjeit

#### User Management (későbbi feature)
- ✅ Látja saját profil adatait (email, role)
- ✅ Szerkesztheti saját profil adatait (email, jelszó)
- ❌ NEM látja más userek adatait
- ❌ NEM módosíthatja saját role-ját

#### Modulok (későbbi feature)
- ✅ Látja az elérhető modulok listáját
- ✅ Aktiválhat/deaktiválhat modulokat saját fiókjához
- ❌ NEM aktiválhat modulokat más userek fiókjához
- ❌ NEM hozhat létre vagy törölhet system modulokat

#### Dashboard & UI
- ✅ Header-ben "User" badge látható (kék háttér)
- ✅ Menüpontok: Projektek, Modulok
- ❌ User Management menüpont NINCS

---

### ⚫ Viewer Role

**Cél:** Csak olvasási jogosultság, későbbi fázisban megosztott projektek megtekintése.

#### Projektek (MVP fázisban)
- ❌ NEM látja a projekteket (üres lista vagy placeholder)
- ❌ NEM hozhat létre új projektet ("Új projekt" button hidden/disabled)
- ❌ NEM szerkeszthet projekteket
- ❌ NEM törölhet projekteket

#### Projektek (későbbi feature - megosztás után)
- ✅ Láthatja a vele **megosztott projekteket** (read-only)
- ✅ Megtekintheti a projekt adatait
- ❌ NEM szerkesztheti a megosztott projekteket
- ❌ NEM törölheti a megosztott projekteket

#### User Management (későbbi feature)
- ✅ Látja saját profil adatait (email, role)
- ⏸️ Részleges szerkesztés: csak email módosítás (jelszó igen)
- ❌ NEM látja más userek adatait

#### Modulok (későbbi feature)
- ✅ Látja az elérhető modulok listáját
- ❌ NEM aktiválhat modulokat
- ❌ NEM deaktiválhat modulokat

#### Dashboard & UI
- ✅ Header-ben "Viewer" badge látható (szürke háttér)
- ✅ Menüpontok: Projektek (megosztott projektek később)
- ❌ Modulok menüpont NINCS
- ❌ User Management menüpont NINCS
- ⚠️ Empty state üzenet: "Nincsenek megosztott projektek" (MVP fázisban)

---

## 🔒 Supabase RLS Policies Összefoglaló

### Projects Tábla

#### SELECT Policy
```sql
-- Admin: minden nem törölt projekt
role = 'admin' AND deleted_at IS NULL

-- User: csak saját nem törölt projektek
owner_id = auth.uid() AND deleted_at IS NULL

-- Viewer: később megosztott projektek (MVP-ben nincs)
```

#### INSERT Policy
```sql
-- Admin és User: engedélyezett
role IN ('admin', 'user')

-- Viewer: tiltott (nincs policy)
```

#### UPDATE Policy
```sql
-- Admin: minden projekt
role = 'admin'

-- User: csak saját projekt
owner_id = auth.uid()

-- Viewer: tiltott (nincs policy)
```

#### DELETE Policy (Soft Delete)
```sql
-- Valójában UPDATE deleted_at oszlop

-- Admin: minden projekt
role = 'admin'

-- User: csak saját projekt
owner_id = auth.uid()

-- Viewer: tiltott (nincs policy)
```

---

## 🔄 Role Változtatás

### Ki változtathatja a role-okat?

| Művelet | Engedélyezett? | Megjegyzés |
|---------|----------------|-----------|
| User megváltoztatja saját role-ját | ❌ Nem | Security risk - csak admin változtathat role-t |
| Admin megváltoztatja más user role-ját | ✅ Igen | User Management funkcióval (későbbi feature) |
| Admin megváltoztatja saját role-ját | ⚠️ Óvatosan | Lehetséges, de nem ajánlott (végső admin elvesztése) |
| Automatikus role hozzárendelés regisztráció után | ✅ Igen | Alapértelmezett role: 'user' |

### Alapértelmezett Role
- Minden új regisztráció alapértelmezetten **'user'** role-t kap
- Admin role-t csak egy meglévő admin adhat
- Első admin user manuális beállítása szükséges (SQL script vagy Supabase Dashboard)

---

## 🚨 Security Megfontolások

### 1. Unauthorized Access Prevention
- Supabase RLS policies kikényszerítik a jogosultságokat database szinten
- Frontend UI is filtert alkalmaz (button-ok hidden/disabled)
- Double-check: Backend (RLS) + Frontend (UI)

### 2. Privilege Escalation Prevention
- User NEM módosíthatja saját role-ját (`users.role` oszlop protected)
- RLS policy tiltja role update-et (ha nincs admin role)

### 3. Role Enum Validation
- `role` oszlop típusa: ENUM ('admin', 'user', 'viewer')
- Invalid role értékek automatikusan tiltottak database szinten

---

## 📝 Use Case Példák

### Use Case 1: Admin minden projektet lát

**Scenario:**
- Admin user belép
- Navigál `/dashboard/projects` oldalra

**Eredmény:**
- Admin látja az összes projektet:
  - Saját projektjei
  - User1 projektjei
  - User2 projektjei
  - stb.
- Projektek listájában látható az owner neve (opcionális oszlop)

---

### Use Case 2: User csak saját projekteket lát

**Scenario:**
- User1 belép
- Navigál `/dashboard/projects` oldalra

**Eredmény:**
- User1 CSAK saját projektjeit látja (owner_id = User1 ID)
- User2 projektjei NEM láthatók
- Admin projektjei NEM láthatók

---

### Use Case 3: Viewer nem látja a projekteket (MVP)

**Scenario:**
- Viewer user belép
- Navigál `/dashboard/projects` oldalra

**Eredmény:**
- Empty state megjelenítése:
  - "Nincsenek megosztott projektek"
  - Placeholder szöveg vagy ikon
  - Nincs "Új projekt" button

---

### Use Case 4: User megpróbál más user projektjét szerkeszteni (API hívás)

**Scenario:**
- User1 megpróbál API hívást küldeni User2 projektjének szerkesztésére
- Például manipulált API request (DevTools-ban)

**Eredmény:**
- Supabase RLS policy tiltja az UPDATE műveletet
- Hibaüzenet: "Unauthorized" vagy "Nincs jogosultságod"
- Frontend toast notification: "Nincs jogosultságod ehhez a művelethez"

---

## ✅ Testing Checklist

### Admin Role Testing
- [ ] Admin látja az összes projektet
- [ ] Admin szerkeszthet bármely projektet
- [ ] Admin törölhet bármely projektet
- [ ] Admin létrehozhat új projektet
- [ ] Admin role badge látható a header-ben

### User Role Testing
- [ ] User CSAK saját projektjeit látja
- [ ] User szerkesztheti saját projektjét
- [ ] User törölheti saját projektjét
- [ ] User létrehozhat új projektet
- [ ] User NEM szerkesztheti más user projektjét (API szinten tiltott)
- [ ] User role badge látható a header-ben

### Viewer Role Testing
- [ ] Viewer NEM látja a projekteket (empty state)
- [ ] Viewer NEM látja "Új projekt" button-t (hidden/disabled)
- [ ] Viewer NEM szerkeszthet projektet
- [ ] Viewer NEM törölhet projektet
- [ ] Viewer role badge látható a header-ben

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis