'use client';

import { useState, FormEvent } from 'react';
// Error type for database errors
type DatabaseError = { code?: string; message: string; details?: string };
import { createProjectAction } from '@/app/actions/projects';
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

  const isDatabaseError = (value: unknown): value is DatabaseError => {
    if (!value || typeof value !== 'object') return false;
    const err = value as Record<string, unknown>;
    return 'code' in err && typeof err.code === 'string';
  };

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
      const { error: createError } = await createProjectAction(name);

      if (createError) {
        console.error('Create error:', createError);

        // Handle specific error codes
        const errorMessage = createError instanceof Error ? createError.message : String(createError);
        if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorMessage.includes('23505')) {
          toast.error('Már létezik projekt ezzel a névvel!');
        } else {
          toast.error(`Hiba történt: ${errorMessage}`);
        }
      } else {
        toast.success('Projekt sikeresen létrehozva!');
        setName('');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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