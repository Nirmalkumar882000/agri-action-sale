export type Role =
  | 'Manager'
  | 'Supervisor'
  | 'Auctioneer'
  | 'Accountant'
  | 'Quality Checker'
  | 'Worker';

export type Language = 'en' | 'ta';

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface Seller {
  id: string;
  code: string; // e.g. "FRM-101"
  name: string;
  nameTamil?: string;
  mobile: string;
  village: string;
  taluk: string;
  district: string;
  pincode: string;
  aadhaar: string;
  bankDetails: BankDetails;
  active: boolean;
  payoutBalance: number;
  totalLotsCount: number;
  totalVolume: number; // Bunches or Bundles
  rating: number;
  createdAt: string;
}

export interface Buyer {
  id: string;
  code: string; // e.g. "BYR-201"
  name: string;
  tradeName: string; // e.g. "Sri Murugan Banana Traders"
  tradeNameTamil?: string;
  mobile: string;
  gstin: string;
  licenseNo: string;
  city: string;
  address: string;
  depositAmount: number; // Advance security deposit (₹)
  creditLimit: number; // Credit ceiling (₹)
  outstandingDues: number; // Current ledger dues (₹)
  paddleNumber: string; // Floor auction token e.g. "P-12"
  status: 'Active' | 'Warning' | 'Blocked';
  createdAt: string;
}

export type CommodityCategory =
  | 'Fruits (பழங்கள்)'
  | 'Vegetables (காய்கறிகள்)'
  | 'Plantation & Cash (தோட்டப் பயிர்கள்)'
  | 'Flowers (மலர்கள்)'
  | 'Spices & Condiments (நறுமணப் பொருட்கள்)'
  | 'Grains & Pulses (தானியங்கள்)'
  | 'Commercial & Leaves (இலைகள் & வர்த்தகம்)'
  | 'General (பொதுவானவை)'
  | string;

export type ProductItemType =
  | 'Bunch'
  | 'Leaf'
  | 'Box'
  | 'Bag'
  | 'Crate'
  | 'Basket'
  | 'Bundle'
  | 'Piece'
  | 'Loose / Bulk'
  | 'Kg'
  | string;

export type ProductUnit =
  | 'Bunch (தார்)'
  | 'Bundle (கட்டு)'
  | 'Bag (மூட்டை)'
  | 'Crate (கூடை)'
  | 'Box (பெட்டி)'
  | 'Basket (கூடை)'
  | 'Kg (கிலோ)'
  | 'Quintal (குவின்டால்)'
  | 'Piece (எண்ணிக்கை)'
  | 'Ton (டன்)'
  | string;

// Backward-compatibility aliases for existing modules
export type BananaItemType = ProductItemType;
export type BananaUnit = ProductUnit;

export interface Product {
  id: string;
  name: string;
  nameTamil: string;
  variety: string;
  varietyTamil: string;
  category?: CommodityCategory;
  itemType: ProductItemType;
  unit: ProductUnit;
  baseRatePerUnit: number; // Benchmark / Floor rate (₹/unit)
  coolieRatePerUnit: number; // Default coolie charge (₹) கூலி
  rentRatePerUnit: number; // Default rent/handling charge (₹) வாடகை
  magimaiRatePerUnit: number; // Charity/temple cess (₹) மகிமை
  commissionPercent: number; // Commission % கமிஷன்
  marketFeePercent: number;
  gstPercent: number;
}

export interface InwardLot {
  id: string;
  lotNumber: string; // e.g. "LOT-54"
  sellerId: string;
  sellerName: string;
  sellerVillage: string;
  sellerMobile: string;
  productId: string;
  productName: string;
  productNameTamil: string;
  variety: string;
  varietyTamil: string;
  category?: CommodityCategory;
  itemType: ProductItemType;
  unit: ProductUnit;
  initialQuantity: number; // Count of Bunches / Bundles
  availableQuantity: number;
  arrivalDate: string; // YYYY-MM-DD
  shedLocation: string; // e.g. "Shed 1 - Front Platform"
  vehicleNumber: string;
  status: 'Inwarded' | 'InAuction' | 'Sold' | 'Unsold';
}

export interface AuctionTransaction {
  id: string;
  billNumber: string; // e.g. "54" (matching KVS Bill No format)
  chitNumber: string; // e.g. "KVS-2026-054"
  date: string; // DD/MM/YYYY
  time: string; // HH:mm:ss
  lotId: string;
  sellerId: string;
  sellerName: string;
  sellerVillage: string;
  buyerId: string;
  buyerName: string;
  buyerTradeName: string;
  buyerPaddle: string;
  productId: string;
  productName: string;
  productNameTamil: string;
  variety: string;
  itemType: BananaItemType;
  unit: BananaUnit;
  quantity: number; // Count of Bunches / Bundles
  ratePerUnit: number;
  grossAmount: number; // quantity * ratePerUnit
  coolieAmount: number; // கூலி
  rentAmount: number; // வாடகை
  magimaiAmount: number; // மகிமை
  commissionPercent: number;
  commissionAmount: number; // கமிஷன்
  totalDeductions: number; // coolie + rent + magimai + commission
  netFarmerPayable: number; // Balance (நிகர தொகை)
  buyerMarketFee: number;
  buyerTotalBilled: number;
  type: 'ManualFloor' | 'DigitalOnline';
  gatePassIssued: boolean;
}

export interface OnlineBid {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderTradeName: string;
  paddleNumber: string;
  amount: number;
  timestamp: string;
}

export interface OnlineAuction {
  id: string;
  auctionCode: string;
  lotId: string;
  productName: string;
  productNameTamil: string;
  variety: string;
  varietyTamil: string;
  itemType: BananaItemType;
  sellerName: string;
  sellerVillage: string;
  quantity: number;
  unit: BananaUnit;
  reservePrice: number; // Minimum floor price
  currentHighestBid: number;
  currentLeaderBuyerId?: string;
  currentLeaderBuyerName?: string;
  currentLeaderPaddle?: string;
  bidsCount: number;
  bidsHistory: OnlineBid[];
  durationSeconds: number;
  remainingSeconds: number;
  startTime: string;
  status: 'Scheduled' | 'Live' | 'Awarded' | 'Unsold';
  antiSniped: boolean;
  winningBid?: number;
  winningBuyerName?: string;
  autoBidActive?: boolean;
}

export interface Employee {
  id: string;
  code: string; // e.g. "EMP-101"
  name: string;
  nameTamil?: string;
  mobile: string;
  role: Role;
  joiningDate: string;
  salaryBasis: 'Monthly' | 'Daily' | 'Weekly';
  baseSalary: number;
  overtimeRatePerHour: number;
  portalAccess: boolean;
  password?: string;
  permissions: string[];
  branches: string[];
}

export type AttendanceStatus = 'P' | 'A' | 'HD' | 'L';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  status: AttendanceStatus;
  overtimeHours: number;
  branch: string;
  updatedAt: string;
}

export interface CashAdvance {
  id: string;
  voucherNumber: string; // e.g. "ADV-2026-042"
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  amount: number;
  disbursementAccount: 'Cash Drawer' | 'HDFC Current' | 'Axis Bank';
  reason: 'Festival Advance' | 'Medical Emergency' | 'Family Travel' | 'Personal';
  remarks?: string;
  status: 'Active' | 'Recovered';
  recoveredInMonth?: string;
}

export interface PayrollRecord {
  id: string;
  payrollMonth: string; // "2026-11"
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  role: Role;
  baseSalary: number;
  daysPresent: number;
  daysHalf: number;
  daysAbsent: number;
  daysLeave: number;
  overtimeHours: number;
  overtimePay: number;
  grossSalary: number;
  advanceDeduction: number;
  otherDeduction: number;
  netSalary: number;
  paymentStatus: 'Pending' | 'Processed';
  paidDate?: string;
  paidFromAccount?: string;
  remarks?: string;
}

export interface MandiProfile {
  shopName: string;
  shopNameTamil: string;
  tagline: string;
  taglineTamil: string;
  marketLocation: string;
  marketLocationTamil: string;
  mandiLicenseNo: string;
  gstin: string;
  address: string;
  addressTamil: string;
  phone: string;
  email: string;
  defaultCommissionPercent: number;
  defaultCooliePerUnit: number;
  defaultRentPerUnit: number;
  defaultMagimaiPerUnit: number;
  activeBranch: string;
  branches: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type LedgerEntryType =
  | 'AUCTION_SALE'
  | 'FARMER_PAYOUT'
  | 'BUYER_COLLECTION'
  | 'COMMISSION_INCOME'
  | 'SERVICE_FEE'
  | 'EXPENSE_PAYMENT'
  | 'STAFF_ADVANCE'
  | 'SALARY_PAYOUT';

export type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI / GPay' | 'Cheque' | 'Credit';

export interface LedgerEntry {
  id: string;
  voucherNumber: string; // e.g. "LED-2026-001"
  date: string;          // DD/MM/YYYY
  time: string;          // HH:mm:ss
  type: LedgerEntryType;
  partyType: 'Farmer' | 'Buyer' | 'Mandi' | 'Staff' | 'Expense';
  partyId?: string;
  partyName: string;
  partyCode?: string;
  debit: number;         // பற்று (Amount paid out / receivable)
  credit: number;        // வரவு (Amount received / payable / income)
  runningBalance: number;// இருப்பு
  paymentMode: PaymentMode;
  referenceNo?: string;  // e.g. "KVS-2026-054" / "TXN-98124"
  narration: string;     // Description
  narrationTamil?: string;
  category?: string;     // e.g. "Patti Settlement", "Buyer Collection", "Commission", "Coolie Labor"
  createdAt: string;
}

export interface MandiExpense {
  id: string;
  voucherNo: string;
  date: string;          // DD/MM/YYYY
  time: string;
  category:
    | 'Coolie & Labor'
    | 'Electricity & Water'
    | 'Platform Maintenance'
    | 'Tea & Refreshment'
    | 'Stationery & Printing'
    | 'Fuel & Transport'
    | 'License & Statutory'
    | 'Other';
  categoryTamil?: string;
  amount: number;
  paymentMode: PaymentMode;
  paidTo: string;
  paidFromAccount: string;
  remarks: string;
}

export interface SmsLogEntry {
  id: string;
  sellerName: string;
  mobile: string;
  date: string;
  time: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
  messageText: string;
  charges: number;
}

export interface WhatsAppLogEntry {
  id: string;
  recipientName: string;
  mobile: string;
  date: string;
  time: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  messageText: string;
  amount: number;
}

