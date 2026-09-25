import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  ClipboardList,
  Users as UsersIcon,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { storage } from '../../services/storage';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { ModuleKey, useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (module: ModuleKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { admin1, admin2, switchAdmin, currentUser } = useAuth();
  const sales = storage.getSales();
  const purchases = storage.getPurchases();
  const customers = storage.getCustomers();
  const products = storage.getProducts();

  const [selectedYear, setSelectedYear] = useState('2024');

  const todayStr = formatDatePK(new Date());

  // Aggregate stats
  const totalRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.grandTotal, 0),
    [sales]
  );
  const totalOrders = sales.length;
  const totalCustomerCount = customers.length;

  // Monthly data for Orders Overview (Smooth dual-curve area chart matching image.png)
  const monthlyOrdersOverview = [
    { month: 'Jan', orders: 25, profit: 12 },
    { month: 'Feb', orders: 45, profit: 24 },
    { month: 'Mar', orders: 75, profit: 48 },
    { month: 'Apr', orders: 88, profit: 62 },
    { month: 'May', orders: 82, profit: 75 },
    { month: 'Jun', orders: 78, profit: 82 },
    { month: 'Jul', orders: 65, profit: 70 },
    { month: 'Aug', orders: 68, profit: 55 },
    { month: 'Sep', orders: 48, profit: 42 },
    { month: 'Oct', orders: 42, profit: 32 },
    { month: 'Nov', orders: 40, profit: 22 },
    { month: 'Dec', orders: 20, profit: 8 },
  ];

  // Sale Analytics Donut Data (Matching image.png: Completed 70%, Distributed 15%, Returned 5%)
  const saleAnalyticsData = [
    { name: 'Completed', value: 70, color: '#7c69ef' },
    { name: 'Distributed', value: 15, color: '#38d1b4' },
    { name: 'Returned', value: 15, color: '#f87171' },
  ];

  // Sales sparkline data for bottom-left card
  const salesSparklineData = [
    { d: '1', val: 30 },
    { d: '2', val: 50 },
    { d: '3', val: 35 },
    { d: '4', val: 78 },
    { d: '5', val: 40 },
    { d: '6', val: 65 },
    { d: '7', val: 50 },
    { d: '8', val: 82 },
    { d: '9', val: 45 },
    { d: '10', val: 60 },
    { d: '11', val: 32 },
    { d: '12', val: 75 },
    { d: '13', val: 40 },
    { d: '14', val: 68 },
    { d: '15', val: 45 },
  ];

  // Purchase Analytics Bar Chart (Sold vs Purchased grouped bars matching image.png)
  const purchaseAnalyticsData = [
    { period: 'Jan', sold: 90, purchased: 45 },
    { period: 'Feb', sold: 75, purchased: 48 },
    { period: 'Mar', sold: 88, purchased: 52 },
    { period: 'Apr', sold: 72, purchased: 55 },
    { period: 'May', sold: 72, purchased: 60 },
    { period: 'Jun', sold: 92, purchased: 65 },
    { period: 'Jul', sold: 70, purchased: 48 },
    { period: 'Aug', sold: 80, purchased: 55 },
    { period: 'Sep', sold: 82, purchased: 52 },
    { period: 'Oct', sold: 78, purchased: 62 },
    { period: 'Nov', sold: 90, purchased: 65 },
    { period: 'Dec', sold: 92, purchased: 50 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Overview Header with Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time business performance and analytics
          </p>
        </div>

        {/* Date Filter Pill matching image.png */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Apr 04, 2024 - Apr 05, 2024</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </div>

      {/* 4 TOP KPI CARDS (Precisely matching image.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: DARK TOTAL REVENUE */}
        <div className="bg-[#24252a] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[155px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-300">Total Revenue</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight">
              ${totalRevenue > 0 ? (totalRevenue / 100).toFixed(0).toLocaleString() : '45,500'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#34d399] font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>10.5%</span>
              <span className="text-slate-400 font-normal">From Last Day</span>
            </div>
          </div>
        </div>

        {/* CARD 2: SOFT MINT TOTAL ORDERS */}
        <div className="bg-[#e6faf4] text-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[155px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#10b981] shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Orders</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalOrders > 0 ? totalOrders : 700}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>10.9%</span>
              <span className="text-slate-400 font-normal">From Last Day</span>
            </div>
          </div>
        </div>

        {/* CARD 3: SOFT BLUSH PINK TOTAL CUSTOMERS */}
        <div className="bg-[#fef0f4] text-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[155px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#f43f5e] shadow-xs">
              <UsersIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Customers</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCustomerCount > 0 ? totalCustomerCount : 230}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12.5%</span>
              <span className="text-slate-400 font-normal">From Last Day</span>
            </div>
          </div>
        </div>

        {/* CARD 4: SOFT BABY BLUE CUSTOMER GROWTH */}
        <div className="bg-[#edf4fc] text-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[155px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#3b82f6] shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Customer Growth</span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">110</div>
            <div className="flex items-center gap-1.5 text-xs text-[#f43f5e] font-semibold mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>0.5%</span>
              <span className="text-slate-400 font-normal">From Last Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: ORDERS OVERVIEW + SALE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: ORDERS OVERVIEW (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Orders Overview</h2>

            <div className="flex items-center gap-4">
              {/* Legend: Orders (purple) & Profit (teal) */}
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c69ef]" />
                  <span>Orders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38d1b4]" />
                  <span>Profit</span>
                </div>
              </div>

              {/* Year Dropdown */}
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer">
                <span>{selectedYear}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Area Chart matching image.png */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyOrdersOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c69ef" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c69ef" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38d1b4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38d1b4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `${v}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#23242a] text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#7c69ef]" />
                            <span>Orders: ${payload[0]?.value}.00</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#38d1b4]" />
                            <span>Profit: ${payload[1]?.value}.00</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#7c69ef"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#38d1b4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: SALE ANALYTICS (Donut 90% Completed) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sale Analytics</h2>
          </div>

          {/* Donut Chart with Center Percentage */}
          <div className="relative h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={saleAnalyticsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {saleAnalyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center percentage label matching image.png */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">90%</span>
              <span className="text-[10px] text-slate-400 font-medium">Total completed</span>
            </div>
          </div>

          {/* Legend items matching image.png */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c69ef]" />
                <span className="text-slate-600">Completed</span>
              </div>
              <span className="text-slate-900 font-bold">70%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38d1b4]" />
                <span className="text-slate-600">Distributed</span>
              </div>
              <span className="text-slate-900 font-bold">15%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                <span className="text-slate-600">Returned</span>
              </div>
              <span className="text-slate-900 font-bold">05%</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SALES SPARKLINE + PURCHASE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: SALES (3 STATS + LINE CHART) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Sales</h2>

            {/* 3 Columns matching image.png */}
            <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Total</span>
                <div className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  9,5868
                </div>
              </div>
              <div className="border-l border-slate-100 pl-3">
                <span className="text-[11px] text-slate-400 font-medium">This Month</span>
                <div className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  10,98
                </div>
              </div>
              <div className="border-l border-slate-100 pl-3">
                <span className="text-[11px] text-slate-400 font-medium">Today</span>
                <div className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  1,06
                </div>
              </div>
            </div>
          </div>

          {/* Smooth line chart */}
          <div className="h-36 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSparklineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#7c69ef"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: PURCHASE ANALYTICS (GROUPED BARS) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Purchase Analytics</h2>

            <div className="flex items-center gap-4">
              {/* Legend: Sold (dark) & Purchased (light) */}
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" />
                  <span>Sold</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                  <span>Purchased</span>
                </div>
              </div>

              {/* Year Dropdown */}
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer">
                <span>{selectedYear}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart matching image.png */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseAnalyticsData} barGap={4} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `${v}k`}
                />
                <Bar dataKey="sold" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={14} />
                <Bar dataKey="purchased" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
