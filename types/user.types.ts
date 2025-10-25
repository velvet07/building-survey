export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Adminisztrátor',
  user: 'Felhasználó',
  viewer: 'Megtekintő',
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: 'error',
  user: 'primary',
  viewer: 'warning',
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Teljes hozzáférés a rendszerhez',
  user: 'Projektek létrehozása és kezelése',
  viewer: 'Csak megtekintési jogosultság',
};
