import React, { useState } from 'react';
import { ShieldCheck, Plus, User, Shield, Phone, Mail, CheckCircle, Edit2, Lock } from 'lucide-react';
import { storage } from '../../services/storage';
import { User as UserType, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const UsersView: React.FC = () => {
  const { currentUser, role, refreshUsers } = useAuth();
  const [users, setUsers] = useState<UserType[]>(() => storage.getUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setUserRole('admin');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setUserRole(u.role);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userToSave: UserType = {
      id: editingUser ? editingUser.id : `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@bizledger.pk`,
      phone: phone.trim() || '-',
      role: userRole,
      active: true,
    };

    storage.saveUser(userToSave, currentUser);
    setUsers(storage.getUsers());
    refreshUsers();
    setIsModalOpen(false);
  };

  if (role !== 'admin') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted (صرف ایڈمن)</h2>
        <p className="text-xs text-slate-400">
          User & staff role administration is restricted to Admin / Owner accounts only.
          Please switch role to Admin using the top header bar to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Staff Accounts & Permissions (صارفین و عملہ)
            </h2>
            <p className="text-xs text-slate-400">
              Role-based access control for shop cashiers, accountants, and store managers
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member (نیا صارف)</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-850 border border-purple-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-purple-300">
            <Shield className="w-4 h-4" />
            <span>Admin / Store Owner</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Full unconstrained access to POS, Ledgers, Reports, Profit, Catalog, Inventory, Staff Accounts & Settings.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <User className="w-4 h-4" />
            <span>Cashier (سیلز مین / کیشئر)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Fast POS terminal, counter sales, receiving customer payments, searching products. Blocked from store profits & settings.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-blue-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Accountant (منشی / اکاؤنٹنٹ)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Customer Khata, Supplier Khata, Purchases, Vouchers, Expenses, and Financial Reports.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-850 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Staff Name</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                    {u.role === 'admin' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        {u.adminNumber === 1 || u.id === 'usr_admin' || u.name.includes('Usman')
                          ? 'Admin 1 (Primary)'
                          : 'Admin 2 (Co-Owner)'}
                      </span>
                    )}
                  </div>
                  {u.designation && (
                    <div className="text-[10px] text-slate-400 pl-9 font-normal">
                      {u.designation}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : u.role === 'cashier'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{u.phone || '—'}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Role"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>{editingUser ? 'Edit Staff Member' : 'Add Staff Member'}</span>
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
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Assigned Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white capitalize font-semibold"
                >
                  <option value="cashier">Cashier (POS & Counter Recovery)</option>
                  <option value="accountant">Accountant (Ledgers, Expenses & Reports)</option>
                  <option value="admin">Admin / Store Owner (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. staff@bizledger.pk"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Account
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
