'use server';

/**
 * Server Actions for Projects
 *
 * Uses local MySQL/MariaDB database via lib/projects.ts
 */

import { revalidatePath } from 'next/cache';
import {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById
} from '@/lib/projects';

export async function createProjectAction(name: string) {
  const { data, error } = await createProject(name);

  if (!error) {
    revalidatePath('/dashboard/projects');
  }

  return { data, error };
}

export async function updateProjectAction(id: string, name: string) {
  const { data, error } = await updateProject(id, name);

  if (!error) {
    revalidatePath('/dashboard/projects');
  }

  return { data, error };
}

export async function deleteProjectAction(id: string) {
  const { data, error } = await deleteProject(id);

  if (!error) {
    revalidatePath('/dashboard/projects');
  }

  return { data, error };
}

export async function getProjectsAction() {
  return await getProjects();
}

export async function getProjectByIdAction(id: string) {
  return await getProjectById(id);
}