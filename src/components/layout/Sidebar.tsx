import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  Receipt,
  BookOpen,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Moon,
  LogOut,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAuth, ModuleKey } from '../../context/AuthContext';
import { storage } from '../../services/storage';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  key: ModuleKey;
  label: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Listen to settings update event so store name & logo update live
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(storage.getSettings());
    };
    window.addEventListener('bizledger_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('bizledger_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'pos', label: 'POS', icon: ShoppingBag },
    { key: 'sales', label: 'Sales', icon: Receipt },
    { key: 'customer-ledger', label: 'Accounting', icon: BookOpen },
    { key: 'purchases', label: 'Purchase', icon: Truck },
    { key: 'customers', label: 'Customers & HR', icon: Users },
    { key: 'expenses', label: 'Payroll', icon: CreditCard },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-50">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Store className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight truncate flex items-center gap-1">
              <span>{settings.name.split(' ')[0] || 'Poital'}</span>
              <span className="text-indigo-600">.flow</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {settings.name || 'Al-Rehman Store'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectModule(item.key);
                  onCloseMobile();
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1f2024] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Help, Dark Mode Toggle, Logout */}
        <div className="p-4 border-t border-slate-100 space-y-1.5">
          <button
            onClick={() => onSelectModule('settings')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help</span>
          </button>

          {/* Dark mode switch (matches screenshot) */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-slate-400" />
              <span>Dark mode</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
