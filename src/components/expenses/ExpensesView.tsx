import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Zap,
  Home,
  Wifi,
  Users,
  Truck,
  Wrench,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  X,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const ExpensesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const refreshExpenses = () => {
    setExpenses(storage.getExpenses());
  };

  const categoriesList: ExpenseCategory[] = [
    'Electricity',
    'Rent',
    'Internet',
    'Salary',
    'Transport',
    'Maintenance',
    'Marketing',
    'Other',
  ];

  const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
    Electricity: Zap,
    Rent: Home,
    Internet: Wifi,
    Salary: Users,
    Transport: Truck,
    Maintenance: Wrench,
    Marketing: TrendingUp,
    Other: Wallet,
  };

  const handleOpenAdd = () => {
    setCategory('Electricity');
    setAmount('');
    setPaymentMethod('Cash');
    setDescription('');
    setReference('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a description.');
      return;
    }

    const result = storage.recordExpense({
      category,
      amount: numAmount,
      paymentMethod,
      description: description.trim(),
      reference: reference.trim(),
      actor: currentUser,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to record expense');
      return;
    }

    setSuccessMsg(`Expense of PKR ${numAmount.toLocaleString()} recorded successfully!`);
    refreshExpenses();
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg('');
    }, 1200);
  };

  // Summaries
  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filtered = expenses.filter((e) => {
    const matchesCat =
      selectedCategoryFilter === 'All' || e.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesSearch =
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.reference && e.reference.toLowerCase().includes(q)) ||
      e.expenseNumber.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Voucher #', 'Date', 'Category', 'Description', 'Amount (PKR)', 'Payment Method', 'Reference', 'Officer'];
    const rows = expenses.map((e) => [
      `"${e.expenseNumber}"`,
      `"${e.date}"`,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMethod,
      `"${e.reference || ''}"`,
      `"${e.recordedBy}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_${formatDatePK(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Shop Expenses & Overheads (دکان کے اخراجات)
            </h2>
            <p className="text-xs text-slate-400">
              Track utility bills (LESCO/K-Electric), rent, salaries, and maintenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense (نیا خرچہ)</span>
          </button>
        </div>
      </div>

      {/* Category breakdown pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categoriesList.map((cat) => {
          const Icon = categoryIcons[cat];
          const totalForCat = expenses
            .filter((e) => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0);

          return (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategoryFilter(selectedCategoryFilter === cat ? 'All' : cat)
              }
              className={`p-3 rounded-2xl border text-left transition ${
                selectedCategoryFilter === cat
                  ? 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500'
                  : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 text-rose-400 mb-1" />
              <div className="text-[11px] font-semibold truncate">{cat}</div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                {formatPKR(totalForCat)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, reference, or category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Recorded: <span className="font-bold text-rose-400 font-mono">{formatPKR(totalExpenseAmount)}</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Voucher #</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Channel</th>
              <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4 text-center">Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No expense records found.
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {exp.expenseNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{exp.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-sm truncate">
                    {exp.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{exp.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                    {formatPKR(exp.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {exp.reference || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                    {exp.recordedBy}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-rose-400" />
                <span>Add Shop Expense (خرچہ درج کریں)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
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
                  <label className="text-slate-300 font-semibold block mb-1">
                    Expense Category (قسم) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  >
                    <option value="Electricity">Electricity / واپڈا بل (LESCO / K-Electric)</option>
                    <option value="Rent">Shop Rent (دکان کا کرایہ)</option>
                    <option value="Internet">Internet / فون و انٹرنیٹ (PTCL / Nayatel)</option>
                    <option value="Salary">Staff Salary (ملازمین کی تنخواہ)</option>
                    <option value="Transport">Transport / کرایہ گاڑی / ایندھن</option>
                    <option value="Maintenance">Maintenance / مرمت و سروس</option>
                    <option value="Marketing">Marketing / اشتہارات</option>
                    <option value="Other">Other / متفرق اخراجات</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Amount (رقم PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xl font-black text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Paid via (ادائیگی کا ذریعہ)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Cash">Cash (دکان کے کیش سے)</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer (HBL / Meezan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Description / Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Electricity bill for September or Generator Fuel"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Reference / Bill Consumer #
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. LESCO-998810 / Cash Voucher #12"
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
                    className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30"
                  >
                    Save Expense
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
