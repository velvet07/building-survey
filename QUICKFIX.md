# =� Gyorsjav�t�s: "Hiba t�rt�nt a projektek bet�lt�se sor�n"

## Probl�ma

Ha ezt a hiba�zenetet l�tod a dashboard-on:
```
Hiba t�rt�nt a projektek bet�lt�se sor�n
```

**OK:** A Supabase adatb�zis nincs inicializ�lva! A t�bl�k (`projects`, `drawings`, `photos` stb.) nincsenek l�trehozva.

---

##  Megold�s (5 perc)

### 1. EllenQrz�s

Nyisd meg b�ng�szQben vagy curl-�z:
```bash
curl https://felmeres.wpmuhely.com/api/setup-db
```

Ha ezt l�tod:
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

Akkor **NINCS inicializ�lva** az adatb�zis. Tov�bb a 2. l�p�shez! �

---

### 2. Supabase SQL Scriptek futtat�sa

#### A. Menj a Supabase Dashboard-ra

```
https://app.supabase.com/project/etpchhopecknyhnjgnor/sql
```

(Vagy: Supabase Dashboard � SQL Editor � New query)

#### B. ElsQ script futtat�sa

1. Nyisd meg a **helyi f�jlt** a szervereden:
   ```bash
   cat /home/wpmuhel/public_html/felmeres/supabase/deploy-all.sql
   ```

2. M�sold ki a **TELJES** tartalm�t (t�bb ezer sor)

3. Illeszd be a Supabase SQL Editor-ba

4. Kattints: **RUN** (vagy Ctrl/Cmd + Enter)

5. V�rj 10-30 m�sodpercet

6. EllenQrizd hogy l�tod a z�ld sikeres �zenetet:
   ```
   Success. No rows returned
   ```

#### C. M�sodik script futtat�sa

1. T�r�ld ki az elQzQ SQL-t az editor-b�l

2. Nyisd meg a **m�sodik f�jlt**:
   ```bash
   cat /home/wpmuhel/public_html/felmeres/supabase/migrations/add-slugs-and-local-storage.sql
   ```

3. M�sold ki a tartalm�t

4. Illeszd be a Supabase SQL Editor-ba

5. Kattints: **RUN**

6. V�rj a sikeres �zenetre

---

### 3. EllenQrz�s

#### A. Table Editor-ban

Menj: **Table Editor** (bal men�)

EllenQrizd hogy ezek a t�bl�k l�trej�ttek:
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

Most ezt kell l�tnod:
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

1. Menj a webes fel�letre: `https://felmeres.wpmuhely.com`

2. Jelentkezz be

3. Pr�b�lj meg l�trehozni egy projektet:
   - Kattints: **+ �j projekt**
   - N�v: `Teszt projekt`
   - L�trehoz�s

4. Ha siker�l � **K�SZ VAN!** <�

5. Ha nem siker�l � N�zd a Docker logokat:
   ```bash
   cd /home/wpmuhel/public_html/felmeres
   docker compose logs -f app
   ```

---

## = Tov�bbi hibakeres�s

### "Unauthorized" vagy "Auth error"

- Jelentkezz ki �s be �jra
- EllenQrizd hogy a user l�tezik a Supabase-ben: Dashboard � Authentication � Users
- EllenQrizd hogy van `profiles` rekord: Dashboard � Table Editor � profiles

### Admin jogok be�ll�t�sa

Ha be tudsz jelentkezni, de nincs admin jogod:

1. Menj a Supabase Dashboard � Table Editor � `profiles`

2. Keresd meg a felhaszn�l�d (email alapj�n)

3. Szerkeszd a `role` mezQt:
   ```
   user � admin
   ```

4. Mentsd el

5. Jelentkezz ki �s vissza

---

## =� R�szletes dokument�ci�

Tov�bbi inform�ci�k:
- **Teljes telep�t�si �tmutat�:** [INSTALL.md](INSTALL.md)
- **Architekt�ra:**
  - Auth: Supabase Cloud 
  - Adatb�zis: Supabase Cloud 
  - F�jlok: Helyi Docker volume 

---

##  Checklist

- [ ] Supabase SQL Editor megnyitva
- [ ] `supabase/deploy-all.sql` lefuttatva
- [ ] `supabase/migrations/add-slugs-and-local-storage.sql` lefuttatva
- [ ] Table Editor-ban l�tszanak a t�bl�k
- [ ] `/api/setup-db` � `initialized: true`
- [ ] Projekt l�trehoz�s sikeres

Ha mind  akkor mqk�dik! =�

---

**Seg�ts�g kell?** N�zd meg a Docker logokat vagy a [INSTALL.md](INSTALL.md)-t!
