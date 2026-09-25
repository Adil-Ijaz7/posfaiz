import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  BookOpen,
  CreditCard,
  ShoppingCart,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Customer, CustomerType } from '../../types';
import { formatPKR, formatDatePK } from '../../utils/formatters';
import { useAuth, ModuleKey } from '../../context/AuthContext';
import { usePOS } from '../../context/POSContext';

interface CustomersViewProps {
  onNavigate: (module: ModuleKey) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { setSelectedCustomerId } = usePOS();
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    urduName: '',
    phone: '',
    address: '',
    email: '',
    type: 'regular',
    openingBalance: 0,
    creditLimit: 50000,
    notes: '',
  });

  const refreshCustomers = () => {
    setCustomers(storage.getCustomers());
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      urduName: '',
      phone: '',
      address: '',
      email: '',
      type: 'regular',
      openingBalance: 0,
      creditLimit: 50000,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (id === 'cust_walkin') {
      setNotice('Walk-in Customer is a required default and cannot be deleted.');
      setTimeout(() => setNotice(null), 4000);
      return;
    }
    storage.deleteCustomer(id, currentUser);
    refreshCustomers();
    setNotice(`Customer "${name}" removed.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const newCust: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust_${Date.now()}`,
      name: formData.name.trim(),
      urduName: formData.urduName?.trim() || '',
      phone: formData.phone?.trim() || '-',
      address: formData.address?.trim() || '',
      email: formData.email?.trim() || '',
      type: (formData.type as CustomerType) || 'regular',
      openingBalance: Number(formData.openingBalance) || 0,
      creditLimit: Number(formData.creditLimit) || 0,
      notes: formData.notes?.trim() || '',
      currentBalance: editingCustomer ? editingCustomer.currentBalance : Number(formData.openingBalance) || 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    storage.saveCustomer(newCust, currentUser);
    refreshCustomers();
    setIsModalOpen(false);
  };

  const handleStartSaleForCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    onNavigate('pos');
  };

  const handleViewLedger = (c: Customer) => {
    onNavigate('customer-ledger');
  };

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.urduName && c.urduName.includes(q)) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Customers & Udhaar Profiles (گاہک کھاتہ دار)
            </h2>
            <p className="text-xs text-slate-400">
              Manage accounts, credit limits, balances, and quick actions
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer (نیا کھاتہ)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-fadeIn">
          {notice}
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, Urdu name, phone number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const isWalkin = customer.id === 'cust_walkin';
          const hasBalance = customer.currentBalance > 0;

          return (
            <div
              key={customer.id}
              className="p-5 rounded-3xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{customer.name}</span>
                      {customer.urduName && (
                        <span className="text-xs font-semibold text-emerald-400 font-sans">
                          ({customer.urduName})
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {customer.type}
                      </span>
                      {customer.creditLimit > 0 && (
                        <span className="text-[10px] text-slate-400">
                          Limit: {formatPKR(customer.creditLimit)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Current Udhaar
                    </div>
                    <div
                      className={`text-base font-black font-mono mt-0.5 ${
                        hasBalance ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatPKR(customer.currentBalance)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{customer.phone || 'No phone'}</span>
                  </div>
                  {customer.address && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                      &quot;{customer.notes}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartSaleForCustomer(customer)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                    title="Start new sale in POS"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>New Sale</span>
                  </button>
                  {!isWalkin && (
                    <button
                      onClick={() => handleViewLedger(customer)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                      title="Open accounting ledger"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Khata</span>
                    </button>
                  )}
                </div>

                {!isWalkin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingCustomer ? 'Edit Customer' : 'Add New Customer (نیا گاہک)'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Customer Name (نام) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ahmed Traders / Haji Ahmed"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Urdu Name (نام اردو میں)
                </label>
                <input
                  type="text"
                  value={formData.urduName || ''}
                  onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                  placeholder="مثلاً حاجی احمد ٹریڈرز"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone (موبائل)</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as CustomerType })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="regular">Regular (عام کسٹمر)</option>
                    <option value="wholesale">Wholesale (ہول سیل ڈیلر)</option>
                    <option value="walk-in">Walk-in (کاؤنٹر سیل)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Address / Market</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Shop # 12, Main Bazaar, Lahore"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Opening Balance (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingCustomer}
                    value={formData.openingBalance ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Credit Limit (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="50000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Weekly billing, pay via JazzCash"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Save Customer Account
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
