# 🏗️ Épületfelmérő Rendszer

Moduláris webalkalmazás épületfelméréshez és építési dokumentációhoz. Teljes projektek kezelése, rajzolás, űrlapok és fotók - mindezt Docker konténerben, önálló szerveren futtatható.

**Verzió:** 1.3.0
**Status:** ✅ Production Ready
**Branch:** `hybrid-URLs-and-local-file-storage-support`

---

## ✨ Funkciók

### 🔐 Felhasználó kezelés
- **3 szerepkör**: Admin, User, Viewer
- Email/jelszó alapú bejelentkezés
- Admin panel felhasználó létrehozáshoz/szerkesztéshez

### 📁 Projektek
- Projekt létrehozás, szerkesztés, törlés
- Automatikus azonosító generálás (pl. `proj-20251025-001`)
- Soft delete (visszaállítható törlés)

### 🖊️ Rajzmodul
- Canvas rajzolás (toll, radír, kijelölés)
- A4/A3 papírméret, álló/fekvő
- Touch gestures (pinch-to-zoom, two-finger pan)
- PDF export
- User-friendly URL-ek (pl. `/alaprajz-pince`)

### 📋 Űrlapok
- Dinamikus űrlapok (Aquapol modul)
- Automatikus mentés
- Megtekintő mód (Viewer role)

### 📷 Fotógaléria
- **Lokális file storage** (Docker volume)
- Automatikus thumbnail generálás
- Galéria nézet
- Letöltés, törlés

---

## 🚀 Gyors telepítés Docker-rel

### Előfeltételek

- **Docker** és **Docker Compose** telepítve
- **Supabase Account** (ingyenes: https://supabase.com)
- Legalább 2GB RAM és 10GB szabad disk
- Saját domain vagy IP cím

### Telepítési lépések

**📖 Részletes telepítési útmutató:** [INSTALL.md](./INSTALL.md)

**Rövid verzió:**

```bash
# 1. Repo letöltése
git clone -b hybrid-URLs-and-local-file-storage-support https://github.com/velvet07/building-survey.git
cd building-survey

# 2. Környezeti változók beállítása
cp .env.docker.example .env.docker
# Szerkeszd a .env.docker fájlt

# 3. Docker indítása
./start.sh

# 4. Admin user létrehozása (böngészőben)
http://your-domain.com:8080

# 5. Készen vagy!
http://your-domain.com:3000
```

**Segítő scriptek:**
```bash
./start.sh     # Indítás
./stop.sh      # Leállítás
./logs.sh      # Logok megtekintése
./rebuild.sh   # Újraépítés és indítás
```

---

## 📚 Dokumentáció

### Telepítés
- **[INSTALL.md](./INSTALL.md)** - Részletes telepítési útmutató Docker-rel

### Felhasználói dokumentáció
- **[docs/USER_GUIDE.md](./docs/USER_GUIDE.md)** - Teljes felhasználói kézikönyv (magyar)
  - 18,000+ szó, 11 fejezet
  - Képernyőképekkel és példákkal
  - Tablet használat és ujjmozdulatok
  - FAQ és hibaelhárítás

### Fejlesztői dokumentáció
- **[DEVELOPER.md](./DEVELOPER.md)** - Fejlesztői útmutató
  - Projekt struktúra
  - Tech stack
  - Modulok áttekintése
  - Új funkció hozzáadása
  - Debugging

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase Auth (cloud) + PostgreSQL 15 (self-hosted)
- **Canvas:** Konva.js + React-Konva
- **Image Processing:** Sharp (thumbnails)
- **PDF Export:** jsPDF
- **Deployment:** Docker + Docker Compose

---

## 📁 Projekt struktúra

```
building-survey/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes (upload, files)
│   ├── dashboard/              # Dashboard pages
│   └── actions/                # Server Actions
├── components/                 # React komponensek
│   ├── drawings/              # Rajzmodul
│   ├── photos/                # Fotógaléria
│   ├── forms/                 # Űrlapok
│   └── users/                 # User management
├── lib/                       # Utilities és logika
├── supabase/                  # Database schema
│   ├── schema.sql            # Fő séma
│   ├── policies.sql          # RLS policies
│   └── migrations/           # Migrációk
├── docker/                    # Docker config
├── setup/                     # PHP admin setup wizard
├── docs/                      # Dokumentáció
│   └── USER_GUIDE.md         # Felhasználói kézikönyv
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Next.js container
├── INSTALL.md                 # Telepítési útmutató
├── DEVELOPER.md               # Fejlesztői dokumentáció
└── README.md                  # Ez a fájl
```

---

## 🔑 Szerepkörök (RBAC)

### 👑 Admin
- ✅ Teljes hozzáférés minden projekthez
- ✅ User management
- ✅ Létrehozás, szerkesztés, törlés

### 👤 User
- ✅ Saját projektek teljes kezelése
- ✅ Rajzok, űrlapok, fotók - teljes hozzáférés
- ❌ Más userek projektjei **nem láthatók**
- ❌ User management nem elérhető

### 👁️ Viewer
- ✅ **MINDEN** projekt megtekintése (read-only)
- ✅ PDF export, fotó letöltés
- ❌ Szerkesztés, törlés, létrehozás **tiltva**

---

## 🆕 Mi újság ebben a verzióban?

### v1.3.0 - Hybrid URLs & Local Storage (2025-10-26)

**Hybrid URL struktúra:**
- Projektek: `proj-20251025-001` (auto-identifier)
- Rajzok: `alaprajz-pince` (név-alapú slug)
- Magyar karakterek kezelése: á→a, é→e, stb.

**Lokális file storage:**
- Fotók most Docker volume-ban (`/app/uploads`)
- Automatikus thumbnail generálás (400x400px)
- Gyorsabb és megbízhatóbb

**Backward compatibility:**
- Régi UUID-alapú URL-ek továbbra is működnek
- Supabase Storage fotók továbbra is működnek

---

## 📦 Használt modulok

- ✅ **Projektek** - Projekt kezelés
- ✅ **Rajzok** - Canvas rajzolás, PDF export
- ✅ **Űrlapok** - Dinamikus form builder (Aquapol)
- ✅ **Fotók** - Galéria, feltöltés, törlés
- ✅ **Felhasználók** - User management (admin only)

---

## 🐛 Hibaelhárítás

### Gyakori problémák

**1. Docker konténer nem indul:**
```bash
# Ellenőrizd a logokat
./logs.sh

# Újraindítás
./stop.sh
./start.sh
```

**2. Adatbázis kapcsolati hiba:**
```bash
# Ellenőrizd a PostgreSQL státuszt
docker-compose ps
docker-compose logs postgres
```

**3. Admin user nem jön létre:**
```bash
# Manuális létrehozás Supabase Dashboard-on keresztül
# Vagy futtasd újra a setup wizard-ot:
docker-compose --profile setup up setup
```

**További segítség:** [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) - 11. fejezet (FAQ)

---

## 🔗 Hasznos linkek

- **Dokumentáció:**
  - [Telepítési útmutató](./INSTALL.md)
  - [Felhasználói kézikönyv](./docs/USER_GUIDE.md)
  - [Fejlesztői dokumentáció](./DEVELOPER.md)

- **External:**
  - [Next.js Docs](https://nextjs.org/docs)
  - [Supabase Docs](https://supabase.com/docs)
  - [Docker Docs](https://docs.docker.com)

---

## 🤝 Support

- **Issues:** [GitHub Issues](https://github.com/velvet07/building-survey/issues)
- **Email:** [support email]
- **Dokumentáció:** Lásd [docs/](./docs/) mappát

---

## 📄 License

ISC

---

**Készítette:** Claude Code
**Generated with:** [Claude Code](https://claude.com/claude-code)
