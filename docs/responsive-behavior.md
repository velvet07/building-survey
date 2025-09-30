# Responsive Behavior - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** UX/UI Designer

---

## 📋 Áttekintés

Ez a dokumentum részletesen leírja az alkalmazás responsive viselkedését különböző képernyőméreteken.

---

## 📱 Breakpoint-ok

| Breakpoint | Min Width | Tailwind Prefix | Eszköz Típus |
|------------|-----------|-----------------|--------------|
| **XS** | 0px | (default) | Mobile (Small) |
| **SM** | 640px | `sm:` | Mobile (Large) / Phablet |
| **MD** | 768px | `md:` | Tablet |
| **LG** | 1024px | `lg:` | Desktop / Laptop |
| **XL** | 1280px | `xl:` | Large Desktop |
| **2XL** | 1536px | `2xl:` | Extra Large Desktop |

---

## 📐 Layout Változások Breakpoint-ok Szerint

### 1. Dashboard Layout

#### Mobile (< 640px)
```
+---------------------------+
|  Header (hamburger menu)  |
+---------------------------+
|                           |
|  Content Area             |
|  (Full Width)             |
|                           |
+---------------------------+

[Sidebar: Hidden, slide-in overlay]
```

**Sidebar:**
- Alapértelmezetten rejtett
- Hamburger menu icon a header-ben (bal felül)
- Kattintásra slide-in animáció balról
- Overlay háttér (fekete, semi-transparent)
- Overlay kattintásra bezáródik

**Header:**
- Full width
- Logo/App név: középen (opcionális)
- Hamburger: bal felül
- User info + logout: jobb felül (icon only)

**Content Area:**
- Full width
- Padding: 16px (p-4)

---

#### Tablet (640px - 1024px)
```
+--------+---------------------+
| Header | Header              |
+--------+---------------------+
|Sidebar | Content Area        |
| (opt)  | (Wide)              |
|        |                     |
+--------+---------------------+

[Sidebar: Collapsable vagy visible]
```

**Döntési Pont:** Sidebar visible vagy collapsable?
- **Opció A:** Sidebar mindig visible (desktop-szerű)
- **Opció B:** Sidebar collapsable, hamburger menu továbbra is

**Javaslat MVP-hez:** Opció B (collapse sidebar, hamburger menu)

**Content Area:**
- Padding: 24px (p-6)
- Max width: container (opcionális)

---

#### Desktop (> 1024px)
```
+--------+--------------------------+
| Header                            |
+--------+--------------------------+
|Sidebar | Content Area             |
| Fixed  | (Max Width Container)    |
|        |                          |
|        |                          |
+--------+--------------------------+

[Sidebar: Always Visible]
```

**Sidebar:**
- Fixed position, left side
- Width: 256px (w-64)
- Always visible
- No collapse

**Header:**
- Fixed position, top
- Left margin: 256px (sidebar width)
- Full width

**Content Area:**
- Left margin: 256px
- Max width: 1280px (max-w-screen-xl)
- Padding: 32px (p-8)
- Centered with `mx-auto`

---

## 📊 Component-specifikus Responsive Behavior

### 2. Projektek Lista

#### Mobile (< 640px)
**Layout:** Card Grid, Single Column

```tsx
<div className="grid grid-cols-1 gap-4">
  <ProjectCard ... />
  <ProjectCard ... />
  ...
</div>
```

**Card Tartalom:**
- Projekt név: text-lg, font-semibold
- Auto ID: text-sm, gray color
- Létrehozás dátuma: text-xs
- Műveletek: Icon button-ok (Szerkesztés, Törlés)

---

#### Tablet (640px - 1024px)
**Layout:** Card Grid, 2 Columns

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <ProjectCard ... />
  <ProjectCard ... />
  ...
</div>
```

---

#### Desktop (> 1024px)
**Layout:** Table View

```tsx
<table className="min-w-full">
  <thead>
    <tr>
      <th>Projekt Név</th>
      <th>Azonosító</th>
      <th>Létrehozva</th>
      <th>Műveletek</th>
    </tr>
  </thead>
  <tbody>
    <tr>...</tr>
    ...
  </tbody>
</table>
```

**Döntési Pont:** Card view vagy Table view desktop-on?
- **Opció A:** Table view (data-heavy, professional)
- **Opció B:** 3 column card grid (visual, modern)

**Javaslat MVP-hez:** Table view (Opció A)

---

### 3. Modal-ok

#### Mobile (< 640px)
**Méret:**
- Full width minus 16px margin (`mx-4`)
- Max height: 90vh
- Overflow: scroll

```tsx
<div className="w-full mx-4 max-h-[90vh] overflow-y-auto">
  <Modal content>
  ...
  </Modal>
</div>
```

---

#### Tablet / Desktop (> 640px)
**Méret:**
- Fixed width: 500px (max-w-md)
- Centered
- Max height: 80vh

```tsx
<div className="max-w-md w-full mx-auto">
  <Modal content>
  ...
  </Modal>
</div>
```

---

### 4. Header User Info

#### Mobile (< 640px)
**Display:**
- User email: **Hidden**
- Role badge: Icon only (vagy hidden)
- Logout: Icon only

```tsx
<div className="flex items-center gap-2">
  <RoleBadgeIcon />
  <LogoutIconButton />
</div>
```

---

#### Desktop (> 1024px)
**Display:**
- User email: Visible
- Role badge: Visible (text + color)
- Logout: Button with text

```tsx
<div className="flex items-center gap-4">
  <span className="text-sm">{userEmail}</span>
  <RoleBadge role={userRole} />
  <LogoutButton />
</div>
```

---

## 🎨 Typography Responsive

### Heading Sizes

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Heading 1
</h1>

<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
  Heading 2
</h2>

<h3 className="text-lg md:text-xl lg:text-2xl font-semibold">
  Heading 3
</h3>
```

### Body Text

```tsx
<p className="text-sm md:text-base">
  Body text
</p>
```

---

## 🖼️ Image / Icon Sizes

### Logo

```tsx
<img className="h-8 md:h-10 lg:h-12" src="/logo.png" alt="Logo" />
```

### Icons

```tsx
<Icon className="w-5 h-5 md:w-6 md:h-6" />
```

---

## 📏 Spacing Responsive

### Padding

```tsx
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>
```

### Gap (Grid / Flex)

```tsx
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Items with responsive gap
</div>
```

---

## 🔘 Button Sizes Responsive

### Default Button

```tsx
<button className="px-3 py-2 md:px-4 md:py-2 lg:px-5 lg:py-3 text-sm md:text-base">
  Button
</button>
```

### Icon Button

```tsx
<button className="p-2 md:p-3">
  <Icon className="w-5 h-5 md:w-6 md:h-6" />
</button>
```

---

## 📱 Touch Target Sizes (Mobile)

**Minimum Touch Target:** 44x44 px (iOS), 48x48 px (Android)

```tsx
/* Correct: Minimum 48px height */
<button className="min-h-[48px] px-4">
  Touch-friendly button
</button>

/* Icon button */
<button className="w-12 h-12 flex items-center justify-center">
  <Icon />
</button>
```

---

## 🎯 Hidden / Visible Classes

### Hide on Mobile, Show on Desktop

```tsx
<div className="hidden lg:block">
  Desktop only content
</div>
```

### Show on Mobile, Hide on Desktop

```tsx
<div className="block lg:hidden">
  Mobile only content
</div>
```

### Conditional Display

```tsx
/* Hamburger menu: Mobile only */
<button className="lg:hidden">
  <HamburgerIcon />
</button>

/* User email: Desktop only */
<span className="hidden lg:inline-block">
  {userEmail}
</span>
```

---

## ✅ Responsive Testing Checklist

### Mobile (375px - iPhone SE)
- [ ] Sidebar slide-in működik
- [ ] Content readable, nem túl kicsi
- [ ] Button-ok kattinthatók (min. 48px)
- [ ] Modal full width, megfelelő padding
- [ ] Table → Card view

### Tablet (768px - iPad)
- [ ] Layout 2 column (ha card view)
- [ ] Sidebar behavior döntése szerint
- [ ] Typography megfelelő méret

### Desktop (1280px)
- [ ] Sidebar always visible
- [ ] Content max-width container
- [ ] Table view (ha van)
- [ ] Typography legnagyobb méret

### Large Desktop (1920px)
- [ ] Content nem túl wide (max-w-screen-2xl)
- [ ] Centered layout

---

## 🛠️ Tailwind Responsive Példakód

```tsx
// Komplex responsive component példa
export default function ResponsiveLayout() {
  return (
    <div className="
      p-4 md:p-6 lg:p-8
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
      gap-4 md:gap-6 lg:gap-8
    ">
      <Card className="
        p-4 md:p-6
        text-sm md:text-base
      ">
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-4">
          Card Title
        </h3>
        <p className="text-sm md:text-base text-gray-600">
          Card content
        </p>
      </Card>
    </div>
  );
}
```

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis