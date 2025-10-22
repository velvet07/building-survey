import type { ReactNode } from 'react';

export default function DrawingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col bg-emerald-50/40" style={{ zIndex: 9999 }}>
      {children}
    </div>
  );
}
