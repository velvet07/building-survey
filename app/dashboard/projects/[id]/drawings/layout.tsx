import type { ReactNode } from 'react';

export default function DrawingsLayout({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-[80] flex flex-col bg-emerald-50/40">{children}</div>;
}
