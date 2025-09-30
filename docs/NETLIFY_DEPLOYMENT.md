# Netlify Deployment Guide - FÁZIS 4

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** DevOps Engineer

---

## 📋 Áttekintés

Ez a dokumentum lépésről-lépésre végigvezet a Netlify deployment folyamaton.

---

## 🚀 1. Netlify Project Setup

### 1.1 Netlify Account Létrehozása

**Lépések:**
1. Navigálj: https://www.netlify.com
2. Sign up / Log in
   - Ajánlott: **GitHub account-tal** (egyszerűbb CI/CD)
3. Verify email address

---

### 1.2 Git Repository Előkészítése

#### A. Git Init (Ha még nincs repo)

```bash
cd /home/velvet/building-survey

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit - Moduláris WebApp MVP

🎉 Project setup complete
- Backend: Supabase + PostgreSQL + RLS
- Frontend: Next.js 14 + TypeScript + Tailwind
- Auth: Email/Password with verification
- CRUD: Projects with soft delete
- Security: Audit passed
- QA: 55 test cases documented

🚀 Generated with Claude Code"
```

---

#### B. GitHub Repository Létrehozása

**Lépések:**
1. GitHub → New Repository
2. Repository name: `building-survey-mvp`
3. Visibility: **Private** (ajánlott MVP-hez)
4. **NE** add README, .gitignore (már léteznek)
5. Create repository

**Push to GitHub:**
```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/building-survey-mvp.git

# Rename branch to main (if needed)
git branch -M main

# Push
git push -u origin main
```

---

### 1.3 Netlify Site Létrehozása

**Lépések:**

1. **Netlify Dashboard → Sites → Add new site → Import an existing project**

2. **Connect to Git provider**
   - Válassz: **GitHub**
   - Authorize Netlify (ha első alkalom)

3. **Pick a repository**
   - Válaszd ki: `building-survey-mvp`

4. **Site settings and deploy**

   **Build settings:**
   ```
   Base directory: (leave empty)
   Build command: npm run build
   Publish directory: .next
   ```

   **Environment variables** (később beállítjuk)

5. **Deploy site**
   - Kattints: "Deploy site"
   - Várj az első deploy-ra (~2-3 perc)

---

### 1.4 Site Name Megváltoztatása

**Lépések:**
1. Site settings → General → Site details
2. Site name: `building-survey-mvp` (vagy egyedi név)
3. Save

**Eredmény URL:**
```
https://building-survey-mvp.netlify.app
```

---

## 🔐 2. Environment Variables Konfiguráció

### 2.1 Production Supabase URL és Keys

**Lépések:**

1. **Netlify Dashboard → Site settings → Environment variables**

2. **Add variables:**

   | Key | Value | Scope |
   |-----|-------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | All |
   | `NEXT_PUBLIC_APP_URL` | `https://building-survey-mvp.netlify.app` | Production |

   **Note:** A `NEXT_PUBLIC_` prefix miatt ezek a client-side-on is elérhetők (RLS védi őket).

3. **Redeploy site** (hogy az új env vars bekerüljenek)
   - Deploys → Trigger deploy → Deploy site

---

### 2.2 .env.example Frissítése

**Fájl:** `.env.example`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production URL (Netlify)
# NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

**Commit:**
```bash
git add .env.example
git commit -m "docs: Update .env.example with production URL note"
git push
```

---

## ⚙️ 3. Build & Deploy Settings

### 3.1 netlify.toml Konfiguráció

**Fájl:** `netlify.toml` (projekt root-ban)

```toml
# Netlify Configuration File
# https://docs.netlify.com/configure-builds/file-based-configuration/

[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

# Redirect rules
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"

# Content Security Policy (uncomment and customize)
# [[headers]]
#   for = "/*"
#   [headers.values]
#     Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"

# Cache static assets
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# HTTPS redirect
[[redirects]]
  from = "http://building-survey-mvp.netlify.app/*"
  to = "https://building-survey-mvp.netlify.app/:splat"
  status = 301
  force = true

# Functions (if needed later)
[functions]
  directory = "netlify/functions"
```

**Commit:**
```bash
git add netlify.toml
git commit -m "feat: Add Netlify configuration with security headers"
git push
```

**Autodeploy:** Netlify automatikusan újra deploy-ol push után.

---

### 3.2 Next.js Netlify Plugin

**Package telepítése:**
```bash
npm install -D @netlify/plugin-nextjs
```

**netlify.toml kiegészítés:**
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Commit:**
```bash
git add package.json package-lock.json netlify.toml
git commit -m "feat: Add Netlify Next.js plugin"
git push
```

---

### 3.3 Build Performance Optimizálás

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "build:prod": "npm run type-check && npm run lint && npm run build"
  }
}
```

**Netlify build command frissítése:**
- Site settings → Build & deploy → Build settings
- Build command: `npm run build:prod`

---

## 🌐 4. Custom Domain Setup (Opcionális)

### 4.1 Domain Vásárlás

**Opciók:**
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- Cloudflare Registrar: https://www.cloudflare.com/products/registrar/

**Példa domain:** `building-survey.com`

---

### 4.2 Domain Csatlakoztatás Netlify-hoz

**Lépések:**

1. **Netlify Dashboard → Domain settings → Add custom domain**

2. **Domain hozzáadása:**
   - Domain name: `building-survey.com`
   - Verify: Yes, it's mine

3. **DNS Konfiguráció:**

   **Opció A: Netlify DNS (Ajánlott)**
   - Netlify → Domain settings → Set up Netlify DNS
   - Netlify generál nameserver-eket (pl. `dns1.p01.nsone.net`)
   - Domain registrar-nál állítsd be a nameserver-eket

   **Opció B: External DNS**
   - Add A record: `104.198.14.52` (Netlify IP)
   - Add CNAME record: `www` → `building-survey-mvp.netlify.app`

4. **HTTPS / SSL:**
   - Netlify automatikusan létrehoz Let's Encrypt SSL certificate-et
   - Várj 5-10 percet a DNS propagációra

5. **Domain alias:**
   - `www.building-survey.com` → redirect to `building-survey.com`

---

### 4.3 Supabase Redirect URLs Frissítése

**Supabase Dashboard → Authentication → URL Configuration:**

**Site URL:**
```
https://building-survey.com
```

**Redirect URLs:**
```
https://building-survey.com/auth/callback
https://building-survey.com/**
https://building-survey-mvp.netlify.app/auth/callback
https://building-survey-mvp.netlify.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 🔗 5. Supabase Production Connection

### 5.1 Production Database Verification

**Ellenőrizd:**

1. **Tables léteznek**
   - Supabase Dashboard → Table Editor
   - Check: `profiles`, `projects`, `modules`, `user_module_activations`

2. **Functions léteznek**
   - Database → Functions
   - Check: 11 functions

3. **RLS Policies enabled**
   - Authentication → Policies
   - Check: 19 policies

4. **Auth provider enabled**
   - Authentication → Providers
   - Email provider: ✅ Enabled

---

### 5.2 Test User Létrehozása Production-ben

**Opció A: Supabase Dashboard**
1. Authentication → Users → Add user
2. Email: `admin@your-domain.com`
3. Password: Generate secure password
4. Auto-confirm email: ✅ Yes

**Opció B: Production Frontend**
1. Navigate to: `https://building-survey-mvp.netlify.app/register`
2. Register test user
3. Check email (Supabase sends confirmation)
4. Confirm email

---

### 5.3 Update Test User Role

**SQL Editor:**
```sql
-- Update test user to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@your-domain.com';

-- Verify
SELECT email, role FROM public.profiles WHERE email = 'admin@your-domain.com';
```

---

## 📊 6. Monitoring Setup

### 6.1 Netlify Analytics (Beépített)

**Lépések:**
1. Site settings → Analytics
2. Enable Netlify Analytics (Fizetős: $9/hó)
   - OR használj ingyenes alternatívát (pl. Plausible, Umami)

**Ingyenes alternatíva:** Google Analytics 4

---

### 6.2 Google Analytics 4 Setup (Opcionális)

**Lépések:**

1. **Google Analytics Account**
   - https://analytics.google.com
   - Create Account → Create Property

2. **Tracking ID:**
   - Property → Data Streams → Add stream → Web
   - Website URL: `https://building-survey-mvp.netlify.app`
   - Measurement ID: `G-XXXXXXXXXX`

3. **Next.js Integration:**

   **Install package:**
   ```bash
   npm install @next/third-parties
   ```

   **app/layout.tsx:**
   ```typescript
   import { GoogleAnalytics } from '@next/third-parties/google'

   export default function RootLayout({ children }) {
     return (
       <html lang="hu">
         <body>
           {children}
           <GoogleAnalytics gaId="G-XXXXXXXXXX" />
         </body>
       </html>
     )
   }
   ```

4. **Commit & Deploy:**
   ```bash
   git add .
   git commit -m "feat: Add Google Analytics 4 tracking"
   git push
   ```

---

## 🚨 7. Error Tracking - Sentry

### 7.1 Sentry Account Setup

**Lépések:**
1. Navigate: https://sentry.io
2. Sign up / Log in
3. Create new project
   - Platform: **Next.js**
   - Project name: `building-survey-mvp`

---

### 7.2 Sentry Integration

**Install Sentry:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**Wizard kérdések:**
- Login to Sentry: Yes
- Select project: `building-survey-mvp`
- DSN: Automatikusan beállítódik

**Létrehozott fájlok:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` (módosítva)

---

### 7.3 Sentry Environment Variables

**Netlify env vars:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxxxx@sentry.io/xxxxx` |
| `SENTRY_AUTH_TOKEN` | `your_auth_token` |
| `SENTRY_ORG` | `your_org_slug` |
| `SENTRY_PROJECT` | `building-survey-mvp` |

---

### 7.4 Test Sentry

**Test error:**
```typescript
// app/test-error/page.tsx
export default function TestErrorPage() {
  throw new Error('Test Sentry error tracking');
}
```

**Deploy & Visit:**
- https://building-survey-mvp.netlify.app/test-error
- Check Sentry Dashboard → Issues

**Után töröld a test page-et.**

---

## 📈 8. Performance Monitoring

### 8.1 Lighthouse CI

**Install:**
```bash
npm install -D @lhci/cli
```

**Configuration file:** `lighthouserc.js`

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['https://building-survey-mvp.netlify.app'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Package.json script:**
```json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}
```

**Run Lighthouse:**
```bash
npm run lighthouse
```

---

### 8.2 Web Vitals Monitoring

**Next.js beépített:**

**app/layout.tsx:**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Vagy egyedi tracking:**
```typescript
// app/web-vitals.ts
export function reportWebVitals(metric: any) {
  console.log(metric);

  // Send to analytics endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  // });
}
```

---

## 💾 9. Backup Strategy

### 9.1 Supabase Backup

**Automatikus backups (Supabase Free tier):**
- Daily backups (last 7 days)
- Dashboard → Database → Backups

**Manual backup:**
```bash
# Export database schema
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --schema-only > schema_backup.sql

# Export data
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --data-only > data_backup.sql
```

---

### 9.2 Git Backup

**GitHub Backup:**
- Git repository = automatic backup
- GitHub automatikusan georedundáns tárolás

**Additional backup:**
```bash
# Clone to external location
git clone https://github.com/YOUR_USERNAME/building-survey-mvp.git /path/to/backup/
```

---

### 9.3 Netlify Site Backup

**Automatikus:**
- Netlify minden deploy = snapshot
- Deploys → [Deploy] → Preview = restore point

**Manual export:**
- Site settings → Build & deploy → Deploy log
- Download build artifacts

---

## 🔄 10. Rollback Procedure

### 10.1 Netlify Instant Rollback

**Lépések:**
1. Netlify Dashboard → Deploys
2. Válaszd ki a korábbi working deploy-t
3. Kattints: **Publish deploy**
4. Confirm

**Időtartam:** ~30 másodperc

---

### 10.2 Git Rollback

**Ha a kód hibás:**

```bash
# Revert last commit
git revert HEAD

# Push
git push
```

**Vagy reset to previous commit:**
```bash
# Find commit hash
git log --oneline

# Reset
git reset --hard <commit-hash>

# Force push (VESZÉLYES! Csak ha biztos)
git push --force
```

---

### 10.3 Database Rollback

**Supabase Dashboard → Database → Backups:**
1. Válaszd ki a restore point-ot
2. Restore backup

**FONTOS:** Backup restore = data loss (minden change a backup után elvész)

---

## ✅ 11. Production Verification

### 11.1 Smoke Test Checklist

**Run these tests on production:**

- [ ] **Homepage loads:** `https://building-survey-mvp.netlify.app`
- [ ] **Register works:** Create test account
- [ ] **Email confirmation:** Check inbox (or Supabase logs)
- [ ] **Login works:** Login with test account
- [ ] **Dashboard loads:** Navigate to `/dashboard`
- [ ] **Create project:** Create new project
- [ ] **Auto ID generated:** Verify `PROJ-YYYYMMDD-NNN` format
- [ ] **Edit project:** Update project name
- [ ] **Delete project:** Soft delete project
- [ ] **Logout works:** Logout and verify redirect
- [ ] **Protected routes:** Try to access `/dashboard` without login → redirect

---

### 11.2 Performance Verification

- [ ] **Initial load < 3s**
- [ ] **Lighthouse Performance score ≥ 80**
- [ ] **No console errors**
- [ ] **Mobile responsive**

---

### 11.3 Security Verification

- [ ] **HTTPS enabled:** Green lock icon
- [ ] **Security headers:** Check with https://securityheaders.com
- [ ] **SSL Labs test:** https://www.ssllabs.com/ssltest/ (A+ grade expected)
- [ ] **No exposed secrets:** Check browser DevTools → Network

---

## 🚀 12. Go-Live Checklist

### Pre-Launch

- [ ] All environment variables set
- [ ] Supabase production database ready
- [ ] Test users created (admin + user)
- [ ] Smoke tests passed
- [ ] Performance verified
- [ ] Security verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring enabled (Analytics + Sentry)
- [ ] Backup strategy documented
- [ ] Rollback procedure tested

### Launch

- [ ] Final QA regression test
- [ ] Notify stakeholders
- [ ] Monitor error logs (Sentry)
- [ ] Monitor analytics (first 24h)
- [ ] Check Netlify deploy logs

### Post-Launch

- [ ] User acceptance testing
- [ ] Collect user feedback
- [ ] Monitor performance metrics
- [ ] Plan iteration roadmap

---

## 📝 Deployment Timeline

### Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Netlify Setup | 30 min | Account, repo, site creation |
| Environment Config | 15 min | Env vars, netlify.toml |
| Domain Setup | 30 min | Custom domain (if applicable) |
| Monitoring Setup | 1 hour | Analytics, Sentry |
| Testing | 2 hours | Smoke tests, QA |
| **TOTAL** | **~4 hours** | Full deployment |

---

## 🔗 Hasznos Linkek

- **Netlify Docs:** https://docs.netlify.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs
- **Sentry Next.js:** https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Deployment Guide Status:** ✅ Complete
**Next Step:** Execute deployment steps

---

**Készítette:** DevOps Engineer
**Dátum:** 2025-09-29
**Dokumentum Verzió:** 1.0