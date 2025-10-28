# SQL Audit Report - auth.uid() Usage
## Date: 2025-10-28

## Summary
Reviewed all SQL files in the project to identify potential issues with `auth.uid()` usage in a hybrid environment (local PostgreSQL + Supabase Cloud Auth).

## Findings

### ✅ CRITICAL ISSUE FIXED
**File:** `docker/postgres/init/02.5-drawings.sql`
**Function:** `enforce_created_by_on_drawings()`
**Issue:** Trigger was always overwriting `created_by` with `auth.uid()`, which returns NULL in local PostgreSQL
**Status:** ✅ FIXED - Now uses provided value first, falls back to auth.uid() if available
**Impact:** HIGH - Was preventing all drawing creation

### ✅ NO ISSUES FOUND

#### 1. **Other Triggers**
- `update_updated_at_column()` - Only updates timestamps, no auth.uid() usage
- `handle_new_user()` - AFTER INSERT trigger, uses NEW.id/NEW.email, no auth.uid()
- `set_project_auto_identifier()` - Auto-generates identifiers, no auth.uid()
- `set_default_drawing_name()` - Auto-generates names, no auth.uid()

#### 2. **Functions with auth.uid()**
Files: `docker/postgres/init/03-functions.sql`
- Multiple functions use `auth.uid()` in SELECT queries and WHERE clauses
- **Not problematic** because:
  - Used in SELECT/WHERE, not in INSERT triggers
  - Functions marked SECURITY DEFINER
  - If auth.uid() returns NULL, query simply returns no results
  - Does not block operations

#### 3. **RLS Policies**
Files: `docker/postgres/init/04-policies.sql`
- Extensive use of `auth.uid()` in RLS policies
- **Not problematic** because:
  - Application connects as `postgres` superuser (DATABASE_URL)
  - Postgres superuser has BYPASSRLS privilege
  - RLS policies don't apply to superuser connections
  - Would only matter if using a non-superuser role

#### 4. **Other Tables**
- `project_form_responses` - Has `created_by`/`updated_by` fields
  - **No trigger** that overwrites these fields
  - Application code sets values directly ✅

- `photos` - Not defined in init scripts (only in migrations)
  - No triggers found

## Architecture Notes

### Current Setup
```
┌─────────────┐
│   Next.js   │ ─── Supabase Cloud Auth (authentication only)
│     App     │
└──────┬──────┘
       │
       │ DATABASE_URL (postgres user)
       ↓
┌─────────────┐
│  PostgreSQL │ ─── All data storage
│   (Local)   │
└─────────────┘
```

### Key Points
1. **postgres user = superuser = BYPASSRLS**
   - RLS policies don't apply
   - No session variables needed
   - Direct database access

2. **auth.uid() emulation exists** (`01-auth-emulation.sql`)
   - Returns NULL when session variables not set
   - Only matters in INSERT triggers that overwrite fields
   - SELECT queries just return empty results (acceptable)

## Recommendations

### ✅ Already Implemented
1. Fixed `enforce_created_by_on_drawings()` trigger - now accepts provided values

### 🔵 Optional Future Improvements
1. **If moving to non-superuser connection:**
   - Set session variables in lib/db.ts query() function
   - Use `SET LOCAL` before each query:
     ```sql
     SET LOCAL app.current_user_id = 'user-id-here';
     ```

2. **Alternative: Disable RLS for local PostgreSQL**
   - Add to init scripts:
     ```sql
     ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
     -- etc for all tables
     ```

## Conclusion

✅ **Only ONE critical issue found and FIXED**
- The `enforce_created_by_on_drawings()` trigger has been corrected
- All other `auth.uid()` usage is safe in current architecture
- No additional changes needed for current setup

## Files Modified
- ✅ `docker/postgres/init/02.5-drawings.sql`
- ✅ `docker/postgres/migrations/fix-drawings-trigger.sql` (new)

## Testing Checklist
- [x] Drawing creation
- [ ] Drawing editing
- [ ] Form submission
- [ ] Photo upload
- [ ] Project creation
- [ ] User profile updates
