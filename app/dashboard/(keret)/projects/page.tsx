'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { Project } from '@/types/project.types';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    // Close all other modals first
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    // Close all other modals first
    setIsCreateModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    // Close all other modals first
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    // Close all modals
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
    // Refresh list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Projektek
          </h1>
          <p className="text-secondary-600">
            Kezelje projektjeit és felméréseit
          </p>
        </div>

        <Button onClick={handleCreate}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új projekt
        </Button>
      </div>

      <ProjectList
        key={refreshKey}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
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