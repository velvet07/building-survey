# 🚀 Building Survey - Production Deployment Guide

## 📋 Áttekintés

Ez a deployment setup egy **production-ready, hibrid architektúrát** használ:
- ✅ **Supabase** - Csak autentikációhoz (cloud)
- ✅ **PostgreSQL** - Helyi adatbázis konténerben
- ✅ **File Storage** - Helyi fájl tárolás (fotók, PDF-ek)
- ✅ **Nginx Proxy** - Reverse proxy a konténerek előtt
- ✅ **Docker Compose** - Teljes orchestration

## 🏗️ Architektúra

```
┌─────────────────────────────────────────────────┐
│         Nginx Reverse Proxy (Port 8888)        │
│         https://survey.yourdomain.com           │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│      Next.js Application (Port 3000)            │
│      - Frontend                                 │
│      - API Routes                               │
│      - PDF Generation                           │
└─────────┬────────────────────────┬──────────────┘
          │                        │
          │                        │
┌─────────▼──────────┐  ┌─────────▼──────────────┐
│  PostgreSQL DB     │  │  Supabase (Cloud)      │
│  (Local Docker)    │  │  - Auth Only           │
│  - Projects        │  │  - User Management     │
│  - Drawings        │  └────────────────────────┘
│  - Photos          │
│  - Form Responses  │
└────────────────────┘
```

## 🔧 Előfeltételek

- Docker 20.10+
- Docker Compose 2.0+
- Supabase fiók (ingyenes tier is elég)
- Minimum 2GB RAM
- Port 3000, 5432, 8080, 8888 szabad

## 📦 Első Telepítés

### 1. Repository klónozása

```bash
git clone <repository-url>
cd building-survey
git checkout claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb
```

### 2. Supabase projekt létrehozása (csak Auth-hoz!)

```bash
# 1. Látogasd meg: https://app.supabase.com
# 2. Create new project
# 3. Várj amíg létrejön (2-3 perc)
# 4. Settings → API → másold ki:
#    - Project URL
#    - anon public key
#    - service_role key (csak admin user létrehozáshoz!)
```

### 3. Supabase Auth beállítása

```bash
# A Supabase Dashboard-on:
# 1. Authentication → URL Configuration
#    - Site URL: https://survey.yourdomain.com
#    - Redirect URLs:
#      * https://survey.yourdomain.com/auth/callback
#      * https://survey.yourdomain.com/**
#
# 2. Authentication → Providers
#    - Enable "Email" provider
#    - (Opcionális) Disable "Confirm email" könnyebb setuphoz
```

### 4. Environment változók

```bash
# Másold le a példa fájlt
cp .env.docker.example .env

# Szerkeszd és töltsd ki az értékeket
nano .env
```

**Fontos értékek:**

```bash
# PostgreSQL (adj meg erős jelszót!)
POSTGRES_PASSWORD=your_strong_password_here

# Supabase (másold be a Dashboard-ról)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL (domain vagy IP)
NEXT_PUBLIC_APP_URL=https://survey.yourdomain.com
```

### 5. Docker konténerek indítása

```bash
# Indítsd el az összes konténert
docker-compose up -d

# Kövesd a logokat
docker-compose logs -f
```

### 6. Admin user létrehozása

```bash
# Nyisd meg böngészőben:
http://your-server-ip:8080

# Töltsd ki:
# - Email: admin@yourdomain.com
# - Password: erős jelszó
# - Full Name: Admin User

# FONTOS: Ezután állítsd le a setup konténert:
docker-compose stop setup
```

### 7. Ellenőrzés

```bash
# Konténerek státusza
docker-compose ps

# App logok
docker-compose logs app

# PostgreSQL ellenőrzése
docker-compose exec postgres psql -U postgres -d building_survey -c "\dt"
```

## 🔄 Frissítés Új Verzióra

### Automatikus Frissítés (AJÁNLOTT)

```bash
cd /path/to/building-survey

# Futtasd a deploy scriptet
./deploy-update.sh
```

Ez a script automatikusan:
1. Újraindítja a Docker szolgáltatást (iptables fix)
2. Leállítja és újraindítja a konténereket
3. Telepíti a Node.js függőségeket
4. Újra buildeli az alkalmazást
5. Újraindítja az app konténert
6. Megjeleníti a státuszt és logokat

### Manuális Frissítés

```bash
# 1. Git pull
git fetch origin
git checkout claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb
git pull origin claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb

# 2. Újra build (ha Dockerfile változott)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. Csak app restart (ha csak kód változott)
docker-compose restart app

# 4. Ellenőrzés
docker-compose logs -f app
```

## 🌐 Reverse Proxy Beállítás (Nginx)

Ha már van Nginx a szerveren:

```nginx
# /etc/nginx/sites-available/building-survey

server {
    listen 80;
    server_name survey.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name survey.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/survey.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/survey.yourdomain.com/privkey.pem;

    # Proxy to Docker Nginx
    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Large file uploads (photos)
        client_max_body_size 50M;
    }
}
```

Aktiválás:

```bash
# Symlink létrehozása
sudo ln -s /etc/nginx/sites-available/building-survey /etc/nginx/sites-enabled/

# Nginx teszt
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx

# Let's Encrypt SSL
sudo certbot --nginx -d survey.yourdomain.com
```

## 🔍 Hasznos Docker Parancsok

### Konténer Kezelés

```bash
# Minden konténer státusza
docker-compose ps

# Logok (valós idejű)
docker-compose logs -f

# Egy konténer logjai
docker-compose logs -f app

# App restart
docker-compose restart app

# Minden leállítása
docker-compose down

# Minden újraindítása
docker-compose restart

# Minden indítása
docker-compose up -d
```

### Adatbázis Műveletek

```bash
# PostgreSQL konzol
docker-compose exec postgres psql -U postgres -d building_survey

# Adatbázis backup
docker-compose exec postgres pg_dump -U postgres building_survey > backup.sql

# Adatbázis restore
docker-compose exec -T postgres psql -U postgres -d building_survey < backup.sql

# Táblák listázása
docker-compose exec postgres psql -U postgres -d building_survey -c "\dt"
```

### Debugging

```bash
# Belépés az app konténerbe
docker-compose exec app sh

# Node.js függőségek újratelepítése
docker-compose exec app npm install

# Build újrafuttatása
docker-compose exec app npm run build

# Environment változók ellenőrzése
docker-compose exec app env | grep NEXT_PUBLIC
```

## 🐛 Hibaelhárítás

### Port foglalt hiba

```bash
# Nézd meg mi használja a portot
sudo netstat -tulpn | grep :3000

# cPanel esetén:
# - Használd a 8888-as portot (nginx-proxy)
# - Vagy változtasd meg a docker-compose.yml-ben a portokat
```

### PostgreSQL connection hiba

```bash
# PostgreSQL újraindítása
docker-compose restart postgres

# Adatbázis logok
docker-compose logs postgres

# Connection string ellenőrzése
docker-compose exec app env | grep DATABASE_URL
```

### Build hiba

```bash
# Tiszta build
docker-compose down
docker-compose build --no-cache app
docker-compose up -d

# Node modules tisztítása konténeren belül
docker-compose exec app rm -rf node_modules .next
docker-compose exec app npm install
docker-compose exec app npm run build
```

### Fotó feltöltés nem működik

```bash
# Volume ellenőrzése
docker volume inspect building-survey-uploads-data

# Jogosultságok
docker-compose exec app ls -la /app/uploads

# Volume újralétrehozása (VIGYÁZAT: adatvesztés!)
docker-compose down
docker volume rm building-survey-uploads-data
docker-compose up -d
```

### pg is not defined hiba

Ez a jelenlegi branch-ben már javítva van! A hiba oka:
- Server-side kód (PostgreSQL) került a client-side bundle-be
- A javítás: `lib/supabase.ts` és `lib/supabaseServer.ts` szétválasztása
- `next.config.js` frissítve a pg externals-szal

## 📊 Monitoring

### Health Check

```bash
# App health (ha beállítva)
curl http://localhost:3000/api/health

# PostgreSQL health
docker-compose exec postgres pg_isready -U postgres
```

### Disk Usage

```bash
# Docker volumes mérete
docker system df -v

# PostgreSQL adatbázis mérete
docker-compose exec postgres psql -U postgres -d building_survey -c "SELECT pg_size_pretty(pg_database_size('building_survey'));"
```

## 🔒 Biztonsági Ajánlások

1. **Erős jelszavak** - PostgreSQL és admin user
2. **Firewall** - Csak 80, 443 port nyitva kívülről
3. **SSL** - Mindig használj HTTPS-t production-ben
4. **Service Role Key** - Soha ne commit-old git-be!
5. **Regular backups** - Napi PostgreSQL backup
6. **Update** - Rendszeres Docker image update

## 🆘 Support

Ha problémába ütközöl:

1. **Logok ellenőrzése**:
   ```bash
   docker-compose logs app
   docker-compose logs postgres
   ```

2. **Konténerek státusza**:
   ```bash
   docker-compose ps
   ```

3. **Environment változók**:
   ```bash
   docker-compose config
   ```

4. **Restart mindennel**:
   ```bash
   docker-compose down
   docker-compose up -d
   docker-compose logs -f
   ```

## 📚 További Dokumentáció

- `.env.docker.example` - Environment változók leírása
- `docker/postgres/init/` - Database schema és init scriptek
- `nginx-proxy.conf` - Nginx proxy konfiguráció
- `docker-compose.yml` - Docker services részletes leírása
