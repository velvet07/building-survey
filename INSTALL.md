# Building Survey - Docker Telepítési Útmutató

Részletes lépésről-lépésre útmutató a Building Survey alkalmazás telepítéséhez saját szerveren Docker segítségével.

## 📋 Tartalomjegyzék

1. [Rendszerkövetelmények](#rendszerkövetelmények)
2. [Docker telepítés](#docker-telepítés)
3. [Supabase projekt létrehozása](#supabase-projekt-létrehozása)
4. [Alkalmazás telepítése](#alkalmazás-telepítése)
5. [Admin felhasználó létrehozása](#admin-felhasználó-létrehozása)
6. [Reverse Proxy beállítás](#reverse-proxy-beállítás)
7. [SSL Certificate (HTTPS)](#ssl-certificate-https)
8. [Troubleshooting](#troubleshooting)

---

## 🖥️ Rendszerkövetelmények

### Minimális:
- **CPU:** 2 mag
- **RAM:** 2GB
- **Tárhely:** 10GB szabad hely
- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Hozzáférés:** SSH (sudo), port 80/443

### Ajánlott:
- **CPU:** 4 mag
- **RAM:** 4GB
- **Tárhely:** 20GB SSD
- **Hálózat:** 100 Mbps

### Szükséges portok:
- `80` - HTTP
- `443` - HTTPS
- `3000` - Next.js (belső, Docker-hez)
- `5432` - PostgreSQL (belső, Docker-hez)
- `8080` - Setup page (ideiglen

es)

---

## 🐳 Docker telepítés

### Ubuntu/Debian:

```bash
# 1. Előkészítés
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 2. Docker GPG kulcs hozzáadása
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 3. Docker repository hozzáadása
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Docker telepítése
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 5. Docker Compose telepítése
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 6. Ellenőrzés
docker --version
docker-compose --version

# 7. User hozzáadása docker csoporthoz (opcionális, sudo nélkül futtatáshoz)
sudo usermod -aG docker $USER
# Jelentkezz ki és vissza, hogy érvényesüljön
```

### CentOS/RHEL:

```bash
# 1. Docker telepítése
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 2. Docker indítása
sudo systemctl start docker
sudo systemctl enable docker

# 3. Docker Compose telepítése
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Ellenőrzés
docker --version
docker-compose --version
```

---

## 🔐 Supabase projekt létrehozása

A Building Survey Supabase Auth-ot használ a felhasználói bejelentkezéshez (cloud-based). Az adatok azonban a saját szerveren (PostgreSQL Docker container-ben) tárolódnak.

### Lépések:

1. **Regisztráció/Bejelentkezés:**
   - Menj a [https://app.supabase.com](https://app.supabase.com)
   - Jelentkezz be vagy regisztrálj (GitHub/Google account-tal is lehet)

2. **Új projekt létrehozása:**
   - Kattints: **"New Project"**
   - **Name:** `building-survey` (vagy tetszőleges)
   - **Database Password:** Generálj biztonságos jelszót (NEM kell megjegyezned - csak Auth-ra használjuk)
   - **Region:** Válaszd a hozzád legközelebbi régiót
   - Kattints: **"Create new project"**
   - Várj 1-2 percet amíg a projekt elindul

3. **API kulcsok megszerzése:**
   - A projektben menj: **Settings** → **API**
   - Másold ki a következő értékeket:
     - **Project URL:** `https://xxxxx.supabase.co`
     - **anon public:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (hosszú string)
     - **service_role:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (hosszabb string)
   - ⚠️ **FONTOS:** A `service_role` kulcs titkos! Ne commitold git-be!

4. **Auth beállítások:**
   - Menj: **Authentication** → **URL Configuration**
   - **Site URL:** Írd be a saját subdomain-ed: `https://survey.yourdomain.com`
   - **Redirect URLs:** Add hozzá:
     ```
     https://survey.yourdomain.com/auth/callback
     https://survey.yourdomain.com/**
     ```
   - Menj: **Authentication** → **Providers**
   - **Email Provider:** Engedélyezd (toggle ON)
   - **Confirm email:** Kikapcsolhatod a könnyebb setup-hoz (opcionális)
   - Mentsd el (Save)

5. **Kész!**
   - A Supabase projekt most már készen áll Auth-ra
   - Az adatok (projektek, rajzok, űrlapok) a saját szerveredre kerülnek

---

## 📦 Alkalmazás telepítése

### 1. Fájlok feltöltése

**SSH-val (ajánlott):**

```bash
# SSH kapcsolódás
ssh -p 3241 user@your-server.com

# Könyvtár létrehozása
mkdir -p ~/building-survey
cd ~/building-survey

# Fájlok feltöltése (pl. SCP-vel vagy git clone)
# Ha van GitHub repo:
git clone https://github.com/youruser/building-survey.git .

# Vagy SCP-vel saját gépről:
# scp -P 3241 -r /path/to/building-survey/* user@your-server.com:~/building-survey/
```

**FTP-vel:**
- Csatlakozz FTP klienssel (FileZilla, WinSCP)
- Töltsd fel az összes fájlt egy könyvtárba (pl. `~/building-survey`)

### 2. Environment fájl konfigurálása

```bash
# Másold a template-et
cp .env.docker.example .env

# Szerkeszd
nano .env
```

**Töltsd ki a következő értékeket:**

```bash
# PostgreSQL jelszó (generálj erős jelszót!)
POSTGRES_PASSWORD=valami_nagyon_biztonsagos_jelszo_123

# Supabase adatok (amit az előbb kimásoltál)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # TITKOS!

# Subdomain URL
NEXT_PUBLIC_APP_URL=https://survey.yourdomain.com
```

**Mentsd el:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3. Konténerek indítása

```bash
# Egyszerű indítás
./start.sh

# Vagy manuálisan:
docker-compose up -d

# Ellenőrzés hogy futnak-e
docker-compose ps

# Várt kimenet:
# building-survey-app       Up       0.0.0.0:3000->3000/tcp
# building-survey-db        Up       0.0.0.0:5432->5432/tcp
```

### 4. Logok ellenőrzése

```bash
# Összes log
./logs.sh

# Csak app logok
./logs.sh app

# Csak database logok
./logs.sh db
```

**Sikeres indulás esetén:**
```
✅ PostgreSQL: Database system is ready to accept connections
✅ Next.js: Ready in X ms
✅ Listening on port 3000
```

---

## 👤 Admin felhasználó létrehozása

### Böngészőből (Setup PHP):

1. **Nyisd meg böngészőben:**
   ```
   http://your-server-ip:8080
   ```

2. **Töltsd ki az űrlapot:**
   - Email: `admin@yourdomain.com`
   - Jelszó: min. 8 karakter (erős jelszó!)
   - Teljes név: (opcionális)

3. **Kattints:** "Admin felhasználó létrehozása"

4. **Sikeres setup esetén:**
   - ✅ "Sikeres setup!" üzenet
   - A setup oldal automatikusan letiltásra kerül
   - Most már bejelentkezhetsz az alkalmazásban

5. **Setup konténer leállítása (opcionális):**
   ```bash
   docker-compose stop setup
   ```

---

## 🌐 Reverse Proxy beállítás

### Nginx (már telepítve van a szerveren):

1. **Config file létrehozása:**
   ```bash
   sudo nano /etc/nginx/sites-available/survey.yourdomain.com
   ```

2. **Másold be a config-ot:**
   ```nginx
   # HTTP -> HTTPS redirect
   server {
       listen 80;
       server_name survey.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   # HTTPS
   server {
       listen 443 ssl http2;
       server_name survey.yourdomain.com;

       # SSL certificate (frissítsd később Let's Encrypt-tel)
       ssl_certificate /etc/letsencrypt/live/survey.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/survey.yourdomain.com/privkey.pem;

       # Security headers
       add_header Strict-Transport-Security "max-age=31536000" always;
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;

       client_max_body_size 50M;

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
       }
   }
   ```

3. **Aktiváld a site-ot:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/survey.yourdomain.com /etc/nginx/sites-enabled/
   ```

4. **Teszt:**
   ```bash
   sudo nginx -t
   ```

5. **Reload:**
   ```bash
   sudo systemctl reload nginx
   ```

### Apache (ha Nginx helyett Apache-ot használsz):

1. **Mod proxy engedélyezése:**
   ```bash
   sudo a2enmod proxy proxy_http proxy_wstunnel
   ```

2. **VirtualHost létrehozása:**
   ```bash
   sudo nano /etc/apache2/sites-available/survey.yourdomain.com.conf
   ```

3. **Config:**
   ```apache
   <VirtualHost *:80>
       ServerName survey.yourdomain.com
       Redirect permanent / https://survey.yourdomain.com/
   </VirtualHost>

   <VirtualHost *:443>
       ServerName survey.yourdomain.com

       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/survey.yourdomain.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/survey.yourdomain.com/privkey.pem

       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/

       # WebSocket support
       RewriteEngine On
       RewriteCond %{HTTP:Upgrade} =websocket [NC]
       RewriteRule /(.*)  ws://localhost:3000/$1 [P,L]
   </VirtualHost>
   ```

4. **Aktiváld:**
   ```bash
   sudo a2ensite survey.yourdomain.com
   sudo systemctl reload apache2
   ```

---

## 🔒 SSL Certificate (HTTPS)

### Let's Encrypt (Ingyenes, automatikus):

```bash
# 1. Certbot telepítése
sudo apt install -y certbot python3-certbot-nginx

# 2. Certificate megszerzése (Nginx-hez)
sudo certbot --nginx -d survey.yourdomain.com

# 3. Követő kérdések:
# - Email cím: add meg
# - Terms of Service: (A)gree
# - Email updates: (N)o
# - Redirect HTTP to HTTPS: (2) Redirect

# 4. Auto-renewal ellenőrzése
sudo systemctl status certbot.timer

# 5. Manuális renewal teszt
sudo certbot renew --dry-run
```

**Certbot automatikusan:**
- Megsz erzi a certificate-et
- Frissíti az Nginx config-ot
- Beállítja az auto-renewal-t (90 naponta)

---

## 🐛 Troubleshooting

### Container nem indul el

```bash
# Logok ellenőrzése
docker-compose logs

# Specifikus container log
docker-compose logs app
docker-compose logs postgres

# Restart
docker-compose restart

# Teljes újraépítés
./rebuild.sh
```

### PostgreSQL connection error

```bash
# Ellenőrizd hogy a DB fut-e
docker-compose ps postgres

# PostgreSQL logok
docker-compose logs postgres

# Próbáld meg újraindítani
docker-compose restart postgres
```

### "Auth error" Supabase-nél

- Ellenőrizd a `.env` fájlban a `NEXT_PUBLIC_SUPABASE_URL` és `NEXT_PUBLIC_SUPABASE_ANON_KEY` értékeket
- Supabase Dashboard → Settings → API - másold ki újra
- Ellenőrizd a Redirect URLs-eket (Authentication → URL Configuration)

### Port already in use (3000, 5432)

```bash
# Nézd meg mi használja a portot
sudo lsof -i:3000
sudo lsof -i:5432

# Kill a processt
sudo kill -9 <PID>

# Vagy módosítsd a portot a docker-compose.yml-ben
```

### Nginx 502 Bad Gateway

```bash
# Ellenőrizd hogy az app fut-e
docker-compose ps app

# App logok
docker-compose logs app

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Próbálj curl-öz közvetlenül
curl http://localhost:3000
```

### Disk space issues

```bash
# Docker tisztítás (régi images, containers)
docker system prune -a --volumes

# Használt hely ellenőrzése
docker system df
```

---

## 🎉 Sikeres telepítés!

Ha minden rendben ment, most már elérhető az alkalmazás:

```
https://survey.yourdomain.com
```

**Következő lépések:**
1. Jelentkezz be az admin fiókkal
2. Menj: **Felhasználók** → Hozz létre user és viewer usereket
3. Menj: **Projektek** → Hozz létre első projektet
4. Menj: **Admin** → Futtasd le az RLS policy update scriptet a Supabase Dashboard-on

**Hasznos parancsok:**
```bash
./start.sh      # Indítás
./stop.sh       # Leállítás
./logs.sh       # Logok nézése
./rebuild.sh    # Újraépítés (kód változtatás után)
```

---

## 📞 Támogatás

- **GitHub Issues:** https://github.com/youruser/building-survey/issues
- **Dokumentáció:** [README.md](README.md)
- **Docker docs:** https://docs.docker.com

---

**Verzió:** 1.0
**Utolsó frissítés:** 2025-10-25
