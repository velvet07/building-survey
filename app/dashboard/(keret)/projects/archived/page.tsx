'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProjectList } from '@/components/projects/ProjectList';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { Project } from '@/types/project.types';
import { useRouter } from 'next/navigation';

export default function ArchivedProjectsPage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (project: Project) => {
    setIsDeleteModalOpen(false);
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setIsEditModalOpen(false);
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Archivált Projektek
          </h1>
          <p className="text-secondary-600">
            Archivált projektek megtekintése és kezelése
          </p>
        </div>

        <Button variant="secondary" onClick={() => router.push('/dashboard/projects')}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Vissza a projektekhez
        </Button>
      </div>

      <ProjectList
        key={refreshKey}
        onCreate={() => {}}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        project={selectedProject}
      />

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleSuccess}
        project={selectedProject}
      />
    </div>
  );
}
