'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { UserRole } from '@/types/user.types';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isViewer = role === 'viewer';
  const canEdit = role === 'admin' || role === 'user';
  const canDelete = role === 'admin' || role === 'user';
  const canCreate = role === 'admin' || role === 'user';

  return {
    role,
    isLoading,
    isAdmin,
    isUser,
    isViewer,
    canEdit,
    canDelete,
    canCreate,
  };
}
