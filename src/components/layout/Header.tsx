import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  ChevronDown,
  Menu,
  Crown,
  Shield,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDatePK } from '../../utils/formatters';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenShortcuts: () => void;
  onNavigateAdmins?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onNavigateAdmins }) => {
  const { currentUser, admin1, admin2, switchAdmin } = useAuth();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = formatDatePK(new Date());

  const isAdmin1Active =
    currentUser.id === admin1?.id ||
    currentUser.id === 'usr_admin' ||
    currentUser.name.includes('Usman');

  return (
    <header className="flex items-center justify-between h-18 px-6 sm:px-8 bg-transparent">
      {/* Mobile Toggle + Search Bar (Matches screenshot) */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-500 rounded-xl hover:bg-white hover:text-slate-900 lg:hidden shadow-sm bg-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type Here to Search"
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 shadow-sm border border-transparent focus:border-slate-200 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Right Controls: Date Picker, Notification, Two Admins Switcher */}
      <div className="flex items-center gap-3">
        {/* Date Filter Pill (Matches screenshot: "Apr 04, 2024 - Apr 05, 2024") */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{todayStr} - Today</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>

        {/* Notifications Icon with Badge (Matches screenshot: red dot 2) */}
        <button
          className="relative p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm border border-slate-100 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            2
          </span>
        </button>

        {/* Two Admins Switcher Dropdown (Matches screenshot avatar) */}
        <div className="relative">
          <button
            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition"
          >
            <div className="relative">
              <img
                src={
                  isAdmin1Active
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80'
                }
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{isAdmin1Active ? 'Admin 1 (Usman)' : 'Admin 2 (Zubair)'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Store Co-Owner</div>
            </div>
          </button>

          {showAdminDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Two Admins Switcher
              </div>

              {/* Admin 1 Option */}
              <button
                onClick={() => {
                  switchAdmin(1);
                  setShowAdminDropdown(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                  isAdmin1Active
                    ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    MU
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Muhammad Usman</div>
                    <div className="text-[10px] text-slate-500">Admin 1 • Managing Partner</div>
                  </div>
                </div>
                {isAdmin1Active && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* Admin 2 Option */}
              <button
                onClick={() => {
                  switchAdmin(2);
                  setShowAdminDropdown(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition mt-1 ${
                  !isAdmin1Active
                    ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    ZA
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Zubair Ahmed</div>
                    <div className="text-[10px] text-slate-500">Admin 2 • Operations Partner</div>
                  </div>
                </div>
                {!isAdmin1Active && <Check className="w-4 h-4 text-teal-600" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
