import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/local';
import { getUserProfile } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Nincs aktív munkamenet' },
        { status: 401 }
      );
    }

    const profile = await getUserProfile(session.userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Felhasználói profil nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Hiba történt' },
      { status: 500 }
    );
  }
}

