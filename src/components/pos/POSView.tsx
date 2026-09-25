import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  Receipt,
  RotateCcw,
  Sparkles,
  Layers,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { storage } from '../../services/storage';
import { Product, Customer } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceModal } from '../invoices/InvoiceModal';

export const POSView: React.FC = () => {
  const {
    cart,
    customers,
    selectedCustomer,
    setSelectedCustomerId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    itemCount,
    discountType,
    discountValue,
    setDiscountType,
    setDiscountValue,
    notes,
    setNotes,
    setIsCheckoutOpen,
    lastCompletedSale,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    processSale,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [posError, setPosError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerSelectRef = useRef<HTMLSelectElement>(null);

  const allProducts = storage.getProducts();
  const categories = storage.getCategories();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 -> focus product search
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F4 -> focus customer dropdown
      if (e.key === 'F4') {
        e.preventDefault();
        customerSelectRef.current?.focus();
      }
      // F8 -> open checkout
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsCheckoutOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, setIsCheckoutOpen]);

  // Filtered products list
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      (product.urduName && product.urduName.includes(q)) ||
      product.sku.toLowerCase().includes(q) ||
      product.barcode.includes(q) ||
      product.brand.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Direct 1-click Cash Sale
  const handleQuickCashSale = () => {
    if (cart.length === 0) return;
    processSale('Cash', grandTotal);
  };

  // Direct 1-click Credit Sale
  const handleQuickCreditSale = () => {
    if (cart.length === 0) return;
    if (selectedCustomer?.id === 'cust_walkin') {
      setPosError('Cannot make credit/udhaar sale to Walk-in customer. Please select or add a named customer.');
      customerSelectRef.current?.focus();
      setTimeout(() => setPosError(null), 4000);
      return;
    }
    processSale('Credit', 0);
  };

  // Quick Add Customer handler
  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '-',
      address: newCustAddress.trim() || 'Counter Local',
      type: 'regular',
      openingBalance: 0,
      creditLimit: 25000,
      currentBalance: 0,
      createdAt: new Date().toISOString(),
    };

    storage.saveCustomer(newCust, storage.getUsers()[0]);
    setSelectedCustomerId(newCust.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.5rem)] p-3 sm:p-5 gap-4 bg-[#edf0f5] overflow-hidden">
      {/* LEFT AREA: Catalog, Search, Categories, Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search & Barcode Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product by Name, Barcode, SKU... [F2]"
              className="w-full pl-10 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                Clear
              </button>
            )}
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded-md">
              F2
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-semibold hidden sm:inline">Scanner Active</span>
            </div>
          </div>
        </div>

        {/* Category Filter Horizontal Scroll */}
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto border-b border-slate-100 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-[#1f2024] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-[#1f2024] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Layers className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Try searching for something else or scan a barcode.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.currentStock <= 0;
                const isLowStock = product.currentStock <= product.minStock && !isOutOfStock;
                const inCart = cart.find((c) => c.product.id === product.id);

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product, 1)}
                    className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-indigo-50/30 border-slate-200/80 hover:border-indigo-400 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {/* In-cart indicator badge */}
                    {inCart && (
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      {/* Product Image / Placeholder */}
                      <div className="w-full h-24 mb-2.5 rounded-xl bg-slate-50 overflow-hidden relative flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        )}

                        {/* Stock badge */}
                        <span
                          className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {product.currentStock} {product.unit}
                        </span>
                      </div>

                      {/* Product details */}
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                        {product.name}
                      </h4>
                      {product.urduName && (
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {product.urduName}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {product.sku}
                      </div>
                    </div>

                    {/* Price and add button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        {formatPKR(
                          selectedCustomer?.type === 'wholesale' && product.wholesalePrice
                            ? product.wholesalePrice
                            : product.sellingPrice
                        )}
                      </div>
                      <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white flex items-center justify-center transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Active Cart, Customer, Billing */}
      <div className="w-full lg:w-[410px] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Customer Selector Top Bar */}
        <div className="p-4 border-b border-slate-100 space-y-2 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Customer
            </label>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Client</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              ref={customerSelectRef}
              value={selectedCustomer?.id || 'cust_walkin'}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.urduName ? `(${c.urduName})` : ''} — Bal: PKR {c.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Khata Status Pill */}
          {selectedCustomer && selectedCustomer.id !== 'cust_walkin' && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px]">
              <span className="text-slate-500">Khata Balance:</span>
              <span
                className={`font-bold font-mono ${
                  selectedCustomer.currentBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {formatPKR(selectedCustomer.currentBalance)}
                {selectedCustomer.currentBalance > 0 && ' (Due)'}
              </span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
              <div className="text-sm font-semibold text-slate-600">Cart is empty</div>
              <p className="text-xs text-slate-400 mt-1">
                Select items from the catalog or scan barcode.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatPKR(item.unitPrice)} × {item.quantity} ={' '}
                    <span className="font-bold text-slate-900">{formatPKR(item.total)}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Billing Summary & Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal ({itemCount} items):</span>
              <span className="font-mono font-medium text-slate-900">{formatPKR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-mono font-medium">-{formatPKR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-600">{formatPKR(grandTotal)}</span>
            </div>
          </div>

          {posError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fadeIn">
              {posError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={cart.length === 0}
              onClick={handleQuickCashSale}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition"
            >
              Cash Sale
            </button>
            <button
              disabled={cart.length === 0}
              onClick={handleQuickCreditSale}
              className="py-2.5 px-3 rounded-xl bg-[#1f2024] hover:bg-black disabled:opacity-50 text-white font-bold text-xs shadow-sm transition"
            >
              Credit Sale
            </button>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
          >
            <span>Complete & Send Invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal />
      <InvoiceModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={lastCompletedSale}
      />

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreateQuickCustomer}
            className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Add New Client
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Phone (for WhatsApp Invoices)
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Main Market, Lahore"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
