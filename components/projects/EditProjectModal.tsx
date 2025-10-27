'use client';

import { useState, useEffect, FormEvent } from 'react';
import { updateProjectAction } from '@/app/actions/projects';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '@/types/project.types';
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
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setStatus(project.status);
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
      const { error: updateError } = await updateProjectAction(project.id, name);

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Projekt neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          disabled={isLoading}
        />

        <div>
          <label className="block text-sm font-semibold text-secondary-700 mb-2">
            Státusz
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-secondary-600">
          <p>Azonosító: {project.auto_identifier}</p>
        </div>
      </form>
    </Modal>
  );
}