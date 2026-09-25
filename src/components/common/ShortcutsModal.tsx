import React from 'react';
import { X, Keyboard, Zap, QrCode } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', label: 'Quick Product Search', description: 'Focus product search bar in POS' },
    { key: 'F4', label: 'Select Customer', description: 'Jump to Customer selection dropdown' },
    { key: 'F8', label: 'Open Checkout', description: 'Proceed with current cart items' },
    { key: 'Ctrl + Enter', label: 'Complete Sale', description: 'Instantly finalize & print receipt' },
    { key: 'Esc', label: 'Close / Cancel', description: 'Dismiss active popup or clear search' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span>POS Keyboard Shortcuts (کی بورڈ شارٹ کٹس)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="space-y-2">
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">{sc.label}</div>
                  <div className="text-[11px] text-slate-400">{sc.description}</div>
                </div>
                <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 text-emerald-400 border border-slate-700 rounded-md shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <QrCode className="w-4 h-4" />
              <span>Barcode Scanner Support (بار کوڈ اسکینر)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard USB & Bluetooth handheld barcode scanners are automatically captured without clicking anywhere. Scan any product barcode to add it to the cart instantly.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-800/20 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            Got it (سمجھ گیا)
          </button>
        </div>
      </div>
    </div>
  );
};
