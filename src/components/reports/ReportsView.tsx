import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  Users,
  Building2,
  Package,
  Layers,
  Wallet,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { formatPKR, formatDatePK } from '../../utils/formatters';

type ReportTab = 'profit' | 'sales' | 'purchases' | 'receivables' | 'payables' | 'expenses';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('profit');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const sales = storage.getSales();
  const purchases = storage.getPurchases();
  const expenses = storage.getExpenses();
  const customers = storage.getCustomers();
  const suppliers = storage.getSuppliers();
  const products = storage.getProducts();

  // Filter items by selected dateRange
  const isWithinRange = (timestamp: number) => {
    if (dateRange === 'all') return true;
    const now = new Date();
    const itemDate = new Date(timestamp);

    if (dateRange === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo;
    }
    if (dateRange === 'month') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  const filteredSales = useMemo(
    () => sales.filter((s) => isWithinRange(s.timestamp)),
    [sales, dateRange]
  );
  const filteredPurchases = useMemo(
    () => purchases.filter((p) => isWithinRange(p.timestamp)),
    [purchases, dateRange]
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((e) => isWithinRange(e.timestamp)),
    [expenses, dateRange]
  );

  // Profit Calculation
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCostOfGoodsSold = filteredSales.reduce((acc, sale) => {
    const saleCOGS = sale.items.reduce(
      (sum, it) => sum + it.quantity * (it.purchasePrice || 0),
      0
    );
    return acc + saleCOGS;
  }, 0);
  const totalGrossProfit = totalSalesRevenue - totalCostOfGoodsSold;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedNetProfit = totalGrossProfit - totalExpenses;

  // Receivables & Payables
  const totalReceivables = customers.reduce(
    (acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0),
    0
  );
  const totalPayables = suppliers.reduce(
    (acc, s) => acc + (s.currentBalance > 0 ? s.currentBalance : 0),
    0
  );

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Report_${activeTab}_${formatDatePK(new Date())}.csv`;

    if (activeTab === 'profit') {
      headers = ['Metric', 'Amount (PKR)', 'Note'];
      rows = [
        ['Total Sales Revenue', totalSalesRevenue, 'All sales in period'],
        ['Cost of Goods Sold (COGS)', totalCostOfGoodsSold, 'Product purchase cost'],
        ['Gross Profit', totalGrossProfit, 'Revenue - COGS'],
        ['Total Expenses', totalExpenses, 'Rent, utilities, salaries, etc.'],
        ['Estimated Net Profit', estimatedNetProfit, 'Clearly labeled as Estimated Profit'],
      ];
    } else if (activeTab === 'receivables') {
      headers = ['Customer Name', 'Phone', 'Type', 'Credit Limit (PKR)', 'Outstanding Balance (PKR)'];
      rows = customers
        .filter((c) => c.currentBalance > 0)
        .map((c) => [
          `"${c.name}"`,
          `"${c.phone}"`,
          c.type,
          c.creditLimit,
          c.currentBalance,
        ]);
    } else if (activeTab === 'payables') {
      headers = ['Supplier Name', 'Phone', 'Address', 'Outstanding Payable (PKR)'];
      rows = suppliers
        .filter((s) => s.currentBalance > 0)
        .map((s) => [
          `"${s.name}"`,
          `"${s.phone}"`,
          `"${s.address}"`,
          s.currentBalance,
        ]);
    } else {
      headers = ['Invoice/Voucher', 'Date', 'Amount (PKR)'];
      rows = filteredSales.map((s) => [s.invoiceNumber, s.date, s.grandTotal]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Business Analytics & Reports (مالیاتی رپورٹیں)
            </h2>
            <p className="text-xs text-slate-400">
              Profit calculation, cash recoveries, supplier payables, and audit summaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'today' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'week' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'month' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'profit'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Estimated Profit Report (منافع رپورٹ)</span>
        </button>
        <button
          onClick={() => setActiveTab('receivables')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'receivables'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Receivables (ادھار ریکوری)</span>
        </button>
        <button
          onClick={() => setActiveTab('payables')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'payables'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Supplier Payables (واجب الادا سپلائرز)</span>
        </button>
      </div>

      {/* Tab 1: Estimated Profit Report */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold">Total Sales Revenue</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {formatPKR(totalSalesRevenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {filteredSales.length} Completed Invoices
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold">Cost of Goods Sold (COGS)</div>
              <div className="text-2xl font-black text-slate-300 font-mono mt-1">
                {formatPKR(totalCostOfGoodsSold)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Direct item cost of products sold
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold">Total Expenses</div>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {formatPKR(totalExpenses)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {filteredExpenses.length} Expense vouchers
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Estimated Net Profit
              </div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  estimatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPKR(estimatedNetProfit)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Gross Profit (PKR {totalGrossProfit.toLocaleString()}) - Expenses
              </div>
            </div>
          </div>

          {/* Profit Calculation Methodology Card */}
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Profit Calculation Ledger (حساب کتاب منافع)</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>(+) Total Sales Revenue:</span>
                <span className="font-bold text-white text-sm">{formatPKR(totalSalesRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>(-) Cost of Goods Sold (Purchase Cost × Sold Qty):</span>
                <span className="font-bold text-slate-300 text-sm">-{formatPKR(totalCostOfGoodsSold)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-800 font-bold">
                <span>(=) Total Gross Profit:</span>
                <span className="text-base">{formatPKR(totalGrossProfit)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-400">
                <span>(-) Operating Expenses (Rent, Utility, Salary, etc.):</span>
                <span className="font-bold text-sm">-{formatPKR(totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-500/40 text-base font-black">
                <span className="text-white">(=) Estimated Net Profit:</span>
                <span className={estimatedNetProfit >= 0 ? 'text-emerald-400 text-lg' : 'text-rose-400 text-lg'}>
                  {formatPKR(estimatedNetProfit)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <strong>Accounting Note:</strong> As required, this is labeled as &quot;Estimated Profit&quot; based on POS sales minus item cost minus shop expenses. Full double-entry depreciation & tax accrual are reserved for SaaS tier.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Receivables Aging & Customer Udhaar */}
      {activeTab === 'receivables' && (
        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Outstanding Customer Balances (ادھار فہرست)</h3>
              <p className="text-xs text-slate-400">Total market credit to be recovered: {formatPKR(totalReceivables)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Credit Limit (PKR)</th>
                  <th className="py-3 px-4 text-right text-amber-400 font-bold">Outstanding Udhaar (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                {customers
                  .filter((c) => c.currentBalance > 0)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.phone}</td>
                      <td className="py-3 px-4 capitalize text-slate-300">{c.type}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatPKR(c.creditLimit)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                        {formatPKR(c.currentBalance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Supplier Payables */}
      {activeTab === 'payables' && (
        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Outstanding Supplier Payables (واجب الادا واجبات)</h3>
              <p className="text-xs text-slate-400">Total liability owed to wholesale vendors: {formatPKR(totalPayables)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right text-purple-400 font-bold">Outstanding Payable (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                {suppliers
                  .filter((s) => s.currentBalance > 0)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.phone}</td>
                      <td className="py-3 px-4 text-slate-300">{s.address}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-400 text-sm">
                        {formatPKR(s.currentBalance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
