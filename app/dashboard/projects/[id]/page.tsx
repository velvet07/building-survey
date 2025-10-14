'use client';

/**
 * Project Dashboard Page
 * Központi oldal egy projekthez - modulok választása
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/types/project.types';
import ProjectPDFExportModal from '@/components/projects/ProjectPDFExportModal';

export default function ProjectDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
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
      href: `/dashboard/projects/${projectId}/forms/aquapol`,
      available: true,
    },
    {
      id: 'data',
      name: 'Adatok',
      description: 'Projekt adatok, mérések és paraméterek',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      color: 'indigo',
      href: '#',
      available: false,
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
      href: `/dashboard/projects/${projectId}/drawings`,
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
      href: '#',
      available: false,
    },
    {
      id: 'documents',
      name: 'Dokumentumok',
      description: 'Szerződések, engedélyek és egyéb dokumentumok',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: 'purple',
      href: '#',
      available: false,
    },
    {
      id: 'notes',
      name: 'Jegyzetek',
      description: 'Megfigyelések és megjegyzések',
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
      color: 'yellow',
      href: '#',
      available: false,
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                <p className="text-gray-600">
                  Azonosító: <span className="font-mono font-medium">{project.auto_identifier}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-2 border border-blue-200 rounded-lg text-blue-600 font-medium hover:bg-blue-50"
                >
                  📄 Modul PDF export
                </button>
                <button
                  onClick={() => router.push('/dashboard/projects')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
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
                <p className="text-2xl font-bold text-gray-900">-</p>
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
                <p className="text-lg font-bold text-gray-900">Aktív</p>
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