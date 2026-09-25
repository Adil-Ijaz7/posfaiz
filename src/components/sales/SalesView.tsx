import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  FileSpreadsheet,
  Send,
  MessageSquare,
  Mail,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Sale, SaleStatus } from '../../types';
import { formatPKR, formatDateTimePK } from '../../utils/formatters';
import { InvoiceModal } from '../invoices/InvoiceModal';

export const SalesView: React.FC = () => {
  const [sales] = useState<Sale[]>(() => storage.getSales());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SaleStatus>('All');
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);

  const filtered = sales.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.paymentStatus === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.paymentMethod.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Invoice #',
      'Date',
      'Customer',
      'Items Count',
      'Subtotal',
      'Discount',
      'Grand Total',
      'Paid',
      'Remaining',
      'Payment Method',
      'Status',
    ];

    const rows = sales.map((s) => [
      `"${s.invoiceNumber}"`,
      `"${s.date}"`,
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.items.reduce((acc, it) => acc + it.quantity, 0),
      s.subtotal,
      s.discount,
      s.grandTotal,
      s.amountPaid,
      s.remainingDue,
      s.paymentMethod,
      s.paymentStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Client Invoices & Sales History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate branded invoices, track payment status, and dispatch directly to clients via WhatsApp & Email
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Invoices CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, customer name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['All', 'Paid', 'Partial', 'Credit'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Generate & Send Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No sales invoices found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-5 font-mono font-bold text-indigo-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">
                      {formatDateTimePK(sale.timestamp)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <div>{sale.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sale.paymentMethod}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-500">
                      {formatPKR(sale.subtotal)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      {formatPKR(sale.grandTotal)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-medium text-emerald-600">
                      {formatPKR(sale.amountPaid)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-500">
                      {sale.remainingDue > 0 ? formatPKR(sale.remainingDue) : '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sale.paymentStatus === 'Credit'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setSelectedSaleForInvoice(sale)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-100 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Send to Client</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal with WhatsApp & Email Send Actions */}
      <InvoiceModal
        isOpen={!!selectedSaleForInvoice}
        onClose={() => setSelectedSaleForInvoice(null)}
        sale={selectedSaleForInvoice}
      />
    </div>
  );
};
