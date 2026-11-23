# Agri-Action-Sale
# Velaan Bay — Agent Portal UI (வேளாண் பே முகவர் தளம்)
### Comprehensive Pure React + LocalStorage Mandi Operating System
> **Target Subsystem**: Agent Portal UI (`agent-portal-ui`)  
> **Architecture**: 100% Client-Side Pure React + LocalStorage Reactive Engine (Zero Backend Dependencies)  
> **UI Philosophy**: Modern Agricultural Aesthetic ("Vibe Coding") — Emerald Forest Green (`#166534`), Golden Harvest (`#f59e0b`), Real-Time Feedback  
> **Bilingual Support**: English & தமிழ் (Tamil)

---

## 🌾 1. Overview & System Highlights

The **Velaan Bay Agent Portal UI** is an agricultural commission agency, mandi auction, and warehouse operating desk. It allows commission agents, auctioneers, clerks, and accountants to run daily mandi operations seamlessly from produce arrival to settlement:

1. **Pure React + LocalStorage Persistence**:
   - Zero external backend needed.
   - All farmers, wholesale buyers, inward lots, auction chits, attendance records, advances, and payroll data are persisted locally.
   - Initialized with realistic agricultural seed data for immediate exploration.
   - One-click "Reset Demo Data" button restores the baseline at any time.

2. **Full Bilingual Support (English & தமிழ்)**:
   - Instant header toggle switching every label, button, modal, receipt, and ledger between English and Tamil.
   - Accurate mandi terminology: *ஏலம், விற்பனையாளர், வியாபாரி, வாடகை, கூலி, மகிமை, கமிஷன், பட்டி / விற்பனை ரசீது, அட்வான்ஸ், சம்பளம்*.

3. **Two-Tier Dynamic RBAC Staff Security**:
   - Live Role Switcher in header: Switch between **Manager, Supervisor, Auctioneer, Accountant, Quality Checker, Worker**.
   - Dynamic sidebar and route filtering based on `ROUTE_PERMISSION_MAP` and role presets.
   - Elegant "Access Restricted by Mandi RBAC" guard when accessing unauthorized routes.

4. **Dual Auction Engines**:
   - **Manual / Floor Calling Desk (`/offline/live`)**: Open-cry bidding desk, live scale weight entry, 15-second spot trader onboarding, real-time credit check, keyboard `[Enter]` shortcut, and instant A5 thermal chit printing.
   - **Online Digital WebSocket Auction (`/online`)**: Real-time ticking countdown timer, quick increment bidding chips (+₹5, +₹10, +₹50, +₹100), anti-sniping extension (+60s), live rival auto-bidding simulation, and hammer fall award.

---

## 📋 2. Complete Guide for All 10 Sidebar Activities

| # | Activity | Route | Primary Actor | Key Operational Capability |
|---|---|---|---|---|
| **1** | **Seller (Farmer) Management** | `/sellers` | Inward Clerk, Admin | Onboard farmers, verify bank & IFSC details, view historical inward lots & auction prices, dispatch WhatsApp arrival alerts. |
| **2** | **Buyer (Trader) Management** | `/buyers` | Mandi Admin, Accountant | Register wholesale buyers, assign floor auction paddle tokens (e.g. `P-01`), configure credit limits & deposits, inspect live credit utilization. |
| **3** | **Products & Grading** | `/products`, `/inventory` | Quality Inspector, Supervisor | Multi-grade price matrix (Grades A/B/C/D), statutory fees (Coolie, Rent, Magimai), inward lot stacking by warehouse bays (`Bay A-02`, `Shed C-01`). |
| **4** | **Manual Floor Auction Engine** | `/offline`, `/offline/live` | Floor Auctioneer, Clerk | Rapid floor calling desk, live scale weigh input, credit warnings, `Enter` to complete, instant KVS A5 Chit printing with Tamil calculation breakdown. |
| **5** | **Online Digital Auction Room** | `/online` | Digital Auctioneer, Bidders | Live ticking countdown, quick bid chips, anti-sniping protection (+60s), rival bidding simulation, automatic hammer fall & winner declaration. |
| **6** | **Reports & Financial Settlements** | `/reports` | Mandi Accountant | Daily sales sheet with CSV export, official bilingual Farmer Settlement Patti (விற்பனை ரசீது), Buyer Tax Invoice & Gate Pass, WhatsApp/SMS audit logs. |
| **7** | **Employee Details & RBAC** | `/workforce/employee-details` | Mandi Agent / Owner | Onboard staff, assign roles with automatic permission presets, configure portal login access, reset passwords, branch allocation. |
| **8** | **Daily Shift Attendance** | `/workforce/attendance` | Supervisor, HR Clerk | Date & branch selector, interactive P / A / HD / L status buttons, OT hours stepper, "Mark All Present", direct feed to salary engine. |
| **9** | **Staff Cash Advances** | `/workforce/advances` | Cashier, Accountant | Disburse cash advances, print official signature advance vouchers, auto-queue for deduction in upcoming monthly payroll. |
| **10** | **Salary & Payroll Engine** | `/workforce/salary-payroll` | Mandi Agent, Accountant | Monthly wage run, auto-aggregates days worked (`P + 0.5 * HD`) & OT pay, auto-deducts pending advances, executes payouts, prints Mandi Salary Slip. |

---

## 🧾 3. Faithful KVS Mandi A5 Portrait Receipt Format

The printed A5 chit generated in the floor calling desk reproduces the official KVS Mandi receipt layout:
- **Mandi Header**: `KVS TRADERS & COMMISSION MANDI` / `கேவிஎஸ் டிரேடர்ஸ் & கமிஷன் மண்டி`
- **Metadata**: Chit Serial No, Date, Time, Farmer Name & Village, Buyer Trade Name & Paddle Token.
- **Produce Table**: Commodity, Variety, Grade, Unit, Weighed Quantity, Rate, Gross Amount.
- **Tamil Deductions Breakdown**:
  - வாடகை (Rent / Stacking)
  - கூலி (Coolie / Weighing)
  - மகிமை (Magimai / Charity Cess)
  - கமிஷன் (Agent Commission %)
  - **Balance (நிகர வரவு / Farmer Net Payable)**
- **Signatures**: Buyer Sign & Authorized Mandi Seal.

---

## 🚀 4. Developer Quickstart

### Installation & Development
```bash
# Navigate to the project directory
cd "c:\NEW GITHUB\kvs"

# Start Vite development server
npm run dev
# Running at: http://localhost:5173
```

### Production Build & Verification
```bash
# Run production build and verify bundle
npm run build
```
Build output:
- `dist/index.html` (1.27 kB)
- `dist/assets/index-*.css` (51.99 kB)
- `dist/assets/vendor-*.js` (4.21 kB)
- `dist/assets/icons-*.js` (34.33 kB)
- `dist/assets/index-*.js` (471.94 kB)
- Clean compilation in ~5.0s with 0 errors!

---
*Velaan Bay v2.0.0 — Pure React + LocalStorage Mandi Operating System.*
