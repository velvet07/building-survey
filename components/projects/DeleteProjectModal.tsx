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
      const { data, error } = await deleteProject(project.id);

      if (error) {
        console.error('Delete error:', error);
        toast.error(`Hiba történt: ${error.message || 'Ismeretlen hiba'}`);
      } else {
        console.log('Delete success:', data);
        toast.success('Projekt sikeresen törölve!');
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