'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Project } from '@/types/project.types';
import { getProjectFormResponse } from '@/lib/forms/api';
import { aquapolFormDefinition } from '@/lib/forms/definitions/aquapol';
import { getDrawings } from '@/lib/drawings/api';
import { exportProjectModulesToPDF } from '@/lib/projects/pdf-export';

interface ProjectPDFExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const moduleOptions = [
  {
    id: 'aquapol-form',
    label: 'Aquapol űrlap',
    description: 'A nedvességfelmérő űrlap kitöltött válaszai.',
  },
  {
    id: 'drawings',
    label: 'Rajz modul',
    description: 'A projektben található rajzok összefoglalója és előnézete.',
  },
];

export default function ProjectPDFExportModal({
  project,
  isOpen,
  onClose,
}: ProjectPDFExportModalProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>(['aquapol-form']);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedModules(['aquapol-form']);
      setError(null);
    }
  }, [isOpen]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isModuleSelected = useMemo(
    () => (moduleId: string) => selectedModules.includes(moduleId),
    [selectedModules]
  );

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      setError('Válassz ki legalább egy modult az exporthoz.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const payload: Parameters<typeof exportProjectModulesToPDF>[0] = {
        project,
        modules: selectedModules,
      };

      if (selectedModules.includes('aquapol-form')) {
        const response = await getProjectFormResponse(project.id, 'aquapol-form');
        payload.aquapol = {
          definition: aquapolFormDefinition,
          response,
        };
      }

      if (selectedModules.includes('drawings')) {
        const drawings = await getDrawings(project.id);
        payload.drawings = drawings;
      }

      exportProjectModulesToPDF(payload);
      onClose();
    } catch (err) {
      console.error('Project PDF export failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Az exportálás közben hiba történt. Próbáld meg újra.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-gray-200">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Modulok PDF exportja</h2>
            <p className="text-sm text-gray-600 mt-1">
              Válaszd ki, hogy a projekt mely moduljainak adatait szeretnéd egyetlen PDF-be exportálni.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Export ablak bezárása"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm">
            Projekt: <span className="font-semibold">{project.name}</span> ({project.auto_identifier})
          </div>

          {moduleOptions.map((module) => (
            <label
              key={module.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                isModuleSelected(module.id)
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isModuleSelected(module.id)}
                onChange={() => toggleModule(module.id)}
              />
              <div>
                <p className="text-base font-semibold text-gray-900">{module.label}</p>
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
              </div>
            </label>
          ))}

          {error && (
            <div className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white"
            disabled={isExporting}
          >
            Mégse
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportálás...
              </>
            ) : (
              <>
                <span role="img" aria-hidden="true">📄</span>
                PDF export indítása
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
