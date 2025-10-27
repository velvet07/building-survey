import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Database Setup Check and Instructions
 * ======================================
 *
 * GET: Check if database is initialized
 * Returns status of all required tables
 */

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        initialized: false,
        error: 'Missing Supabase environment variables',
        message: 'Check .env file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      }, { status: 500 });
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if essential tables exist
    const checks = {
      profiles: false,
      projects: false,
      drawings: false,
      photos: false,
    };

    // Try to query each table
    for (const table of Object.keys(checks)) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        checks[table as keyof typeof checks] = !error;
      } catch (e) {
        checks[table as keyof typeof checks] = false;
      }
    }

    const allInitialized = Object.values(checks).every(v => v);

    if (!allInitialized) {
      const dashboardUrl = supabaseUrl.replace('https://', 'https://app.supabase.com/project/');
      const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

      return NextResponse.json({
        initialized: false,
        checks,
        message: 'Database not fully initialized - manual setup required',
        instructions: {
          step1: 'Go to Supabase Dashboard SQL Editor',
          step1_url: `https://app.supabase.com/project/${projectRef}/sql`,
          step2: 'Create a new query',
          step3: 'Copy the content from: supabase/deploy-all.sql',
          step4: 'Paste and Run',
          step5: 'Copy the content from: supabase/migrations/add-slugs-and-local-storage.sql',
          step6: 'Paste and Run again',
          step7: 'Refresh this page to verify',
        },
        sqlFiles: [
          'supabase/deploy-all.sql',
          'supabase/migrations/add-slugs-and-local-storage.sql',
        ],
      });
    }

    return NextResponse.json({
      initialized: true,
      checks,
      message: 'Database is fully initialized and ready!',
    });

  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}