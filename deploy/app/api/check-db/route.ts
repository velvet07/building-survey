import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth/local';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.userId || null;

    if (!userId) {
      return NextResponse.json({
        error: 'Not authenticated',
      }, { status: 401 });
    }

    // Check if profile exists
    const profileResult = await query(
      'SELECT * FROM profiles WHERE id = ?',
      [userId]
    );

    const profile = profileResult.rows[0] || null;

    // Try to create a test project
    let testProject = null;
    let createError = null;

    try {
      const projectId = crypto.randomUUID();
      await query(
        'INSERT INTO projects (id, name, owner_id) VALUES (?, ?, ?)',
        [projectId, `Debug Test Project ${Date.now()}`, userId]
      );

      const result = await query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );

      testProject = result.rows[0];

      // Clean up test project
      await query('DELETE FROM projects WHERE id = ?', [projectId]);
    } catch (error: any) {
      createError = {
        message: error.message,
        code: error.code,
      };
    }

    return NextResponse.json({
      user: {
        id: userId,
      },
      profile: profile,
      testProject: testProject,
      createError: createError,
      diagnosis: !profile
        ? 'HIBA: Nincs profile bejegyzés!'
        : !testProject && createError
        ? `HIBA: ${createError.code} - ${createError.message}`
        : testProject
        ? 'OK: Minden működik, projekt sikeresen létrehozva!'
        : 'OK',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}
