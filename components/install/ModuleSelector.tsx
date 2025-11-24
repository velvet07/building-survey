'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import modulesConfig from '@/config/modules.json';

interface ModuleSelectorProps {
  onNext: (modules: Record<string, boolean>) => void;
}

export function ModuleSelector({ onNext }: ModuleSelectorProps) {
  const [modules, setModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Set defaults
    const defaults: Record<string, boolean> = {};
    Object.keys(modulesConfig).forEach((key) => {
      const module = (modulesConfig as any)[key];
      defaults[key] = module.default === true;
    });
    setModules(defaults);
  }, []);

  const toggleModule = (key: string) => {
    const module = (modulesConfig as any)[key];
    if (module.required) {
      return; // Can't disable required modules
    }
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    onNext(modules);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Válaszd ki, mely modulokat szeretnéd telepíteni. A kötelező modulok nem
        kapcsolhatók ki.
      </p>

      <div className="space-y-3">
        {Object.keys(modulesConfig).map((key) => {
          const module = (modulesConfig as any)[key];
          const isEnabled = modules[key] || false;

          return (
            <div
              key={key}
              className={`border rounded-lg p-4 ${
                isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleModule(key)}
                      disabled={module.required}
                      className="w-4 h-4"
                    />
                    <label className="font-medium">{module.name}</label>
                    {module.required && (
                      <span className="text-xs text-gray-500">(kötelező)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={handleNext} className="w-full">
        Tovább
      </Button>
    </div>
  );
}

