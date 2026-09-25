/**
 * BizLedger POS — Point of Sale & Customer/Supplier Ledger Management System
 * Production-ready application tailored for small & medium businesses in Pakistan.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth, ModuleKey } from './context/AuthContext';
import { POSProvider } from './context/POSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ShortcutsModal } from './components/common/ShortcutsModal';

// Modules
import { POSView } from './components/pos/POSView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AdminsDashboardView } from './components/admins/AdminsDashboardView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomersView } from './components/customers/CustomersView';
import { CustomerLedgerView } from './components/customer-ledger/CustomerLedgerView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { SupplierLedgerView } from './components/supplier-ledger/SupplierLedgerView';
import { SalesView } from './components/sales/SalesView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { LoginView } from './components/auth/LoginView';
import { Lock, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, hasPermission, isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // If not authenticated, display the minimal Two Admins Login Dashboard
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // If active module is not allowed for current role, fall back to pos or dashboard
  const isAllowed = hasPermission(activeModule);

  const renderModuleContent = () => {
    if (!isAllowed) {
      return (
        <div className="p-8 max-w-md mx-auto text-center space-y-4 my-16 bg-slate-850 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Module Restricted</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The &quot;{activeModule}&quot; module is not accessible for the &quot;{role}&quot; role.
            You can use the role switcher in the header to switch to Admin/Owner or Accountant.
          </p>
          <button
            onClick={() => setActiveModule('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardView onNavigate={(mod) => setActiveModule(mod)} />;
      case 'admins-dashboard':
        return <AdminsDashboardView />;
      case 'pos':
        return <POSView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'customers':
        return <CustomersView onNavigate={(mod) => setActiveModule(mod)} />;
      case 'customer-ledger':
        return <CustomerLedgerView />;
      case 'suppliers':
        return <SuppliersView onNavigate={(mod) => setActiveModule(mod)} />;
      case 'supplier-ledger':
        return <SupplierLedgerView />;
      case 'sales':
        return <SalesView />;
      case 'purchases':
        return <PurchasesView />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return <DashboardView onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#edf0f5] text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onNavigateAdmins={() => setActiveModule('admins-dashboard')}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#edf0f5]">
          {renderModuleContent()}
        </main>
      </div>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <MainLayout />
      </POSProvider>
    </AuthProvider>
  );
}
