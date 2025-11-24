import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/local';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Kijelentkezési hiba történt' },
      { status: 500 }
    );
  }
}

