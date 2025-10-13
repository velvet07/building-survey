import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { getSupabaseServerConfig } from '@/lib/supabaseConfig';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const supabaseConfig = getSupabaseServerConfig();
const serializedSupabaseConfig = JSON.stringify(supabaseConfig).replace(/</g, '\\u003c');

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
        <Script id="supabase-config" strategy="beforeInteractive">
          {`window.__SUPABASE_CONFIG__ = ${serializedSupabaseConfig};`}
        </Script>
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