'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: '🏠',
  },
  {
    href: '/dashboard/projects',
    label: 'Projektek',
    icon: '📁',
  },
  {
    href: '/dashboard/users',
    label: 'Felhasználók',
    icon: '👥',
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();

  return (
    <aside className="w-40 bg-white border-r border-secondary-200 min-h-screen">
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          // Hide admin-only items for non-admin users
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-100'
              )}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}