
import * as React from 'react';
const { useState, useEffect } = React;
import { useLocalData } from './useLocalData';

export type Permission = 
  | 'view_dashboard'
  | 'manage_inventory'
  | 'view_inventory'
  | 'manage_staff'
  | 'view_staff'
  | 'manage_sales'
  | 'view_sales'
  | 'view_reports'
  | 'manage_settings'
  | 'view_history';

export type Role = 'admin' | 'manager' | 'bartender' | 'server' | 'viewer';

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard', 'manage_inventory', 'view_inventory', 'manage_staff', 
    'view_staff', 'manage_sales', 'view_sales', 'view_reports', 
    'manage_settings', 'view_history'
  ],
  manager: [
    'view_dashboard', 'manage_inventory', 'view_inventory', 'view_staff',
    'manage_sales', 'view_sales', 'view_reports', 'view_history'
  ],
  bartender: [
    'view_dashboard', 'view_inventory', 'manage_sales', 'view_sales'
  ],
  server: [
    'view_dashboard', 'view_inventory', 'manage_sales', 'view_sales'
  ],
  viewer: [
    'view_dashboard', 'view_inventory', 'view_staff', 'view_sales', 'view_reports'
  ]
};

export const usePermissions = () => {
  const { getSettings } = useLocalData();
  const [currentUserRole, setCurrentUserRole] = useState<Role>('admin'); // Par défaut admin

  useEffect(() => {
    // Pour l'instant, on utilise admin par défaut
    // Dans une vraie app, on récupérerait le rôle de l'utilisateur connecté
    const settings = getSettings();
    setCurrentUserRole('admin');
  }, [getSettings]);

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[currentUserRole].includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const getRolePermissions = (role: Role): Permission[] => {
    return rolePermissions[role];
  };

  const setUserRole = (role: Role) => {
    setCurrentUserRole(role);
  };

  return {
    currentUserRole,
    hasPermission,
    hasAnyPermission,
    getRolePermissions,
    setUserRole,
    availableRoles: Object.keys(rolePermissions) as Role[]
  };
};
