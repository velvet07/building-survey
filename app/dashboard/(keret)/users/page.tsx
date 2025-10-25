'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UserList } from '@/components/users/UserList';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { DeleteUserModal } from '@/components/users/DeleteUserModal';
import { User, UserRole } from '@/types/user.types';

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    // Close all other modals first
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user: User) => {
    // Close all other modals first
    setIsCreateModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    // Close all other modals first
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    // Close all modals
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    // Refresh list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Felhasználók
          </h1>
          <p className="text-secondary-600">
            Kezelje a rendszer felhasználóit és jogosultságaikat
          </p>
        </div>

        <Button onClick={handleCreate}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új felhasználó
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés név vagy email alapján..."
            className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-secondary-200">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-secondary-700">Szűrés jogosultság szerint:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="all">Összes felhasználó</option>
            <option value="admin">Adminisztrátorok</option>
            <option value="user">Felhasználók</option>
            <option value="viewer">Megtekintők</option>
          </select>
        </div>
      </div>

      <UserList
        key={`${refreshKey}-${roleFilter}-${searchQuery}`}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterRole={roleFilter}
        searchQuery={searchQuery}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleSuccess}
        user={selectedUser}
      />
    </div>
  );
}
