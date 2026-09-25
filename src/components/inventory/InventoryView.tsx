import React, { useState } from 'react';
import {
  Layers,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  Search,
  History,
  CheckCircle,
  Package,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Product, StockMovement, StockMovementReason } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const InventoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(() => storage.getStockMovements());
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'increase' | 'decrease'>('decrease');
  const [adjustQty, setAdjustQty] = useState<string>('1');
  const [adjustReason, setAdjustReason] = useState<StockMovementReason>('Damaged');
  const [adjustRef, setAdjustRef] = useState<string>('ADJ-MANUAL');
  const [adjustError, setAdjustError] = useState<string>('');
  const [adjustSuccess, setAdjustSuccess] = useState<string>('');

  const refreshData = () => {
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Computed summary metrics
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStock && p.currentStock > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

  const handleOpenAdjust = (prod?: Product) => {
    const pId = prod ? prod.id : products[0]?.id || '';
    setSelectedProductId(pId);
    setAdjustQty('1');
    setAdjustType('decrease');
    setAdjustReason('Damaged');
    setAdjustRef('ADJ-AUDIT');
    setAdjustError('');
    setAdjustSuccess('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setAdjustError('Please enter a valid quantity greater than zero.');
      return;
    }

    const change = adjustType === 'increase' ? qty : -qty;

    const result = storage.adjustStock(
      selectedProduct.id,
      change,
      adjustReason,
      adjustRef || 'MANUAL-ADJ',
      currentUser
    );

    if (!result.success) {
      setAdjustError(result.error || 'Failed to adjust stock');
      return;
    }

    setAdjustSuccess(`Successfully updated ${selectedProduct.name} stock to ${result.newStock}!`);
    refreshData();
    setTimeout(() => {
      setIsAdjustModalOpen(false);
      setAdjustSuccess('');
    }, 1200);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.urduName && p.urduName.includes(q)) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Inventory & Warehouse Valuation (گودام و اسٹاک)
            </h2>
            <p className="text-xs text-slate-400">
              Audit stock adjustments, waste tracking, and valuation
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAdjust()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Stock Adjustment (اسٹاک درستگی)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold">Total Catalog</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {products.length} Items
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold">Total Stock Units</div>
          <div className="text-xl font-black text-cyan-400 font-mono mt-1">
            {totalStockUnits.toLocaleString()} Units
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold">Inventory Valuation</div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {formatPKR(totalInventoryValue)}
          </div>
          <div className="text-[10px] text-slate-400">At current cost price</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold">Low Stock Alert</div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            {lowStockCount} Products
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold">Out of Stock</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            {outOfStockCount} Products
          </div>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">Current Stock Levels</h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 font-mono">SKU</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Cost (PKR)</th>
                <th className="py-3 px-4 text-right">Stock Value (PKR)</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/30">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.minStock && p.currentStock > 0;
                const isOut = p.currentStock <= 0;
                const totalVal = p.currentStock * p.purchasePrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.name}</div>
                      {p.urduName && (
                        <div className="text-[11px] text-slate-400">{p.urduName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.sku}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{p.unit}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatPKR(p.purchasePrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatPKR(totalVal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Log */}
      <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Stock Movement History (آڈٹ ٹریل)</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Quantity Change</th>
                <th className="py-3 px-4 text-center">Prev → New</th>
                <th className="py-3 px-4">Reason / Reference</th>
                <th className="py-3 px-4 text-center">Audited By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/30">
              {movements.slice(0, 15).map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-300">{m.date}</td>
                  <td className="py-3 px-4 font-semibold text-white">{m.productName}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.quantityChange > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {m.quantityChange > 0 ? '+ In' : '- Out'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {m.previousStock} → {m.newStock}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-semibold text-white">{m.reason}</span>{' '}
                    <span className="text-[11px] text-slate-400">({m.reference})</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                    {m.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleAdjustSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-cyan-400" />
                <span>Adjust Product Stock</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {adjustSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{adjustSuccess}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Select Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current Stock: {p.currentStock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Current On Hand:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Adjustment Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('decrease')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                        adjustType === 'decrease'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      <span>Deduct / Decrease (-)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('increase')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                        adjustType === 'increase'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add / Increase (+)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Quantity to Adjust *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Reason for Adjustment (وجہ)
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as StockMovementReason)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Damaged">Damaged / Expired Goods (خراب یا تاریخ ختم)</option>
                    <option value="Lost">Lost / Theft / Shrinkage (گمشدہ یا چوری)</option>
                    <option value="Manual Adjustment">Manual Audit Correction (گنتی کی درستگی)</option>
                    <option value="Customer Return">Customer Return (گاہک کی واپسی)</option>
                    <option value="Supplier Return">Supplier Return (سپلائر کو واپسی)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Audit Note / Ref
                  </label>
                  <input
                    type="text"
                    value={adjustRef}
                    onChange={(e) => setAdjustRef(e.target.value)}
                    placeholder="e.g. Broken in storage / Annual audit"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                {adjustError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {adjustError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/30"
                  >
                    Save Stock Adjustment
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
