# Drawing Module - Adatbázis Setup Útmutató

## 🎯 A probléma amit látsz:

```
Error: Rajz létrehozása sikertelen: Could not find the table 'public.drawings' in the schema cache
```

Ez azt jelenti, hogy a `drawings` tábla még nem létezik az adatbázisban.

## ✅ Megoldás - 3 egyszerű lépés:

### 1. Nyisd meg a Supabase Dashboard-ot

Menj a Supabase projekted admin felületére:
```
https://supabase.com/dashboard
```

### 2. Nyisd meg az SQL Editor-t

- Bal oldali menüben kattints: **SQL Editor** (vagy **Database** → **SQL Editor**)
- Vagy használd ezt a direkt linket:
  ```
  https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/sql
  ```

### 3. Futtasd az SQL setup scriptet

**Opció A - Fájl feltöltése:**
1. Kattints **"New Query"** vagy **"+"** gombra
2. Másold be a `/home/velvet/building-survey/supabase/SETUP_DRAWING_MODULE.sql` fájl teljes tartalmát
3. Kattints **"Run"** vagy **F5**

**Opció B - Részletes setup (ha valami elromlik):**
Ha az összevont script nem működik, futtasd egyesével:
1. `supabase/schema_drawings.sql` - Tábla és indexek
2. `supabase/policies_drawings.sql` - RLS biztonsági szabályok
3. `supabase/functions_drawings.sql` - Utility függvények

## 📋 Ellenőrzés

A script végén látni fogsz egy jelentést:

```
==============================================
DRAWING MODULE INSTALLATION REPORT
==============================================
Table "drawings" exists: true
RLS enabled: true
Number of policies: 4
==============================================
✓ Installation successful!
```

Ha ezt látod → **Kész! ✅**

## 🚀 Használat

1. **Frissítsd a böngészőt** (Ctrl+R vagy F5)
2. Menj egy **projekthez**
3. Kattints a **"Rajzok"** modulra
4. Kattints **"+ Új rajz"**
5. **Rajzolj!** 🎨

## 🛠️ Troubleshooting

### Ha továbbra is hibát kapsz:

**1. Check a tábla létezik-e:**
```sql
SELECT * FROM public.drawings LIMIT 1;
```
Ha ez működik → tábla OK ✅

**2. Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'drawings';
```
Látni kell 4 policy-t (SELECT, INSERT, UPDATE, DELETE)

**3. Check user permissions:**
```sql
SELECT auth.uid();
```
Ez visszaadja a jelenlegi user ID-t. Ha `NULL` → nem vagy bejelentkezve!

**4. Check project permissions:**
```sql
SELECT * FROM public.projects WHERE owner_id = auth.uid();
```
Látod a projektjeidet? Ha nem → nincs jogod hozzá!

## 📞 Ha elakadtál

Hibák ellenőrzése:
1. Nyisd meg a böngésző **Developer Console**-t (F12)
2. Nézd meg a **Console** tabot
3. Másold ki a teljes hibát
4. Ellenőrizd a **Network** tabot → van-e sikertelen Supabase kérés?

## 🎨 Modulok a Dashboard-on

Most már látni fogod:

```
┌─────────────┬─────────────┐
│   Adatok    │   Rajzok    │  ← Elérhető ✅
│ (hamarosan) │   (aktív)   │
├─────────────┼─────────────┤
│    Fotók    │  Jegyzetek  │
│ (hamarosan) │ (hamarosan) │
└─────────────┴─────────────┘
```

## 📁 Fájlok referencia

- **Setup script**: `/home/velvet/building-survey/supabase/SETUP_DRAWING_MODULE.sql`
- **Schema**: `/home/velvet/building-survey/supabase/schema_drawings.sql`
- **Policies**: `/home/velvet/building-survey/supabase/policies_drawings.sql`
- **Functions**: `/home/velvet/building-survey/supabase/functions_drawings.sql`

---

**Minden ready! Most már működnie kell! 🚀**