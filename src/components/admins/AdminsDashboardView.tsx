import React, { useState } from 'react';
import {
  Crown,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Activity,
  History,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { formatDateTimePK } from '../../utils/formatters';

export const AdminsDashboardView: React.FC = () => {
  const { currentUser, admin1, admin2, switchUser, logout } = useAuth();
  const [filterAdminId, setFilterAdminId] = useState<string>('all');
  const auditLogs = storage.getAuditLogs();

  const activeAdminNumber =
    currentUser.id === admin1?.id || currentUser.adminNumber === 1
      ? 1
      : currentUser.id === admin2?.id || currentUser.adminNumber === 2
      ? 2
      : null;

  const filteredLogs = auditLogs
    .filter((log) => {
      if (filterAdminId === 'all') {
        return (
          log.userId === admin1?.id ||
          log.userId === admin2?.id ||
          log.userId === 'usr_admin' ||
          log.userId === 'usr_admin_2'
        );
      }
      return log.userId === filterAdminId;
    })
    .slice(0, 15);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Two Admins Management Dashboard
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
              Dual-Admin Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Co-administration console for business owners: Muhammad Usman & Zubair Ahmed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>

      {/* TWO ADMIN CARDS SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADMIN 1 */}
        <div
          className={`relative bg-slate-900/90 rounded-2xl border transition-all p-5 flex flex-col justify-between ${
            activeAdminNumber === 1
              ? 'border-emerald-500/50 shadow-lg shadow-emerald-900/10 ring-1 ring-emerald-500/30'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  MU
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Muhammad Usman</h2>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold uppercase">
                      Admin 1 (Primary)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Managing Partner & Super Admin</p>
                </div>
              </div>

              {activeAdminNumber === 1 ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                  Standby
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Email</span>
                </div>
                <div className="font-mono text-slate-200 text-[11px] truncate">
                  {admin1?.email || 'admin1@bizledger.pk'}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Phone</span>
                </div>
                <div className="font-mono text-slate-200 text-[11px]">
                  {admin1?.phone || '0300-8421905'}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Executive Responsibilities
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Store Financials & Net Profit Reports</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>NTN Tax Settings & Legal Store Configuration</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Master Product Catalog & Price Overrides</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80">
            {activeAdminNumber === 1 ? (
              <div className="text-center py-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                ✓ Currently Logged In as Admin 1 (Usman)
              </div>
            ) : (
              <button
                onClick={() => admin1 && switchUser(admin1)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Switch Active Session to Admin 1 (Usman)</span>
              </button>
            )}
          </div>
        </div>

        {/* ADMIN 2 */}
        <div
          className={`relative bg-slate-900/90 rounded-2xl border transition-all p-5 flex flex-col justify-between ${
            activeAdminNumber === 2
              ? 'border-indigo-500/50 shadow-lg shadow-indigo-900/10 ring-1 ring-indigo-500/30'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg">
                  ZA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Zubair Ahmed</h2>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold uppercase">
                      Admin 2 (Co-Owner)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Operations Partner & Admin</p>
                </div>
              </div>

              {activeAdminNumber === 2 ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Active Session
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                  Standby
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Email</span>
                </div>
                <div className="font-mono text-slate-200 text-[11px] truncate">
                  {admin2?.email || 'admin2@bizledger.pk'}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Phone</span>
                </div>
                <div className="font-mono text-slate-200 text-[11px]">
                  {admin2?.phone || '0301-5544332'}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Executive Responsibilities
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>Warehouse Stock Replenishment & Damaged Audits</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>Supplier Credit Khata & Purchase Orders</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>Cash Register Audits & Daily Reconciliation</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80">
            {activeAdminNumber === 2 ? (
              <div className="text-center py-2 text-xs text-indigo-400 font-medium bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                ✓ Currently Logged In as Admin 2 (Zubair)
              </div>
            ) : (
              <button
                onClick={() => admin2 && switchUser(admin2)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Switch Active Session to Admin 2 (Zubair)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN ACTIONS AUDIT STREAM */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Dual-Admin Audit Trail</h3>
            <span className="text-[10px] text-slate-400">
              (Filtered to actions taken by Admin 1 & Admin 2)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterAdminId('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterAdminId === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Admins
            </button>
            <button
              onClick={() => setFilterAdminId(admin1?.id || 'usr_admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterAdminId === admin1?.id || filterAdminId === 'usr_admin'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin 1 (Usman)
            </button>
            <button
              onClick={() => setFilterAdminId(admin2?.id || 'usr_admin_2')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterAdminId === admin2?.id || filterAdminId === 'usr_admin_2'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin 2 (Zubair)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Admin</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No actions recorded for the selected admin yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAdmin1 =
                    log.userId === admin1?.id ||
                    log.userId === 'usr_admin' ||
                    log.userName.includes('Usman');
                  return (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formatDateTimePK(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            isAdmin1
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          <Crown className="w-2.5 h-2.5" />
                          {isAdmin1 ? 'Admin 1 (Usman)' : 'Admin 2 (Zubair)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.entity}</td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
