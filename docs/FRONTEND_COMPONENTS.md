# Frontend Komponensek - FÁZIS 2

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** Frontend Engineer

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza az összes React komponens implementációs útmutatóját és kódját a FÁZIS 2-höz.

---

## 🎨 UI Komponensek

### 1. Button Komponens

**Fájl:** `components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
      secondary: 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300 active:bg-secondary-400',
      danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
      ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

### 2. Input Komponens

**Fájl:** `components/ui/Input.tsx`

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm text-secondary-900 placeholder-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-secondary-100 disabled:cursor-not-allowed',
            error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-secondary-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### 3. Modal Komponens

**Fájl:** `components/ui/Modal.tsx`

```typescript
'use client';

import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Badge Komponens

**Fájl:** `components/ui/Badge.tsx`

```typescript
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    error: 'bg-error-100 text-error-800',
    warning: 'bg-warning-100 text-warning-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

### 5. Card Komponens

**Fájl:** `components/ui/Card.tsx`

```typescript
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
        'bg-white rounded-lg border border-secondary-200 shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

### 6. LoadingSpinner Komponens

**Fájl:** `components/ui/LoadingSpinner.tsx`

```typescript
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn('animate-spin text-primary-500', sizes[size], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}
```

---

### 7. EmptyState Komponens

**Fájl:** `components/ui/EmptyState.tsx`

```typescript
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="flex justify-center mb-4 text-secondary-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-600 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
```

---

## 🔐 Auth Komponensek

### 8. LoginForm Komponens

**Fájl:** `components/auth/LoginForm.tsx`

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }

    if (!password) {
      newErrors.password = 'A jelszó megadása kötelező';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error('Hibás email cím vagy jelszó');
      } else {
        toast.success('Sikeres bejelentkezés!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      toast.error('Hiba történt a bejelentkezés során');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email cím"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="pelda@email.com"
        disabled={isLoading}
      />

      <Input
        label="Jelszó"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Bejelentkezés
      </Button>
    </form>
  );
}
```

---

### 9. RegisterForm Komponens

**Fájl:** `components/auth/RegisterForm.tsx`

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }

    if (!password) {
      newErrors.password = 'A jelszó megadása kötelező';
    } else if (password.length < 8) {
      newErrors.password = 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'A jelszó megerősítése kötelező';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ez az email cím már regisztrálva van');
        } else {
          toast.error('Hiba történt a regisztráció során');
        }
      } else {
        toast.success('Regisztráció sikeres! Ellenőrizd az email fiókodat a megerősítéshez.');
        router.push('/login');
      }
    } catch (err) {
      toast.error('Hiba történt a regisztráció során');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email cím"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="pelda@email.com"
        disabled={isLoading}
      />

      <Input
        label="Jelszó"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        helperText="Legalább 8 karakter"
        disabled={isLoading}
      />

      <Input
        label="Jelszó megerősítése"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Regisztráció
      </Button>
    </form>
  );
}
```

---

## 📐 Layout Komponensek

### 10. Header Komponens

**Fájl:** `components/layout/Header.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { user } = await getCurrentUser();
      setUserEmail(user?.email || null);
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Hiba történt a kijelentkezés során');
    } else {
      toast.success('Sikeres kijelentkezés');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-secondary-900">
            Épületfelmérő Rendszer
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-secondary-600">{userEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
          >
            Kijelentkezés
          </Button>
        </div>
      </div>
    </header>
  );
}
```

---

### 11. Sidebar Komponens

**Fájl:** `components/layout/Sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/projects',
    label: 'Projektek',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-secondary-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-100'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

### 12. DashboardLayout Komponens

**Fájl:** `components/layout/DashboardLayout.tsx`

```typescript
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 📊 Project Komponensek

### 13. ProjectCard Komponens

**Fájl:** `components/projects/ProjectCard.tsx`

```typescript
import { Project } from '@/types/project.types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">
            {project.name}
          </h3>
          <Badge variant="default">{project.auto_identifier}</Badge>
        </div>
      </div>

      <div className="text-sm text-secondary-600 mb-4">
        <p>Létrehozva: {formatDate(project.created_at)}</p>
        <p>Frissítve: {formatDate(project.updated_at)}</p>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(project)}
        >
          Szerkesztés
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(project)}
        >
          Törlés
        </Button>
      </div>
    </Card>
  );
}
```

---

### 14. ProjectList Komponens

**Fájl:** `components/projects/ProjectList.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getProjects } from '@/lib/projects';
import { Project } from '@/types/project.types';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface ProjectListProps {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCreate: () => void;
}

export function ProjectList({ onEdit, onDelete, onCreate }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const { data, error } = await getProjects();

    if (error) {
      toast.error('Hiba történt a projektek betöltése során');
    } else {
      setProjects(data || []);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
        title="Még nincs egyetlen projekt sem"
        description="Kezdj neki az első projekt létrehozásával!"
        action={
          <Button onClick={onCreate}>
            Új projekt létrehozása
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

---

### 15. CreateProjectModal Komponens

**Fájl:** `components/projects/CreateProjectModal.tsx`

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { createProject } from '@/lib/projects';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) {
      setError('A projekt neve kötelező');
      return false;
    }
    if (name.length < 3) {
      setError('A projekt nevének legalább 3 karakter hosszúnak kell lennie');
      return false;
    }
    if (name.length > 100) {
      setError('A projekt neve maximum 100 karakter hosszú lehet');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error: createError } = await createProject(name);

      if (createError) {
        toast.error('Hiba történt a projekt létrehozása során');
      } else {
        toast.success('Projekt sikeresen létrehozva!');
        setName('');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Hiba történt a projekt létrehozása során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Új projekt létrehozása"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Mégse
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Létrehozás
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Projekt neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          placeholder="Például: Budapest Főváros 1. kerület"
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
}
```

---

### 16. EditProjectModal Komponens

**Fájl:** `components/projects/EditProjectModal.tsx`

```typescript
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { updateProject } from '@/lib/projects';
import { Project } from '@/types/project.types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
    }
  }, [project]);

  const validate = () => {
    if (!name.trim()) {
      setError('A projekt neve kötelező');
      return false;
    }
    if (name.length < 3) {
      setError('A projekt nevének legalább 3 karakter hosszúnak kell lennie');
      return false;
    }
    if (name.length > 100) {
      setError('A projekt neve maximum 100 karakter hosszú lehet');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!project || !validate()) return;

    setIsLoading(true);

    try {
      const { error: updateError } = await updateProject(project.id, name);

      if (updateError) {
        toast.error('Hiba történt a projekt frissítése során');
      } else {
        toast.success('Projekt sikeresen frissítve!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Hiba történt a projekt frissítése során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Projekt szerkesztése"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Mégse
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Mentés
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Projekt neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          disabled={isLoading}
        />
        <div className="mt-4 text-sm text-secondary-600">
          <p>Azonosító: {project.auto_identifier}</p>
        </div>
      </form>
    </Modal>
  );
}
```

---

### 17. DeleteProjectModal Komponens

**Fájl:** `components/projects/DeleteProjectModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { deleteProject } from '@/lib/projects';
import { Project } from '@/types/project.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

export function DeleteProjectModal({ isOpen, onClose, onSuccess, project }: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setIsLoading(true);

    try {
      const { error } = await deleteProject(project.id);

      if (error) {
        toast.error('Hiba történt a projekt törlése során');
      } else {
        toast.success('Projekt sikeresen törölve!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Hiba történt a projekt törlése során');
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Projekt törlése"
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Mégse
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Törlés
          </Button>
        </div>
      }
    >
      <p className="text-secondary-700">
        Biztosan törölni szeretnéd a(z) <strong>{project.name}</strong> ({project.auto_identifier}) nevű projektet?
      </p>
      <p className="text-sm text-secondary-600 mt-4">
        Ez a művelet visszavonható, a projekt soft delete-tel kerül törlésre.
      </p>
    </Modal>
  );
}
```

---

## 📝 Következő Lépések

Miután ezek a komponensek létrejöttek, a következő feladatok várnak:

1. **Oldalak létrehozása** (`app/` könyvtár)
2. **Root Layout konfiguráció**
3. **Toast Provider beállítása**
4. **TypeScript types exportálása**
5. **Development server indítás**
6. **Manuális UI tesztelés**

**Részletes oldalak útmutató:** `docs/FRONTEND_PAGES.md`

---

**Komponensek státusz:** ✅ Dokumentálva (Implementáció pending)