import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-secondary-200/60 shadow-lg shadow-secondary-900/5 hover:shadow-xl hover:shadow-secondary-900/10 transition-shadow duration-200',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}