# =¨ Gyorsjavítás: "Hiba történt a projektek betöltése során"

## Probléma

Ha ezt a hibaüzenetet látod a dashboard-on:
```
Hiba történt a projektek betöltése során
```

**OK:** A Supabase adatbázis nincs inicializálva! A táblák (`projects`, `drawings`, `photos` stb.) nincsenek létrehozva.

---

##  Megoldás (5 perc)

### 1. EllenQrzés

Nyisd meg böngészQben vagy curl-öz:
```bash
curl https://felmeres.wpmuhely.com/api/setup-db
```

Ha ezt látod:
```json
{
  "initialized": false,
  "checks": {
    "profiles": false,
    "projects": false,
    ...
  }
}
```

Akkor **NINCS inicializálva** az adatbázis. Tovább a 2. lépéshez! ’

---

### 2. Supabase SQL Scriptek futtatása

#### A. Menj a Supabase Dashboard-ra

```
https://app.supabase.com/project/etpchhopecknyhnjgnor/sql
```

(Vagy: Supabase Dashboard ’ SQL Editor ’ New query)

#### B. ElsQ script futtatása

1. Nyisd meg a **helyi fájlt** a szervereden:
   ```bash
   cat /home/wpmuhel/public_html/felmeres/supabase/deploy-all.sql
   ```

2. Másold ki a **TELJES** tartalmát (több ezer sor)

3. Illeszd be a Supabase SQL Editor-ba

4. Kattints: **RUN** (vagy Ctrl/Cmd + Enter)

5. Várj 10-30 másodpercet

6. EllenQrizd hogy látod a zöld sikeres üzenetet:
   ```
   Success. No rows returned
   ```

#### C. Második script futtatása

1. Töröld ki az elQzQ SQL-t az editor-ból

2. Nyisd meg a **második fájlt**:
   ```bash
   cat /home/wpmuhel/public_html/felmeres/supabase/migrations/add-slugs-and-local-storage.sql
   ```

3. Másold ki a tartalmát

4. Illeszd be a Supabase SQL Editor-ba

5. Kattints: **RUN**

6. Várj a sikeres üzenetre

---

### 3. EllenQrzés

#### A. Table Editor-ban

Menj: **Table Editor** (bal menü)

EllenQrizd hogy ezek a táblák létrejöttek:
-  `profiles`
-  `projects`
-  `drawings`
-  `photos`
-  `modules`
-  `user_module_activations`

#### B. API Check

```bash
curl https://felmeres.wpmuhely.com/api/setup-db
```

Most ezt kell látnod:
```json
{
  "initialized": true,
  "checks": {
    "profiles": true,
    "projects": true,
    "drawings": true,
    "photos": true
  },
  "message": "Database is fully initialized and ready!"
}
```

---

### 4. Teszt

1. Menj a webes felületre: `https://felmeres.wpmuhely.com`

2. Jelentkezz be

3. Próbálj meg létrehozni egy projektet:
   - Kattints: **+ Új projekt**
   - Név: `Teszt projekt`
   - Létrehozás

4. Ha sikerül ’ **KÉSZ VAN!** <‰

5. Ha nem sikerül ’ Nézd a Docker logokat:
   ```bash
   cd /home/wpmuhel/public_html/felmeres
   docker compose logs -f app
   ```

---

## = További hibakeresés

### "Unauthorized" vagy "Auth error"

- Jelentkezz ki és be újra
- EllenQrizd hogy a user létezik a Supabase-ben: Dashboard ’ Authentication ’ Users
- EllenQrizd hogy van `profiles` rekord: Dashboard ’ Table Editor ’ profiles

### Admin jogok beállítása

Ha be tudsz jelentkezni, de nincs admin jogod:

1. Menj a Supabase Dashboard ’ Table Editor ’ `profiles`

2. Keresd meg a felhasználód (email alapján)

3. Szerkeszd a `role` mezQt:
   ```
   user ’ admin
   ```

4. Mentsd el

5. Jelentkezz ki és vissza

---

## =Ú Részletes dokumentáció

További információk:
- **Teljes telepítési útmutató:** [INSTALL.md](INSTALL.md)
- **Architektúra:**
  - Auth: Supabase Cloud 
  - Adatbázis: Supabase Cloud 
  - Fájlok: Helyi Docker volume 

---

##  Checklist

- [ ] Supabase SQL Editor megnyitva
- [ ] `supabase/deploy-all.sql` lefuttatva
- [ ] `supabase/migrations/add-slugs-and-local-storage.sql` lefuttatva
- [ ] Table Editor-ban látszanak a táblák
- [ ] `/api/setup-db` ’ `initialized: true`
- [ ] Projekt létrehozás sikeres

Ha mind  akkor mqködik! =€

---

**Segítség kell?** Nézd meg a Docker logokat vagy a [INSTALL.md](INSTALL.md)-t!
