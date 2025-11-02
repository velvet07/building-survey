'use client';

/**
 * Project Dashboard Page
 * Központi oldal egy projekthez - modulok választása
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Project, ProjectStatus } from '@/types/project.types';
import { PROJECT_STATUS_LABELS } from '@/types/project.types';
import { getDrawings } from '@/lib/drawings/api';
import { updateProject } from '@/lib/projects';
import ProjectPDFExportModal from '@/components/projects/ProjectPDFExportModal';
import { useUserRole } from '@/hooks/useUserRole';
import toast from 'react-hot-toast';

// Helper to check if string is UUID format
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function ProjectDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const projectIdentifier = params.id as string; // Can be UUID or auto_identifier
  const { canEdit } = useUserRole();

  const [project, setProject] = useState<Project | null>(null);
  const [drawingsCount, setDrawingsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectIdentifier]);

  useEffect(() => {
    if (project) {
      loadDrawingsCount();
    }
  }, [project]);

  const loadProject = async () => {
    try {
      const supabase = createClient();

      // Determine if identifier is UUID or auto_identifier
      const isUUIDFormat = isUUID(projectIdentifier);
      const column = isUUIDFormat ? 'id' : 'auto_identifier';

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq(column, projectIdentifier)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/dashboard/projects'); // Redirect if not found
    } finally {
      setLoading(false);
    }
  };

  const loadDrawingsCount = async () => {
    if (!project) return;

    try {
      const drawings = await getDrawings(project.id);
      setDrawingsCount(drawings.length);
    } catch (error) {
      console.error('Error loading drawings count:', error);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;

    setIsUpdatingStatus(true);
    try {
      const { error } = await updateProject(project.id, project.name, newStatus);
      if (error) {
        toast.error('Hiba történt a státusz frissítése során');
      } else {
        toast.success('Projekt státusz sikeresen frissítve!');
        setProject({ ...project, status: newStatus });
      }
    } catch (err) {
      toast.error('Hiba történt a státusz frissítése során');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Projekt betöltése...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projekt nem található</h2>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Vissza a projektekhez
          </button>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'aquapol-form',
      name: 'Aquapol űrlap',
      description: 'Nedvességfelmérő kérdőív és telepítési adatok rögzítése',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 8h6M9 12h6M9 16h3"
          />
        </svg>
      ),
      color: 'emerald',
      href: `/dashboard/projects/${projectIdentifier}/forms/aquapol`,
      available: true,
    },
    {
      id: 'drawings',
      name: 'Rajzok',
      description: 'Alaprajzok, vázlatok és technikai rajzok készítése',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      color: 'blue',
      href: `/dashboard/projects/${projectIdentifier}/drawings`,
      available: true,
    },
    {
      id: 'photos',
      name: 'Fotók',
      description: 'Helyszíni fotók és dokumentáció',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: 'green',
      href: `/dashboard/projects/${projectIdentifier}/photos`,
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-gray-600 hover:text-gray-900 font-medium mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Vissza a projektekhez
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{project.name}</h1>
                <p className="text-gray-600">
                  Azonosító:{' '}
                  <span className="font-mono text-sm font-medium sm:text-base">{project.auto_identifier}</span>
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Státusz:</label>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                    disabled={isUpdatingStatus || !canEdit}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {!canEdit && (
                    <span className="text-xs text-gray-500 italic">(csak olvasható)</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <span aria-hidden className="text-lg">📄</span>
                  Modul PDF export
                </button>
                <button
                  onClick={() => router.push('/dashboard/projects')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Modulok</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => module.available && router.push(module.href)}
                disabled={!module.available}
                className={`
                  bg-white rounded-lg shadow-sm border-2 p-6 text-left transition-all
                  ${
                    module.available
                      ? `border-${module.color}-200 hover:border-${module.color}-400 hover:shadow-md cursor-pointer`
                      : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div
                  className={`
                  inline-flex p-3 rounded-lg mb-4
                  ${module.available ? `bg-${module.color}-50 text-${module.color}-600` : 'bg-gray-100 text-gray-400'}
                `}
                >
                  {module.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                {module.available ? (
                  <div className={`text-sm font-medium text-${module.color}-600 flex items-center gap-2`}>
                    Megnyitás
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-400">Hamarosan elérhető</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats (Optional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rajzok száma</p>
                <p className="text-2xl font-bold text-gray-900">{drawingsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Státusz</p>
                <p className="text-lg font-bold text-gray-900">
                  {project ? PROJECT_STATUS_LABELS[project.status] : 'Aktív'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Létrehozva</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.created_at).toLocaleDateString('hu-HU')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {project && (
        <ProjectPDFExportModal
          project={project}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}