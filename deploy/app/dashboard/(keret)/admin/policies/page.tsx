'use client';

import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';

const POLICY_UPDATE_SQL = `-- =============================================================================
-- Update RLS Policies to Allow Viewer Role to View All Projects
-- =============================================================================

-- 1. PROJECTS TABLE - ADD VIEWER SELECT POLICY
DROP POLICY IF EXISTS "Users can view all non-deleted projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view own non-deleted projects" ON public.projects;
CREATE POLICY "Users can view own non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "Viewers can view all non-deleted projects" ON public.projects;
CREATE POLICY "Viewers can view all non-deleted projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  AND deleted_at IS NULL
);

-- 2. DRAWINGS TABLE - ADD VIEWER SELECT POLICY
DROP POLICY IF EXISTS drawings_select_policy ON public.drawings;

CREATE POLICY drawings_select_policy
ON public.drawings
FOR SELECT
USING (
  (
    EXISTS (
      SELECT 1
      FROM public.projects
      WHERE public.projects.id = public.drawings.project_id
        AND public.projects.owner_id = auth.uid()
        AND public.drawings.deleted_at IS NULL
    )
  )
  OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
    AND deleted_at IS NULL
  )
  OR
  (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = auth.uid()
        AND public.profiles.role = 'admin'
    )
  )
);

-- 3. FORM RESPONSES TABLE - ADD VIEWER SELECT POLICY
DROP POLICY IF EXISTS "All users can view form responses" ON public.project_form_responses;

DROP POLICY IF EXISTS "Project owners can view own form responses" ON public.project_form_responses;
CREATE POLICY "Project owners can view own form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.owner_id = auth.uid()
      AND public.projects.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Viewers can view all form responses" ON public.project_form_responses;
CREATE POLICY "Viewers can view all form responses"
ON public.project_form_responses
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer'
  AND EXISTS (
    SELECT 1
    FROM public.projects
    WHERE public.projects.id = public.project_form_responses.project_id
      AND public.projects.deleted_at IS NULL
  )
);`;

export default function AdminPoliciesPage() {
  const { isAdmin, isLoading } = useUserRole();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(POLICY_UPDATE_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hozzáférés megtagadva</h2>
          <p className="text-gray-600 mb-4">Ez az oldal csak admin felhasználók számára elérhető.</p>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Vissza a projektekhez
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Vissza
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RLS Policy Frissítések</h1>
            <p className="text-gray-600">
              Futtasd le ezt az SQL scriptet a Supabase Dashboard-on, hogy a viewer felhasználók lássák az összes projektet.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Lépések:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Kattints a "Másolás" gombra az alábbi SQL kód másolásához</li>
              <li>Nyisd meg a Supabase Dashboard-ot → SQL Editor menüpontot</li>
              <li>Kattints a "New Query" gombra</li>
              <li>Illeszd be a másolt SQL kódot</li>
              <li>Kattints a "Run" gombra (vagy Ctrl+Enter / Cmd+Enter)</li>
              <li>Ellenőrizd, hogy sikeresen lefutott-e (nincs hibaüzenet)</li>
            </ol>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Mit csinál ez a frissítés?</h3>
            <div className="text-yellow-800 text-sm space-y-2">
              <p><strong>Változások:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>VIEWER</strong> látja az ÖSSZES projektet, rajzot és űrlap választ</li>
                <li><strong>USER</strong> továbbra is CSAK saját projektjeit látja (nem változik)</li>
                <li><strong>ADMIN</strong> továbbra is mindent lát és szerkeszt (nem változik)</li>
              </ul>
              <p className="mt-3"><strong>Biztonság (nem változik):</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>User létrehozni, szerkeszteni, törölni továbbra is csak a saját projektjeit tudja</li>
                <li>Viewer továbbra is NEM tud létrehozni, szerkeszteni vagy törölni semmit</li>
                <li>Admin továbbra is mindent tud létrehozni, szerkeszteni és törölni</li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">SQL Script:</label>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <svg
                      className="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Másolva!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Másolás
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
              {POLICY_UPDATE_SQL}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Ellenőrzés a futtatás után:</h3>
            <p className="text-gray-700 text-sm mb-3">
              Miután lefuttattad a scriptet, futtasd le ezt a query-t is, hogy ellenőrizd a policy-kat:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
{`-- Check all policies on projects table
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Check all policies on drawings table
SELECT * FROM pg_policies WHERE tablename = 'drawings';

-- Check all policies on project_form_responses table
SELECT * FROM pg_policies WHERE tablename = 'project_form_responses';`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
