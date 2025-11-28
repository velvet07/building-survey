import { NextRequest, NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/auth/local';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó megadása kötelező' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ez az email cím már regisztrálva van' },
        { status: 409 }
      );
    }

    // Create user
    const userId = await createUser(email, password, fullName);

    // Create session
    await createSession(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        full_name: fullName || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Regisztrációs hiba történt' },
      { status: 500 }
    );
  }
}

