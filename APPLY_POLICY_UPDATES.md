# RLS Policy Frissítések Alkalmazása

## Probléma
A viewer és más felhasználók nem látják az összes projektet, mert az RLS (Row Level Security) policy-k még a régi szabályokat használják, amelyek szerint csak a saját projekteket lehet látni.

## Megoldás
Az alábbi SQL scriptet kell lefuttatni a Supabase Dashboard-on, hogy minden felhasználó láthassa az összes projektet, rajzot és űrlap választ (de továbbra is csak a tulajdonosok szerkeszthessenek).

## Lépések

### 1. Nyisd meg a Supabase Dashboard-ot
- Menj a projekted Supabase Dashboard-jára
- Kattints a bal oldali menüben a **SQL Editor**-ra

### 2. Futtasd le az SQL scriptet
- Kattints a **New Query** gombra
- Másold be az alábbi SQL kódot:

```sql
-- =============================================================================
-- Update RLS Policies to Allow All Users to View All Projects
-- =============================================================================

-- 1. PROJECTS TABLE - UPDATE SELECT POLICY
-- Drop the old policy that restricted viewing to owned projects
DROP POLICY IF EXISTS "Users can view own non-deleted projects" ON public.projects;

-- Create new policy that allows all users to view all projects
CREATE POLICY "Users can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
);

COMMENT ON POLICY "Users can view all non-deleted projects" ON public.projects IS
'Minden authenticated user láthatja az összes nem törölt projektet';

-- 2. DRAWINGS TABLE - UPDATE SELECT POLICY
-- Drop the old policy that restricted viewing to owned project drawings
DROP POLICY IF EXISTS drawings_select_policy ON public.drawings;

-- Create new policy that allows all users to view all drawings
CREATE POLICY drawings_select_policy
ON public.drawings
FOR SELECT
USING (
  -- Feltétel 1: Minden authenticated user látja az aktív rajzokat
  (
    deleted_at IS NULL
  )
  OR
  -- Feltétel 2: Admin mindent lát (törölt rajzokat is)
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
);

COMMENT ON POLICY drawings_select_policy ON public.drawings IS
'Minden user látja az összes aktív rajzot, Admin mindent (törölt rajzokkal együtt)';

-- 3. FORM RESPONSES TABLE - UPDATE SELECT POLICY
-- Drop the old policy that restricted viewing to owned project form responses
DROP POLICY IF EXISTS "Project owners can view own form responses" ON public.project_form_responses;

-- Create new policy that allows all users to view all form responses
CREATE POLICY "All users can view form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.deleted_at IS NULL
  )
);

COMMENT ON POLICY "All users can view form responses" ON public.project_form_responses IS
'Minden user láthatja az összes űrlap választ (aktív projektekhez tartozók)';
```

### 3. Futtasd le a scriptet
- Kattints a **Run** gombra (vagy nyomj `Ctrl+Enter` / `Cmd+Enter`)
- Várd meg, amíg a script lefut
- Ellenőrizd, hogy nincs-e hiba üzenet

### 4. Ellenőrzés
Ellenőrizheted a policy-kat az alábbi query-vel:

```sql
-- Check all policies on projects table
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Check all policies on drawings table
SELECT * FROM pg_policies WHERE tablename = 'drawings';

-- Check all policies on project_form_responses table
SELECT * FROM pg_policies WHERE tablename = 'project_form_responses';
```

## Mit csinál ez a frissítés?

### Változások:
- **Projektek**: Minden bejelentkezett user látja az ÖSSZES nem törölt projektet (nem csak a sajátját)
- **Rajzok**: Minden user látja az ÖSSZES aktív rajzot (nem csak a saját projektjeihez tartozókat)
- **Űrlap válaszok**: Minden user látja az ÖSSZES űrlap választ az aktív projektekhez

### Mi NEM változott (továbbra is védett):
- Projektek létrehozása: csak admin és user
- Projektek szerkesztése: csak a tulajdonos és admin
- Projektek törlése: csak a tulajdonos és admin
- Rajzok létrehozása: csak admin és user
- Rajzok szerkesztése: csak a tulajdonos és admin
- Rajzok törlése: csak a tulajdonos és admin
- Űrlap válaszok létrehozása: csak a projekt tulajdonos és admin
- Űrlap válaszok szerkesztése: csak a projekt tulajdonos és admin

### Viewer role:
- A viewer user továbbra is csak megtekinteni tud mindent (projekt, rajz, űrlap)
- Nem tud létrehozni, szerkeszteni vagy törölni semmit
- A UI-ban minden szerkesztő funkció elrejtve marad számára

## Sikeres alkalmazás után
Miután lefuttattad a scriptet:
1. Jelentkezz ki és vissza viewer user-rel
2. Ellenőrizd, hogy látod-e az összes projektet
3. Próbáld meg szerkeszteni egy projektet - ez nem fog menni (csak megtekintés)
4. Minden más user is látni fogja az összes projektet

## Megjegyzés
Ez a frissítés a production adatbázist módosítja. A változtatások azonnal életbe lépnek minden felhasználónál.
