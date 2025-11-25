'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }

    if (!password) {
      newErrors.password = 'A jelszó megadása kötelező';
    } else if (password.length < 8) {
      newErrors.password = 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'A jelszó megerősítése kötelező';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ez az email cím már regisztrálva van');
        } else {
          toast.error('Hiba történt a regisztráció során');
        }
      } else {
        toast.success('Regisztráció sikeres! Ellenőrizd az email fiókodat a megerősítéshez.');
        router.push('/login');
      }
    } catch (err) {
      toast.error('Hiba történt a regisztráció során');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email cím"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="pelda@email.com"
        disabled={isLoading}
      />

      <Input
        label="Jelszó"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        helperText="Legalább 8 karakter"
        disabled={isLoading}
      />

      <Input
        label="Jelszó megerősítése"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Regisztráció
      </Button>
    </form>
  );
}