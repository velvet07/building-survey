'use client';

/**
 * Aquapol Diagnostics Form
 * Tablet friendly form layout for recording on-site moisture diagnostics
 */

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { getAquapolForm, saveAquapolForm } from '@/lib/aquapol/api';
import { showError, showSuccess } from '@/lib/toast';
import type {
  AquapolFormData,
  AquapolFormRecord,
  BasementType,
  BuildingType,
  InterventionUrgency,
  SaltContentLevel,
  VentilationQuality,
} from '@/types/aquapol.types';

interface AquapolFormProps {
  projectId: string;
}

const ingressOptions: Array<{ value: string; label: string }> = [
  { value: 'rising_damp', label: 'Kapilláris felszívódás' },
  { value: 'splash_water', label: 'Fröccsenő esővíz' },
  { value: 'condensation', label: 'Kondenzáció' },
  { value: 'pipe_leak', label: 'Csőtörés / szivárgás' },
  { value: 'roof_leak', label: 'Tető beázás' },
  { value: 'groundwater', label: 'Talajvíz nyomás' },
];

const initialForm: AquapolFormData = {
  client: {
    contactName: '',
    phone: '',
    email: '',
  },
  property: {
    address: '',
    buildingType: 'family',
    constructionYear: '',
    basement: 'none',
    floorArea: '',
  },
  diagnostics: {
    inspectionDate: new Date().toISOString().slice(0, 10),
    wallMoisture: '',
    floorMoisture: '',
    relativeHumidity: '',
    saltContent: 'medium',
    ventilation: 'average',
    ingressSources: [],
    notes: '',
  },
  recommendation: {
    summary: '',
    urgency: 'normal',
    followUpDate: '',
    responsiblePerson: '',
  },
  additionalNotes: '',
};

export default function AquapolForm({ projectId }: AquapolFormProps) {
  const [form, setForm] = useState<AquapolFormData>(initialForm);
  const [loadedForm, setLoadedForm] = useState<AquapolFormData>(initialForm);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const record = await getAquapolForm(projectId);
        if (record) {
          setForm(record.data);
          setLoadedForm(record.data);
          setLastSaved(record.updated_at);
        } else {
          setForm(initialForm);
          setLoadedForm(initialForm);
          setLastSaved(null);
        }
        setIsDirty(false);
      } catch (error) {
        console.error(error);
        showError('Nem sikerült betölteni az Aquapol űrlapot');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [projectId]);

  const setClientField = (field: keyof AquapolFormData['client'], value: string) => {
    setForm((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const setPropertyField = (
    field: keyof AquapolFormData['property'],
    value: string | BuildingType | BasementType
  ) => {
    setForm((prev) => ({
      ...prev,
      property: {
        ...prev.property,
        [field]: value as AquapolFormData['property'][typeof field],
      },
    }));
    setIsDirty(true);
  };

  const setDiagnosticsField = (
    field: keyof AquapolFormData['diagnostics'],
    value: string | string[] | SaltContentLevel | VentilationQuality
  ) => {
    setForm((prev) => ({
      ...prev,
      diagnostics: {
        ...prev.diagnostics,
        [field]: value as AquapolFormData['diagnostics'][typeof field],
      },
    }));
    setIsDirty(true);
  };

  const toggleIngressSource = (source: string) => {
    setForm((prev) => {
      const exists = prev.diagnostics.ingressSources.includes(source);
      return {
        ...prev,
        diagnostics: {
          ...prev.diagnostics,
          ingressSources: exists
            ? prev.diagnostics.ingressSources.filter((item) => item !== source)
            : [...prev.diagnostics.ingressSources, source],
        },
      };
    });
    setIsDirty(true);
  };

  const setRecommendationField = (
    field: keyof AquapolFormData['recommendation'],
    value: string | InterventionUrgency
  ) => {
    setForm((prev) => ({
      ...prev,
      recommendation: {
        ...prev.recommendation,
        [field]: value as AquapolFormData['recommendation'][typeof field],
      },
    }));
    setIsDirty(true);
  };

  const handleNotesChange = (value: string) => {
    setForm((prev) => ({ ...prev, additionalNotes: value }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setForm(loadedForm);
    setIsDirty(false);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const record: AquapolFormRecord = await saveAquapolForm(projectId, form);
      setLoadedForm(record.data);
      setForm(record.data);
      setLastSaved(record.updated_at);
      setIsDirty(false);
      showSuccess('Aquapol űrlap mentve');
    } catch (error) {
      console.error(error);
      showError('Nem sikerült menteni az Aquapol űrlapot');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedLastSaved = useMemo(() => {
    if (!lastSaved) return 'Még nincs mentve';
    const date = new Date(lastSaved);
    return `Utolsó mentés: ${date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, [lastSaved]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Űrlap betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save bar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Aquapol diagnosztikai űrlap</h2>
          <p className="text-sm text-gray-500">{formattedLastSaved}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Visszaállítás
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Mentés
          </button>
        </div>
      </div>

      {/* Client & Property */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ügyfél és helyszín</h3>
          <p className="text-sm text-gray-500">Alap információk a kapcsolatfelvételhez és a vizsgált épületről.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kapcsolattartó</h4>
            <label className="block">
              <span className="text-sm text-gray-600">Név</span>
              <input
                type="text"
                value={form.client.contactName}
                onChange={(e) => setClientField('contactName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ügyfél neve"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Telefon</span>
              <input
                type="tel"
                value={form.client.phone}
                onChange={(e) => setClientField('phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+36..."
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">E-mail</span>
              <input
                type="email"
                value={form.client.email}
                onChange={(e) => setClientField('email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ugyfel@example.hu"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ingatlan</h4>
            <label className="block">
              <span className="text-sm text-gray-600">Cím</span>
              <input
                type="text"
                value={form.property.address}
                onChange={(e) => setPropertyField('address', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Irányítószám, város, utca, házszám"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Épület típusa</span>
              <select
                value={form.property.buildingType}
                onChange={(e) => setPropertyField('buildingType', e.target.value as BuildingType)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="family">Családi ház</option>
                <option value="apartment">Társasház / lakás</option>
                <option value="historic">Műemlék / régi épület</option>
                <option value="commercial">Kereskedelmi</option>
                <option value="industrial">Ipari</option>
              </select>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-600">Építés éve</span>
                <input
                  type="text"
                  value={form.property.constructionYear}
                  onChange={(e) => setPropertyField('constructionYear', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. 1978"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Pinceszint</span>
                <select
                  value={form.property.basement}
                  onChange={(e) => setPropertyField('basement', e.target.value as BasementType)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Nincs</option>
                  <option value="partial">Részben</option>
                  <option value="full">Teljes pinceszint</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600">Hasznos alapterület (m²)</span>
              <input
                type="text"
                value={form.property.floorArea}
                onChange={(e) => setPropertyField('floorArea', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pl. 120"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Diagnostics */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Diagnosztika</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Felmérés dátuma</span>
              <input
                type="date"
                value={form.diagnostics.inspectionDate}
                onChange={(e) => setDiagnosticsField('inspectionDate', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">Vízbetörési források és mért értékek dokumentálása.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-600">Falnedvesség (%)</span>
              <input
                type="text"
                value={form.diagnostics.wallMoisture}
                onChange={(e) => setDiagnosticsField('wallMoisture', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pl. 6.5"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Padlónedvesség (%)</span>
              <input
                type="text"
                value={form.diagnostics.floorMoisture}
                onChange={(e) => setDiagnosticsField('floorMoisture', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pl. 4.8"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-600">Relatív páratartalom (%)</span>
              <input
                type="text"
                value={form.diagnostics.relativeHumidity}
                onChange={(e) => setDiagnosticsField('relativeHumidity', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pl. 68"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Sóterhelés</span>
              <select
                value={form.diagnostics.saltContent}
                onChange={(e) => setDiagnosticsField('saltContent', e.target.value as SaltContentLevel)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Alacsony</option>
                <option value="medium">Közepes</option>
                <option value="high">Magas</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Szellőzés minősége</span>
              <select
                value={form.diagnostics.ventilation}
                onChange={(e) => setDiagnosticsField('ventilation', e.target.value as VentilationQuality)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="good">Jó</option>
                <option value="average">Közepes</option>
                <option value="poor">Gyenge</option>
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700">Feltételezett nedvesedési források</span>
            <div className="grid grid-cols-1 gap-2">
              {ingressOptions.map((option) => {
                const checked = form.diagnostics.ingressSources.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                      checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIngressSource(option.value)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-gray-600">Megjegyzések / mérési pontok</span>
          <textarea
            value={form.diagnostics.notes}
            onChange={(e) => setDiagnosticsField('notes', e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Részletes megfigyelések a nedvesedésről, sókivirágzásról, szerkezeti állapotról..."
          />
        </label>
      </section>

      {/* Recommendation */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ajánlások</h3>
          <p className="text-sm text-gray-500">Terápiás javaslat, utókövetés és felelős személy kijelölése.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block md:col-span-2">
            <span className="text-sm text-gray-600">Összefoglaló ajánlás</span>
            <textarea
              value={form.recommendation.summary}
              onChange={(e) => setRecommendationField('summary', e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rövid összegzés a javasolt Aquapol beavatkozásról, előkészítésről és várható eredményekről"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Sürgősség</span>
            <select
              value={form.recommendation.urgency}
              onChange={(e) => setRecommendationField('urgency', e.target.value as InterventionUrgency)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monitor">Megfigyelés</option>
              <option value="normal">Normál ütemezés</option>
              <option value="urgent">Sürgős kivitelezés</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Utókövetés dátuma</span>
            <input
              type="date"
              value={form.recommendation.followUpDate}
              onChange={(e) => setRecommendationField('followUpDate', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Felelős szakértő</span>
            <input
              type="text"
              value={form.recommendation.responsiblePerson}
              onChange={(e) => setRecommendationField('responsiblePerson', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="pl. Tóth Péter"
            />
          </label>
        </div>
      </section>

      {/* Additional notes */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Kiegészítő jegyzetek</h3>
          <p className="text-sm text-gray-500">Fotódokumentáció, extra feladatok, helyszíni visszajelzések.</p>
        </div>
        <textarea
          value={form.additionalNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ide írhatod a helyszíni tapasztalatokat, további feladatokat, várható akadályokat..."
        />
      </section>
    </div>
  );
}
