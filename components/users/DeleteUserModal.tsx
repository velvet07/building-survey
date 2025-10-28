'use client';

import { useState } from 'react';
import { deleteUserAction } from '@/app/actions/users';
import { User } from '@/types/user.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await deleteUserAction(user.id);

      if (error) {
        console.error('Delete error:', error);
        if (typeof error.message === 'string') {
          toast.error(`Hiba történt: ${error.message}`);
        } else {
          toast.error('Hiba történt a felhasználó törlése során');
        }
      } else {
        console.log('Delete success:', data);
        toast.success('Felhasználó sikeresen törölve!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Delete exception:', err);
      toast.error(`Hiba történt: ${err instanceof Error ? err.message : 'Ismeretlen hiba'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Felhasználó törlése"
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
        Biztosan törölni szeretnéd <strong>{user.full_name || user.email}</strong> nevű felhasználót?
      </p>
      <p className="text-sm text-secondary-600 mt-2">
        Email: {user.email}
      </p>
      <p className="text-sm text-danger-700 mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
        <strong>⚠️ Figyelem:</strong> Ez a művelet nem visszavonható! A felhasználó véglegesen törlődik mind a Supabase-ből, mind a helyi adatbázisból.
      </p>
    </Modal>
  );
}
