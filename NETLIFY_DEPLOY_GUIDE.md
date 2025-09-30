# Netlify Deployment Útmutató - Building Survey v0.1

## 🚀 Gyors Telepítés (Ajánlott - Webes Felület)

### 1. Netlify Dashboard Megnyitása
Látogass el: **https://app.netlify.com**

### 2. Új Site Létrehozása
1. Kattints: **"Add new site"** → **"Import an existing project"**
2. Válaszd: **"Deploy manually"** (mivel még nincs GitHub repository push)

### 3. Manual Deploy
1. **Húzd be a `.next` mappát** a Netlify felületre
   - Vagy: **Browse to upload** → Válaszd ki: `/home/velvet/building-survey/.next`

2. Site neve automatikusan generálódik (pl: `random-name-123.netlify.app`)
   - Később átnevezheted: **Site settings → Change site name**

### 4. Environment Variables Beállítása
A deployment után menj: **Site settings → Environment variables**

Kötelező változók:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

Hol találod ezeket:
- Supabase Dashboard → Project Settings → API
- URL: `https://<project-ref>.supabase.co`
- Anon key: `eyJ...` (public anon key)

### 5. Site újraindítása
Environment variables beállítása után:
- **Deploys → Trigger deploy → Clear cache and deploy site**

---

## 🔄 Alternatíva: GitHub + Netlify Auto Deploy

Ha később szeretnéd automatizálni:

### 1. Push GitHub-ra (ha még nem tetted meg)
```bash
git push -u origin main
```

### 2. Netlify-ban Connect to GitHub
1. **Add new site → Import an existing project**
2. **Connect to Git provider → GitHub**
3. Válaszd ki: `velvet07/building-survey`
4. **Build settings** (automatikusan felismeri):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (opcionális)

5. **Environment variables** hozzáadása (lásd fentebb)

6. **Deploy site**

---

## 📋 Build Settings (Referencia)

A `netlify.toml` fájl már tartalmazza a beállításokat:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

---

## 🔐 Biztonsági Ellenőrzés

✅ `.env.local` **NEM** kerül fel (`.gitignore` védve)
✅ Supabase kulcsok csak Netlify Environment Variables-ben
✅ RLS (Row Level Security) aktív az adatbázisban
✅ HTTPS automatikusan engedélyezve

---

## 🌐 Site URL

A deployment után kapni fogsz egy URL-t:
- **Temporary**: `https://random-name-123.netlify.app`
- **Custom**: Beállítható a Netlify Dashboard-ban

---

## 📊 Post-Deploy Checklist

- [ ] Site elérhető (200 status)
- [ ] Login működik (Supabase auth)
- [ ] Projektek CRUD működik
- [ ] Rajzok modul betölt
- [ ] Drawing canvas funkcionális
- [ ] PDF export működik

---

## 🐛 Troubleshooting

### Error: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
- **Ok**: Supabase URL nincs beállítva
- **Fix**: Environment variables → Add `NEXT_PUBLIC_SUPABASE_URL`

### Error: "Invalid API key"
- **Ok**: Supabase anon key hibás
- **Fix**: Ellenőrizd a key-t a Supabase Dashboard-ban

### Error: "Network request failed"
- **Ok**: CORS beállítás hiányos
- **Fix**: Supabase → Authentication → URL Configuration → Add Netlify URL

---

## 📞 Támogatás

- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Verzió**: v0.1
**Létrehozva**: 2025-09-30
**Build Status**: ✅ Production Ready