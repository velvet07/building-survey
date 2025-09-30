# Design System - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** UX/UI Designer

---

## 🎨 Color Palette

### Primary Colors

```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

**Használat:** CTA button-ok, link-ek, aktív state-ek

---

### Secondary Colors

```css
--secondary-50: #f8fafc;
--secondary-100: #f1f5f9;
--secondary-200: #e2e8f0;
--secondary-300: #cbd5e1;
--secondary-400: #94a3b8;
--secondary-500: #64748b;  /* Main Secondary */
--secondary-600: #475569;
--secondary-700: #334155;
--secondary-800: #1e293b;
--secondary-900: #0f172a;
```

**Használat:** Text, borders, backgrounds

---

### Status Colors

```css
/* Success (Zöld) */
--success-500: #10b981;
--success-600: #059669;

/* Error (Piros) */
--error-500: #ef4444;
--error-600: #dc2626;

/* Warning (Sárga) */
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Info (Kék) */
--info-500: #3b82f6;
--info-600: #2563eb;
```

**Használat:** Toast notifications, validation messages, badges

---

### Neutral Colors (Gray Scale)

```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

**Használat:** Background, text, borders

---

## 🔤 Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Megjegyzés:** Inter font Google Fonts-ból vagy system font fallback

---

### Font Sizes

| Név | Size | Line Height | Használat |
|-----|------|-------------|-----------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) | Apró szövegek, hints |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) | Secondary text |
| `text-base` | 1rem (16px) | 1.5rem (24px) | Body text (default) |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) | Lead text |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) | Small headings |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) | H3 |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) | H2 |
| `text-4xl` | 2.25rem (36px) | 2.5rem (40px) | H1 |

---

### Font Weights

| Név | Weight | Használat |
|-----|--------|-----------|
| `font-light` | 300 | Subtle text |
| `font-normal` | 400 | Body text (default) |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, button |
| `font-bold` | 700 | Strong emphasis |

---

## 📏 Spacing System (Tailwind)

```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

**Használat:** `p-4` (padding 16px), `m-2` (margin 8px), `gap-6` (gap 24px)

---

## 🔲 Border Radius

```css
rounded-none: 0px
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)       /* Default */
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-full: 9999px
```

**Használat:**
- Button: `rounded-md` vagy `rounded-lg`
- Card: `rounded-lg`
- Modal: `rounded-xl`
- Badge: `rounded-full`

---

## 🌑 Shadow

```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

**Használat:**
- Card: `shadow-md`
- Modal: `shadow-xl`
- Dropdown: `shadow-lg`

---

## 🖼️ Layout Grid

### Container Max Width

```css
max-w-screen-sm: 640px
max-w-screen-md: 768px
max-w-screen-lg: 1024px
max-w-screen-xl: 1280px
max-w-screen-2xl: 1536px
```

**Dashboard Content:** `max-w-screen-2xl mx-auto px-6`

---

### Grid Columns

```css
grid-cols-1: 1 column
grid-cols-2: 2 columns
grid-cols-3: 3 columns
grid-cols-4: 4 columns
grid-cols-12: 12 columns (classic grid)
```

**Project Cards:**
- Mobile: `grid-cols-1`
- Tablet: `grid-cols-2`
- Desktop: `grid-cols-3`

---

## 🎯 Tailwind Config Extend

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#64748b',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          DEFAULT: '#10b981',
          500: '#10b981',
          600: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Device |
|------------|-----------|-----------------|--------|
| `xs` | 0px | (default) | Mobile |
| `sm` | 640px | `sm:` | Large Mobile |
| `md` | 768px | `md:` | Tablet |
| `lg` | 1024px | `lg:` | Desktop |
| `xl` | 1280px | `xl:` | Large Desktop |
| `2xl` | 1536px | `2xl:` | Extra Large Desktop |

**Példa használat:**
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## ✅ Design Tokens Summary

**Primary Color:** `#3b82f6` (Blue)
**Secondary Color:** `#64748b` (Slate Gray)
**Font:** Inter (Google Fonts)
**Base Font Size:** 16px
**Border Radius (Default):** 4px (rounded)
**Spacing Unit:** 4px (0.25rem)
**Shadow (Default):** shadow-md

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis