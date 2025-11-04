# Adatmigráció: Supabase → Lokális PostgreSQL

## Mi történt?

A migráció script frissítve lett, hogy kezelje a duplikált `auto_identifier` problémát:

### Javítások:
1. **Duplikált auto_identifier kezelése**: A `projects` táblánál most `ON CONFLICT (auto_identifier) DO UPDATE` használatával frissíti a létező sorokat ahelyett, hogy hibát dobna
2. **Egyéb táblák**: `ON CONFLICT (id) DO NOTHING` - átugorja a duplikátumokat
3. **Localhost/Docker kompatibilitás**: A script most automatikusan detektálja a környezetet

### Eredmény:
- Minden projekt most már sikeresen importálódik (mind a 18)
- Nincs több "duplicate key violation" hiba
- A kapcsolatok (foreign keys) érintetlenek maradnak

## Használat

### 1. Szerveren (ahol Docker fut):

```bash
cd /home/user/building-survey

# Futtasd a migration scriptet
./run-migration.sh
```

Ez automatikusan:
- ✅ Ellenőrzi hogy Docker fut-e
- ✅ Átmásolja a migration scriptet a konténerbe
- ✅ Lefuttatja a migrációt
- ✅ Újraindítja az alkalmazást

### 2. Kézzel (Docker konténerben):

```bash
# Másold be a scriptet
docker cp migrate-smart.js building-survey-app:/app/

# Futtasd a migrációt
docker exec building-survey-app node /app/migrate-smart.js

# Indítsd újra az appot
docker-compose restart app
```

## Mit csinál a migration script?

### 1. Kapcsolódás
- Supabase REST API-hoz (adatok letöltése)
- Lokális PostgreSQL-hez (adatok feltöltése)

### 2. Táblák migrálása (sorrendben):
1. **profiles** (6 sor) - Felhasználói profilok
2. **projects** (18 sor) - Projektek
3. **drawings** (14 sor) - Rajzok
4. **photos** (1 sor) - Fotók

### 3. Automatikus kezelés:
- Oszlopok automatikus detektálása
- Duplikátumok kezelése (update vagy skip)
- Foreign key constraint-ek figyelembevétele
- Trigger-ek átmeneti kikapcsolása

## Ellenőrzés

A migráció után:

```bash
# Ellenőrizd az alkalmazást
docker-compose logs -f app

# Vagy nyisd meg a böngészőben
http://your-server:3000
```

Várható eredmény:
- ✅ Projektek megjelennek a dashboardon
- ✅ Projektek megnyílnak
- ✅ Rajzok betöltődnek és szerkeszthetők
- ✅ Fotók látszanak

## Troubleshooting

### "Docker not available"
```bash
# Indítsd el a Docker daemon-t
sudo systemctl start docker
```

### "PostgreSQL container is not running"
```bash
# Indítsd el a konténereket
docker-compose up -d
```

### "Connection refused"
A konténerek nem futnak vagy a hálózat nem elérhető.
```bash
# Ellenőrizd a konténereket
docker-compose ps

# Nézd meg a logokat
docker-compose logs postgres
```

## Fontos megjegyzések

⚠️ **A migráció felülírja a lokális adatbázis tartalmát**
- A script `TRUNCATE TABLE CASCADE` parancsot használ
- Minden létező adat törlődik a lokális adatbázisból
- A Supabase-ben lévő adatok nem változnak

✅ **Mit migrál:**
- Adatbázis rekordok (profiles, projects, drawings, photos)
- ID-k és kapcsolatok megmaradnak

❌ **Mit NEM migrál:**
- Fotó fájlok a Supabase Storage-ból
- Egyéb fájlok vagy blobbok

## Következő lépések

Ha a migráció sikeres volt:

1. **Kapcsold át az alkalmazást lokális módba**
   - Már alapból lokális PostgreSQL-t használ
   - Supabase csak auth-hoz kell

2. **Teszteld az alkalmazást**
   - Hozz létre új projektet
   - Adj hozzá rajzot
   - Tölts fel fotót

3. **Backup (opcionális)**
   ```bash
   docker exec building-survey-db pg_dump -U postgres building_survey > backup.sql
   ```

## Fájlok

- `migrate-smart.js` - Fő migration script (frissített konfliktus kezeléssel)
- `run-migration.sh` - Wrapper script Docker környezethez
- `MIGRATION-README.md` - Ez a dokumentáció

## Kapcsolat

Ha bármi probléma van:
1. Nézd meg a logokat: `docker-compose logs -f app`
2. Ellenőrizd az adatbázist: `docker exec -it building-survey-db psql -U postgres -d building_survey`
3. Vizsgáld meg a táblák tartalmát: `SELECT * FROM projects LIMIT 5;`
