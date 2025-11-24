import { NextResponse } from 'next/server';
import { query, getCurrentUserId } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user',
      });
    }

    // Get user profile
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
        [projectId, `Test Project ${Date.now()}`, userId]
      );

      const result = await query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );

      testProject = result.rows[0];

      // Clean up
      await query('DELETE FROM projects WHERE id = ?', [projectId]);
    } catch (error: any) {
      createError = error.message;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
      },
      profile,
      testProject,
      createError,
    });
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: error.message || 'Unknown error',
    });
  }
}
