# Komponens Stílusok - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** UX/UI Designer

---

## 🔘 Button Komponens

### Button Variants

#### Primary Button
```tsx
className="
  bg-primary-500 text-white
  px-4 py-2
  rounded-md
  font-medium
  hover:bg-primary-600
  active:bg-primary-700
  disabled:bg-gray-300 disabled:cursor-not-allowed
  transition-colors duration-200
"
```

#### Secondary Button
```tsx
className="
  bg-white text-gray-700 border border-gray-300
  px-4 py-2
  rounded-md
  font-medium
  hover:bg-gray-50
  active:bg-gray-100
  disabled:bg-gray-100 disabled:cursor-not-allowed
  transition-colors duration-200
"
```

#### Danger Button
```tsx
className="
  bg-error-500 text-white
  px-4 py-2
  rounded-md
  font-medium
  hover:bg-error-600
  active:bg-error-700
  disabled:bg-gray-300 disabled:cursor-not-allowed
  transition-colors duration-200
"
```

#### Ghost Button
```tsx
className="
  bg-transparent text-primary-600
  px-4 py-2
  rounded-md
  font-medium
  hover:bg-primary-50
  active:bg-primary-100
  disabled:text-gray-400 disabled:cursor-not-allowed
  transition-colors duration-200
"
```

---

### Button Loading State
```tsx
<button disabled className="...">
  <LoadingSpinner className="w-4 h-4 mr-2" />
  Betöltés...
</button>
```

---

## 📝 Input Komponens

### Default Input
```tsx
className="
  w-full
  px-3 py-2
  border border-gray-300 rounded-md
  text-base
  placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
  disabled:bg-gray-100 disabled:cursor-not-allowed
  transition-all duration-200
"
```

### Input with Error
```tsx
className="
  w-full
  px-3 py-2
  border-2 border-error-500 rounded-md
  text-base
  placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500
  transition-all duration-200
"
```

### Error Message
```tsx
<p className="mt-1 text-sm text-error-500">
  {errorMessage}
</p>
```

---

## 🏷️ Label Komponens
```tsx
className="
  block
  text-sm font-medium text-gray-700
  mb-1
"
```

---

## 🃏 Card Komponens

### Default Card
```tsx
className="
  bg-white
  rounded-lg
  shadow-md
  p-6
  hover:shadow-lg
  transition-shadow duration-200
"
```

### Clickable Card
```tsx
className="
  bg-white
  rounded-lg
  shadow-md
  p-6
  cursor-pointer
  hover:shadow-lg hover:border-primary-300
  transition-all duration-200
  border-2 border-transparent
"
```

---

## 🎭 Modal Komponens

### Modal Overlay
```tsx
className="
  fixed inset-0
  bg-black bg-opacity-50
  flex items-center justify-center
  p-4
  z-50
"
```

### Modal Content
```tsx
className="
  bg-white
  rounded-xl
  shadow-2xl
  max-w-md w-full
  p-6
  relative
"
```

### Modal Header
```tsx
<h2 className="text-2xl font-semibold text-gray-900 mb-4">
  Modal Cím
</h2>
```

### Modal Footer
```tsx
<div className="flex gap-3 justify-end mt-6">
  <Button variant="secondary">Mégse</Button>
  <Button variant="primary">Mentés</Button>
</div>
```

---

## 🍞 Toast Notification

### Success Toast
```tsx
className="
  bg-success-500 text-white
  px-4 py-3
  rounded-lg
  shadow-lg
  flex items-center gap-2
"
```

### Error Toast
```tsx
className="
  bg-error-500 text-white
  px-4 py-3
  rounded-lg
  shadow-lg
  flex items-center gap-2
"
```

### Info Toast
```tsx
className="
  bg-info-500 text-white
  px-4 py-3
  rounded-lg
  shadow-lg
  flex items-center gap-2
"
```

---

## 🏷️ Badge Komponens

### Admin Badge
```tsx
className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-error-100 text-error-800
"
```

### User Badge
```tsx
className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-primary-100 text-primary-800
"
```

### Viewer Badge
```tsx
className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-gray-100 text-gray-800
"
```

---

## 🔄 Loading Spinner
```tsx
className="
  animate-spin
  h-5 w-5
  border-2 border-white border-t-transparent
  rounded-full
"
```

---

## 📊 Table Komponens

### Table Container
```tsx
className="overflow-x-auto"
```

### Table
```tsx
className="min-w-full divide-y divide-gray-200"
```

### Table Header
```tsx
className="bg-gray-50"
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Oszlop Név
</th>
```

### Table Body
```tsx
className="bg-white divide-y divide-gray-200"
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  Tartalom
</td>
```

---

## 🎯 Empty State

```tsx
<div className="text-center py-12">
  <svg className="mx-auto h-12 w-12 text-gray-400" ... />
  <h3 className="mt-2 text-sm font-medium text-gray-900">
    Nincs még projekted
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    Kezdj el egy új projektet a gombra kattintva
  </p>
  <div className="mt-6">
    <Button variant="primary">Új projekt létrehozása</Button>
  </div>
</div>
```

---

## 🧭 Sidebar Navigation

### Sidebar Container
```tsx
className="
  w-64
  bg-white
  border-r border-gray-200
  h-screen
  fixed left-0 top-0
  overflow-y-auto
"
```

### Sidebar Link (Active)
```tsx
className="
  flex items-center gap-3
  px-4 py-3
  text-sm font-medium
  bg-primary-50 text-primary-700 border-r-2 border-primary-500
"
```

### Sidebar Link (Inactive)
```tsx
className="
  flex items-center gap-3
  px-4 py-3
  text-sm font-medium
  text-gray-700
  hover:bg-gray-50
  transition-colors duration-150
"
```

---

## 🎩 Header

```tsx
className="
  bg-white
  border-b border-gray-200
  px-6 py-4
  flex items-center justify-between
"
```

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis