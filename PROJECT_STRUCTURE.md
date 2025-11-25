# 📁 Projekt Struktúra

Ez a dokumentum leírja a projekt mappastruktúráját.

## 🎯 Áttekintés

A projekt két fő részre van osztva:
- **Fő mappa** (`/`): Fejlesztési fájlok, dokumentációk, tesztek
- **Deploy mappa** (`/deploy`): Telepítendő fájlok (mindent, amit a szerverre kell másolni)

## 📂 Fő Mappa Struktúra

```
building-survey/
├── deploy/                    # ⭐ TELEPÍTENDŐ FÁJLOK (lásd alább)
├── docs/                      # Dokumentációk
│   ├── USER_GUIDE.md
│   ├── USER_GUIDE.html
│   ├── SQL_AUDIT_REPORT.md
│   └── SUPABASE_USAGE_AUDIT.md
├── e2e/                       # End-to-end tesztek
│   └── drawing-module.spec.ts
├── .cursor/                   # Cursor IDE beállítások
├── DEVELOPER.md              # Fejlesztői dokumentáció
├── INSTALL.md                # Docker telepítési útmutató
├── INSTALL_CPANEL.md         # cPanel telepítési útmutató
├── INSTALL_CWP7.md           # CWP7 telepítési útmutató
├── README.md                 # Fő README
├── TODO.md                   # TODO lista
├── LAST_WORKING_COMMIT.txt   # Utolsó működő commit
├── DEPLOY_WORKING.sh         # Fejlesztői deployment script
├── deploy-update.sh          # Fejlesztői update script
├── playwright.config.ts      # Playwright teszt konfiguráció
├── netlify.toml              # Netlify konfiguráció (ha használod)
└── .gitignore                # Git ignore szabályok
```

## 📦 Deploy Mappa Struktúra

A `deploy/` mappa tartalmazza **minden fájlt**, amit a szerverre kell másolni:

```
deploy/
├── app/                      # Next.js App Router
├── components/               # React komponensek
├── lib/                      # Könyvtárak és utility-k
├── hooks/                    # Custom React hookok
├── types/                    # TypeScript típusok
├── config/                   # Konfigurációs fájlok
├── translations/            # Fordítások
├── database/                 # MySQL adatbázis sémák
├── docker/                   # Docker konfigurációk
│   └── postgres/            # PostgreSQL init scriptek
├── setup/                    # PHP setup script
├── supabase/                 # Supabase sémák (ha használod)
├── public/                   # Statikus fájlok
├── package.json             # NPM függőségek
├── package-lock.json        # NPM lock fájl
├── Dockerfile               # Docker image build
├── docker-compose.yml       # Docker Compose konfiguráció
├── next.config.js           # Next.js konfiguráció
├── tsconfig.json            # TypeScript konfiguráció
├── tailwind.config.ts       # Tailwind CSS konfiguráció
├── postcss.config.js        # PostCSS konfiguráció
├── middleware.ts            # Next.js middleware
├── nginx-proxy.conf         # Nginx proxy konfiguráció (opcionális)
├── start.sh                 # Docker start script
├── stop.sh                  # Docker stop script
├── logs.sh                  # Docker logs script
├── rebuild.sh               # Docker rebuild script
└── README.md                # Deploy mappa leírása
```

## 🚀 Telepítés

### Docker telepítéshez:

1. Másold a `deploy/` mappa **tartalmát** a szerverre
2. Lépj be a mappába: `cd deploy` (vagy ahol másoltad)
3. Hozd létre a `.env` fájlt
4. Futtasd: `./start.sh`

### cPanel/CWP7 telepítéshez (Docker nélkül):

1. Másold a `deploy/` mappa **tartalmát** a webhosting könyvtáradba
2. Hozd létre a `.env` fájlt
3. Telepítsd a függőségeket: `npm install --production`
4. Build: `npm run build`
5. Indítás: `npm start`

## 📝 Megjegyzések

- A `deploy/` mappa **nem tartalmazza** a fejlesztési fájlokat (tesztek, dokumentációk, stb.)
- A `deploy/` mappa **tartalma** kell a szerverre, nem maga a mappa
- A fő mappában maradnak a fejlesztői fájlok, dokumentációk és tesztek
- A `deploy/` mappa frissítése: amikor módosítasz kódot, újra kell másolni a változott fájlokat a `deploy/` mappába

## 🔄 Frissítés folyamata

1. Módosítod a kódot a fő mappában
2. Másolod a változott fájlokat a `deploy/` mappába
3. Teszteled a `deploy/` mappában
4. Feltöltöd a `deploy/` mappa tartalmát a szerverre

**Tipp:** Használhatsz scriptet is a fájlok automatikus másolásához a `deploy/` mappába.

