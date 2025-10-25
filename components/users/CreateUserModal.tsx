'use client';

import { useState, FormEvent } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { createUserAction } from '@/app/actions/users';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '@/types/user.types';
import toast from 'react-hot-toast';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const isPostgrestError = (value: unknown): value is PostgrestError => {
    return Boolean(
      value &&
      typeof value === 'object' &&
      'code' in value &&
      typeof (value as Record<string, unknown>).code === 'string'
    );
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Érvénytelen email cím formátum';
    }

    if (!password) {
      newErrors.password = 'A jelszó kötelező';
    } else if (password.length < 8) {
      newErrors.password = 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
    }

    // Full name is optional, but if provided, it should be at least 3 characters
    if (fullName.trim() && fullName.length < 3) {
      newErrors.fullName = 'A teljes névnek legalább 3 karakter hosszúnak kell lennie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error: createError } = await createUserAction(email, password, fullName, role);

      if (createError) {
        console.error('Create error:', createError);

        // Handle specific error codes
        if (isPostgrestError(createError) && createError.code === '23505') {
          toast.error('Már létezik felhasználó ezzel az email címmel!');
        } else if ('message' in createError && typeof createError.message === 'string') {
          if (createError.message.includes('duplicate') || createError.message.includes('already exists')) {
            toast.error('Már létezik felhasználó ezzel az email címmel!');
          } else {
            toast.error(`Hiba történt: ${createError.message}`);
          }
        } else {
          toast.error('Hiba történt a felhasználó létrehozása során');
        }
      } else {
        toast.success('Felhasználó sikeresen létrehozva!');
        setEmail('');
        setPassword('');
        setFullName('');
        setRole('user');
        setErrors({});
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Hiba történt a felhasználó létrehozása során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('user');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Új felhasználó létrehozása"
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Teljes név (opcionális)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="Például: Kovács János"
          disabled={isLoading}
        />

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
          placeholder="Minimum 8 karakter"
          disabled={isLoading}
        />

        <div>
          <label className="block text-sm font-semibold text-secondary-700 mb-2">
            Jogosultság
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-secondary-50 disabled:cursor-not-allowed"
          >
            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-secondary-500">
            {USER_ROLE_DESCRIPTIONS[role]}
          </p>
        </div>
      </form>
    </Modal>
  );
}
