'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicForm from '@/components/forms/DynamicForm';
import { aquapolFormDefinition } from '@/lib/forms/definitions/aquapol';
import {
  getProjectFormResponse,
  saveProjectFormResponse,
} from '@/lib/forms/api';
import { exportFormToPDF } from '@/lib/forms/pdf-export';
import type { FormValues } from '@/lib/forms/types';
import type { Project } from '@/types/project.types';
import { createClient } from '@/lib/supabase';
import { useUserRole } from '@/hooks/useUserRole';

const FORM_SLUG = 'aquapol-form';

function createInitialValues(): FormValues {
  const initial: FormValues = {};

  aquapolFormDefinition.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        initial[field.id] = false;
      } else {
        initial[field.id] = '';
      }
    });
  });

  return initial;
}

export default function AquapolFormPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { canEdit, isViewer } = useUserRole();

  const [project, setProject] = useState<Project | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(() => createInitialValues());
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingForm, setLoadingForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const isLoading = loadingProject || loadingForm;

  const resetStatus = useCallback(() => {
    setStatusMessage(null);
    setStatusType(null);
  }, []);

  const loadProject = useCallback(async () => {
    setLoadingProject(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      setProject(data as Project);
    } catch (error) {
      console.error('Error loading project:', error);
      setStatusMessage('Nem sikerült betölteni a projektet.');
      setStatusType('error');
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  const loadForm = useCallback(async () => {
    setLoadingForm(true);

    try {
      const response = await getProjectFormResponse(projectId, FORM_SLUG);
      if (response) {
        setFormValues({
          ...createInitialValues(),
          ...response.data,
        });
        setLastSavedAt(response.updated_at);
      } else {
        setFormValues(createInitialValues());
        setLastSavedAt(null);
      }
    } catch (error) {
      console.error('Error loading Aquapol form:', error);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Nem sikerült betölteni az űrlapot.'
      );
      setStatusType('error');
    } finally {
      setLoadingForm(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
    void loadForm();
  }, [loadProject, loadForm]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: string | number | boolean) => {
      setFormValues((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
      resetStatus();
    },
    [resetStatus]
  );

  const handleSave = useCallback(async () => {
    // Viewer cannot save
    if (!canEdit) {
      setStatusMessage('Nincs jogosultságod a mentéshez.');
      setStatusType('error');
      return;
    }

    setSaving(true);
    resetStatus();

    try {
      const response = await saveProjectFormResponse(projectId, FORM_SLUG, formValues);
      setLastSavedAt(response.updated_at);
      setStatusMessage('Űrlap sikeresen mentve.');
      setStatusType('success');
    } catch (error) {
      console.error('Error saving Aquapol form:', error);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Nem sikerült menteni az űrlapot.'
      );
      setStatusType('error');
    } finally {
      setSaving(false);
    }
  }, [canEdit, formValues, projectId, resetStatus]);

  const handleExport = useCallback(() => {
    if (!project) return;

    try {
      setExporting(true);
      exportFormToPDF(aquapolFormDefinition, formValues);
      setStatusMessage('PDF export sikeresen elindítva.');
      setStatusType('success');
    } catch (error) {
      console.error('Error exporting Aquapol form PDF:', error);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Nem sikerült elkészíteni a PDF exportot.'
      );
      setStatusType('error');
    } finally {
      setExporting(false);
    }
  }, [formValues, project]);

  const saveButtonContent = saving ? (
    <>
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Mentés folyamatban...
    </>
  ) : (
    <>
      <span role="img" aria-hidden="true">
        💾
      </span>
      Mentés
    </>
  );

  const statusBadge = useMemo(() => {
    if (!statusMessage || !statusType) return null;

    const bgClass = statusType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200';

    return (
      <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${bgClass}`}>
        {statusMessage}
      </div>
    );
  }, [statusMessage, statusType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Űrlap betöltése...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Projekt nem található</h2>
          <p className="text-gray-600 mb-4">A keresett projekt nem elérhető vagy törlésre került.</p>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            Vissza a projektekhez
          </button>
        </div>
      </div>
    );
  }

  const lastSavedDisplay = lastSavedAt
    ? new Date(lastSavedAt).toLocaleString('hu-HU')
    : 'Még nincs mentve';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-6">
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Vissza a projekthez
          </button>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Aquapol űrlap</h1>
              <p className="text-gray-600">Projekt: <span className="font-semibold">{project.name}</span></p>
              <p className="text-sm text-gray-500 mt-1">Utolsó mentés: {lastSavedDisplay}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {statusBadge}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span role="img" aria-hidden="true">📄</span>
                PDF exportálás
              </button>
              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveButtonContent}
                </button>
              )}
              {isViewer && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Megtekintő mód
                </div>
              )}
            </div>
          </div>
        </div>

        <DynamicForm
          definition={aquapolFormDefinition}
          values={formValues}
          onChange={handleFieldChange}
          onSubmit={handleSave}
          isSubmitting={saving}
          readOnly={!canEdit}
          actions={
            canEdit ? (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 self-end rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveButtonContent}
              </button>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
