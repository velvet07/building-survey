'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserRoleAction } from '@/app/actions/users';
import type { UserRole } from '@/types/user.types';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { role: userRole, error } = await getCurrentUserRoleAction();

      if (error) {
        console.error('Error checking user role:', error);
      } else {
        setRole(userRole);
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
