import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-secondary-100 text-secondary-700 ring-1 ring-inset ring-secondary-700/10',
    success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-600/20',
    error: 'bg-error-50 text-error-700 ring-1 ring-inset ring-error-600/20',
    warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-600/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}