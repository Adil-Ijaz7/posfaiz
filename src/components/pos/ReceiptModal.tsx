import React, { useState } from 'react';
import { X, Printer, Download, Store, Check, Copy } from 'lucide-react';
import { Sale } from '../../types';
import { storage } from '../../services/storage';
import { formatPKR, formatDateTimePK } from '../../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'A4'>('80mm');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !sale) return null;

  const settings = storage.getSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReceipt = () => {
    const lines = [
      `==============================`,
      settings.name,
      settings.urduName || '',
      settings.address,
      `Phone: ${settings.phone}`,
      `NTN: ${settings.taxNumber}`,
      `==============================`,
      `Invoice #: ${sale.invoiceNumber}`,
      `Date: ${formatDateTimePK(sale.timestamp)}`,
      `Customer: ${sale.customerName}`,
      `Cashier: ${sale.cashierName}`,
      `------------------------------`,
      ...sale.items.map(
        (it) =>
          `${it.productName}\n  ${it.quantity} x ${it.unitPrice} = PKR ${it.total}`
      ),
      `------------------------------`,
      `Subtotal:    PKR ${sale.subtotal}`,
      sale.discount > 0 ? `Discount:   -PKR ${sale.discount}` : null,
      sale.tax > 0 ? `Tax:        +PKR ${sale.tax}` : null,
      `GRAND TOTAL: PKR ${sale.grandTotal}`,
      `PAID:        PKR ${sale.amountPaid} (${sale.paymentMethod})`,
      sale.remainingDue > 0 ? `BALANCE DUE: PKR ${sale.remainingDue}` : null,
      `==============================`,
      settings.receiptFooter,
      settings.receiptUrduFooter || '',
      `==============================`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Controls Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Format:</span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setPaperSize('80mm')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  paperSize === '80mm'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPaperSize('58mm')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  paperSize === '58mm'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm Thermal
              </button>
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  paperSize === 'A4'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Slip
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTextReceipt}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Copy receipt text to clipboard (e.g. for WhatsApp)"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950 flex justify-center">
          <div
            id="printable-receipt"
            className={`bg-white text-black p-5 shadow-2xl transition-all font-mono leading-tight ${
              paperSize === '58mm'
                ? 'w-[260px] text-[11px]'
                : paperSize === '80mm'
                ? 'w-[340px] text-xs'
                : 'w-full max-w-xl text-sm p-8'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-center mb-1">
                <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-xs">
                  <Store className="w-4 h-4 text-black" />
                </div>
              </div>
              <h2 className="font-extrabold text-base uppercase tracking-wider">{settings.name}</h2>
              {settings.urduName && (
                <div className="text-xs font-semibold text-gray-800 font-sans mt-0.5">
                  {settings.urduName}
                </div>
              )}
              <p className="text-[11px] text-gray-700 mt-1">{settings.address}</p>
              <p className="text-[11px] text-gray-700">Phone: {settings.phone}</p>
              {settings.taxNumber && (
                <p className="text-[10px] text-gray-600">{settings.taxNumber}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>INVOICE #:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE & TIME:</span>
                <span>{formatDateTimePK(sale.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-semibold">{sale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="font-bold uppercase">{sale.paymentStatus}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-gray-400">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-[10px] uppercase">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index} className="text-[11px]">
                      <td className="py-1 pr-1">
                        <div className="font-semibold truncate max-w-[130px]">{item.productName}</div>
                      </td>
                      <td className="py-1 text-center font-mono">{item.quantity}</td>
                      <td className="py-1 text-right font-mono">{item.unitPrice}</td>
                      <td className="py-1 text-right font-mono font-bold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPKR(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatPKR(sale.discount)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <span>Sales Tax:</span>
                  <span className="font-mono">+{formatPKR(sale.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-gray-400">
                <span>GRAND TOTAL:</span>
                <span className="font-mono">{formatPKR(sale.grandTotal)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold">
                  {formatPKR(sale.amountPaid)} ({sale.paymentMethod})
                </span>
              </div>

              {sale.remainingDue > 0 && (
                <div className="flex justify-between font-bold text-red-600 pt-1">
                  <span>BALANCE DUE (ادھار):</span>
                  <span className="font-mono">{formatPKR(sale.remainingDue)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center space-y-1 text-[10px] text-gray-700">
              <p className="font-semibold">{settings.receiptFooter}</p>
              {settings.receiptUrduFooter && (
                <p className="font-sans font-medium">{settings.receiptUrduFooter}</p>
              )}
              <p className="text-[9px] text-gray-500 pt-1">Powered by BizLedger POS • www.bizledger.pk</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            Close (بند کریں)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt (پرنٹ رسید)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
