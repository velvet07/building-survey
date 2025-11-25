'use client';

import { useState, FormEvent } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
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

  const isPostgrestError = (value: unknown): value is PostgrestError => {
    return Boolean(
      value &&
      typeof value === 'object' &&
      'code' in value &&
      typeof (value as Record<string, unknown>).code === 'string'
    );
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
        if (isPostgrestError(createError) && createError.code === '23505') {
          // Unique constraint violation
          toast.error('Már létezik projekt ezzel a névvel!');
        } else if ('message' in createError && typeof createError.message === 'string' && createError.message.includes('duplicate')) {
          toast.error('Már létezik projekt ezzel a névvel!');
        } else {
          const message = 'message' in createError && typeof createError.message === 'string'
            ? createError.message
            : 'Ismeretlen hiba';
          toast.error(`Hiba történt: ${message}`);
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