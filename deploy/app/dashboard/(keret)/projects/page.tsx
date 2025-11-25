'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { Project } from '@/types/project.types';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';

export default function ProjectsPage() {
  const { canCreate, canEdit, canDelete } = useUserRole();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

        {canCreate && (
          <Button onClick={handleCreate}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Új projekt
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés projekt név vagy azonosító alapján..."
            className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <ProjectList
        key={`${refreshKey}-${searchQuery}`}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchQuery={searchQuery}
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