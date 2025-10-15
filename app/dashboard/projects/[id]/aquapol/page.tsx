'use client';

import { useParams, useRouter } from 'next/navigation';
import AquapolForm from '@/components/aquapol/AquapolForm';

export default function AquapolFormPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Vissza a projekt dashboardhoz
      </button>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aquapol diagnosztikai űrlap</h1>
          <p className="text-gray-600">
            Töltsd ki a felméréshez kapcsolódó nedvesedési adatokat, hogy az Aquapol rendszer tervezését
            és kivitelezését dokumentálni tudjuk. A mentés automatikusan a projekthez kapcsolódik.
          </p>
        </div>

        <AquapolForm projectId={projectId} />
      </div>
    </div>
  );
}
