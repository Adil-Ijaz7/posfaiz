import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  User,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Building,
  Phone,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Customer, LedgerEntry, PaymentMethod } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const CustomerLedgerView: React.FC = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    // Default to the first customer that is not walk-in (e.g. Ahmed Traders)
    const registered = storage.getCustomers().find((c) => c.id !== 'cust_walkin');
    return registered ? registered.id : storage.getCustomers()[0]?.id;
  });

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [searchRef, setSearchRef] = useState<string>('');

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string>('');

  const refreshData = () => {
    setCustomers(storage.getCustomers());
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Fetch entries for this customer
  const ledgerEntries = useMemo(() => {
    if (!selectedCustomerId) return [];
    let entries = storage.getCustomerLedger(selectedCustomerId);

    if (searchRef.trim()) {
      const q = searchRef.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.reference.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    if (dateFilter === 'today') {
      const today = formatDatePK(new Date());
      entries = entries.filter((e) => e.date === today);
    } else if (dateFilter === 'month') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      entries = entries.filter((e) => {
        const d = new Date(e.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    return entries;
  }, [selectedCustomerId, searchRef, dateFilter]);

  // Compute opening, debit, credit, closing balances
  const summary = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    ledgerEntries.forEach((entry) => {
      totalDebit += entry.debit;
      totalCredit += entry.credit;
    });

    const openingBalance = selectedCustomer?.openingBalance || 0;
    const closingBalance = totalDebit - totalCredit;

    return {
      openingBalance,
      totalDebit,
      totalCredit,
      closingBalance,
    };
  }, [ledgerEntries, selectedCustomer]);

  // Handle Recording Wasool (Payment)
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;

    const result = storage.recordPayment({
      type: 'customer_payment',
      partyId: selectedCustomer.id,
      partyName: selectedCustomer.name,
      amount,
      paymentMethod,
      reference: paymentRef,
      notes: paymentNotes || 'Customer payment received (وصولی)',
      actor: currentUser,
    });

    if (result.success) {
      setPaymentSuccessMsg(`Payment of PKR ${amount.toLocaleString()} received successfully!`);
      refreshData();
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setPaymentSuccessMsg('');
        setPaymentAmount('');
        setPaymentRef('');
        setPaymentNotes('');
      }, 1200);
    }
  };

  const handleExportCSV = () => {
    if (!selectedCustomer || ledgerEntries.length === 0) return;

    const headers = ['Date', 'Reference', 'Description', 'Debit (PKR)', 'Credit (PKR)', 'Balance (PKR)'];
    const rows = ledgerEntries.map((e) => [
      e.date,
      `"${e.reference}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.debit,
      e.credit,
      e.balance,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Khata_${selectedCustomer.name}_${formatDatePK(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Customer Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Customer Khata / Ledger (گاہک کھاتہ)
            </h2>
            <p className="text-xs text-slate-400">
              Standard Pakistani debit/credit accounting & payment receipts
            </p>
          </div>
        </div>

        {/* Customer Dropdown & Quick Payment Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[240px]">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.urduName ? `(${c.urduName})` : ''} — Bal: PKR {c.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setPaymentAmount(selectedCustomer?.currentBalance ? String(selectedCustomer.currentBalance) : '');
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Payment (وصولی)</span>
          </button>
        </div>
      </div>

      {/* Selected Customer Profile Card */}
      {selectedCustomer && (
        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{selectedCustomer.name}</span>
                {selectedCustomer.urduName && (
                  <span className="text-sm font-semibold text-emerald-400 font-sans">
                    {selectedCustomer.urduName}
                  </span>
                )}
                <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedCustomer.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {selectedCustomer.phone}
                </span>
                <span>•</span>
                <span>{selectedCustomer.address}</span>
                {selectedCustomer.creditLimit > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">
                      Credit Limit: {formatPKR(selectedCustomer.creditLimit)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                Closing Net Balance (کل واجب الادا ادھار)
              </div>
              <div
                className={`text-2xl font-black font-mono mt-0.5 ${
                  summary.closingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {formatPKR(summary.closingBalance)}
              </div>
              <div className="text-[10px] text-slate-400">
                {summary.closingBalance > 0
                  ? 'Customer owes this amount to store'
                  : 'Account settled / in advance'}
              </div>
            </div>
          </div>

          {/* Ledger Financial Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Opening Balance</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {formatPKR(summary.openingBalance)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Debit (Credit Sales)</span>
              </div>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                {formatPKR(summary.totalDebit)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Total Credit (Wasool / Paid)</span>
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {formatPKR(summary.totalCredit)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Closing Balance</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {formatPKR(summary.closingBalance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table & Filters */}
      <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
        {/* Table Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="Search reference or description..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  dateFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  dateFilter === 'month' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  dateFilter === 'today' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
              title="Print Account Statement"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
              title="Download CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Accounting Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right text-amber-400 font-bold">Debit (ادھار / بل)</th>
                <th className="py-3 px-4 text-right text-emerald-400 font-bold">Credit (وصولی)</th>
                <th className="py-3 px-4 text-right text-white font-bold">Running Balance</th>
                <th className="py-3 px-4 text-center">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded for this customer in selected period.
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-3 px-4 font-mono text-slate-300">{entry.date}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400 font-mono">
                      {entry.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {entry.debit > 0 ? formatPKR(entry.debit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {entry.credit > 0 ? formatPKR(entry.credit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {formatPKR(entry.balance)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                      {entry.createdBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment (Wasool) Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleRecordPayment}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Receive Payment (رقم وصولی)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <span className="text-white font-semibold">{selectedCustomer.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {paymentSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{paymentSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current Outstanding:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatPKR(selectedCustomer.currentBalance)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Amount Received (وصول رقم PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-lg font-black text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Payment Channel (طریقہ وصولی)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Cash">Cash (نقد)</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Bank Transfer">Bank Transfer (HBL / Meezan / MCB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reference / TRX ID (ٹرانزیکشن آئی ڈی)
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. JC-892147 / HBL-981"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Partial cleared against Friday bill"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
                  >
                    Confirm & Save Receipt
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
