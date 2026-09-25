import React, { useState, useRef } from 'react';
import {
  Settings,
  Store,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle,
  Download,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
  Trash2,
  Coins,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { BusinessSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Preset modern business logos
const PRESET_LOGOS = [
  {
    name: 'Modern Flow',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop&q=80',
  },
  {
    name: 'Retail Minimal',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop&q=80',
  },
  {
    name: 'Superstore',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&h=120&fit=crop&q=80',
  },
  {
    name: 'Gourmet Mart',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&h=120&fit=crop&q=80',
  },
];

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings>(() => storage.getSettings());
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [importJson, setImportJson] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof BusinessSettings, val: any) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  // Handle local image file upload and convert to base64 DataURL
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 1.5MB for localStorage)
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMsg('Logo file size must be under 1.5MB for browser storage.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleChange('logoUrl', base64);
        setSuccessMsg('Logo preview updated. Click "Save Store Branding" to apply.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings(settings, currentUser);
    setSuccessMsg('Store name, logo, and settings saved successfully!');
    // Trigger global event so Header/Sidebar updates immediately
    window.dispatchEvent(new Event('bizledger_settings_updated'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BizLedger_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    const ok = storage.importDatabaseJSON(importJson, currentUser);
    if (ok) {
      setSuccessMsg('Database restored successfully from backup!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setErrorMsg('Invalid JSON backup file.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleResetDemo = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    storage.initializeDefaults(true);
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            Store Name & Logo Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize your store identity, custom brand logo, and client invoice appearance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition"
              >
                Confirm Reset All Data
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold border border-slate-200 transition"
              title="Reset store dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: STORE BRANDING & LOGO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Store Branding & Logo (اسٹور کا نام اور لوگو)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This name and logo will appear on your top navigation bar, client invoices, and WhatsApp receipts
              </p>
            </div>
            <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Admin Exclusive
            </span>
          </div>

          {/* Logo Upload & Preview Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            {/* Live Logo Preview Box */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative group">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <Store className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">No Logo</span>
                  </div>
                )}

                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    title="Remove Logo"
                    className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-rose-300" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Store Logo</span>
            </div>

            {/* Logo Actions */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Custom Logo
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Image File...</span>
                  </button>
                  <span className="text-xs text-slate-400">PNG, JPG, SVG up to 1.5MB</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Or Paste Image URL
                </label>
                <input
                  type="url"
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/store-logo.png"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Preset Logos */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Or select a ready-to-use sample logo:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_LOGOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('logoUrl', p.url)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-[11px] text-slate-700 font-medium transition"
                    >
                      <img src={p.url} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Store Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Store Name (English) *
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Al-Rehman General Store"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Displayed in the main app header, sidebar, and client invoices
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Urdu / Alternate Store Name (اردو نام)
              </label>
              <input
                type="text"
                value={settings.urduName || ''}
                onChange={(e) => handleChange('urduName', e.target.value)}
                placeholder="الرحمٰن جنرل اسٹور اینڈ کریانہ"
                dir="rtl"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">Printed on receipts and client statements</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Tagline / Business Nature
            </label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="e.g. Wholesale & Retail Fast Moving Consumer Goods"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* SECTION 2: CONTACT & LEGAL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              Contact Details & Legal NTN
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Store Phone *</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0300-8421905"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Store Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="accounts@store.pk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                NTN / STRN Tax Registration
              </label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                placeholder="NTN: 4182904-8"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Physical Address *</label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Shop # 14-16, Commercial Market, Lahore"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* SECTION 2.5: CURRENCY & ACCOUNTING */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              Currency & Accounting Locale (کرنسی سیٹنگز)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active: {settings.currency || 'PKR'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Currency Code *</label>
              <input
                type="text"
                required
                value={settings.currency || 'PKR'}
                onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                placeholder="PKR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">ISO 4217 Currency (PKR)</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Currency Display Symbol *</label>
              <select
                value={settings.currencySymbol || 'PKR'}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="PKR">PKR (Standard ISO — e.g. PKR 1,500)</option>
                <option value="Rs.">Rs. (Rupees — e.g. Rs. 1,500)</option>
                <option value="₨">₨ (Urdu Script — e.g. ₨ 1,500)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Shown across catalog, receipts & invoices</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers inventory re-order warning</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: INVOICE & RECEIPT TERMS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Invoice Footer & Receipt Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="INV-"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Default Paper Size</label>
              <select
                value={settings.thermalPaperSize}
                onChange={(e) => handleChange('thermalPaperSize', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="80mm">80mm Thermal Paper</option>
                <option value="58mm">58mm Thermal Paper</option>
                <option value="A4">A4 Full Page Invoice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Invoice Policy Note (English)
            </label>
            <input
              type="text"
              value={settings.receiptFooter}
              onChange={(e) => handleChange('receiptFooter', e.target.value)}
              placeholder="Thank you for shopping with us! No cash refund. Exchange within 7 days."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Invoice Policy Note (Urdu)
            </label>
            <input
              type="text"
              value={settings.receiptUrduFooter || ''}
              onChange={(e) => handleChange('receiptUrduFooter', e.target.value)}
              placeholder="خریدا گیا مال رسید کے ساتھ 7 دن میں تبدیل کیا جا سکتا ہے۔"
              dir="rtl"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Save Floating/Footer Button */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500">
            Changes take effect immediately across all terminal sales and invoice printouts.
          </p>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
