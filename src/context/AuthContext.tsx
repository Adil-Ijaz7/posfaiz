import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  role: 'admin';
  isAuthenticated: boolean;
  admin1?: User;
  admin2?: User;
  login: (user: User) => void;
  logout: () => void;
  switchUser: (user: User) => void;
  switchAdmin: (adminNumber: 1 | 2) => void;
  hasPermission: (module: ModuleKey) => boolean;
  refreshUsers: () => void;
  isOffline: boolean;
}

export type ModuleKey =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'sales'
  | 'purchases'
  | 'customer-ledger'
  | 'supplier-ledger'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit'
  | 'admins-dashboard';

const ALL_MODULES: ModuleKey[] = [
  'dashboard',
  'pos',
  'products',
  'inventory',
  'customers',
  'suppliers',
  'sales',
  'purchases',
  'customer-ledger',
  'supplier-ledger',
  'payments',
  'expenses',
  'reports',
  'users',
  'settings',
  'audit',
  'admins-dashboard',
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authState = localStorage.getItem('bizledger_authenticated');
    return authState !== 'false';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('bizledger_active_user_id');
    const all = storage.getUsers();
    const found = all.find((u) => u.id === savedId);
    return found || all[0];
  });
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const admin1 = users.find((u) => u.adminNumber === 1 || u.id === 'usr_admin') || users[0];
  const admin2 = users.find((u) => u.adminNumber === 2 || u.id === 'usr_admin_2') || users[1];

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshUsers = () => {
    const all = storage.getUsers();
    setUsers(all);
    const updatedCurrent = all.find((u) => u.id === currentUser.id);
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('bizledger_active_user_id', user.id);
    localStorage.setItem('bizledger_authenticated', 'true');
    storage.recordAudit(
      user.id,
      user.name,
      'USER_LOGIN',
      'Auth',
      user.id,
      `Admin signed in: ${user.name}`
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('bizledger_authenticated', 'false');
    storage.recordAudit(
      currentUser.id,
      currentUser.name,
      'USER_LOGOUT',
      'Auth',
      currentUser.id,
      `Admin logged out`
    );
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('bizledger_active_user_id', user.id);
    localStorage.setItem('bizledger_authenticated', 'true');
  };

  const switchAdmin = (adminNum: 1 | 2) => {
    const target = adminNum === 1 ? admin1 : admin2;
    if (target) {
      switchUser(target);
    }
  };

  const hasPermission = (_module: ModuleKey): boolean => {
    // Both Two Admins have complete access to all modules
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role: 'admin',
        isAuthenticated,
        admin1,
        admin2,
        login,
        logout,
        switchUser,
        switchAdmin,
        hasPermission,
        refreshUsers,
        isOffline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
