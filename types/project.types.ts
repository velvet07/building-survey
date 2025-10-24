export type ProjectStatus = 'active' | 'completed' | 'archived' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  auto_identifier: string;
  owner_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Aktív',
  completed: 'Befejezett',
  archived: 'Archivált',
  on_hold: 'Függőben',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'success',
  completed: 'primary',
  archived: 'secondary',
  on_hold: 'warning',
};