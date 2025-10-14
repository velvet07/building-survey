import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

export default function DrawingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
    </div>
  );
}
