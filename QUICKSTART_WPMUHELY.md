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

## 🐛 Részletes Hibaelhárítási Útmutató

### ⚠️ Docker Build Hibák

#### 1. TypeScript Type Error - Buffer típus

**Hiba:**
```
Type error: Argument of type 'Buffer' is not assignable to parameter of type 'BodyInit'
```

**OK:** A Node.js Buffer típus nem kompatibilis a NextResponse-szal.

**Megoldás:** Már javítva van a kódban - pull latest:
```bash
git pull origin claude/hybrid-urls-local-storage-011CUTyvuEZ7cmVKw7LD1gZi
docker-compose up -d --build
```

#### 2. SQL Init Hiba - Role does not exist

**Hiba:**
```
ERROR: role "authenticated" does not exist
```

**OK:** A role-okat a GRANT előtt kell létrehozni.

**Megoldás:** Már javítva - ha mégis előfordul:
```bash
# Töröld a DB volume-ot és indítsd újra
docker-compose down
docker volume rm building-survey-postgres-data
docker-compose up -d
```

#### 3. Drawings Table Not Found

**Hiba:**
```
ERROR: relation "public.drawings" does not exist
```

**OK:** A drawings táb hiányzott az init szkriptekből.

**Megoldás:** Már javítva - `02.5-drawings.sql` hozzáadva az init-hez.

#### 4. Public Directory Missing

**Hiba:**
```
COPY failed: /app/public: not found
```

**Megoldás:** Már javítva - üres public könyvtár létrehozva.

---

### ⚠️ Docker Container Problémák

#### 5. Container "unhealthy" státusz

**Tünet:**
```bash
docker-compose ps
# STATUS: Up X minutes (unhealthy)
```

**OK:** A healthcheck curl-t használ, ami nincs az alpine image-ben.

**Megoldás:** Már javítva - healthcheck kikapcsolva mindkét helyen (Dockerfile + docker-compose.yml).

#### 6. Container nem indul / azonnal leáll

**Diagnosztika:**
```bash
# Logok részletesen
docker-compose logs app --tail 100

# Konténer inspektálása
docker inspect building-survey-app
```

**Gyakori okok:**
- Hiányzó környezeti változók → ellenőrizd `.env.docker`
- Port már foglalt → `netstat -tlnp | grep 3000`
- Memória probléma → `docker stats`

---

### ⚠️ Docker Networking Problémák

#### 7. "Connection reset by peer" hiba

**Hiba:**
```bash
curl http://localhost:3000/api/health
# curl: (56) Recv failure: Connection reset by peer
```

**OK:** Docker port mapping nem működik megfelelően bizonyos konfigurációkban (pl. cPanel környezet, firewall, stb).

**Diagnosztika:**
```bash
# 1. Konténer státusz
docker-compose ps

# 2. Port mapping ellenőrzése
docker port building-survey-app
# Kimenet: 3000/tcp -> 0.0.0.0:3000

# 3. Konténeren BELÜL működik-e?
docker exec building-survey-app wget -O- http://127.0.0.1:3000/api/health
# Ha ez működik, de kívülről nem → networking probléma

# 4. Netstat - hallgatja-e a port?
netstat -tlnp | grep 3000
```

**✅ MEGOLDÁS - Nginx Proxy Konténer (AJÁNLOTT):**

Ha a host gépről nem érhető el a Docker port (connection refused, connection reset), használj belső Nginx proxy-t:

```bash
# 1. Nginx config létrehozása
cd /home/wpmuhel/public_html/felmeres
cat > nginx-proxy.conf << 'EOF'
server {
    listen 80;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

# 2. docker-compose.yml szerkesztése
nano docker-compose.yml
```

**Add hozzá az `app:` után (UGYANAZON a behúzási szinten):**

```yaml
  nginx-proxy:
    image: nginx:alpine
    container_name: building-survey-nginx
    restart: unless-stopped
    ports:
      - "8888:80"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    networks:
      - building-survey-network
```

```bash
# 3. Indítás
docker-compose up -d

# 4. Teszt
curl http://localhost:8888/api/health
# Kimenet: {"status":"ok",...}
```

**Most a fő Nginx/Apache ezt a porton keresztül fogja elérni az app-ot!**

#### 8. iptables / Docker network hiba

**Hiba:**
```
Failed to Setup IP tables: Unable to enable ACCEPT OUTGOING rule
```

**Megoldás:**
```bash
# Docker daemon restart
systemctl restart docker

# Majd újra
docker-compose up -d
```

---

### ⚠️ Reverse Proxy Problémák (Nginx/Apache)

#### 9. Nginx 502 Bad Gateway

**Tünet:** Browser: "error code: 502"

**Diagnosztika:**
```bash
# 1. App fut-e?
docker-compose ps
curl http://localhost:8888/api/health  # Ha használod az nginx-proxy-t

# 2. Nginx error log
tail -50 /usr/local/nginx/logs/error.log
# VAGY
tail -50 /usr/local/apache/domlogs/felmeres.wpmuhely.com.error.log

# 3. Upstream connection
grep "upstream" /usr/local/apache/domlogs/felmeres.wpmuhely.com.error.log | tail -5
```

**Gyakori okok:**

**A) Rossz upstream cím az Nginx config-ban**

**cPanel Managed Nginx esetén:**

A cPanel environment-ben **KÉT config fájl** van:
- **HTTP (80):** `/etc/nginx/conf.d/vhosts/felmeres.wpmuhely.com.conf`
- **HTTPS (443):** `/usr/local/nginx/conf/conf.d/felmeres.wpmuhely.com.conf`

**MINDKÉT fájlban** módosítani kell a `proxy_pass` direktívát!

```bash
# HTTPS config szerkesztése
nano /usr/local/nginx/conf/conf.d/felmeres.wpmuhely.com.conf
```

Keresd meg a `location /` blokkot és **cseréld le**:

```nginx
location / {
    # Docker Next.js app proxy
    proxy_pass http://127.0.0.1:8888;  # <-- nginx-proxy port
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 50M;
}
```

**Töröld vagy kommenteld ki** az `@backend` és `@custom` location blokkokat!

```bash
# HTTP config szerkesztése (ha használod a HTTP-t is)
nano /etc/nginx/conf.d/vhosts/felmeres.wpmuhely.com.conf
# Ugyanaz a módosítás!

# Nginx reload
nginx -s reload

# Teszt
curl https://felmeres.wpmuhely.com/api/health
```

**B) SELinux blokkolja a proxy kapcsolatot**

```bash
# Ellenőrzés
getenforce
# Ha "Enforcing":

# SELinux engedélyezése HTTP proxy-hoz
setsebool -P httpd_can_network_connect 1

# Nginx restart
systemctl restart nginx
```

**C) Firewall (CSF) blokkolja a portot**

```bash
# CSF config szerkesztése
nano /etc/csf/csf.conf

# Keresd meg: TCP_IN
# Add hozzá: 8888 (nginx-proxy port)
# Példa: TCP_IN = "20,21,22,25,53,80,110,143,443,8888"

# CSF restart
csf -r

# Ellenőrzés
iptables -L -n | grep 8888
```

---

### ⚠️ Supabase Auth Problémák

#### 10. "Auth session missing" vagy "Invalid JWT"

**OK:** Helytelen Supabase konfiguráció.

**Ellenőrzés:**
```bash
# .env.docker értékek
cat .env.docker | grep SUPABASE
```

**Megoldás:**
1. Supabase Dashboard → Settings → API
2. Másold újra az anon key-t és service role key-t
3. Frissítsd `.env.docker`-ben
4. Restart:
```bash
docker-compose restart app
```

#### 11. "Redirect URL not allowed"

**OK:** Hiányzó redirect URL a Supabase-ben.

**Megoldás:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Redirect URLs → Add URL:
   - `https://felmeres.wpmuhely.com/auth/callback`
   - `https://felmeres.wpmuhely.com/**`
3. Save

---

### ⚠️ Database Problémák

#### 12. "Connection refused" PostgreSQL

```bash
# DB státusz
docker-compose ps postgres

# DB logok
docker-compose logs postgres | tail -50

# Ha nem healthy, restart
docker-compose restart postgres
```

#### 13. "Relation does not exist" SQL error

**OK:** Táblák nem lettek létrehozva.

**Megoldás:**
```bash
# Töröld a DB volume-ot és inicializáld újra
docker-compose down
docker volume rm building-survey-postgres-data
docker-compose up -d

# Várj 30 másodpercet az init-re
sleep 30
docker-compose logs postgres | grep "init process complete"
```

---

### ⚠️ Performance Problémák

#### 14. Lassú build (10+ perc)

```bash
# Docker cache clean
docker system prune -a

# BuildKit használata (gyorsabb)
DOCKER_BUILDKIT=1 docker-compose build
docker-compose up -d
```

#### 15. Magas CPU/memória használat

```bash
# Stats
docker stats

# Ha app túl sokat használ:
# - Növeld a Docker memória limitet
# - Csökkentsd a worker számot (docker-compose.yml)
```

---

### ⚠️ Egyéb Gyakori Hibák

#### 16. "Port already in use"

```bash
# Nézd meg mi használja
lsof -i:3000  # vagy :8888

# Kill process
kill -9 <PID>

# Vagy módosítsd a portot docker-compose.yml-ben
```

#### 17. Git clone / pull problémák

```bash
# Ha "Permission denied":
sudo chown -R $USER:$USER /home/wpmuhel/public_html/felmeres/

# Ha "Already exists":
# Biztosítsd hogy ÜRES a mappa vagy használj -f flag-et
rm -rf /home/wpmuhel/public_html/felmeres/*
git clone ...
```

---

## 🔍 Hibakeresési Workflow

Ha valami nem működik, kövesd ezt a sorrendet:

```bash
# 1. Container státusz
docker-compose ps
# Minden "Up" és "healthy" legyen

# 2. App logok
docker-compose logs app --tail 50
# Keress ERROR, WARN, vagy exception üzeneteket

# 3. DB logok
docker-compose logs postgres --tail 50
# "Database system is ready" kell látszódjon

# 4. Konténeren belüli teszt
docker exec building-survey-app wget -O- http://127.0.0.1:3000/api/health
# Ennek működnie KELL - ha nem, app probléma

# 5. Nginx proxy teszt (ha használod)
curl http://localhost:8888/api/health
# Ennek is működnie kell

# 6. Külső teszt
curl https://felmeres.wpmuhely.com/api/health
# Ha ez nem megy, de az előző igen → Nginx config probléma

# 7. Nginx error log
tail -50 /usr/local/apache/domlogs/felmeres.wpmuhely.com.error.log | grep upstream
```

**Lépésről-lépésre haladj** - így pontosan megtalálod hol van a hiba!

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
