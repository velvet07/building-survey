import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const sanitizeEnv = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const runtimeSupabaseUrl =
  sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? sanitizeEnv(process.env.SUPABASE_URL);

const runtimeSupabaseAnonKey =
  sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
  sanitizeEnv(process.env.SUPABASE_ANON_KEY) ??
  sanitizeEnv(process.env.SUPABASE_KEY);

const supabaseRuntimeConfigScript = `window.__SUPABASE_RUNTIME_CONFIG__ = ${JSON.stringify({
  ...(runtimeSupabaseUrl ? { NEXT_PUBLIC_SUPABASE_URL: runtimeSupabaseUrl } : {}),
  ...(runtimeSupabaseAnonKey ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: runtimeSupabaseAnonKey } : {}),
})};`;

export const metadata: Metadata = {
  title: 'Épületfelmérő Rendszer',
  description: 'Moduláris épületfelmérő és dokumentációs rendszer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={inter.variable}>
        <Script
          id="supabase-runtime-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: supabaseRuntimeConfigScript }}
        />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}