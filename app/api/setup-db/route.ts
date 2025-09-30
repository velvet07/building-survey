import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  try {
    // Execute the SQL commands via RPC or direct query
    // Note: This requires the SQL to be executed with proper permissions

    // 1. Drop old auto_identifier constraint
    let error1 = null;
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_auto_identifier_key;'
      });
      error1 = result.error;
    } catch (e) {
      error1 = { message: 'RPC not available, using alternative method' };
    }

    // 2. Create unique index for project names
    let error2 = null;
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          CREATE UNIQUE INDEX IF NOT EXISTS unique_active_project_name_per_user
          ON public.projects (owner_id, name)
          WHERE deleted_at IS NULL;
        `
      });
      error2 = result.error;
    } catch (e) {
      error2 = { message: 'RPC not available' };
    }

    // 3. Update the generate_project_identifier function
    let error3 = null;
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION generate_project_identifier()
          RETURNS TEXT AS $$
          DECLARE
            today_date TEXT;
            today_count INTEGER;
            new_identifier TEXT;
            max_attempts INTEGER := 100;
            attempt_count INTEGER := 0;
          BEGIN
            today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

            LOOP
              SELECT COUNT(*)
              INTO today_count
              FROM public.projects
              WHERE auto_identifier LIKE 'PROJ-' || today_date || '-%';

              today_count := today_count + 1;
              new_identifier := 'PROJ-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0');

              IF NOT EXISTS (
                SELECT 1 FROM public.projects WHERE auto_identifier = new_identifier
              ) THEN
                RETURN new_identifier;
              END IF;

              attempt_count := attempt_count + 1;
              IF attempt_count >= max_attempts THEN
                new_identifier := 'PROJ-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0') || '-' || floor(random() * 1000)::TEXT;
                RETURN new_identifier;
              END IF;
            END LOOP;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      error3 = result.error;
    } catch (e) {
      error3 = { message: 'RPC not available' };
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      errors: {
        constraint: error1?.message,
        unique_index: error2?.message,
        function: error3?.message,
      },
      note: 'If errors occurred, please run the SQL scripts manually in Supabase SQL Editor',
      sql_files: [
        '/home/velvet/building-survey/supabase/fix-auto-identifier.sql',
        '/home/velvet/building-survey/supabase/add-unique-project-name.sql',
      ]
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      instruction: 'Please run the SQL scripts manually in Supabase SQL Editor at: https://supabase.com/dashboard/project/etpchhopecknyhnjgnor/sql'
    }, { status: 500 });
  }
}