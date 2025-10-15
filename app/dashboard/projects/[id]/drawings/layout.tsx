import type { ReactNode } from 'react';

export default function DrawingsLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-emerald-50">{children}</div>;
}
