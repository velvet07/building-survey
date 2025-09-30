# Wireframes - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** UX/UI Designer

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza az összes wireframe leírást a Moduláris WebApp MVP projekthez. A tényleges wireframe-ek Figma-ban vagy PNG formátumban készülnek el, ez a dokumentum a struktúrát és az elemeket írja le.

---

## 🔐 1. Login Screen

### Layout
- **Centered Layout:** Vertikálisan és horizontálisan középre igazított form
- **Max Width:** 400px
- **Background:** Light gray (`bg-gray-50`)

### Elemek (Fentről lefelé)
1. **Logo / App Név**
   - Pozíció: Középen, felül
   - Méret: Large (text-3xl)

2. **Form Cím**
   - Szöveg: "Bejelentkezés"
   - Méret: text-2xl, font-semibold

3. **Email Input Field**
   - Label: "Email cím"
   - Placeholder: "pelda@email.com"
   - Type: email
   - Required: true

4. **Password Input Field**
   - Label: "Jelszó"
   - Placeholder: "Jelszó"
   - Type: password
   - Required: true

5. **Bejelentkezés Button**
   - Variant: Primary
   - Full Width
   - Szöveg: "Bejelentkezés"

6. **Link: Elfelejtett jelszó?**
   - Pozíció: Button alatt, középen
   - Méret: text-sm
   - Szín: Primary

7. **Regisztráció Link**
   - Szöveg: "Nincs még fiókod? Regisztrálj"
   - Pozíció: Form alján
   - Méret: text-sm

### States
- **Default:** Tiszta form
- **Error:** Input field-ek piros border-rel, hibaüzenet alatt
- **Loading:** Button spinner-rel, disabled

### Responsive
- **Mobile:** Same layout, full width
- **Desktop:** Centered card layout

---

## 📝 2. Register Screen

### Layout
- **Centered Layout:** Hasonló a login-hoz
- **Max Width:** 400px

### Elemek
1. **Logo / App Név**
2. **Form Cím:** "Regisztráció"
3. **Email Input Field**
4. **Password Input Field**
   - Extra: Password strength indicator (opcionális)
5. **Password Confirm Input Field**
   - Label: "Jelszó megerősítése"
6. **Terms Checkbox**
   - Label: "Elfogadom az Általános Szerződési Feltételeket"
   - Required: true
7. **Regisztráció Button**
   - Full Width
   - Variant: Primary
8. **Login Link**
   - Szöveg: "Van már fiókod? Jelentkezz be"

### States
- **Default**
- **Error:** Password mismatch, email invalid, stb.
- **Loading**
- **Success:** "Email megerősítés elküldve" üzenet

---

## 📊 3. Dashboard Layout (Empty State)

### Layout Structure
```
+----------------------------------+
|  Header (fixed top)              |
+--------+-------------------------+
|Sidebar | Content Area            |
|        |                         |
|        |  Empty State            |
|        |  "Nincs még projekted"  |
|        |                         |
+--------+-------------------------+
```

### Header (Top Bar)
- **Height:** 64px
- **Background:** White
- **Border Bottom:** Gray
- **Elemek:**
  - Left: Hamburger menu (mobile only)
  - Right: User email, Role badge, Logout button

### Sidebar (Left)
- **Width:** 256px (desktop), Collapsed (mobile)
- **Background:** White
- **Border Right:** Gray
- **Elemek:**
  - "Projektek" menüpont (active)
  - "Modulok" menüpont (inactive, később)

### Content Area
- **Empty State:**
  - Icon: Folder vagy Project icon (gray)
  - Heading: "Nincs még projekted"
  - Description: "Kezdj el egy új projektet a gombra kattintva"
  - CTA Button: "Új projekt létrehozása" (Primary)

---

## 📊 4. Dashboard Layout (With Projects)

### Layout Structure
Ugyanaz, mint Empty State, de Content Area-ban:

### Project List (Table View)
- **Oszlopok:**
  1. Projekt Név
  2. Azonosító (Auto ID)
  3. Létrehozva (Dátum)
  4. Műveletek (Szerkesztés, Törlés icons)

- **Header Row:**
  - Background: Light gray
  - Font: Bold, uppercase

- **Data Rows:**
  - Hover: Light background
  - Border Bottom: Light gray

- **"Új projekt" Button:**
  - Pozíció: Jobb felül (Content Area tetején)
  - Variant: Primary

---

## ➕ 5. Create Project Modal

### Modal Overlay
- **Background:** Semi-transparent black (`bg-black bg-opacity-50`)
- **Centered:** Modal content középen

### Modal Content
- **Max Width:** 500px
- **Background:** White
- **Border Radius:** Large (`rounded-xl`)
- **Shadow:** Extra large

### Elemek
1. **Modal Header**
   - Cím: "Új projekt létrehozása"
   - Close Button (X): Jobb felül

2. **Project Name Input**
   - Label: "Projekt név"
   - Placeholder: "Add meg a projekt nevét"
   - Validation: 3-100 karakter

3. **Auto ID Preview (opcionális)**
   - Label: "Azonosító előnézet"
   - Value: "PROJ-YYYYMMDD-XXX"
   - Read-only, gray background

4. **Footer Buttons**
   - "Mégse" (Secondary)
   - "Létrehozás" (Primary)

### States
- **Default**
- **Error:** Input piros border + hibaüzenet
- **Loading:** "Létrehozás" button loading state

---

## ✏️ 6. Edit Project Modal

### Layout
Hasonló a Create Modal-hoz

### Elemek
1. **Modal Header:** "Projekt szerkesztése"
2. **Project Name Input**
   - Pre-filled jelenlegi névvel
3. **Auto ID Field**
   - Read-only
   - Gray background
   - Value: jelenlegi auto ID
4. **Footer Buttons**
   - "Mégse" (Secondary)
   - "Mentés" (Primary)

---

## 🗑️ 7. Delete Project Confirmation Modal

### Modal Content
- **Max Width:** 400px
- **Danger Theme:** Piros accent

### Elemek
1. **Icon:** Warning icon (piros vagy sárga)
2. **Heading:** "Biztosan törölni szeretnéd?"
3. **Project Name Display**
   - Szöveg: "Projekt név: **{name}**"
   - Bold kiemelés
4. **Warning Message (opcionális)**
   - "Ez a művelet visszavonhatatlan!"
   - Kisebb betű, gray color
5. **Footer Buttons**
   - "Mégse" (Secondary)
   - "Törlés" (Danger - piros)

---

## 📱 Responsive Behavior Summary

### Mobile (< 640px)
- **Sidebar:** Collapse, hamburger menu
- **Content:** Single column
- **Table → Cards:** Projekt lista card layout-ra vált
- **Modals:** Full width, margin csökkentve

### Tablet (640px - 1024px)
- **Sidebar:** Collapsable vagy visible (döntés alapján)
- **Content:** 2 column grid (ha card view)

### Desktop (> 1024px)
- **Sidebar:** Always visible
- **Content:** Full table view vagy 3 column grid

---

## 🎨 Design Notes

**Wireframe Tool:** Figma (ajánlott) vagy Sketch
**Export Format:** PNG vagy Figma link megosztása
**Style:** Low-fidelity vagy High-fidelity (döntés alapján)

**Megjegyzés:** A tényleges wireframe-eket a UX/UI Designer készíti el Figma-ban vagy más design tool-ban, majd exportálja PNG formátumban ebbe a mappába.

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis