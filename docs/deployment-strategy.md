# Deployment Stratégia - Netlify

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** System Architect

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza a Netlify deployment stratégiát, environment variables kezelést, és a production deployment folyamatot.

---

## 🚀 Deployment Platform: Netlify

**Választott platform:** Netlify
**Indoklás:**
- Next.js first-class support
- Auto-deploy GitHub integration
- Preview deploys PR-ekhez
- Ingyenes tier elegendő MVP-hez
- Built-in CDN
- Egyszerű environment variables kezelés

---

## 🔑 Environment Variables

### Production Environment Variables

| Változó Név | Leírás | Érték Példa | Kötelező |
|-------------|--------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ❌ (későbbi feature) |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://app.netlify.app` | ❌ (opcionális) |

### `.env.local` (Development)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### `.env.example` (Template)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠️ Build Settings

### Netlify Build Configuration

**Build Command:**
```bash
npm run build
```

**Publish Directory:**
```
.next
```

**Node Version:**
```
20.x
```

**Package Manager:** npm

---

## 📦 Netlify Deployment Flow

### 1. Initial Setup

**Lépések:**

1. **GitHub Repository létrehozása**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/building-survey.git
   git push -u origin main
   ```

2. **Netlify Account létrehozása**
   - Navigate to https://netlify.com
   - Sign up with GitHub account

3. **New Site from Git**
   - Netlify Dashboard → "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify
   - Select repository: `building-survey`

4. **Build Settings konfiguráció**
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

5. **Várj az első deploy-ra**
   - Első deploy ~2-5 perc
   - Netlify generál egy random subdomain-t: `https://random-name-123456.netlify.app`

---

### 2. Environment Variables beállítása

**Netlify Dashboard:**
- Site settings → Environment variables
- Add variables:
  - `NEXT_PUBLIC_SUPABASE_URL` → Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase anon key

**Mentés után:**
- Trigger manual redeploy (Deploy → Trigger deploy)

---

### 3. Supabase Redirect URLs frissítése

**Supabase Dashboard:**
- Authentication → URL Configuration
- Site URL: `https://your-netlify-domain.netlify.app`
- Redirect URLs:
  - `https://your-netlify-domain.netlify.app/auth/callback`
  - `https://your-netlify-domain.netlify.app/**` (wildcard preview deploys-hoz)

**Megjegyzés:** Minden deploy után újra ellenőrizni kell a redirect URL-eket.

---

### 4. Custom Domain Setup (Opcionális)

**Ha van custom domain (pl. `app.example.com`):**

1. **Netlify Dashboard:**
   - Domain settings → Add custom domain
   - Enter domain: `app.example.com`

2. **DNS Provider (pl. Cloudflare, Namecheap):**
   - Add CNAME record:
     ```
     app.example.com → your-netlify-domain.netlify.app
     ```

3. **SSL Certificate:**
   - Netlify automatikusan provision-öl Let's Encrypt SSL cert-et
   - Várj ~1-2 percet

4. **HTTPS Enforce:**
   - Netlify Dashboard → HTTPS → "Force HTTPS" enable

5. **Supabase Redirect URLs frissítése:**
   - Site URL: `https://app.example.com`
   - Redirect URLs: `https://app.example.com/auth/callback`

---

## 🔄 Auto-Deploy Workflow

### Main Branch Auto-Deploy

**Workflow:**
1. Developer push to `main` branch
2. GitHub webhook trigger Netlify build
3. Netlify runs `npm install` + `npm run build`
4. Netlify deploys to production
5. Old version automatikusan rollback-able

**Időtartam:** ~2-5 perc deploy-ig

---

### PR Preview Deploys

**Workflow:**
1. Developer nyit Pull Request
2. Netlify automatikusan build és deploy preview-t
3. Preview URL generálódik: `https://deploy-preview-123--your-site.netlify.app`
4. PR comment-ben megjelenik a preview link
5. Reviewer tudja tesztelni a változtatásokat

**Enable PR Previews:**
- Netlify Dashboard → Site settings → Build & deploy → Deploy contexts
- "Deploy previews" → **Enable**

---

## 🔙 Rollback Strategy

### Rollback Previous Deploy

**Ha production bug történik:**

1. **Netlify Dashboard:**
   - Deploys → Previous deploys list
   - Find last working deploy
   - Click "Publish deploy"

2. **Vagy Git Revert:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

**Időtartam:** Instant rollback (Netlify cached build)

---

## 🧪 Testing Before Production Deploy

### Staging Environment (Opcionális)

**Létrehozás:**
1. Netlify-ban új site-ot `building-survey-staging` néven
2. Connect to `staging` branch
3. Külön environment variables (staging Supabase instance)

**Workflow:**
1. Developer push to `staging` branch
2. Staging auto-deploy
3. QA team tesztel staging-on
4. Ha OK → merge `staging` → `main` (production deploy)

---

## 📊 Monitoring és Analytics

### 1. Netlify Analytics (Opcionális)

**Enable:**
- Netlify Dashboard → Analytics → Enable

**Metrics:**
- Page views
- Unique visitors
- Top pages
- Bandwidth usage

**Költség:** $9/hó (opcionális MVP-hez)

---

### 2. Error Tracking (Sentry - Opcionális)

**Setup:**
```bash
npm install @sentry/nextjs
```

**Config:**
```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Environment Variable:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

### 3. Uptime Monitoring (UptimeRobot - Opcionális)

**Setup:**
1. Create UptimeRobot account
2. Add new monitor: `https://your-netlify-domain.netlify.app`
3. Check interval: 5 minutes
4. Alert email: your@email.com

**Ingyenes tier:** 50 monitors, 5 perc interval

---

## 🔒 Security

### 1. Environment Variables biztonság

- ✅ `NEXT_PUBLIC_*` variables public-ok (browser-accessible)
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` biztonságos (rate limited, RLS protected)
- ❌ SOHA ne commit-olj `.env.local` file-t
- ✅ Használj `.env.example` template-et

### 2. HTTPS Enforce

- Netlify automatikusan SSL cert-et provision-öl
- "Force HTTPS" enabled (minden HTTP redirect HTTPS-re)

### 3. Secrets Management

- Supabase Service Role Key → SOHA ne használd client-side
- Ha szükséges → Next.js API Route-ban environment variable-ként

---

## 📝 Deployment Checklist

### Pre-Deploy Checklist

- [ ] `.env.local` gitignore-ban van
- [ ] Environment variables beállítva Netlify-ban
- [ ] Supabase redirect URLs frissítve
- [ ] Build sikeresen lefut locally (`npm run build`)
- [ ] Lint check pass (`npm run lint`)
- [ ] TypeScript check pass (`npm run type-check`)
- [ ] Tests pass (ha van) (`npm run test`)

### Post-Deploy Checklist

- [ ] Production site elérhető
- [ ] Login/Register működik
- [ ] Email confirmation működik
- [ ] Dashboard betöltődik
- [ ] Projekt CRUD műveletek működnek
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance megfelelő (< 2s load time)

---

## 🚨 Troubleshooting

### Build Failure

**Gyakori okok:**
- TypeScript errors → Fix errors locally
- Missing dependencies → Check `package.json`
- Environment variables missing → Add to Netlify

**Debug:**
- Netlify deploy log-ban látható a pontos hiba
- Fix locally → push újra

### Runtime Error (Production)

**Gyakori okok:**
- Supabase connection issue → Check environment variables
- RLS policy block → Check policies.sql
- CORS error → Check Supabase allowed origins

**Debug:**
- Browser console → Check error messages
- Netlify function logs (ha API route-ot használsz)

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis