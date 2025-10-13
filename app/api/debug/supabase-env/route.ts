import { NextResponse } from 'next/server';

const mask = (value?: string) => {
  if (!value) return null;
  const visible = value.slice(0, 6);
  return `${visible}… (${value.length} chars)`;
};

export async function GET() {
  const nextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nextPublicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const urlSource = nextPublicUrl
    ? process.env.NEXT_PUBLIC_SUPABASE_URL === process.env.SUPABASE_URL
      ? 'SUPABASE_URL'
      : 'NEXT_PUBLIC_SUPABASE_URL'
    : null;

  let keySource: string | null = null;
  if (nextPublicAnonKey) {
    if (nextPublicAnonKey === process.env.SUPABASE_ANON_KEY) {
      keySource = 'SUPABASE_ANON_KEY';
    } else if (nextPublicAnonKey === process.env.SUPABASE_KEY) {
      keySource = 'SUPABASE_KEY';
    } else {
      keySource = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
    }
  }

  return NextResponse.json({
    hasUrl: Boolean(nextPublicUrl),
    hasAnonKey: Boolean(nextPublicAnonKey),
    urlSource,
    keySource,
    urlPreview: mask(nextPublicUrl),
    anonKeyPreview: mask(nextPublicAnonKey),
  });
}
