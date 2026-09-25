import React, { useState } from 'react';
import { History, Search, Shield, Filter, FileSpreadsheet } from 'lucide-react';
import { storage } from '../../services/storage';
import { AuditLog } from '../../types';
import { formatDateTimePK, formatDatePK } from '../../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('All');

  const entities = ['All', 'Sale', 'Purchase', 'Payment', 'Expense', 'Product', 'Inventory', 'Customer', 'Supplier', 'Settings', 'User'];

  const filtered = logs.filter((log) => {
    const matchesEntity = selectedEntity === 'All' || log.entity === selectedEntity;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesEntity;

    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q);

    return matchesEntity && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Officer / User', 'Action', 'Entity', 'Details'];
    const rows = logs.map((l) => [
      `"${formatDateTimePK(l.timestamp)}"`,
      `"${l.userName}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${formatDatePK(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              System Audit Trail (شفاف آڈٹ ریکارڈ)
            </h2>
            <p className="text-xs text-slate-400">
              Immutable ledger of business events, stock changes, sales, and financial updates
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user, entity, or note..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {entities.map((ent) => (
            <button
              key={ent}
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedEntity === ent
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Date & Time (PKT)</th>
              <th className="py-3.5 px-4">Staff Member</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity</th>
              <th className="py-3.5 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No audit entries found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {formatDateTimePK(log.timestamp)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{log.userName}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{log.entity}</td>
                  <td className="py-3.5 px-4 text-slate-300 leading-relaxed">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
