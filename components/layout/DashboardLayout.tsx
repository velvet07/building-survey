"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isDrawingEditor = Boolean(
    pathname?.match(/^\/dashboard\/projects\/[^/]+\/drawings\/[^/]+/)
  );

  if (isDrawingEditor) {
    return <div className="min-h-screen bg-emerald-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}