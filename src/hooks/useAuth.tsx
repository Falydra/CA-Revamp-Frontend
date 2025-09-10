import { useState, useEffect } from 'react';
import type { Role, User } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    roles: [],
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        const rolesStr = localStorage.getItem('roles');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          const roles = rolesStr ? JSON.parse(rolesStr) : [];
          const roleNames = roles.map((role: Role) => role.name.toLowerCase());

          setAuthState({
            user,
            token,
            roles: roleNames,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            token: null,
            roles: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          token: null,
          roles: [],
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const hasRole = (role: string): boolean => {
    return authState.roles.includes(role.toLowerCase());
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => authState.roles.includes(role.toLowerCase()));
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'super admin', 'superadmin']);
  };

  const isSuperAdmin = (): boolean => {
    return hasAnyRole(['super admin', 'superadmin']);
  };

  const isOrganizer = (): boolean => {
    return hasAnyRole(['organizer', 'donee']);
  };

  const isDonor = (): boolean => {
    return hasRole('donor') || authState.roles.length === 0; // Default role
  };

  const getDefaultDashboard = (): string => {
    if (isSuperAdmin()) return '/dashboard/super-admin';
    if (hasRole('admin')) return '/dashboard/admin';
    if (isOrganizer()) return '/dashboard/donee';
    return '/dashboard/donor'; // Default
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    setAuthState({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isOrganizer,
    isDonor,
    getDefaultDashboard,
    logout,
  };
};