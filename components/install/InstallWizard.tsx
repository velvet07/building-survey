'use client';

import { useState } from 'react';
import { DatabaseConfig } from './DatabaseConfig';
import { ModuleSelector } from './ModuleSelector';
import { AdminUserForm } from './AdminUserForm';

type Step = 'database' | 'modules' | 'admin' | 'installing' | 'complete';

export function InstallWizard() {
  const [step, setStep] = useState<Step>('database');
  const [databaseConfig, setDatabaseConfig] = useState<any>(null);
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleDatabaseTest = async (config: any) => {
    try {
      const response = await fetch('/install/api/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Database test error:', error);
      return false;
    }
  };

  const handleDatabaseNext = (config: any) => {
    setDatabaseConfig(config);
    setStep('modules');
  };

  const handleModulesNext = (modules: Record<string, boolean>) => {
    setSelectedModules(modules);
    setStep('admin');
  };

  const handleInstall = async (adminUser: any) => {
    setStep('installing');
    setError(null);

    try {
      const response = await fetch('/install/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: databaseConfig,
          modules: selectedModules,
          adminEmail: adminUser.email,
          adminPassword: adminUser.password,
          adminFullName: adminUser.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Telepítési hiba');
      }

      setStep('complete');
    } catch (error: any) {
      setError(error.message || 'Hiba történt a telepítés során');
      setStep('admin');
    }
  };

  if (step === 'installing') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Telepítés folyamatban...</p>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Telepítés sikeres!</h2>
        <p className="text-gray-600 mb-6">
          Az alkalmazás telepítve lett. Most már bejelentkezhetsz.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Bejelentkezés
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'database' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 ${
              step === 'modules' || step === 'admin' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'modules' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            2
          </div>
          <div
            className={`flex-1 h-1 ${
              step === 'admin' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            3
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Adatbázis</span>
          <span>Modulok</span>
          <span>Admin felhasználó</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {step === 'database' && (
        <DatabaseConfig onNext={handleDatabaseNext} onTest={handleDatabaseTest} />
      )}

      {step === 'modules' && <ModuleSelector onNext={handleModulesNext} />}

      {step === 'admin' && <AdminUserForm onComplete={handleInstall} />}
    </div>
  );
}

