'use client';

import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { user } = await getCurrentUser();
      setUserEmail(user?.email || null);
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Hiba történt a kijelentkezés során');
    } else {
      toast.success('Sikeres kijelentkezés');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-secondary-900">
            Épületfelmérő Rendszer
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-secondary-600">{userEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
          >
            Kijelentkezés
          </Button>
        </div>
      </div>
    </header>
  );
}