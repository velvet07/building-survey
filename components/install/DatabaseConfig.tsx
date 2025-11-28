'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DatabaseConfigProps {
  onNext: (config: {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  }) => void;
  onTest: (config: {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  }) => Promise<boolean>;
}

export function DatabaseConfig({ onNext, onTest }: DatabaseConfigProps) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const success = await onTest({ host, port, database: name, username, password });
      setTestResult({
        success,
        message: success
          ? 'Adatbázis kapcsolat sikeres'
          : 'Adatbázis kapcsolódási hiba',
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Hiba történt',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    onNext({ host, port, database: name, username, password });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Fontos:</strong> Az adatbázist előre létre kell hozni a webhosting panelben
          (cPanel/CWP7). Az installer csak kapcsolódik a meglévő adatbázishoz.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adatbázis hoszt</label>
        <Input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="localhost"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Port</label>
        <Input
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          placeholder="3306"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adatbázis név *</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="building_survey"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Felhasználónév *</label>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jelszó *</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {testResult && (
        <div
          className={`p-3 rounded ${
            testResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {testResult.message}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          disabled={testing || !host || !port || !name || !username || !password}
        >
          {testing ? 'Tesztelés...' : 'Kapcsolat tesztelése'}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!testResult?.success}
          className="ml-auto"
        >
          Tovább
        </Button>
      </div>
    </div>
  );
}

