'use client';

import { useState, useEffect } from 'react';
import { getProjectsAction } from '@/app/actions/projects';
import { Project } from '@/types/project.types';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface ProjectListProps {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCreate: () => void;
  searchQuery?: string;
}

export function ProjectList({ onEdit, onDelete, onCreate, searchQuery = '' }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const { data, error } = await getProjectsAction();

    if (error) {
      toast.error('Hiba történt a projektek betöltése során');
    } else {
      let filteredProjects = data || [];

      // Apply search filter
      if (searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        filteredProjects = filteredProjects.filter((project) => {
          const searchableText = `${project.name} ${project.auto_identifier}`.toLowerCase();
          // All search terms must match (AND logic)
          return searchTerms.every((term) => searchableText.includes(term));
        });
      }

      setProjects(filteredProjects);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    // Check if empty due to search
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon={
            <svg className="h-16 w-16 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Nincs találat"
          description={`Nem található projekt a keresési feltételnek megfelelően: "${searchQuery}"`}
        />
      );
    }

    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
        title="Még nincs egyetlen projekt sem"
        description="Kezdj neki az első projekt létrehozásával!"
        action={
          <Button onClick={onCreate}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Új projekt létrehozása
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}