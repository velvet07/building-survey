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