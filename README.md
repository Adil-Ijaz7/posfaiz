# BizLedger POS — Point of Sale & Customer/Supplier Ledger Management System

> Production-ready Point of Sale (POS) and Customer/Supplier Ledger Management MVP architected for small and medium-sized businesses (SMBs) in Pakistan (Al-Rehman General Store context).

---

## 🌟 Key Features

1. **Lightning-Fast POS Terminal**:
   - Barcode Scanner Plug & Play auto-capture (USB / Bluetooth hardware scanners).
   - Category filtering & instant search by product name, SKU, or barcode.
   - 1-Click **Cash Sale** (نقد) & **Credit Sale** (ادھار).
   - Quick PKR denomination buttons (₨500, ₨1,000, ₨2,000, ₨5,000, Exact).
   - Thermal receipt generator for **58mm**, **80mm**, and **A4** paper sizes with direct browser printing and WhatsApp text copy.

2. **Core Customer Ledger (گاہک کھاتہ)**:
   - True accounting-grade transaction-derived running balances:
     $$\text{Balance} = \text{Opening Balance} + \text{Credit Sales} - \text{Customer Payments} - \text{Returns}$$
   - Debit = Customer owes store (Credit Sale)
   - Credit = Customer payment received (Wasool)
   - Instant "Receive Payment" modal directly from the ledger.
   - Filter by Date (Today, This Month, All Time), Print statement, and Export CSV.

3. **Supplier Ledger (سپلائر کھاتہ)**:
   - Credit = Amount owed to supplier (Purchases)
   - Debit = Amount paid to supplier (Supplier Payments)
   - Instant "Pay Supplier" modal with Bank Transfer / Cash / JazzCash channels.

4. **Inward Stock Purchases & Inventory Audit**:
   - Stock adjustments with audit reason tracking (`Damaged`, `Lost`, `Manual Audit Correction`, `Customer Return`, `Supplier Return`).
   - Reorder threshold alerts and valuation calculation.

5. **Financial Reports & Estimated Profit**:
   - Gross Profit = $\text{Total Sales Revenue} - \text{Cost of Goods Sold (COGS)}$
   - Estimated Net Profit = $\text{Gross Profit} - \text{Operating Expenses}$
   - Clearly labeled as "Estimated Profit".
   - Breakdown of expenses: Electricity (LESCO / K-Electric), Rent, Internet, Salaries, Generator fuel, etc.

6. **Pakistani Business Localization**:
   - Currency: **PKR (₨)** with Pakistani number formatting.
   - Date Format: **DD-MM-YYYY**.
   - Timezone: **Asia/Karachi (PKT)**.
   - Payment Methods: Cash, JazzCash, Easypaisa, Bank Transfer (HBL, Meezan), Credit.
   - Bilingual receipt headers and policy note: *"Exchange within 7 days with valid receipt / تبدیلی یا واپسی 7 دن کے اندر رسید کے ساتھ ممکن ہے"*.

7. **Offline-First Resilience**:
   - Designed for locations with frequent load shedding and erratic network connectivity. All state, sales, and ledgers persist in localStorage with instant backup export/import.

8. **Role-Based Access Control (RBAC)**:
   - **Admin / Owner**: Full access across all modules, profit calculations, settings, and staff accounts.
   - **Cashier**: POS Terminal, Customer counter payments, and product search.
   - **Accountant**: Ledgers, Sales, Purchases, Expenses, Vouchers, and Reports.

---

## ⌨️ POS Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **`F2`** | Quick Focus Product Search bar |
| **`F4`** | Jump to Customer selection dropdown |
| **`F8`** | Open Checkout & Payment modal |
| **`Ctrl + Enter`** | Complete Sale & trigger Print preview |
| **`Esc`** | Close active modal / Clear search |
| **Hardware Scanner** | Scan any barcode anywhere to auto-add to cart |

---

## 🚀 Acceptance Tests Verification

All 5 core acceptance tests from specification are fully functional:

- **TEST 1 (Product & Credit Sale)**:
  - Product: *Coca Cola 500ml* (Purchase: ₨70, Selling: ₨100, Stock: 100).
  - Customer: *Ahmed Traders*.
  - Sale: Qty 5 (Total ₨500, Paid ₨200, Credit ₨300).
  - Result: Stock updates to 95, Sale total is ₨500, Ahmed's Khata balance increases by ₨300.
- **TEST 2 (Receive Payment)**:
  - Receive payment of ₨300 against Ahmed's account.
  - Result: Ahmed's outstanding balance decreases back by ₨300.
- **TEST 3 (Supplier Purchase)**:
  - Create purchase from *ABC Wholesale* (Total ₨10,000, Paid ₨4,000, Credit ₨6,000).
  - Result: Inventory increases by items, Supplier payable increases by ₨6,000.
- **TEST 4 (Pay Supplier)**:
  - Pay supplier ₨6,000.
  - Result: Supplier payable reduces to ₨0.
- **TEST 5 (Add Expense & Net Profit)**:
  - Add expense *Electricity* = ₨5,000.
  - Result: Appears in expense voucher list, Estimated Net Profit decreases by ₨5,000.

---

## 💻 Running on Node.js (No Docker Required)

BizLedger POS runs **100% natively on Node.js** without any Docker dependency.

### Prerequisites:
- **Node.js**: v18.0.0+ or v20.0.0+
- **npm**: v9.0.0+

### 1. Development Mode (Instant Hot-Reload):
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Production Mode (Node.js Direct):
```bash
# Build the production bundle
npm run build

# Start the Node.js Express server
npm start
```
The server will start natively on `http://localhost:3000`.

### 3. Optional: Preview Mode:
```bash
npm run preview
```

*(Note: Docker configuration files are provided strictly as an optional alternative for containerized environments, but Docker is **never** required).*

---

## 👤 Default Demo Staff Accounts

| Staff Member | Role | Permissions |
| :--- | :--- | :--- |
| **Muhammad Usman (Owner)** | Admin | Full business access & Store Settings |
| **Hamza Farooq** | Cashier | POS Counter & Customer Payments |
| **Tariq Mehmood** | Accountant | Khata Ledgers, Purchases, Expenses, Reports |

*(Switch roles anytime via the top header bar dropdown).*
