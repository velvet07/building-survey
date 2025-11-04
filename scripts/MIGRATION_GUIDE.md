# Adatmigráció: Supabase → Lokális PostgreSQL

Ez az útmutató segít átmásolni az adatokat a Supabase cloud adatbázisból a lokális PostgreSQL adatbázisba.

## Előfeltételek

1. **Node.js** telepítve
2. **Docker** fut és a lokális PostgreSQL elérhető
3. **Supabase connection string** - a Supabase adatbázis elérése

## Lépések

### 1. Szerezd meg a Supabase connection string-et

Menj a Supabase dashboard-ra:
1. Nyisd meg: https://app.supabase.com/project/YOUR-PROJECT/settings/database
2. Görgess le a "Connection string" részhez
3. Válaszd ki a **"Connection pooling"** fület (vagy "Direct connection")
4. Másold ki a connection string-et

Formátuma:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 2. Állítsd be a környezeti változót

**Dockerben (ajánlott):**

Szerkeszd a `.env` fájlt a projekt gyökérkönyvtárában:
```bash
nano .env
```

Add hozzá ezt a sort:
```bash
SUPABASE_CONNECTION_STRING=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres
```

**Vagy közvetlenül a terminálban:**
```bash
export SUPABASE_CONNECTION_STRING="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"
```

### 3. Futtasd a migration scriptet

**Docker környezetben:**

```bash
# Lépj be az app konténerbe
docker exec -it building-survey-app sh

# Futtasd a migration scriptet
cd /app
chmod +x scripts/migrate-data.sh
./scripts/migrate-data.sh
```

**Vagy közvetlenül:**

```bash
cd /home/velvet07/building-survey

# Telepítsd a függőségeket (ha még nincs)
npm install pg

# Futtasd a scriptet
chmod +x scripts/migrate-data.sh
./scripts/migrate-data.sh
```

### 4. Erősítsd meg a migrációt

A script megkérdezi:
```
⚠️  This will OVERWRITE data in local database. Continue? (yes/no):
```

Írd be: `yes` és nyomj Entert.

### 5. Várd meg a befejezést

A script:
- ✅ Backup-ot készít a lokális adatbázisról
- ✅ Lemásolja az összes táblát: profiles, projects, drawings, photos, forms_data
- ✅ Megtartja az ID-kat és kapcsolatokat
- ✅ Kiírja a progress-t

### 6. Ellenőrizd az eredményt

```bash
# Indítsd újra az alkalmazást
docker-compose restart app

# Vagy ha közvetlenül futtatod:
npm run dev
```

Nyisd meg az alkalmazást és ellenőrizd:
- ✅ Látszanak-e a projektek
- ✅ Megnyílnak-e a projekt oldalak
- ✅ Működik-e a rajzok modul
- ✅ Működik-e a fotók modul

## Hibaelhárítás

### "ERROR: SUPABASE_CONNECTION_STRING is not set"

Állítsd be a környezeti változót (lásd 2. lépés).

### "Connection refused" vagy "could not connect to server"

**Supabase oldalon:**
- Ellenőrizd, hogy a connection string helyes-e
- Ellenőrizd, hogy a jelszó helyes-e
- Ellenőrizd, hogy a Supabase projekt fut-e

**Lokális oldalon:**
- Ellenőrizd, hogy a Docker PostgreSQL fut-e: `docker-compose ps`
- Ellenőrizd, hogy a DATABASE_URL helyes-e a `.env` fájlban

### "Table does not exist"

Ez normális, ha egy tábla még nem létezik a Supabase-ben. A script automatikusan átugorja.

### Migráció visszavonása

Ha valami rosszul sült el:

```bash
# Állítsd vissza a backup-ból
cd /home/velvet07/building-survey/scripts
psql $DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql
```

## Mit migrál a script?

A következő táblákat másolja át:

1. **profiles** - Felhasználói profilok
2. **projects** - Projektek
3. **drawings** - Rajzok és canvas adatok
4. **photos** - Fotók metaadatai (nem a fájlok, csak a DB rekordok)
5. **forms_data** - Űrlap adatok

## Fontos megjegyzések

- ⚠️ **A fotó FÁJLOKAT** ez a script NEM másolja át, csak a metaadatokat az adatbázisban
- ⚠️ Ha a fotók a Supabase Storage-ban vannak, azokat külön kell átmásolni
- ✅ A script megtartja az ID-kat, így a kapcsolatok érvényesek maradnak
- ✅ Automatikusan backup-ot készít mielőtt felülírná az adatokat

## Fotók migrálása (opcionális)

Ha a fotók a Supabase Storage-ban vannak, külön kell őket átmásolni a lokális storage-ba (`/app/uploads`).

Ehhez készíthetünk egy külön scriptet, ha szükséges.
