-- Ellenőrizd ezt a Supabase SQL Editor-ban
-- https://supabase.com/dashboard/project/etpchhopecknyhnjgnor/sql

-- 1. Nézd meg van-e trigger a profiles táblához
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Nézd meg létezik-e a handle_new_user function
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Nézd meg a bejelentkezett user-eket
SELECT
    au.id,
    au.email,
    au.created_at as auth_created,
    p.role,
    p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 4. Nézd meg van-e auto_identifier trigger
SELECT
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'projects';