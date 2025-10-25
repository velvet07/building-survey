'use client';

import { Project, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/types/project.types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const { canEdit, canDelete } = useUserRole();

  const handleOpenProject = () => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <Card padding="md" className="group hover:border-primary-300 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-600 transition-colors leading-tight mb-2">
          {project.name}
        </h3>

        <div className="flex gap-2 mb-3">
          <Badge variant="default" className="inline-block">{project.auto_identifier}</Badge>
          <Badge variant={PROJECT_STATUS_COLORS[project.status] as any} className="inline-block">
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </div>

        <div className="text-xs text-secondary-500 space-y-1 font-medium">
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Létrehozva: {formatDate(project.created_at)}
          </p>
          {project.updated_at !== project.created_at && (
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Frissítve: {formatDate(project.updated_at)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-secondary-200/80">
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenProject}
          className="flex-1 md:flex-none md:min-w-0"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Megnyitás
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(project)}
            className="flex-1 md:flex-none"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Szerkesztés
          </Button>
        )}
        {canDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(project)}
            className="flex-1 md:flex-none"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Törlés
          </Button>
        )}
      </div>
    </Card>
  );
}