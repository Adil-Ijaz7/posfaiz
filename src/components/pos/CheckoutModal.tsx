import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  AlertCircle,
  CheckCircle,
  User,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    grandTotal,
    subtotal,
    discountAmount,
    taxAmount,
    selectedCustomer,
    processSale,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Default amount paid to grandTotal when opening
  useEffect(() => {
    if (isCheckoutOpen) {
      if (paymentMethod === 'Credit') {
        setAmountPaidInput('0');
      } else {
        setAmountPaidInput(grandTotal.toString());
      }
      setErrorMessage('');
    }
  }, [isCheckoutOpen, grandTotal, paymentMethod]);

  if (!isCheckoutOpen) return null;

  const numericPaid = parseFloat(amountPaidInput) || 0;
  const changeOrRemaining = grandTotal - numericPaid;

  // Handle Quick PKR cash buttons
  const quickCashButtons = [
    { label: 'Exact', value: grandTotal },
    { label: 'PKR 500', value: 500 },
    { label: 'PKR 1,000', value: 1000 },
    { label: 'PKR 2,000', value: 2000 },
    { label: 'PKR 5,000', value: 5000 },
  ];

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'Credit') {
      setAmountPaidInput('0');
    } else if (numericPaid === 0) {
      setAmountPaidInput(grandTotal.toString());
    }
  };

  const handleCompleteSale = () => {
    setErrorMessage('');

    // If Credit sale, ensure customer is not anonymous walk-in without a name
    if (changeOrRemaining > 0 && selectedCustomer?.id === 'cust_walkin') {
      setErrorMessage(
        'Credit/Udhaar sales cannot be assigned to anonymous Walk-in customer. Please select a registered customer.'
      );
      return;
    }

    setIsProcessing(true);
    const result = processSale(paymentMethod, numericPaid);
    setIsProcessing(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to complete sale');
    }
  };

  // Keyboard shortcut listener inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCheckoutOpen(false);
    } else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleCompleteSale();
    }
  };

  const paymentMethodsList: { id: PaymentMethod; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'Cash', label: 'Cash (نقد)', icon: Banknote, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'JazzCash', label: 'JazzCash', icon: Smartphone, color: 'text-red-400 border-red-500/40 bg-red-500/10' },
    { id: 'Easypaisa', label: 'Easypaisa', icon: Smartphone, color: 'text-green-400 border-green-500/40 bg-green-500/10' },
    { id: 'Bank Transfer', label: 'Bank (HBL/Meezan)', icon: Building, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { id: 'Credit', label: 'Credit / Udhaar (ادھار)', icon: CreditCard, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              Complete Sale & Checkout (ادائیگی و بل)
            </h2>
            <p className="text-xs text-slate-400">
              Select payment method & amount received
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Customer Summary Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>{selectedCustomer?.name || 'Walk-in Customer'}</span>
                  {selectedCustomer?.urduName && (
                    <span className="text-[11px] text-slate-400">{selectedCustomer.urduName}</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Phone: {selectedCustomer?.phone || 'N/A'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Current Balance</div>
              <div
                className={`text-xs font-bold ${
                  (selectedCustomer?.currentBalance || 0) > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {formatPKR(selectedCustomer?.currentBalance || 0)}
                {(selectedCustomer?.currentBalance || 0) > 0 && ' (Udhaar)'}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Payment Method (طریقہ ادائیگی)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentMethodsList.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => handleSelectPaymentMethod(pm.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? pm.color + ' ring-2 ring-emerald-500 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Paid Input & Quick Pakistani Cash Denominations */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Amount Received / Paid (وصول رقم)
              </label>
              <span className="text-[11px] text-slate-400">Currency: PKR</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 font-bold text-xs tracking-wider">
                PKR
              </div>
              <input
                type="number"
                value={amountPaidInput}
                onChange={(e) => setAmountPaidInput(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full pl-14 pr-4 py-3 text-2xl font-black bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight"
              />
            </div>

            {/* Quick cash pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickCashButtons.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setAmountPaidInput(q.value.toString())}
                  className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                >
                  {q.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountPaidInput('0')}
                className="px-3 py-1 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 transition"
              >
                Full Credit (0)
              </button>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-300">{formatPKR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono">-{formatPKR(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Sales Tax:</span>
                <span className="font-mono text-slate-300">+{formatPKR(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
              <span>Grand Total:</span>
              <span className="text-emerald-400 font-mono text-base">{formatPKR(grandTotal)}</span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">
                {changeOrRemaining > 0 ? 'Remaining Credit (بقایا ادھار):' : 'Change Due to Customer (واپسی رقم):'}
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  changeOrRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {formatPKR(Math.abs(changeOrRemaining))}
              </span>
            </div>

            {changeOrRemaining > 0 && selectedCustomer && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Credit Sale Note:</strong> PKR {changeOrRemaining.toLocaleString()} will be automatically debited to{' '}
                  <span className="font-bold underline">{selectedCustomer.name}&apos;s Khata</span>.
                  New closing balance will be: <strong>{formatPKR((selectedCustomer.currentBalance || 0) + changeOrRemaining)}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/40">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Ctrl + Enter</kbd> to complete
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Complete & Print (مکمل سیل)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
