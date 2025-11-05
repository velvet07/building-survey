# Docker Deployment Útmutató

Ez a dokumentum leírja, hogyan lehet a Building Survey alkalmazást Docker segítségével telepíteni és frissíteni.

## Előfeltételek

- Docker telepítve (20.10+)
- Docker Compose telepítve (2.0+)
- Git hozzáférés a repository-hoz

## Első Telepítés

### 1. Repository klónozása

```bash
git clone <repository-url>
cd building-survey
git checkout claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb
```

### 2. Environment változók beállítása

Másold le az `.env.example` fájlt `.env` néven és töltsd ki a szükséges értékekkel:

```bash
cp .env.example .env
nano .env
```

Szükséges értékek:
- `NEXT_PUBLIC_SUPABASE_URL`: A Supabase projekt URL-je
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A Supabase anonymous key

### 3. Alkalmazás indítása

```bash
# Automatikus deployment script használata
./deploy.sh

# VAGY manuálisan:
docker-compose build
docker-compose up -d
```

## Frissítés (Amikor új kód érkezett)

### Gyors frissítés - Automatikus Script

```bash
./deploy.sh
```

Ez a script automatikusan:
1. Lekéri a legfrissebb kódot a git repository-ból
2. Leállítja a futó konténereket
3. Újra buildeli az alkalmazást
4. Elindítja az új verzót

### Manuális frissítés

```bash
# 1. Legfrissebb kód lekérése
git fetch origin
git checkout claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb
git pull origin claude/fix-empty-page-console-error-011CUq4FiRzvDweyYrokGmfb

# 2. Konténerek leállítása
docker-compose down

# 3. Új build készítése (--no-cache: tiszta build, ajánlott frissítésnél)
docker-compose build --no-cache

# 4. Konténerek indítása
docker-compose up -d

# 5. Logok ellenőrzése
docker-compose logs -f
```

## Hasznos Docker Parancsok

### Konténer kezelés

```bash
# Státusz ellenőrzése
docker-compose ps

# Logok megtekintése (valós idejű)
docker-compose logs -f

# Logok megtekintése (utolsó 100 sor)
docker-compose logs --tail=100

# Konténerek leállítása
docker-compose down

# Konténerek újraindítása
docker-compose restart

# Konténerek indítása
docker-compose up -d
```

### Hibaelhárítás

```bash
# Belépés a futó konténerbe
docker-compose exec web sh

# Konténer újraindítása
docker-compose restart web

# Összes Docker erőforrás törlése (VIGYÁZAT: mindent töröl!)
docker system prune -a --volumes
```

### Build és tisztítás

```bash
# Tiszta build (töröl minden cache-t)
docker-compose build --no-cache

# Régi, használaton kívüli image-ek törlése
docker image prune -a

# Volumes törlése (VIGYÁZAT: adatvesztés lehet!)
docker-compose down -v
```

## Port Konfiguráció

Az alkalmazás alapértelmezetten a **3000-es porton** fut.

Ha más portot szeretnél használni, szerkeszd a `docker-compose.yml` fájlt:

```yaml
ports:
  - "8080:3000"  # Host:Container
```

## Környezeti Változók Frissítése

Ha frissíteni kell a környezeti változókat (pl. új Supabase URL):

1. Szerkeszd a `.env` fájlt
2. Indítsd újra a konténereket:

```bash
docker-compose down
docker-compose up -d
```

## Production Deployment Checklist

- [ ] `.env` fájl létrehozva és kitöltve
- [ ] Docker és Docker Compose telepítve
- [ ] Tűzfal beállítva (3000-es port nyitva, ha szükséges)
- [ ] HTTPS reverse proxy beállítva (Nginx/Traefik, opcionális)
- [ ] Backup rendszer beállítva
- [ ] Monitoring és logolás beállítva

## Reverse Proxy (Nginx példa)

Ha Nginx-et használsz reverse proxy-ként:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Hibaelhárítás

### Az alkalmazás nem indul el

1. Ellenőrizd a logokat:
   ```bash
   docker-compose logs web
   ```

2. Ellenőrizd hogy a portok szabadok-e:
   ```bash
   netstat -tulpn | grep 3000
   ```

3. Ellenőrizd az environment változókat:
   ```bash
   docker-compose config
   ```

### Build hiba

1. Töröld a cache-t és próbáld újra:
   ```bash
   docker-compose build --no-cache
   ```

2. Töröld a node_modules mappát és próbáld újra:
   ```bash
   docker system prune -a
   docker-compose build
   ```

### Konténer crashel

1. Nézd meg a részletes logokat:
   ```bash
   docker-compose logs --tail=200 web
   ```

2. Próbáld meg a konténert interaktív módban futtatni:
   ```bash
   docker-compose run --rm web sh
   ```

## Támogatás

Ha problémába ütközöl, ellenőrizd:
1. Docker verziót: `docker --version`
2. Docker Compose verziót: `docker-compose --version`
3. Konténer logokat: `docker-compose logs web`
4. Konténer státuszt: `docker-compose ps`
