'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '@/types/project.types';
import { getProjectFormResponseAction } from '@/app/actions/forms';
import { aquapolFormDefinition } from '@/lib/forms/definitions/aquapol';
import { getDrawingsAction } from '@/app/actions/drawings';
import type { Drawing } from '@/lib/drawings/types';
import { exportProjectModulesToPDF } from '@/lib/projects/pdf-export';

type ModuleId = 'aquapol-form' | 'drawings';

interface ProjectPDFExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const moduleOptions: Array<{
  id: ModuleId;
  label: string;
  description: string;
}> = [
  {
    id: 'aquapol-form',
    label: 'Aquapol űrlap',
    description: 'A nedvességfelmérő űrlap kitöltött válaszai.',
  },
  {
    id: 'drawings',
    label: 'Rajz modul',
    description: 'Válaszd ki, mely rajzokat szeretnéd az exportba tenni.',
  },
];

export default function ProjectPDFExportModal({
  project,
  isOpen,
  onClose,
}: ProjectPDFExportModalProps) {
  const [selectedModules, setSelectedModules] = useState<Record<ModuleId, boolean>>({
    'aquapol-form': true,
    drawings: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDrawings, setAvailableDrawings] = useState<Drawing[]>([]);
  const [drawingsLoading, setDrawingsLoading] = useState(false);
  const [selectedDrawingIds, setSelectedDrawingIds] = useState<string[]>([]);
  const selectedModulesRef = useRef(selectedModules);

  useEffect(() => {
    selectedModulesRef.current = selectedModules;
  }, [selectedModules]);

  useEffect(() => {
    if (isOpen) {
      setSelectedModules({ 'aquapol-form': true, drawings: false });
      setSelectedDrawingIds([]);
      setError(null);
      void loadDrawings();
    }
  }, [isOpen]);

  const loadDrawings = async (): Promise<Drawing[] | undefined> => {
    try {
      setDrawingsLoading(true);
      const { data: drawings, error } = await getDrawingsAction(project.id);
      if (error) {
        throw error;
      }
      if (!drawings) {
        return undefined;
      }
      setAvailableDrawings(drawings);
      if (selectedModulesRef.current.drawings) {
        setSelectedDrawingIds(drawings.map((drawing) => drawing.id));
      }
      return drawings;
    } catch (err) {
      console.error('Rajzok betöltése az exporthoz sikertelen:', err);
      setError('Nem sikerült betölteni a rajzok listáját.');
      return undefined;
    } finally {
      setDrawingsLoading(false);
    }
  };

  const toggleModule = (moduleId: ModuleId) => {
    setSelectedModules((prev) => {
      const nextValue = !prev[moduleId];
      if (moduleId === 'drawings') {
        setSelectedDrawingIds(nextValue ? availableDrawings.map((drawing) => drawing.id) : []);
      }
      return {
        ...prev,
        [moduleId]: nextValue,
      };
    });
  };

  const toggleDrawing = (drawingId: string) => {
    setSelectedDrawingIds((prev) => {
      if (prev.includes(drawingId)) {
        return prev.filter((id) => id !== drawingId);
      }
      return [...prev, drawingId];
    });
  };

  const selectAllDrawings = () => {
    setSelectedDrawingIds(availableDrawings.map((drawing) => drawing.id));
  };

  const clearAllDrawings = () => {
    setSelectedDrawingIds([]);
  };

  const isModuleSelected = useMemo(
    () => (moduleId: ModuleId) => Boolean(selectedModules[moduleId]),
    [selectedModules]
  );

  const handleExport = async () => {
    const selectedModuleIds = (Object.keys(selectedModules) as Array<'aquapol-form' | 'drawings'>).filter(
      (moduleId) => selectedModules[moduleId]
    );

    if (selectedModuleIds.length === 0) {
      setError('Válassz ki legalább egy modult az exporthoz.');
      return;
    }

    if (selectedModules.drawings && selectedDrawingIds.length === 0) {
      setError('Válassz ki legalább egy rajzot az exporthoz.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const moduleSelections = selectedModuleIds.map((moduleId) =>
        moduleId === 'drawings'
          ? { id: moduleId, items: selectedDrawingIds }
          : { id: moduleId }
      );

      const payload: Parameters<typeof exportProjectModulesToPDF>[0] = {
        project,
        modules: moduleSelections,
      };

      if (selectedModules['aquapol-form']) {
        const { data: response, error } = await getProjectFormResponseAction(project.id, 'aquapol-form');
        if (error) {
          throw error;
        }
        payload.aquapol = {
          definition: aquapolFormDefinition,
          response: response || null,
        };
      }

      if (selectedModules.drawings) {
        let drawings = availableDrawings;
        if (!drawings.length) {
          const fresh = await loadDrawings();
          if (fresh) {
            drawings = fresh;
          }
        }
        payload.drawings = {
          data: drawings,
        };
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

  const renderDrawingSelection = () => {
    if (!isModuleSelected('drawings')) {
      return null;
    }

    if (drawingsLoading) {
      return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm text-gray-600">
          Rajzok betöltése...
        </div>
      );
    }

    if (availableDrawings.length === 0) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-700">
          Ehhez a projekthez még nem tartozik rajz.
        </div>
      );
    }

    const allSelected = selectedDrawingIds.length === availableDrawings.length;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            Kiválasztott rajzok: {selectedDrawingIds.length} / {availableDrawings.length}
          </span>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={selectAllDrawings}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={allSelected}
            >
              Összes kijelölése
            </button>
            <button
              onClick={clearAllDrawings}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100"
              type="button"
              disabled={selectedDrawingIds.length === 0}
            >
              Kijelölés törlése
            </button>
          </div>
        </div>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
          {availableDrawings.map((drawing) => {
            const checked = selectedDrawingIds.includes(drawing.id);
            return (
              <label
                key={drawing.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                  checked ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={checked}
                  onChange={() => toggleDrawing(drawing.id)}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{drawing.name}</p>
                  <p className="text-xs text-gray-600">
                    {drawing.paper_size.toUpperCase()} • {drawing.orientation === 'portrait' ? 'Álló' : 'Fekvő'} • {new Date(drawing.updated_at ?? drawing.created_at).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 sm:px-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Modulok PDF exportja</h2>
            <p className="text-sm text-gray-600 mt-1">
              Válaszd ki, hogy a projekt mely moduljainak adatait szeretnéd egyetlen PDF-be exportálni.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Export ablak bezárása"
          >
            ✕
          </button>
        </div>

        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Projekt: <span className="font-semibold">{project.name}</span> ({project.auto_identifier})
          </div>

          {moduleOptions.map((module) => (
            <label
              key={module.id}
              className={`block rounded-2xl border p-4 transition-colors sm:p-5 ${
                isModuleSelected(module.id)
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isModuleSelected(module.id)}
                    onChange={() => toggleModule(module.id)}
                  />
                  <div>
                    <p className="text-base font-semibold text-gray-900">{module.label}</p>
                    <p className="mt-1 text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>

                {module.id === 'drawings' && renderDrawingSelection()}
              </div>
            </label>
          ))}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white"
            disabled={isExporting}
          >
            Mégse
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
