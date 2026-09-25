import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  X,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Purchase, Supplier, Product, PaymentMethod } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const PurchasesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>(() => storage.getPurchases());
  const [suppliers] = useState<Supplier[]>(() => storage.getSuppliers());
  const [products] = useState<Product[]>(() => storage.getProducts());
  const [searchQuery, setSearchQuery] = useState('');

  // New Purchase Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierInvoiceRef, setSupplierInvoiceRef] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<
    { productId: string; quantity: number; purchasePrice: number }[]
  >([]);
  const [discount, setDiscount] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshPurchases = () => {
    setPurchases(storage.getPurchases());
  };

  const handleOpenAddModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setSupplierInvoiceRef('');
    setPurchaseItems([
      {
        productId: products[0]?.id || '',
        quantity: 10,
        purchasePrice: products[0]?.purchasePrice || 70,
      },
    ]);
    setDiscount('0');
    setAmountPaid('0');
    setPaymentMethod('Bank Transfer');
    setNotes('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: products[0]?.id || '',
        quantity: 10,
        purchasePrice: products[0]?.purchasePrice || 100,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (
    idx: number,
    field: 'productId' | 'quantity' | 'purchasePrice',
    val: any
  ) => {
    const updated = [...purchaseItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      updated[idx] = {
        ...updated[idx],
        productId: val,
        purchasePrice: prod ? prod.purchasePrice : updated[idx].purchasePrice,
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        [field]: Number(val) || 0,
      };
    }
    setPurchaseItems(updated);
  };

  const subtotal = purchaseItems.reduce(
    (acc, it) => acc + it.quantity * it.purchasePrice,
    0
  );
  const numDiscount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - numDiscount);
  const numPaid = parseFloat(amountPaid) || 0;
  const remainingPayable = Math.max(0, grandTotal - numPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (purchaseItems.length === 0) {
      setErrorMsg('Please add at least one product item.');
      return;
    }

    const result = storage.createPurchase({
      supplierId: selectedSupplierId,
      supplierInvoiceRef: supplierInvoiceRef.trim(),
      items: purchaseItems,
      discount: numDiscount,
      amountPaid: numPaid,
      paymentMethod,
      notes,
      actor: currentUser,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to record purchase');
      return;
    }

    setSuccessMsg(`Purchase #${result.purchase?.invoiceNumber} recorded successfully!`);
    refreshPurchases();
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg('');
    }, 1200);
  };

  const filtered = purchases.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.invoiceNumber.toLowerCase().includes(q) ||
      (p.supplierInvoiceRef && p.supplierInvoiceRef.toLowerCase().includes(q)) ||
      p.supplierName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Purchase Orders & Inward Stock (مال کی خریداری)
            </h2>
            <p className="text-xs text-slate-400">
              Receive vendor stock, update inventory quantities, and manage supplier accounts
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Purchase (نیا مال وصول کریں)</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
        <div className="relative max-w-md w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, supplier, or bill reference..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Purchases List */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4 text-center">Items</th>
              <th className="py-3.5 px-4 text-right">Total (PKR)</th>
              <th className="py-3.5 px-4 text-right">Paid (PKR)</th>
              <th className="py-3.5 px-4 text-right">Payable (PKR)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No purchase records found.
                </td>
              </tr>
            ) : (
              filtered.map((pur) => (
                <tr key={pur.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    <div>{pur.invoiceNumber}</div>
                    {pur.supplierInvoiceRef && (
                      <div className="text-[10px] text-slate-400 font-sans">
                        Ref: {pur.supplierInvoiceRef}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{pur.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{pur.supplierName}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {pur.items.reduce((s, it) => s + it.quantity, 0)} units
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatPKR(pur.total)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                    {formatPKR(pur.amountPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-400">
                    {pur.remainingPayable > 0 ? formatPKR(pur.remainingPayable) : 'PKR 0'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pur.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : pur.status === 'Partial'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {pur.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Record Inward Stock / Purchase Order (خریداری مال)</span>
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
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
                {/* Supplier & Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Supplier / Distributor *
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Payable: PKR {s.currentBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Vendor Invoice / Bilty # (بل نمبر)
                    </label>
                    <input
                      type="text"
                      value={supplierInvoiceRef}
                      onChange={(e) => setSupplierInvoiceRef(e.target.value)}
                      placeholder="e.g. ABC-INV-9921 / Bilty 4410"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      Purchase Items (خریدی گئی اشیاء)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {purchaseItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60"
                      >
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.currentStock})
                            </option>
                          ))}
                        </select>

                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-xs"
                          />
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              handleItemChange(idx, 'purchasePrice', e.target.value)
                            }
                            placeholder="Price"
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-right text-xs"
                          />
                        </div>

                        <div className="w-24 text-right font-mono font-bold text-white text-xs">
                          {formatPKR(item.quantity * item.purchasePrice)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-300">{formatPKR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Discount:</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-right text-xs"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                    <span>Total Purchase Value:</span>
                    <span className="text-blue-400 font-mono text-base">{formatPKR(grandTotal)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Amount Paid Now (نقد ادا رقم PKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash (نقد)</option>
                        <option value="JazzCash">JazzCash</option>
                        <option value="Easypaisa">Easypaisa</option>
                        <option value="Credit">Credit (مکمل ادھار)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-semibold">
                    <span className="text-slate-300">Remaining Payable to Supplier:</span>
                    <span className="text-purple-400 font-mono font-bold text-sm">
                      {formatPKR(remainingPayable)}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30"
              >
                Save Purchase & Increase Inventory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
