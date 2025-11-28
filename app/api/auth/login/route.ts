import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, createSession, updateLastLogin } from '@/lib/auth/local';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó megadása kötelező' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id);
    await updateLastLogin(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bejelentkezési hiba történt' },
      { status: 500 }
    );
  }
}

