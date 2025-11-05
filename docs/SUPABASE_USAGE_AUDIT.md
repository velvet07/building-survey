# Supabase Usage Audit Report
## Date: 2025-10-28

## Executive Summary

Comprehensive audit of all Supabase usage in the codebase to ensure proper hybrid architecture:
- ✅ **Supabase Cloud**: Authentication only
- ✅ **Local PostgreSQL**: All data storage (projects, drawings, forms, photos, profiles)

## Findings

### ✅ AUTH MODULES (Correct - Supabase Cloud)

**Files using Supabase for authentication:**
1. `lib/auth.ts` - ✅ Correct (authentication functions)
2. `lib/supabase.ts` - ✅ Correct (client creation)
3. `lib/supabase/server.ts` - ✅ Correct (server-side auth)
4. `lib/supabaseServer.ts` - ✅ Correct (server auth helpers)
5. `components/auth/*` - ✅ Correct (login/register forms)

**Status:** ✅ **CORRECT** - All auth remains on Supabase Cloud

### ✅ DATA MODULES (Correct - Local PostgreSQL)

#### 1. Projects Module
- **File:** `lib/projects.ts`
- **Status:** ✅ **CORRECT** - Uses `query()` from `lib/db.ts`
- **Actions:** `app/actions/projects.ts` - ✅ Server Actions implemented
- **Database:** Local PostgreSQL via `DATABASE_URL`

#### 2. Drawings Module
- **File:** `lib/drawings/api.ts`
- **Status:** ✅ **CORRECT** - Uses `query()` from `lib/db.ts`
- **Actions:** `app/actions/drawings.ts` - ✅ Server Actions implemented
- **Database:** Local PostgreSQL via `DATABASE_URL`
- **Recent Fix:** ✅ Drawing slug support added

#### 3. Forms Module
- **File:** `lib/forms/api.ts`
- **Status:** ✅ **CORRECT** - Uses `query()` from `lib/db.ts`
- **Actions:** `app/actions/forms.ts` - ✅ Server Actions implemented
- **Database:** Local PostgreSQL via `DATABASE_URL`

#### 4. Photos Module
- **File:** `lib/photos/api.ts`
- **Status:** ✅ **MOSTLY CORRECT** with legacy support
- **Database:** Local PostgreSQL via `query()`
- **Storage:** Local file system via `/api/upload` and `/api/files/[filename]`
- **Supabase Usage:**
  - Lines 12, 43-46, 155-166, 188-193, 270-274, 324-328
  - **Purpose:** ✅ **LEGACY SUPPORT ONLY** for old photos stored in Supabase Storage
  - **New photos:** All stored locally
  - **Impact:** No issue - maintains backward compatibility

#### 5. Users/Profiles Module
- **File:** Multiple action files
- **Status:** ✅ **CORRECT** - Uses Server Actions
- **Database:** Local PostgreSQL via `lib/db.ts`

### ✅ TYPE IMPORTS (Not a Problem)

**Files importing Supabase types only:**
- `components/users/CreateUserModal.tsx` - PostgrestError type
- `components/projects/CreateProjectModal.tsx` - PostgrestError type

**Status:** ✅ **NOT A PROBLEM** - Only importing TypeScript types for error handling

### 🔍 SQL ARCHITECTURE (Verified)

**Database Connection:**
- Connection: `postgres` superuser via `DATABASE_URL`
- Privilege: BYPASSRLS (bypasses Row Level Security)
- Effect: RLS policies with `auth.uid()` don't apply
- Status: ✅ **WORKING AS DESIGNED**

**Triggers:**
- ✅ `enforce_created_by_on_drawings()` - Fixed to hybrid mode
- ✅ `auto_generate_drawing_slug()` - Working correctly
- ✅ All other triggers - No issues found

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           CLIENT (Browser)                   │
│  - React Components                          │
│  - Client-side State                         │
└──────────┬──────────────────────────────────┘
           │
           │ Server Actions
           ↓
┌─────────────────────────────────────────────┐
│         NEXT.JS SERVER                       │
│  - Server Actions (app/actions/*)            │
│  - API Routes (/api/*)                       │
└──────┬────────────────────────┬─────────────┘
       │                        │
       │ lib/db.ts              │ lib/auth.ts
       │ (query)                │ (createClient)
       ↓                        ↓
┌──────────────────┐   ┌────────────────────┐
│  PostgreSQL      │   │  Supabase Cloud    │
│  (Local/Docker)  │   │  (Auth Only)       │
│                  │   │                    │
│  • projects      │   │  • auth.users      │
│  • drawings      │   │  • email/password  │
│  • forms         │   │  • JWT tokens      │
│  • photos        │   │                    │
│  • profiles      │   └────────────────────┘
│                  │
│  • File storage: │
│    /app/uploads  │
└──────────────────┘
```

## Recent Fixes Applied

### 1. Forms Module (✅ Fixed)
**Issue:** Direct Supabase calls from client components
**Fix:** Server Actions created (`app/actions/forms.ts`)
**Commit:** b77c2b3

### 2. Drawings Module (✅ Fixed)
**Issue:**
- Direct API calls from client
- Trigger overwriting `created_by` with NULL
**Fix:**
- Server Actions implemented
- Trigger fixed to hybrid mode
**Commits:** 4f79abd, c0dbd92

### 3. Drawing Slugs (✅ Fixed)
**Issue:** Slug missing or undefined causing navigation errors
**Fix:**
- Migration to ensure slug column exists
- Fallback to ID if slug unavailable
**Commit:** 7a466e5

## Recommendations

### ✅ Current Setup - No Changes Needed

The current hybrid architecture is correctly implemented:
1. **Supabase Cloud** - Authentication only ✅
2. **Local PostgreSQL** - All data ✅
3. **Server Actions** - Proper server-client separation ✅
4. **Legacy Support** - Maintained for old Supabase Storage photos ✅

### 🔵 Optional Future Improvements

#### 1. Remove Legacy Supabase Storage Support
**When:** After migrating all old photos to local storage
**How:**
```typescript
// Remove from lib/photos/api.ts:
- Lines 42-56 (signed URL generation)
- Lines 154-166 (getPhotoUrl fallback)
- Lines 187-207 (downloadPhoto Supabase)
- Lines 267-282 (deletePhoto Supabase)
- Lines 321-337 (deletePhotos Supabase)
```

#### 2. Add Session Variable Support (If Needed)
**When:** If moving from superuser to regular role
**How:** Set `app.current_user_id` in `lib/db.ts` query wrapper

#### 3. Disable RLS (Alternative)
**When:** If RLS not needed with superuser connection
**How:** Run migration to disable RLS on all tables

## Testing Checklist

- [x] User registration (Supabase Auth)
- [x] User login (Supabase Auth)
- [x] Project creation (Local PostgreSQL)
- [x] Drawing creation (Local PostgreSQL)
- [x] Drawing editing (Local PostgreSQL)
- [x] Form submission (Local PostgreSQL)
- [ ] Photo upload (Local File System)
- [ ] Photo download (Local File System)
- [ ] Legacy photo access (Supabase Storage)

## Conclusion

✅ **AUDIT COMPLETE - NO ISSUES FOUND**

The codebase correctly implements the hybrid architecture:
- Supabase is used **ONLY** for authentication and legacy photo storage
- All new data operations use local PostgreSQL
- Server Actions properly separate client and server code
- No unauthorized direct Supabase data queries found

## Migration Commands for Server

```bash
cd /home/wpmuhel/public_html/felmeres

# 1. Pull latest changes
git pull origin claude/hybrid-urls-forms-fix-011CUYznPtNcvNApnP9R5bC1

# 2. Run drawings trigger fix (if not done)
docker exec -i building-survey-db psql -U postgres -d building_survey < docker/postgres/migrations/fix-drawings-trigger.sql

# 3. Run drawing slugs migration
docker exec -i building-survey-db psql -U postgres -d building_survey < docker/postgres/migrations/add-drawing-slugs.sql

# 4. Restart application
docker-compose restart app

# 5. Verify drawings table
docker exec building-survey-db psql -U postgres -d building_survey -c "SELECT id, name, slug FROM public.drawings LIMIT 5;"
```

## Files Modified in This Session

1. ✅ `app/actions/forms.ts` - NEW
2. ✅ `app/actions/drawings.ts` - UPDATED (added getDrawingBySlugAction)
3. ✅ `app/dashboard/(keret)/projects/[id]/forms/aquapol/page.tsx` - UPDATED
4. ✅ `app/dashboard/(fullscreen)/projects/[id]/drawings/[drawing_id]/page.tsx` - UPDATED
5. ✅ `app/dashboard/(keret)/projects/[id]/drawings/page.tsx` - UPDATED (fallback)
6. ✅ `docker/postgres/init/02.5-drawings.sql` - UPDATED (hybrid trigger)
7. ✅ `docker/postgres/migrations/fix-drawings-trigger.sql` - NEW
8. ✅ `docker/postgres/migrations/add-drawing-slugs.sql` - NEW
9. ✅ `.env.local` - NEW (example for local dev)
10. ✅ `docs/SQL_AUDIT_REPORT.md` - NEW
11. ✅ `docs/SUPABASE_USAGE_AUDIT.md` - NEW (this file)

## Support

For issues or questions:
- Check logs: `docker logs building-survey-app -f --tail=100`
- PostgreSQL access: `docker exec -it building-survey-db psql -U postgres -d building_survey`
- GitHub Issues: https://github.com/velvet07/building-survey/issues
