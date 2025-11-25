'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdminUserFormProps {
  onComplete: (user: {
    email: string;
    password: string;
    fullName: string;
  }) => void;
}

export function AdminUserForm({ onComplete }: AdminUserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Érvényes email címet adj meg';
    }

    if (!password || password.length < 8) {
      newErrors.password = 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'A két jelszó nem egyezik meg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onComplete({ email, password, fullName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email cím *</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jelszó *</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 karakter"
          required
          minLength={8}
        />
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jelszó mégegyszer *</label>
        <Input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Írd be újra a jelszót"
          required
          minLength={8}
        />
        {errors.passwordConfirm && (
          <p className="text-sm text-red-600 mt-1">{errors.passwordConfirm}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Teljes név (opcionális)</label>
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Kiss János"
        />
      </div>

      <Button type="submit" className="w-full">
        Telepítés befejezése
      </Button>
    </form>
  );
}

