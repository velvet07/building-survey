'use client';

import { useState, useEffect, FormEvent } from 'react';
import { updateUserAction } from '@/app/actions/users';
import { User, UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '@/types/user.types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRole(user.role);
    }
  }, [user]);

  const validate = () => {
    if (!fullName.trim()) {
      setError('A teljes név kötelező');
      return false;
    }
    if (fullName.length < 3) {
      setError('A teljes névnek legalább 3 karakter hosszúnak kell lennie');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !validate()) return;

    setIsLoading(true);

    try {
      const { error: updateError } = await updateUserAction(user.id, fullName, role);

      if (updateError) {
        if (typeof updateError.message === 'string') {
          toast.error(`Hiba történt: ${updateError.message}`);
        } else {
          toast.error('Hiba történt a felhasználó frissítése során');
        }
      } else {
        toast.success('Felhasználó sikeresen frissítve!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Hiba történt a felhasználó frissítése során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Felhasználó szerkesztése"
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-secondary-600 mb-4 p-3 bg-secondary-50 rounded-lg">
          <p className="font-semibold mb-1">Email cím:</p>
          <p>{user.email}</p>
        </div>

        <Input
          label="Teljes név"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={error}
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
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
