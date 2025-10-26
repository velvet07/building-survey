# 🚀 Gyors Telepítési Útmutató - felmeres.wpmuhely.com

Ez az egyszerűsített útmutató kifejezetten a **felmeres.wpmuhely.com** domain-re, ahol már van Docker és Apache/Nginx.

---

## ⏱️ Teljes telepítési idő: ~15 perc

---

## 1️⃣ Supabase projekt beállítása (5 perc)

### 1.1 Projekt létrehozása (ha még nincs)

1. Menj a https://app.supabase.com
2. Kattints: **"New Project"**
3. Töltsd ki:
   - **Name:** `felmeres-wpmuhely`
   - **Database Password:** Bármilyen jelszó (nem használjuk, de kötelező)
   - **Region:** Europe West (London) - legközelebbi
4. Várj ~2 percet az indulásra

### 1.2 API kulcsok kimásolása

1. Menj: **Settings → API**
2. Másold ki (tedd egy notepad-be):
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGci... (hosszú string)
   service_role: eyJhbGci... (még hosszabb string, TITKOS!)
   ```

### 1.3 Auth beállítások

1. Menj: **Authentication → URL Configuration**
2. Állítsd be:
   - **Site URL:** `https://felmeres.wpmuhely.com`
   - **Redirect URLs:** Add hozzá ezeket (Add URL gomb):
     ```
     https://felmeres.wpmuhely.com/auth/callback
     https://felmeres.wpmuhely.com/**
     ```

3. Menj: **Authentication → Providers**
4. **Email Provider:** Kapcsold be (toggle ON)
5. **Confirm email:** Opcionális - kikapcsolhatod egyszerűség kedvéért
6. **Save**

✅ **Supabase kész!**

---

## 2️⃣ Alkalmazás telepítése (3 perc)

### 2.1 SSH kapcsolódás

```bash
ssh -p 3241 user@wpmuhely.com
# (vagy ahogy szokott csatlakozni)
```

### 2.2 Fájlok letöltése KÖZVETLENÜL a főkönyvtárba

```bash
# Menj a célmappába (pl. /home/wpmuhel/public_html/felmeres/)
cd /home/wpmuhel/public_html/felmeres/

# Ha már van valami itt, töröld vagy másold át
# ls -la   # nézd meg mi van

# Clone KÖZVETLENÜL IDE (a . jelenti az aktuális mappát!)
git clone -b claude/hybrid-urls-local-storage-011CUTyvuEZ7cmVKw7LD1gZi https://github.com/velvet07/building-survey.git .

# ⚠️ FONTOS: A végén a PONT (.) azt jelenti hogy NEM hoz létre almappát!

# Ellenőrzés - közvetlenül itt kell lennie a fájloknak:
ls -la
# Látszódnia kell: docker-compose.yml, Dockerfile, app/, components/, stb.
```

### 2.3 Környezeti változók beállítása

```bash
# Másold a template-et
cp .env.docker.example .env.docker

# Szerkesztés
nano .env.docker
```

**Töltsd ki ezeket az értékeket:**

```bash
# PostgreSQL (generálj erős jelszót!)
POSTGRES_PASSWORD=ide_irj_egy_eros_jelszo_123ABC_XYZ

# Supabase (amit az előbb kimásoltál)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Domain
NEXT_PUBLIC_APP_URL=https://felmeres.wpmuhely.com

# PostgreSQL settings (hagyd változatlan)
POSTGRES_USER=postgres
POSTGRES_DB=building_survey
```

**Mentés:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 2.4 Docker indítása

```bash
# Indítás
./start.sh

# VAGY manuálisan:
docker-compose up -d

# Ellenőrzés (várj ~30 másodpercet)
docker-compose ps

# Várt kimenet:
# building-survey-app       Up       0.0.0.0:3000->3000/tcp
# building-survey-db        Up       0.0.0.0:5432->5432/tcp
```

### 2.5 Logok ellenőrzése

```bash
./logs.sh

# Várt kimenet:
# ✓ PostgreSQL: Database system is ready to accept connections
# ✓ Next.js: Ready in Xms
# ✓ Listening on port 3000
```

**Ha hibát látsz:**
```bash
# Újraindítás
./stop.sh
./start.sh

# Logok újra
./logs.sh
```

✅ **Docker konténerek futnak!**

---

## 3️⃣ Admin felhasználó létrehozása (2 perc)

### 3.1 Setup oldal megnyitása

**Böngészőben:**
```
http://wpmuhely.com:8080
```

*(Ha nem működik a domain, próbáld az IP címmel: `http://xx.xx.xx.xx:8080`)*

### 3.2 Admin létrehozása

1. Töltsd ki:
   - **Email:** `admin@wpmuhely.com` (vagy bármilyen email)
   - **Jelszó:** Min. 8 karakter, erős jelszó!
   - **Név:** Opcionális

2. **Kattints:** "Admin felhasználó létrehozása"

3. **Sikeres esetén:**
   - ✅ "Sikeres setup!" üzenet
   - Setup oldal automatikusan letiltódik

### 3.3 Setup leállítása (opcionális)

```bash
docker-compose stop setup
```

✅ **Admin user kész!**

---

## 4️⃣ Reverse Proxy beállítása (5 perc)

A szervereden már fut Apache vagy Nginx. Melyiket használod?

### Nginx esetén:

```bash
# 1. Config file létrehozása
sudo nano /etc/nginx/sites-available/felmeres.wpmuhely.com
```

**Másold be ezt:**

```nginx
server {
    listen 80;
    server_name felmeres.wpmuhely.com;

    # Ideiglenes HTTP config (később SSL-re frissül)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # File upload limit
        client_max_body_size 50M;
    }
}
```

```bash
# 2. Aktiválás
sudo ln -s /etc/nginx/sites-available/felmeres.wpmuhely.com /etc/nginx/sites-enabled/

# 3. Teszt
sudo nginx -t

# 4. Reload
sudo systemctl reload nginx
```

### Apache esetén:

```bash
# 1. Mod proxy engedélyezése (ha nincs)
sudo a2enmod proxy proxy_http

# 2. VirtualHost létrehozása
sudo nano /etc/apache2/sites-available/felmeres.wpmuhely.com.conf
```

**Másold be ezt:**

```apache
<VirtualHost *:80>
    ServerName felmeres.wpmuhely.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:3000/$1 [P,L]

    # File upload limit
    LimitRequestBody 52428800
</VirtualHost>
```

```bash
# 3. Aktiválás
sudo a2ensite felmeres.wpmuhely.com

# 4. Reload
sudo systemctl reload apache2
```

**Teszt böngészőben:**
```
http://felmeres.wpmuhely.com
```

✅ **HTTP működik!**

---

## 5️⃣ SSL Certificate (HTTPS) - Let's Encrypt (5 perc)

### Nginx esetén:

```bash
# 1. Certbot telepítése (ha nincs)
sudo apt install -y certbot python3-certbot-nginx

# 2. Certificate megszerzése (automatikus Nginx config frissítés)
sudo certbot --nginx -d felmeres.wpmuhely.com

# Követő kérdések:
# Email: add meg a saját email-ed
# Terms: (A)gree
# Updates: (N)o
# Redirect HTTP→HTTPS: (2) Redirect
```

### Apache esetén:

```bash
# 1. Certbot telepítése (ha nincs)
sudo apt install -y certbot python3-certbot-apache

# 2. Certificate megszerzése
sudo certbot --apache -d felmeres.wpmuhely.com

# Ugyanazok a kérdések mint Nginx-nél
```

**Auto-renewal ellenőrzése:**
```bash
sudo systemctl status certbot.timer

# Tesztelés
sudo certbot renew --dry-run
```

✅ **HTTPS kész!**

---

## 6️⃣ Ellenőrzés és első bejelentkezés (1 perc)

### Nyisd meg böngészőben:
```
https://felmeres.wpmuhely.com
```

### Jelentkezz be:
- **Email:** `admin@wpmuhely.com` (vagy amit beírtál)
- **Jelszó:** Admin jelszavad

### Első lépések:
1. **Dashboard:** Látod a főoldalt
2. **Projektek → + Új projekt:** Hozz létre tesztprojektet
3. **Felhasználók:** Hozz létre további usereket (User vagy Viewer role)
4. **Rajzok:** Próbáld ki a rajzmodul-t
5. **Fotók:** Tölts fel fotókat

✅ **MINDEN KÉSZ!**

---

## 🔧 Hasznos parancsok

```bash
# Jelenlegi mappa (ahol a fájlok vannak)
cd /home/wpmuhel/public_html/felmeres/

# Státusz ellenőrzése
docker-compose ps

# Logok nézése
docker-compose logs -f app        # App logok (live)
docker-compose logs -f postgres   # DB logok (live)
docker-compose logs               # Összes log

# Újraindítás
docker-compose restart

# Leállítás és indítás
docker-compose down
docker-compose up -d

# Újraépítés (kód változás után)
docker-compose down
docker-compose up -d --build

# Volume-ok listázása
docker volume ls
```

---

## 🐛 Gyakori problémák

### 1. "Module not found" build hiba

**Hiba:**
```
Module not found: Can't resolve '@/lib/supabase/server'
```

**Megoldás:**
```bash
# Pull the latest code (már javítva van)
git pull origin claude/hybrid-urls-local-storage-011CUTyvuEZ7cmVKw7LD1gZi

# Rebuild
docker-compose down
docker-compose up -d --build
```

### 2. "Connection refused" hiba

```bash
# Ellenőrizd hogy futnak a containerek
docker-compose ps

# Ha nem futnak
docker-compose up -d
```

### 3. "Auth error" Supabase

```bash
# Ellenőrizd a .env.docker fájlt
cat .env.docker | grep SUPABASE

# Újraindítás
docker-compose restart
```

### 4. Port 3000 foglalt

```bash
# Nézd meg mi használja
sudo lsof -i:3000

# Ha más alkalmazás, kill-eld vagy módosítsd a portot
# docker-compose.yml → app → ports: "3001:3000"
```

### 5. Nginx 502 Bad Gateway

```bash
# App státusz
docker-compose logs app

# Direct teszt
curl http://localhost:3000

# Nginx restart
sudo systemctl restart nginx
```

### 6. Build nagyon lassú

```bash
# Docker cache tisztítás
docker system prune -a

# Majd újra:
docker-compose up -d --build
```

---

## 📊 Mappa struktúra a szerveren

```
/home/wpmuhel/public_html/felmeres/    # <-- KÖZVETLENÜL IDE TELEPÍTETTÜK!
├── .env.docker              # Környezeti változók (TITKOS!)
├── docker-compose.yml        # Docker szolgáltatások
├── Dockerfile               # Next.js image
├── app/                     # Next.js alkalmazás
├── components/              # React komponensek
├── lib/                     # Logika
├── supabase/               # SQL schema fájlok
└── docs/                   # Dokumentáció
```

**Backup:**
```bash
cd /home/wpmuhel/public_html/felmeres/

# Docker volume backup (adatbázis)
docker run --rm -v building-survey-postgres-data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Uploads backup (fotók)
docker run --rm -v building-survey-uploads-data:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup.tar.gz /data
```

---

## 🎉 Sikeres telepítés!

Az alkalmazás most már fut:
- **URL:** https://felmeres.wpmuhely.com
- **Admin:** admin@wpmuhely.com

**Következő lépések:**
1. Hozz létre user és viewer usereket
2. Hozz létre projekteket
3. Próbáld ki a modulokat (rajzok, űrlapok, fotók)
4. Állítsd be a rendszeres backup-ot

**Dokumentáció:**
- [README.md](README.md) - Általános áttekintés
- [INSTALL.md](INSTALL.md) - Részletes telepítési útmutató
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) - Felhasználói kézikönyv (18,000+ szó)
- [DEVELOPER.md](DEVELOPER.md) - Fejlesztői dokumentáció

---

**Verzió:** 1.3.0
**Branch:** `claude/hybrid-urls-local-storage-011CUTyvuEZ7cmVKw7LD1gZi`
**Létrehozva:** 2025-10-26
