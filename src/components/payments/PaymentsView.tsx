import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Building2,
  User,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Payment, PaymentMethod, PaymentType } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const PaymentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(() => storage.getPayments());
  const [customers] = useState(() => storage.getCustomers());
  const [suppliers] = useState(() => storage.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | PaymentType>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('customer_payment');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const refreshPayments = () => {
    setPayments(storage.getPayments());
  };

  const handleOpenModal = (type: PaymentType = 'customer_payment') => {
    setPaymentType(type);
    if (type === 'customer_payment') {
      const reg = customers.find((c) => c.id !== 'cust_walkin');
      setSelectedPartyId(reg ? reg.id : customers[0]?.id || '');
    } else {
      setSelectedPartyId(suppliers[0]?.id || '');
    }
    setAmount('');
    setPaymentMethod('Cash');
    setReference('');
    setNotes('');
    setSuccessMsg('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }

    let partyName = 'General Counter';
    if (paymentType === 'customer_payment') {
      const c = customers.find((cust) => cust.id === selectedPartyId);
      if (c) partyName = c.name;
    } else if (paymentType === 'supplier_payment') {
      const s = suppliers.find((supp) => supp.id === selectedPartyId);
      if (s) partyName = s.name;
    }

    const result = storage.recordPayment({
      type: paymentType,
      partyId: selectedPartyId,
      partyName,
      amount: numAmount,
      paymentMethod,
      reference,
      notes,
      actor: currentUser,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Payment recording failed');
      return;
    }

    setSuccessMsg(`Payment of PKR ${numAmount.toLocaleString()} recorded successfully!`);
    refreshPayments();
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg('');
    }, 1200);
  };

  const filtered = payments.filter((p) => {
    const matchesType = filterType === 'All' || p.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesType;

    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(q) ||
      p.partyName.toLowerCase().includes(q) ||
      (p.reference && p.reference.toLowerCase().includes(q)) ||
      p.paymentMethod.toLowerCase().includes(q);

    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Payments & Financial Vouchers (ادائیگیاں و وصولیاں)
            </h2>
            <p className="text-xs text-slate-400">
              Unified cashflow ledger for customer recoveries and supplier settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('customer_payment')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Receive Payment (گاہک سے وصولی)</span>
          </button>
          <button
            onClick={() => handleOpenModal('supplier_payment')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pay Supplier (سپلائر کو ادائیگی)</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Payment #, Party, Reference, or Method..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'All'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilterType('customer_payment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'customer_payment'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Customer Inflow (وصولی)
          </button>
          <button
            onClick={() => setFilterType('supplier_payment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'supplier_payment'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Supplier Outflow (ادائیگی)
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Voucher #</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Party Name</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
              <th className="py-3.5 px-4">Reference / Notes</th>
              <th className="py-3.5 px-4 text-center">Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No payment vouchers found.
                </td>
              </tr>
            ) : (
              filtered.map((pay) => {
                const isInflow = pay.type === 'customer_payment';

                return (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {pay.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{pay.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isInflow
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {isInflow ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>Customer Recovery</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Supplier Settlement</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{pay.partyName}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {pay.paymentMethod}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-black text-sm ${
                        isInflow ? 'text-emerald-400' : 'text-purple-400'
                      }`}
                    >
                      {formatPKR(pay.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {pay.reference && (
                        <span className="font-mono text-slate-300 font-semibold mr-1.5">
                          [{pay.reference}]
                        </span>
                      )}
                      <span>{pay.notes || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                      {pay.createdBy}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Record Financial Voucher</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Voucher Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal('customer_payment')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                        paymentType === 'customer_payment'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Customer Wasool (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal('supplier_payment')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                        paymentType === 'supplier_payment'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Supplier Pay (-)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {paymentType === 'customer_payment' ? 'Select Customer *' : 'Select Supplier *'}
                  </label>
                  <select
                    value={selectedPartyId}
                    onChange={(e) => setSelectedPartyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  >
                    {paymentType === 'customer_payment'
                      ? customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Khata Balance: PKR {c.currentBalance.toLocaleString()})
                          </option>
                        ))
                      : suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Payable: PKR {s.currentBalance.toLocaleString()})
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Payment Amount (رقم PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xl font-black text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Channel (طریقہ ادائیگی)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Cash">Cash (نقد)</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Bank Transfer">Bank Transfer (HBL / Meezan / MCB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Reference / TRX ID / Cheque #
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. JC-782190 or Cheque # 99120"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Note / Remarks</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Cleared against weekly billing"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
                  >
                    Save & Update Ledger
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
