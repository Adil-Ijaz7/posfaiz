import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  Share2,
  Building2,
  Phone,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import { Sale } from '../../types';
import { storage } from '../../services/storage';
import { formatPKR, formatDatePK, formatDateTimePK } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, sale }) => {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen || !sale) return null;

  const settings = storage.getSettings();
  const customer = storage.getCustomers().find((c) => c.id === sale.customerId);
  const clientPhone = sale.customerPhone || customer?.phone || '';
  const clientEmail = customer?.email || '';

  // Clean phone number for WhatsApp (e.g. 03001234567 -> 923001234567)
  const formatPhoneForWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.slice(1);
    }
    return clean;
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate WhatsApp message and open WhatsApp Web/App
  const handleSendWhatsApp = () => {
    const waNumber = formatPhoneForWhatsApp(clientPhone);
    const itemList = sale.items
      .map((it) => `• ${it.productName} (x${it.quantity}) - PKR ${it.total.toLocaleString()}`)
      .join('%0A');

    const message = `*INVOICE: ${sale.invoiceNumber}*%0A` +
      `*Store:* ${settings.name}%0A` +
      `*Date:* ${formatDatePK(new Date(sale.timestamp))}%0A` +
      `*Customer:* ${sale.customerName}%0A` +
      `--------------------------------%0A` +
      `*Items:*%0A${itemList}%0A` +
      `--------------------------------%0A` +
      `*Grand Total:* PKR ${sale.grandTotal.toLocaleString()}%0A` +
      `*Amount Paid:* PKR ${sale.amountPaid.toLocaleString()} (${sale.paymentMethod})%0A` +
      (sale.remainingDue > 0 ? `*Balance Due:* PKR ${sale.remainingDue.toLocaleString()}%0A` : '') +
      `--------------------------------%0A` +
      `Thank you for your business!%0A` +
      `${settings.phone}`;

    const url = waNumber
      ? `https://wa.me/${waNumber}?text=${message}`
      : `https://wa.me/?text=${message}`;

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    storage.recordAudit(
      'sys',
      'Admin',
      'SEND_INVOICE_WHATSAPP',
      'Invoice',
      sale.invoiceNumber,
      `Sent invoice ${sale.invoiceNumber} to ${sale.customerName} via WhatsApp`
    );
  };

  // Open Email modal
  const handleOpenEmail = () => {
    setRecipientEmail(clientEmail || '');
    setEmailSubject(`Invoice ${sale.invoiceNumber} from ${settings.name}`);
    setEmailBody(
      `Dear ${sale.customerName},\n\n` +
      `Thank you for shopping with ${settings.name}.\n\n` +
      `Here is a summary of your invoice ${sale.invoiceNumber} dated ${formatDatePK(new Date(sale.timestamp))}:\n` +
      `Total Amount: PKR ${sale.grandTotal.toLocaleString()}\n` +
      `Amount Paid: PKR ${sale.amountPaid.toLocaleString()}\n` +
      (sale.remainingDue > 0 ? `Balance Due: PKR ${sale.remainingDue.toLocaleString()}\n\n` : '\n') +
      `Please let us know if you have any questions.\n\n` +
      `Best regards,\n${settings.name}\n${settings.phone}`
    );
    setEmailSent(false);
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    storage.recordAudit(
      'sys',
      'Admin',
      'SEND_INVOICE_EMAIL',
      'Invoice',
      sale.invoiceNumber,
      `Sent invoice ${sale.invoiceNumber} to ${recipientEmail}`
    );
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSent(false);
    }, 1800);
  };

  const handleCopyInvoiceText = () => {
    const text =
      `==============================\n` +
      `${settings.name}\n` +
      `${settings.address}\n` +
      `Phone: ${settings.phone}\n` +
      `NTN: ${settings.taxNumber}\n` +
      `==============================\n` +
      `Invoice #: ${sale.invoiceNumber}\n` +
      `Date: ${formatDateTimePK(sale.timestamp)}\n` +
      `Customer: ${sale.customerName}\n` +
      `------------------------------\n` +
      sale.items.map((it) => `${it.productName} x ${it.quantity} = PKR ${it.total}`).join('\n') +
      `\n------------------------------\n` +
      `Subtotal:    PKR ${sale.subtotal}\n` +
      (sale.discount > 0 ? `Discount:   -PKR ${sale.discount}\n` : '') +
      `Grand Total: PKR ${sale.grandTotal}\n` +
      `Paid:        PKR ${sale.amountPaid} (${sale.paymentMethod})\n` +
      (sale.remainingDue > 0 ? `Balance Due: PKR ${sale.remainingDue}\n` : '') +
      `==============================\n` +
      `${settings.receiptFooter}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] border border-slate-100">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Invoice #{sale.invoiceNumber}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                sale.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : sale.paymentStatus === 'Partial'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {sale.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Send Button */}
            <button
              onClick={handleSendWhatsApp}
              title="Send to client via WhatsApp"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Email Send Button */}
            <button
              onClick={handleOpenEmail}
              title="Send invoice via Email"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="Print Invoice"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyInvoiceText}
              title="Copy text breakdown"
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white">
          {/* Invoice Header: Store Brand & Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-sm">
                  {settings.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {settings.name}
                </h1>
                {settings.urduName && (
                  <p className="text-xs text-slate-500 font-medium">{settings.urduName}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{settings.address}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>Phone: {settings.phone}</span>
                  {settings.taxNumber && <span>• NTN: {settings.taxNumber}</span>}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                INVOICE
              </div>
              <div className="font-mono text-xs text-indigo-600 font-semibold mt-0.5">
                {sale.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date: {formatDatePK(new Date(sale.timestamp))}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {formatDateTimePK(sale.timestamp).split(' ')[1]} PKT
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Billed To (گاہک)
              </div>
              <div className="font-bold text-slate-900 text-sm">{sale.customerName}</div>
              {clientPhone && <div className="text-slate-600 mt-0.5 font-mono">{clientPhone}</div>}
              {customer?.address && <div className="text-slate-500 mt-0.5">{customer.address}</div>}
              {customer?.currentBalance !== undefined && (
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                  <span>Khata Balance:</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {customer.currentBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Details
              </div>
              <div className="text-slate-600">
                Payment Method: <span className="font-semibold text-slate-900">{sale.paymentMethod}</span>
              </div>
              <div className="text-slate-600">
                Authorized By: <span className="text-slate-800 font-medium">{sale.cashierName}</span>
              </div>
              {sale.notes && (
                <div className="text-[11px] text-slate-500 italic mt-1">&quot;{sale.notes}&quot;</div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-slate-900">{it.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-800">
                      {it.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">
                      PKR {it.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                      PKR {it.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Summary */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500 space-y-1 max-w-xs">
              <div className="font-semibold text-slate-700">Notice & Terms:</div>
              <p className="text-[11px] leading-relaxed">
                {settings.receiptFooter || 'Exchange within 7 days with valid receipt.'}
              </p>
              {settings.receiptUrduFooter && (
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {settings.receiptUrduFooter}
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">PKR {sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">-PKR {sale.discount.toLocaleString()}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-mono">+PKR {sale.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-600">PKR {sale.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono font-semibold">PKR {sale.amountPaid.toLocaleString()}</span>
              </div>
              {sale.remainingDue > 0 && (
                <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-dashed border-slate-200">
                  <span>Balance Due:</span>
                  <span className="font-mono">PKR {sale.remainingDue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="no-print px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official BizLedger Invoice</span>
          <span>Automated Client Dispatch Ready</span>
        </div>
      </div>

      {/* EMAIL DISPATCH DIALOG */}
      {showEmailModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSendEmailSubmit}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Email Invoice to Client</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900">Invoice Sent Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Invoice {sale.invoiceNumber} has been delivered to {recipientEmail}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Message Preview</label>
                    <textarea
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invoice Now</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
