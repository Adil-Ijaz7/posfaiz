/**
 * BizLedger POS - Transactional Storage Engine & Business Logic Core
 * Handles atomic operations for Sales, Purchases, Ledgers, Payments, Stock, and Audit logs.
 * Fully offline-capable and persistent.
 */

import {
  AuditLog,
  BusinessSettings,
  Category,
  Customer,
  Expense,
  LedgerEntry,
  Payment,
  PaymentMethod,
  Product,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  StockMovement,
  Supplier,
  User,
} from '../types';
import {
  initialCategories,
  initialCustomerLedger,
  initialCustomers,
  initialExpenses,
  initialPayments,
  initialProducts,
  initialPurchases,
  initialSales,
  initialSettings,
  initialStockMovements,
  initialSupplierLedger,
  initialSuppliers,
  initialUsers,
} from '../db/initialData';
import { formatDatePK } from '../utils/formatters';

const STORAGE_KEYS = {
  SETTINGS: 'bizledger_settings',
  USERS: 'bizledger_users',
  CATEGORIES: 'bizledger_categories',
  PRODUCTS: 'bizledger_products',
  CUSTOMERS: 'bizledger_customers',
  SUPPLIERS: 'bizledger_suppliers',
  CUSTOMER_LEDGER: 'bizledger_customer_ledger',
  SUPPLIER_LEDGER: 'bizledger_supplier_ledger',
  SALES: 'bizledger_sales',
  PURCHASES: 'bizledger_purchases',
  PAYMENTS: 'bizledger_payments',
  EXPENSES: 'bizledger_expenses',
  STOCK_MOVEMENTS: 'bizledger_stock_movements',
  AUDIT_LOGS: 'bizledger_audit_logs',
};

class StorageEngine {
  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (e) {
      console.error(`Failed to load ${key} from storage:`, e);
    }
    return defaultValue;
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
    }
  }

  // Initializer
  public initializeDefaults(force = false): void {
    if (force || !localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.save(STORAGE_KEYS.SETTINGS, initialSettings);
      this.save(STORAGE_KEYS.USERS, initialUsers);
      this.save(STORAGE_KEYS.CATEGORIES, initialCategories);
      this.save(STORAGE_KEYS.PRODUCTS, initialProducts);
      this.save(STORAGE_KEYS.CUSTOMERS, initialCustomers);
      this.save(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
      this.save(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
      this.save(STORAGE_KEYS.SUPPLIER_LEDGER, initialSupplierLedger);
      this.save(STORAGE_KEYS.SALES, initialSales);
      this.save(STORAGE_KEYS.PURCHASES, initialPurchases);
      this.save(STORAGE_KEYS.PAYMENTS, initialPayments);
      this.save(STORAGE_KEYS.EXPENSES, initialExpenses);
      this.save(STORAGE_KEYS.STOCK_MOVEMENTS, initialStockMovements);
      this.save(STORAGE_KEYS.AUDIT_LOGS, [
        {
          id: 'audit_init',
          timestamp: Date.now(),
          date: formatDatePK(new Date()),
          userId: 'usr_admin',
          userName: 'Muhammad Usman',
          action: 'SYSTEM_INITIALIZE',
          entity: 'System',
          entityId: 'root',
          details: 'Initialized BizLedger POS database with standard Pakistani retail demo catalog.',
        },
      ]);
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public recordAudit(
    userId: string,
    userName: string,
    action: string,
    entity: string,
    entityId: string,
    details: string,
    oldValue?: string,
    newValue?: string
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      date: formatDatePK(new Date()),
      userId,
      userName,
      action,
      entity,
      entityId,
      details,
      oldValue,
      newValue,
    };
    logs.unshift(newLog);
    this.save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // retain last 500
  }

  // --- Settings ---
  public getSettings(): BusinessSettings {
    const s = this.load<BusinessSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    if (!s.currency || s.currencySymbol === '₨') {
      s.currency = 'PKR';
      s.currencySymbol = 'PKR';
      this.save(STORAGE_KEYS.SETTINGS, s);
    }
    return s;
  }

  public updateSettings(settings: BusinessSettings, user: User): void {
    this.save(STORAGE_KEYS.SETTINGS, settings);
    this.recordAudit(
      user.id,
      user.name,
      'UPDATE_SETTINGS',
      'Settings',
      settings.id,
      'Updated business settings & receipt config'
    );
  }

  // --- Users ---
  public getUsers(): User[] {
    let list = this.load<User[]>(STORAGE_KEYS.USERS, initialUsers);
    // Restrict strictly to the Two Admins
    list = list.filter((u) => u.id === 'usr_admin' || u.id === 'usr_admin_2');
    const hasAdmin1 = list.some((u) => u.id === 'usr_admin');
    const hasAdmin2 = list.some((u) => u.id === 'usr_admin_2');
    if (!hasAdmin1 || !hasAdmin2 || list.length !== 2) {
      list = [...initialUsers];
      this.save(STORAGE_KEYS.USERS, list);
    }
    return list;
  }

  public saveUser(user: User, actor: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
      this.recordAudit(actor.id, actor.name, 'UPDATE_USER', 'User', user.id, `Updated user ${user.name}`);
    } else {
      users.push(user);
      this.recordAudit(actor.id, actor.name, 'CREATE_USER', 'User', user.id, `Created user ${user.name} (${user.role})`);
    }
    this.save(STORAGE_KEYS.USERS, users);
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.load<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  public saveCategory(category: Category, actor: User): void {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      cats[idx] = category;
    } else {
      cats.push(category);
    }
    this.save(STORAGE_KEYS.CATEGORIES, cats);
    this.recordAudit(actor.id, actor.name, 'SAVE_CATEGORY', 'Category', category.id, `Saved category ${category.name}`);
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.load<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public saveProduct(product: Product, actor: User): void {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      const old = products[idx];
      products[idx] = product;
      this.recordAudit(
        actor.id,
        actor.name,
        'UPDATE_PRODUCT',
        'Product',
        product.id,
        `Updated product ${product.name}`,
        JSON.stringify(old),
        JSON.stringify(product)
      );
    } else {
      products.push(product);
      this.recordAudit(
        actor.id,
        actor.name,
        'CREATE_PRODUCT',
        'Product',
        product.id,
        `Created product ${product.name} with price PKR ${product.sellingPrice}`
      );
    }
    this.save(STORAGE_KEYS.PRODUCTS, products);
  }

  public deleteProduct(id: string, actor: User): void {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (target) {
      const filtered = products.filter((p) => p.id !== id);
      this.save(STORAGE_KEYS.PRODUCTS, filtered);
      this.recordAudit(actor.id, actor.name, 'DELETE_PRODUCT', 'Product', id, `Deleted product ${target.name}`);
    }
  }

  // --- Inventory Movements & Adjustments ---
  public getStockMovements(): StockMovement[] {
    return this.load<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public adjustStock(
    productId: string,
    quantityChange: number,
    reason: StockMovement['reason'],
    reference: string,
    actor: User
  ): { success: boolean; newStock: number; error?: string } {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      return { success: false, newStock: 0, error: 'Product not found' };
    }

    const previousStock = prod.currentStock;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      return { success: false, newStock: previousStock, error: 'Stock cannot be negative' };
    }

    prod.currentStock = newStock;
    this.save(STORAGE_KEYS.PRODUCTS, products);

    // Record movement
    const movements = this.getStockMovements();
    const movement: StockMovement = {
      id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: prod.name,
      date: formatDatePK(new Date()),
      timestamp: Date.now(),
      type: quantityChange >= 0 ? 'In' : 'Out',
      quantityChange,
      previousStock,
      newStock,
      reason,
      reference,
      recordedBy: actor.name,
    };
    movements.unshift(movement);
    this.save(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

    this.recordAudit(
      actor.id,
      actor.name,
      'STOCK_ADJUSTMENT',
      'Inventory',
      productId,
      `Adjusted ${prod.name} stock: ${previousStock} -> ${newStock} (${quantityChange >= 0 ? '+' : ''}${quantityChange}) Reason: ${reason}`
    );

    return { success: true, newStock };
  }

  // --- Customers & Balances ---
  public getCustomers(): Customer[] {
    const customers = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    // Dynamically compute derived currentBalance from ledger to prevent inconsistency
    return customers.map((c) => ({
      ...c,
      currentBalance: this.calculateCustomerBalance(c.id, c.openingBalance),
    }));
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  public saveCustomer(customer: Customer, actor: User): void {
    const customers = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const idx = customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      customers[idx] = customer;
      this.recordAudit(actor.id, actor.name, 'UPDATE_CUSTOMER', 'Customer', customer.id, `Updated customer ${customer.name}`);
    } else {
      customers.push(customer);
      this.recordAudit(actor.id, actor.name, 'CREATE_CUSTOMER', 'Customer', customer.id, `Created customer ${customer.name}`);
      
      // If opening balance > 0, record initial ledger entry
      if (customer.openingBalance > 0) {
        this.addCustomerLedgerEntry({
          id: `c_led_${Date.now()}`,
          partyType: 'customer',
          partyId: customer.id,
          partyName: customer.name,
          date: formatDatePK(new Date()),
          timestamp: Date.now(),
          reference: 'OPENING',
          description: 'Opening Balance (سابقہ کھاتہ)',
          debit: customer.openingBalance,
          credit: 0,
          balance: customer.openingBalance,
          createdBy: actor.name,
        });
      }
    }
    this.save(STORAGE_KEYS.CUSTOMERS, customers);
  }

  public deleteCustomer(id: string, actor: User): void {
    const customers = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const filtered = customers.filter((c) => c.id !== id);
    this.save(STORAGE_KEYS.CUSTOMERS, filtered);
    this.recordAudit(actor.id, actor.name, 'DELETE_CUSTOMER', 'Customer', id, `Deleted customer ${id}`);
  }

  public calculateCustomerBalance(customerId: string, openingBalance = 0): number {
    const entries = this.getCustomerLedger(customerId);
    if (entries.length === 0) return openingBalance;
    // Compute total debit minus total credit
    let totalDebit = 0;
    let totalCredit = 0;
    for (const entry of entries) {
      totalDebit += entry.debit;
      totalCredit += entry.credit;
    }
    return totalDebit - totalCredit;
  }

  // --- Customer Ledger ---
  public getCustomerLedger(customerId?: string): LedgerEntry[] {
    const entries = this.load<LedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
    if (customerId) {
      return entries
        .filter((e) => e.partyId === customerId)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  public addCustomerLedgerEntry(entry: LedgerEntry): void {
    const entries = this.load<LedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
    entries.push(entry);
    this.save(STORAGE_KEYS.CUSTOMER_LEDGER, entries);
  }

  // --- Suppliers & Balances ---
  public getSuppliers(): Supplier[] {
    const suppliers = this.load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    return suppliers.map((s) => ({
      ...s,
      currentBalance: this.calculateSupplierBalance(s.id, s.openingBalance),
    }));
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.getSuppliers().find((s) => s.id === id);
  }

  public saveSupplier(supplier: Supplier, actor: User): void {
    const suppliers = this.load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    const idx = suppliers.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) {
      suppliers[idx] = supplier;
      this.recordAudit(actor.id, actor.name, 'UPDATE_SUPPLIER', 'Supplier', supplier.id, `Updated supplier ${supplier.name}`);
    } else {
      suppliers.push(supplier);
      this.recordAudit(actor.id, actor.name, 'CREATE_SUPPLIER', 'Supplier', supplier.id, `Created supplier ${supplier.name}`);
      if (supplier.openingBalance > 0) {
        this.addSupplierLedgerEntry({
          id: `s_led_${Date.now()}`,
          partyType: 'supplier',
          partyId: supplier.id,
          partyName: supplier.name,
          date: formatDatePK(new Date()),
          timestamp: Date.now(),
          reference: 'OPENING',
          description: 'Opening Balance Payable (سابقہ حساب)',
          debit: 0,
          credit: supplier.openingBalance,
          balance: supplier.openingBalance,
          createdBy: actor.name,
        });
      }
    }
    this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  public calculateSupplierBalance(supplierId: string, openingBalance = 0): number {
    const entries = this.getSupplierLedger(supplierId);
    if (entries.length === 0) return openingBalance;
    let totalDebit = 0; // payments made to supplier
    let totalCredit = 0; // purchases owed to supplier
    for (const entry of entries) {
      totalDebit += entry.debit;
      totalCredit += entry.credit;
    }
    return totalCredit - totalDebit;
  }

  // --- Supplier Ledger ---
  public getSupplierLedger(supplierId?: string): LedgerEntry[] {
    const entries = this.load<LedgerEntry[]>(STORAGE_KEYS.SUPPLIER_LEDGER, initialSupplierLedger);
    if (supplierId) {
      return entries
        .filter((e) => e.partyId === supplierId)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  public addSupplierLedgerEntry(entry: LedgerEntry): void {
    const entries = this.load<LedgerEntry[]>(STORAGE_KEYS.SUPPLIER_LEDGER, initialSupplierLedger);
    entries.push(entry);
    this.save(STORAGE_KEYS.SUPPLIER_LEDGER, entries);
  }

  // --- SALES (ATOMIC POS TRANSACTION FLOW) ---
  public getSales(): Sale[] {
    return this.load<Sale[]>(STORAGE_KEYS.SALES, initialSales).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public getSaleById(id: string): Sale | undefined {
    return this.getSales().find((s) => s.id === id || s.invoiceNumber === id);
  }

  /**
   * Complete Sale Transaction (Atomic Execution)
   * Follows the 12-step flow defined in user requirements.
   */
  public createSale(params: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice: number; discount: number }[];
    discount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    actor: User;
  }): { success: boolean; sale?: Sale; error?: string } {
    const { customerId, items, discount, amountPaid, paymentMethod, notes, actor } = params;

    if (!items || items.length === 0) {
      return { success: false, error: 'Cannot complete sale with an empty cart.' };
    }

    const products = this.getProducts();
    const customer = this.getCustomerById(customerId);
    const saleItems: SaleItem[] = [];

    // STEP 1 & 2: Validate products & stock
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ID ${item.productId}` };
      }
      if (prod.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${item.quantity}`,
        };
      }
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
      saleItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasePrice: prod.purchasePrice,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    // STEP 3, 4, 5: Calculate totals
    const subtotal = saleItems.reduce((acc, it) => acc + it.total, 0);
    const settings = this.getSettings();
    const tax = settings.enableTax ? (subtotal - discount) * (settings.taxRate / 100) : 0;
    const grandTotal = Math.max(0, subtotal - discount + tax);

    // Verify payment logic
    const remainingDue = Math.max(0, grandTotal - amountPaid);
    let paymentStatus: Sale['paymentStatus'] = 'Paid';
    if (remainingDue > 0 && amountPaid > 0) {
      paymentStatus = 'Partial';
    } else if (remainingDue > 0 && amountPaid === 0) {
      paymentStatus = 'Credit';
    }

    // Generate Invoice Number
    const existingSales = this.getSales();
    const nextInvoiceNum = `${settings.invoicePrefix}${1000 + existingSales.length + 1}`;
    const dateStr = formatDatePK(new Date());
    const now = Date.now();

    const sale: Sale = {
      id: `sale_${now}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: nextInvoiceNum,
      date: dateStr,
      timestamp: now,
      customerId: customer ? customer.id : 'cust_walkin',
      customerName: customer ? customer.name : 'Walk-in Customer',
      customerPhone: customer?.phone,
      items: saleItems,
      subtotal,
      discount,
      tax,
      grandTotal,
      amountPaid,
      remainingDue,
      paymentMethod,
      paymentStatus,
      cashierId: actor.id,
      cashierName: actor.name,
      notes,
    };

    // STEP 8: Atomically decrease stock & record movement
    for (const item of saleItems) {
      const prod = products.find((p) => p.id === item.productId)!;
      prod.currentStock -= item.quantity;
      prod.totalSold = (prod.totalSold || 0) + item.quantity;

      this.adjustStock(
        prod.id,
        -item.quantity,
        'Sale',
        nextInvoiceNum,
        actor
      );
    }
    this.save(STORAGE_KEYS.PRODUCTS, products);

    // STEP 9: If credit or partial, create customer ledger entry
    if (remainingDue > 0) {
      const custId = customer ? customer.id : 'cust_walkin';
      const custName = customer ? customer.name : 'Walk-in Customer';
      
      const previousBal = this.calculateCustomerBalance(custId);
      const newBal = previousBal + remainingDue;

      this.addCustomerLedgerEntry({
        id: `c_led_${now}`,
        partyType: 'customer',
        partyId: custId,
        partyName: custName,
        date: dateStr,
        timestamp: now,
        reference: nextInvoiceNum,
        description: `Credit Sale Invoice #${nextInvoiceNum}`,
        debit: remainingDue, // customer owes business
        credit: 0,
        balance: newBal,
        createdBy: actor.name,
      });
    }

    // STEP 10: If payment > 0, create payment record
    if (amountPaid > 0) {
      this.recordPayment({
        type: 'customer_payment',
        partyId: customer ? customer.id : 'cust_walkin',
        partyName: customer ? customer.name : 'Walk-in Customer',
        amount: amountPaid,
        paymentMethod,
        reference: nextInvoiceNum,
        notes: `POS Sale Payment for #${nextInvoiceNum}`,
        actor,
      });
    }

    // STEP 6: Save sale record
    existingSales.unshift(sale);
    this.save(STORAGE_KEYS.SALES, existingSales);

    // Record audit
    this.recordAudit(
      actor.id,
      actor.name,
      'COMPLETE_SALE',
      'Sale',
      sale.id,
      `Sale #${nextInvoiceNum} total PKR ${grandTotal} (${paymentStatus}) to ${sale.customerName}`
    );

    return { success: true, sale };
  }

  // --- PURCHASES (ATOMIC FLOW) ---
  public getPurchases(): Purchase[] {
    return this.load<Purchase[]>(STORAGE_KEYS.PURCHASES, initialPurchases).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public createPurchase(params: {
    supplierId: string;
    supplierInvoiceRef?: string;
    items: { productId: string; quantity: number; purchasePrice: number }[];
    discount: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    actor: User;
  }): { success: boolean; purchase?: Purchase; error?: string } {
    const { supplierId, supplierInvoiceRef, items, discount, amountPaid, paymentMethod, notes, actor } = params;

    const supplier = this.getSupplierById(supplierId);
    if (!supplier) {
      return { success: false, error: 'Supplier not found' };
    }
    if (!items || items.length === 0) {
      return { success: false, error: 'Purchase items cannot be empty' };
    }

    const products = this.getProducts();
    const purchaseItems: PurchaseItem[] = [];

    for (const it of items) {
      const prod = products.find((p) => p.id === it.productId);
      if (!prod) {
        return { success: false, error: `Product ID ${it.productId} not found` };
      }
      purchaseItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: it.quantity,
        purchasePrice: it.purchasePrice,
        total: it.quantity * it.purchasePrice,
      });
    }

    const subtotal = purchaseItems.reduce((acc, it) => acc + it.total, 0);
    const total = Math.max(0, subtotal - discount);
    const remainingPayable = Math.max(0, total - amountPaid);

    let status: Purchase['status'] = 'Paid';
    if (remainingPayable > 0 && amountPaid > 0) {
      status = 'Partial';
    } else if (remainingPayable > 0 && amountPaid === 0) {
      status = 'Credit';
    }

    const existing = this.getPurchases();
    const invoiceNum = `PUR-${2000 + existing.length + 1}`;
    const dateStr = formatDatePK(new Date());
    const now = Date.now();

    const purchase: Purchase = {
      id: `pur_${now}`,
      invoiceNumber: invoiceNum,
      supplierInvoiceRef,
      date: dateStr,
      timestamp: now,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: purchaseItems,
      subtotal,
      discount,
      total,
      amountPaid,
      remainingPayable,
      paymentMethod,
      status,
      notes,
    };

    // Increase inventory & update purchase price
    for (const it of purchaseItems) {
      const prod = products.find((p) => p.id === it.productId)!;
      prod.currentStock += it.quantity;
      prod.purchasePrice = it.purchasePrice; // update latest cost price

      this.adjustStock(
        prod.id,
        it.quantity,
        'Purchase',
        invoiceNum,
        actor
      );
    }
    this.save(STORAGE_KEYS.PRODUCTS, products);

    // Update supplier ledger if credit/partial
    if (remainingPayable > 0) {
      const currentPayable = this.calculateSupplierBalance(supplier.id);
      this.addSupplierLedgerEntry({
        id: `s_led_${now}`,
        partyType: 'supplier',
        partyId: supplier.id,
        partyName: supplier.name,
        date: dateStr,
        timestamp: now,
        reference: invoiceNum,
        description: `Credit Purchase #${invoiceNum}${supplierInvoiceRef ? ` (Ref: ${supplierInvoiceRef})` : ''}`,
        debit: 0,
        credit: remainingPayable, // we owe supplier
        balance: currentPayable + remainingPayable,
        createdBy: actor.name,
      });
    }

    // Record supplier payment if amountPaid > 0
    if (amountPaid > 0) {
      this.recordPayment({
        type: 'supplier_payment',
        partyId: supplier.id,
        partyName: supplier.name,
        amount: amountPaid,
        paymentMethod,
        reference: invoiceNum,
        notes: `Paid against Purchase #${invoiceNum}`,
        actor,
      });
    }

    existing.unshift(purchase);
    this.save(STORAGE_KEYS.PURCHASES, existing);

    this.recordAudit(
      actor.id,
      actor.name,
      'CREATE_PURCHASE',
      'Purchase',
      purchase.id,
      `Recorded purchase #${invoiceNum} from ${supplier.name} total PKR ${total}`
    );

    return { success: true, purchase };
  }

  // --- PAYMENTS ---
  public getPayments(): Payment[] {
    return this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public recordPayment(params: {
    type: Payment['type'];
    partyId: string;
    partyName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    actor: User;
  }): { success: boolean; payment?: Payment; error?: string } {
    const { type, partyId, partyName, amount, paymentMethod, reference, notes, actor } = params;

    if (amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    const existing = this.getPayments();
    const paymentNum = `PAY-${1000 + existing.length + 1}`;
    const dateStr = formatDatePK(new Date());
    const now = Date.now();

    const payment: Payment = {
      id: `pay_${now}_${Math.random().toString(36).substring(2, 6)}`,
      paymentNumber: paymentNum,
      date: dateStr,
      timestamp: now,
      type,
      partyId,
      partyName,
      amount,
      paymentMethod,
      reference,
      notes,
      createdBy: actor.name,
    };

    // If customer payment, decrease receivable in ledger (Credit customer)
    if (type === 'customer_payment') {
      const prevBal = this.calculateCustomerBalance(partyId);
      const newBal = prevBal - amount;
      this.addCustomerLedgerEntry({
        id: `c_led_${now}`,
        partyType: 'customer',
        partyId,
        partyName,
        date: dateStr,
        timestamp: now,
        reference: paymentNum,
        description: `Payment Received via ${paymentMethod} (وصولی)${reference ? ` Ref: ${reference}` : ''}`,
        debit: 0,
        credit: amount, // Payment reduces what customer owes
        balance: newBal,
        createdBy: actor.name,
      });
    }

    // If supplier payment, decrease payable in ledger (Debit supplier)
    if (type === 'supplier_payment') {
      const prevBal = this.calculateSupplierBalance(partyId);
      const newBal = prevBal - amount;
      this.addSupplierLedgerEntry({
        id: `s_led_${now}`,
        partyType: 'supplier',
        partyId,
        partyName,
        date: dateStr,
        timestamp: now,
        reference: paymentNum,
        description: `Payment Made via ${paymentMethod} (ادائیگی)${reference ? ` Ref: ${reference}` : ''}`,
        debit: amount, // Payment reduces what we owe supplier
        credit: 0,
        balance: newBal,
        createdBy: actor.name,
      });
    }

    existing.unshift(payment);
    this.save(STORAGE_KEYS.PAYMENTS, existing);

    this.recordAudit(
      actor.id,
      actor.name,
      'RECORD_PAYMENT',
      'Payment',
      payment.id,
      `Recorded ${type} PKR ${amount} for ${partyName} via ${paymentMethod}`
    );

    return { success: true, payment };
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return this.load<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  public recordExpense(params: {
    category: Expense['category'];
    amount: number;
    paymentMethod: PaymentMethod;
    description: string;
    reference?: string;
    actor: User;
  }): { success: boolean; expense?: Expense; error?: string } {
    const { category, amount, paymentMethod, description, reference, actor } = params;

    if (amount <= 0) {
      return { success: false, error: 'Expense amount must be greater than zero.' };
    }

    const existing = this.getExpenses();
    const expenseNum = `EXP-${100 + existing.length + 1}`;
    const dateStr = formatDatePK(new Date());
    const now = Date.now();

    const expense: Expense = {
      id: `exp_${now}`,
      expenseNumber: expenseNum,
      date: dateStr,
      timestamp: now,
      category,
      amount,
      paymentMethod,
      description,
      reference,
      recordedBy: actor.name,
    };

    existing.unshift(expense);
    this.save(STORAGE_KEYS.EXPENSES, existing);

    this.recordAudit(
      actor.id,
      actor.name,
      'RECORD_EXPENSE',
      'Expense',
      expense.id,
      `Recorded expense PKR ${amount} (${category}): ${description}`
    );

    return { success: true, expense };
  }

  // --- EXPORT & BACKUP ---
  public exportDatabaseJSON(): string {
    const dump: Record<string, unknown> = {};
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      dump[key] = this.load(storageKey, null);
    }
    return JSON.stringify(dump, null, 2);
  }

  public importDatabaseJSON(jsonStr: string, actor: User): boolean {
    try {
      const dump = JSON.parse(jsonStr);
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        if (dump[key]) {
          this.save(storageKey, dump[key]);
        }
      }
      this.recordAudit(actor.id, actor.name, 'IMPORT_DATABASE', 'System', 'all', 'Restored database from JSON backup');
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const storage = new StorageEngine();
// Initialize immediately
storage.initializeDefaults();
