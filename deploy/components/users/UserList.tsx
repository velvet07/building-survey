'use client';

import { useState, useEffect } from 'react';
import { getUsersAction } from '@/app/actions/users';
import { User, UserRole } from '@/types/user.types';
import { UserCard } from './UserCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface UserListProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
  filterRole?: UserRole | 'all';
  searchQuery?: string;
}

export function UserList({ onEdit, onDelete, onCreate, filterRole = 'all', searchQuery = '' }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const { data, error } = await getUsersAction();

    if (error) {
      toast.error('Hiba történt a felhasználók betöltése során');
    } else {
      let filteredUsers = data || [];

      // Apply role filter
      if (filterRole !== 'all') {
        filteredUsers = filteredUsers.filter((u) => u.role === filterRole);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        filteredUsers = filteredUsers.filter((user) => {
          const searchableText = `${user.email} ${user.full_name || ''}`.toLowerCase();
          // All search terms must match (AND logic)
          return searchTerms.every((term) => searchableText.includes(term));
        });
      }

      setUsers(filteredUsers);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (users.length === 0) {
    // Check if empty due to search
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon={
            <svg className="h-16 w-16 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Nincs találat"
          description={`Nem található felhasználó a keresési feltételnek megfelelően: "${searchQuery}"`}
        />
      );
    }

    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        title="Még nincs egyetlen felhasználó sem"
        description="Kezdj neki az első felhasználó létrehozásával!"
        action={
          <Button onClick={onCreate}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Új felhasználó létrehozása
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
