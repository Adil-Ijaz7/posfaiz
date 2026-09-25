import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  ArrowRight,
  Store,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export const LoginView: React.FC = () => {
  const { admin1, admin2, login } = useAuth();
  const settings = storage.getSettings();

  const handleAdminLogin = (adminNumber: 1 | 2) => {
    const target = adminNumber === 1 ? admin1 : admin2;
    if (target) {
      login(target);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#edf0f5] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Main Container matching clean light UI */}
      <div className="relative w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-xl p-8 sm:p-10 space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-600/20">
              <Store className="w-8 h-8" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.name}
            </h1>
            {settings.urduName && (
              <p className="text-xs text-slate-400 font-medium">{settings.urduName}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Two Admins Business Portal • Dual-Administrator Management
            </p>
          </div>
        </div>

        {/* TWO ADMINS ACCESS CARDS */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-900">
              Select Administrator To Continue
            </h2>
            <p className="text-xs text-slate-400">
              Instant 1-click authorized access for store owners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ADMIN 1: MUHAMMAD USMAN */}
            <div className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-5 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    MU
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900">Muhammad Usman</h3>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-semibold px-2 py-0.5 rounded-full bg-indigo-100">
                      Admin 1 (Primary)
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Store Name & Logo Settings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Financials & Net Profit</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[10px] pt-1">
                    admin1@bizledger.pk
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdminLogin(1)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <span>Sign In as Admin 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ADMIN 2: ZUBAIR AHMED */}
            <div className="bg-slate-50 hover:bg-teal-50/40 border border-slate-200/80 hover:border-teal-400 rounded-2xl p-5 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    ZA
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900">Zubair Ahmed</h3>
                    </div>
                    <span className="text-[10px] text-teal-700 font-semibold px-2 py-0.5 rounded-full bg-teal-100">
                      Admin 2 (Co-Owner)
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>Inventory & Warehouse Control</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>Supplier Orders & Purchases</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[10px] pt-1">
                    admin2@bizledger.pk
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdminLogin(2)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition cursor-pointer"
              >
                <span>Sign In as Admin 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dual-Admin System (No Cashier)</span>
          <span>Asia/Karachi (PKT)</span>
        </div>
      </div>
    </div>
  );
};
