export type UserRole = 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  avatar?: string;
  designation?: string;
  adminNumber?: 1 | 2;
}

export interface BusinessSettings {
  id: string;
  name: string;
  logoUrl?: string;
  urduName?: string;
  tagline?: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string; // NTN / STRN in Pakistan
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  receiptFooter: string;
  receiptUrduFooter?: string;
  lowStockThreshold: number;
  enableTax: boolean;
  taxRate: number; // e.g., 0% or 17%
  thermalPaperSize: '58mm' | '80mm' | 'A4';
}

export type ProductUnit =
  | 'Piece'
  | 'Box'
  | 'Pack'
  | 'Kg'
  | 'Gram'
  | 'Liter'
  | 'Meter'
  | 'Dozen';

export interface Category {
  id: string;
  name: string;
  urduName?: string;
  description?: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  urduName?: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  currentStock: number;
  minStock: number;
  unit: ProductUnit;
  description?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  totalSold?: number;
}

export type CustomerType = 'walk-in' | 'regular' | 'wholesale';

export interface Customer {
  id: string;
  name: string;
  urduName?: string;
  phone: string;
  address: string;
  email?: string;
  type: CustomerType;
  openingBalance: number;
  creditLimit: number;
  notes?: string;
  currentBalance: number; // Derived: positive = customer owes business (Debit)
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  openingBalance: number;
  notes?: string;
  currentBalance: number; // Derived: positive = business owes supplier (Credit)
  createdAt: string;
}

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Credit';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  discount: number;
  total: number;
}

export type SaleStatus = 'Paid' | 'Partial' | 'Credit' | 'Cancelled';

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO or DD-MM-YYYY
  timestamp: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  amountPaid: number;
  remainingDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: SaleStatus;
  cashierId: string;
  cashierName: string;
  notes?: string;
  businessId?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export type PurchaseStatus = 'Paid' | 'Partial' | 'Credit';

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierInvoiceRef?: string;
  date: string;
  timestamp: number;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  remainingPayable: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  date: string;
  timestamp: number;
  reference: string; // e.g. "INV-1005" or "PAY-1002"
  description: string;
  debit: number;
  credit: number;
  balance: number; // Running balance after transaction
  createdBy: string;
}

export type PaymentType = 'customer_payment' | 'supplier_payment' | 'expense_payment';

export interface Payment {
  id: string;
  paymentNumber: string;
  date: string;
  timestamp: number;
  type: PaymentType;
  partyId: string;
  partyName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Salary'
  | 'Transport'
  | 'Maintenance'
  | 'Marketing'
  | 'Other';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  timestamp: number;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  recordedBy: string;
}

export type StockMovementReason =
  | 'Sale'
  | 'Purchase'
  | 'Damaged'
  | 'Lost'
  | 'Manual Adjustment'
  | 'Customer Return'
  | 'Supplier Return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  date: string;
  timestamp: number;
  type: 'In' | 'Out' | 'Adjustment';
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: StockMovementReason;
  reference: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  date: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface POSCartState {
  items: CartItem[];
  selectedCustomerId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  notes: string;
  paymentMethod: PaymentMethod;
  amountTendered: number;
}
