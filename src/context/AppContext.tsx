import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Language,
  Seller,
  Buyer,
  Product,
  InwardLot,
  AuctionTransaction,
  OnlineAuction,
  OnlineBid,
  Employee,
  AttendanceRecord,
  CashAdvance,
  PayrollRecord,
  MandiProfile,
  NotificationItem,
  LedgerEntry,
  MandiExpense,
  PaymentMode,
  SmsLogEntry,
  WhatsAppLogEntry,
} from '../types';
import {
  INITIAL_MANDI_PROFILE,
  INITIAL_SELLERS,
  INITIAL_BUYERS,
  INITIAL_PRODUCTS,
  INITIAL_INWARD_LOTS,
  INITIAL_AUCTION_TRANSACTIONS,
  INITIAL_ONLINE_AUCTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_ADVANCES,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_MANDI_EXPENSES,
  INITIAL_SMS_LOGS,
  INITIAL_WHATSAPP_LOGS,
} from '../utils/mockData';
import { ROLE_DEFAULT_PERMISSIONS, canAccessRoute } from '../utils/rbac';
import { translations } from '../utils/i18n';

interface AppContextType {
  // Theme & Appearance
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Loader & Progress
  isLoading: boolean;
  loadingMessage: string;

  // Localization & Role
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  currentUser: Employee;
  hasPermission: (route: string) => boolean;

  // Profile
  profile: MandiProfile;
  updateProfile: (profile: MandiProfile) => void;

  // Sellers (Banana Farmers)
  sellers: Seller[];
  addSeller: (seller: Omit<Seller, 'id' | 'createdAt'>) => Seller;
  updateSeller: (seller: Seller) => void;

  // Buyers (Wholesale Traders)
  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, 'id' | 'createdAt'>) => Buyer;
  updateBuyer: (buyer: Buyer) => void;

  // Products (Banana & Leaves Varieties)
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Inward Lots
  lots: InwardLot[];
  addInwardLot: (lot: Omit<InwardLot, 'id'>) => InwardLot;
  updateLotStatus: (lotId: string, status: InwardLot['status'], shed?: string) => void;

  // Mandi Floor Auction Engine
  transactions: AuctionTransaction[];
  completeFloorAuctionLot: (payload: {
    lot: InwardLot;
    weighedQuantity: number;
    winningRate: number;
    buyer: Buyer;
  }) => AuctionTransaction;

  // Online Digital Auction Engine
  onlineAuctions: OnlineAuction[];
  createOnlineAuction: (payload: {
    lot: InwardLot;
    reservePrice: number;
    durationMinutes: number;
  }) => void;
  placeOnlineBid: (auctionId: string, amount: number, bidder: Buyer) => void;
  toggleAutoBidding: (auctionId: string) => void;
  completeDigitalAuctionLot: (auctionId: string) => AuctionTransaction | null;

  // Settlements & Payments
  settleFarmerPayout: (sellerId: string, amount?: number, paymentMode?: string) => void;
  recordBuyerPayment: (buyerId: string, amount: number, paymentMode?: string) => void;

  // Financial Ledger & Expenses
  ledgerEntries: LedgerEntry[];
  mandiExpenses: MandiExpense[];
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'voucherNumber' | 'createdAt' | 'runningBalance'>) => LedgerEntry;
  recordFarmerPayout: (sellerId: string, amount: number, paymentMode?: PaymentMode, reference?: string, remarks?: string) => void;
  recordBuyerReceipt: (buyerId: string, amount: number, paymentMode?: PaymentMode, reference?: string, remarks?: string) => void;
  recordMandiExpense: (expense: Omit<MandiExpense, 'id' | 'voucherNo'>) => MandiExpense;

  // Workforce & Staff
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  resetEmployeePassword: (empId: string, newPass: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'updatedAt'>) => void;
  markAllPresentForDate: (date: string, branch: string) => void;

  // Staff Advances
  advances: CashAdvance[];
  recordCashAdvance: (advance: Omit<CashAdvance, 'id' | 'voucherNumber'>) => CashAdvance;

  // Payroll
  payrolls: PayrollRecord[];
  generateMonthlyPayroll: (monthStr: string) => PayrollRecord[];
  processSalaryPayment: (payrollId: string, paymentMethod: string, remarks?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;

  // Messaging & Dispatch Logs
  smsLogs: SmsLogEntry[];
  addSmsLog: (entry: Omit<SmsLogEntry, 'id'>) => SmsLogEntry;
  whatsAppLogs: WhatsAppLogEntry[];
  addWhatsAppLog: (entry: Omit<WhatsAppLogEntry, 'id'>) => WhatsAppLogEntry;

  // System
  resetAllDemoData: () => void;
  loadDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStorage<T>(key: string, initial: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : initial;
  } catch {
    return initial;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('kvs_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch { }
    return 'light';
  });

  // Loader state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Sync theme with DOM and localStorage
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('kvs_theme', theme);
    } catch (e) {
      console.error('Theme sync error', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const [language, setLanguageState] = useState<Language>(() => getStorage('kvs_lang', 'ta'));
  const [activeRole, setActiveRoleState] = useState<Role>(() => getStorage('kvs_role', 'Manager'));
  const [activeBranch, setActiveBranchState] = useState<string>(() =>
    getStorage('kvs_branch', INITIAL_MANDI_PROFILE.activeBranch)
  );

  const [profile, setProfileState] = useState<MandiProfile>(() =>
    getStorage('kvs_profile', INITIAL_MANDI_PROFILE)
  );
  const [sellers, setSellersState] = useState<Seller[]>(() =>
    getStorage('kvs_sellers', INITIAL_SELLERS)
  );
  const [buyers, setBuyersState] = useState<Buyer[]>(() =>
    getStorage('kvs_buyers', INITIAL_BUYERS)
  );
  const [products, setProductsState] = useState<Product[]>(() =>
    getStorage('kvs_products', INITIAL_PRODUCTS)
  );
  const [lots, setLotsState] = useState<InwardLot[]>(() =>
    getStorage('kvs_lots', INITIAL_INWARD_LOTS)
  );
  const [transactions, setTransactionsState] = useState<AuctionTransaction[]>(() =>
    getStorage('kvs_txs', INITIAL_AUCTION_TRANSACTIONS)
  );
  const [onlineAuctions, setOnlineAuctionsState] = useState<OnlineAuction[]>(() =>
    getStorage('kvs_online_auctions', INITIAL_ONLINE_AUCTIONS)
  );
  const [employees, setEmployeesState] = useState<Employee[]>(() =>
    getStorage('kvs_employees', INITIAL_EMPLOYEES)
  );
  const [attendance, setAttendanceState] = useState<AttendanceRecord[]>(() =>
    getStorage('kvs_attendance', INITIAL_ATTENDANCE)
  );
  const [advances, setAdvancesState] = useState<CashAdvance[]>(() =>
    getStorage('kvs_advances', INITIAL_ADVANCES)
  );
  const [payrolls, setPayrollsState] = useState<PayrollRecord[]>(() =>
    getStorage('kvs_payrolls', [])
  );
  const [ledgerEntries, setLedgerEntriesState] = useState<LedgerEntry[]>(() =>
    getStorage('kvs_ledger_entries', INITIAL_LEDGER_ENTRIES)
  );
  const [mandiExpenses, setMandiExpensesState] = useState<MandiExpense[]>(() =>
    getStorage('kvs_mandi_expenses', INITIAL_MANDI_EXPENSES)
  );

  const setLedgerEntries = (data: LedgerEntry[]) => {
    setLedgerEntriesState(data);
    setStorage('kvs_ledger_entries', data);
  };

  const setMandiExpenses = (data: MandiExpense[]) => {
    setMandiExpensesState(data);
    setStorage('kvs_mandi_expenses', data);
  };

  const [smsLogs, setSmsLogsState] = useState<SmsLogEntry[]>(() =>
    getStorage('kvs_sms_logs', INITIAL_SMS_LOGS)
  );
  const setSmsLogs = (data: SmsLogEntry[]) => {
    setSmsLogsState(data);
    setStorage('kvs_sms_logs', data);
  };
  const addSmsLog = (entry: Omit<SmsLogEntry, 'id'>) => {
    const newEntry: SmsLogEntry = {
      id: 'sms-' + Date.now(),
      ...entry,
    };
    const updated = [newEntry, ...smsLogs];
    setSmsLogs(updated);
    return newEntry;
  };

  const [whatsAppLogs, setWhatsAppLogsState] = useState<WhatsAppLogEntry[]>(() =>
    getStorage('kvs_whatsapp_logs', INITIAL_WHATSAPP_LOGS)
  );
  const setWhatsAppLogs = (data: WhatsAppLogEntry[]) => {
    setWhatsAppLogsState(data);
    setStorage('kvs_whatsapp_logs', data);
  };
  const addWhatsAppLog = (entry: Omit<WhatsAppLogEntry, 'id'>) => {
    const newEntry: WhatsAppLogEntry = {
      id: 'wa-' + Date.now(),
      ...entry,
    };
    const updated = [newEntry, ...whatsAppLogs];
    setWhatsAppLogs(updated);
    return newEntry;
  };

  const [notifications, setNotificationsState] = useState<NotificationItem[]>(() =>
    getStorage('kvs_notifications', [
      {
        id: 'n-1',
        title: 'KVS Mandi Operating Desk',
        message: 'Floor auction calling engine initialized for Banana & Leaves trading.',
        type: 'info',
        timestamp: '08:00 AM',
        read: false,
      },
    ])
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStorage('kvs_lang', lang);
  };

  const setActiveRole = (role: Role) => {
    setActiveRoleState(role);
    setStorage('kvs_role', role);
  };

  const setActiveBranch = (branch: string) => {
    setActiveBranchState(branch);
    setStorage('kvs_branch', branch);
  };

  const updateProfile = (p: MandiProfile) => {
    setProfileState(p);
    setStorage('kvs_profile', p);
    addNotification('Company Profile Updated', 'Mandi details and statutory rates updated.', 'success');
  };

  const setSellers = (data: Seller[]) => {
    setSellersState(data);
    setStorage('kvs_sellers', data);
  };

  const setBuyers = (data: Buyer[]) => {
    setBuyersState(data);
    setStorage('kvs_buyers', data);
  };

  const setProducts = (data: Product[]) => {
    setProductsState(data);
    setStorage('kvs_products', data);
  };

  const setLots = (data: InwardLot[]) => {
    setLotsState(data);
    setStorage('kvs_lots', data);
  };

  const setTransactions = (data: AuctionTransaction[]) => {
    setTransactionsState(data);
    setStorage('kvs_txs', data);
  };

  const setOnlineAuctions = (data: OnlineAuction[] | ((prev: OnlineAuction[]) => OnlineAuction[])) => {
    setOnlineAuctionsState(prev => {
      const next = typeof data === 'function' ? data(prev) : data;
      setStorage('kvs_online_auctions', next);
      return next;
    });
  };

  const setEmployees = (data: Employee[]) => {
    setEmployeesState(data);
    setStorage('kvs_employees', data);
  };

  const setAttendance = (data: AttendanceRecord[]) => {
    setAttendanceState(data);
    setStorage('kvs_attendance', data);
  };

  const setAdvances = (data: CashAdvance[]) => {
    setAdvancesState(data);
    setStorage('kvs_advances', data);
  };

  const setPayrolls = (data: PayrollRecord[]) => {
    setPayrollsState(data);
    setStorage('kvs_payrolls', data);
  };

  const setNotifications = (data: NotificationItem[]) => {
    setNotificationsState(data);
    setStorage('kvs_notifications', data);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const currentUser: Employee = employees.find(e => e.role === activeRole) || {
    id: 'user-default',
    code: 'EMP-001',
    name: 'Active Mandi Operator',
    mobile: '9842100000',
    role: activeRole,
    joiningDate: '2024-01-01',
    salaryBasis: 'Monthly',
    baseSalary: 30000,
    overtimeRatePerHour: 150,
    portalAccess: true,
    permissions: ROLE_DEFAULT_PERMISSIONS[activeRole],
    branches: [activeBranch],
  };

  const hasPermission = (routePath: string): boolean => {
    const userPerms = currentUser.permissions || ROLE_DEFAULT_PERMISSIONS[activeRole];
    return canAccessRoute(routePath, userPerms);
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const item: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications([item, ...notifications.slice(0, 19)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // 1. Sellers Management
  const addSeller = (data: Omit<Seller, 'id' | 'createdAt'>): Seller => {
    const newSeller: Seller = {
      ...data,
      id: 's-' + (sellers.length + 1) + '-' + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSellers([newSeller, ...sellers]);
    addNotification('Farmer Onboarded', `${newSeller.name} (${newSeller.village}) registered.`, 'success');
    return newSeller;
  };

  const updateSeller = (data: Seller) => {
    setSellers(sellers.map(s => (s.id === data.id ? data : s)));
  };

  // 2. Buyers Management
  const addBuyer = (data: Omit<Buyer, 'id' | 'createdAt'>): Buyer => {
    const newBuyer: Buyer = {
      ...data,
      id: 'b-' + (buyers.length + 1) + '-' + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBuyers([newBuyer, ...buyers]);
    addNotification('Trader Registered', `${newBuyer.tradeName} (Paddle ${newBuyer.paddleNumber}) added.`, 'success');
    return newBuyer;
  };

  const updateBuyer = (data: Buyer) => {
    setBuyers(buyers.map(b => (b.id === data.id ? data : b)));
  };

  // 3. Products Management
  const addProduct = (data: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...data,
      id: 'p-' + (products.length + 1),
    };
    setProducts([...products, newProduct]);
    addNotification('Variety Registered', `${newProduct.name} rate benchmarked.`, 'success');
    return newProduct;
  };

  const updateProduct = (data: Product) => {
    setProducts(products.map(p => (p.id === data.id ? data : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    addNotification('Commodity Removed', 'Produce variety removed from catalog.', 'info');
  };

  // 4. Inward Produce Lots
  const addInwardLot = (data: Omit<InwardLot, 'id'>): InwardLot => {
    const newLot: InwardLot = {
      ...data,
      id: 'lot-' + (lots.length + 1) + '-' + Date.now().toString().slice(-4),
    };
    setLots([newLot, ...lots]);

    setSellers(
      sellers.map(s => {
        if (s.id === newLot.sellerId) {
          return {
            ...s,
            totalLotsCount: s.totalLotsCount + 1,
            totalVolume: s.totalVolume + newLot.initialQuantity,
          };
        }
        return s;
      })
    );

    addNotification('Produce Inwarded', `${newLot.productName} (${newLot.initialQuantity} ${newLot.unit}) received.`, 'info');
    return newLot;
  };

  const updateLotStatus = (lotId: string, status: InwardLot['status'], shed?: string) => {
    setLots(lots.map(l => (l.id === lotId ? { ...l, status, ...(shed ? { shedLocation: shed } : {}) } : l)));
  };

  // Financial Ledger Entry Creator
  const addLedgerEntry = (
    entry: Omit<LedgerEntry, 'id' | 'voucherNumber' | 'createdAt' | 'runningBalance'>
  ): LedgerEntry => {
    const voucherNumber = `LED-${new Date().getFullYear()}-${String(ledgerEntries.length + 1).padStart(3, '0')}`;
    const prevBalance = ledgerEntries.length > 0 ? ledgerEntries[0].runningBalance : 0;
    const runningBalance = prevBalance + entry.credit - entry.debit;

    const newEntry: LedgerEntry = {
      ...entry,
      id: 'led-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      voucherNumber,
      runningBalance,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...ledgerEntries];
    setLedgerEntries(updated);
    return newEntry;
  };

  // 5. Floor Auction Completion & Instant KVS Chit Generation
  const completeFloorAuctionLot = (payload: {
    lot: InwardLot;
    weighedQuantity: number;
    winningRate: number;
    buyer: Buyer;
  }): AuctionTransaction => {
    const { lot, weighedQuantity, winningRate, buyer } = payload;
    const prod = products.find(p => p.id === lot.productId);

    const grossAmount = weighedQuantity * winningRate;

    // Specific Mandi Deductions matching real KVS receipt
    const coolieAmount = prod?.coolieRatePerUnit || profile.defaultCooliePerUnit || 16.0;
    const rentAmount = prod?.rentRatePerUnit || profile.defaultRentPerUnit || 60.0;
    const magimaiAmount = prod?.magimaiRatePerUnit || profile.defaultMagimaiPerUnit || 1.0;
    const commissionPercent = prod?.commissionPercent || profile.defaultCommissionPercent || 10.0;
    const commissionAmount = Math.round((grossAmount * commissionPercent) / 100);

    const totalDeductions = coolieAmount + rentAmount + magimaiAmount + commissionAmount;
    const netFarmerPayable = Math.max(0, grossAmount - totalDeductions);

    const buyerMarketFee = Math.round((grossAmount * (prod?.marketFeePercent || 1.0)) / 100);
    const buyerTotalBilled = grossAmount + buyerMarketFee;

    const now = new Date();
    const billNumber = String(transactions.length + 54);
    const chitNumber = `KVS-2026-${String(transactions.length + 54).padStart(3, '0')}`;
    const dateFormatted = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeFormatted = now.toTimeString().slice(0, 8);

    const tx: AuctionTransaction = {
      id: 'tx-' + Date.now(),
      billNumber,
      chitNumber,
      date: dateFormatted,
      time: timeFormatted,
      lotId: lot.id,
      sellerId: lot.sellerId,
      sellerName: lot.sellerName,
      sellerVillage: lot.sellerVillage,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerTradeName: buyer.tradeName,
      buyerPaddle: buyer.paddleNumber,
      productId: lot.productId,
      productName: lot.productName,
      productNameTamil: lot.productNameTamil,
      variety: lot.variety,
      itemType: lot.itemType,
      unit: lot.unit,
      quantity: weighedQuantity,
      ratePerUnit: winningRate,
      grossAmount,
      coolieAmount,
      rentAmount,
      magimaiAmount,
      commissionPercent,
      commissionAmount,
      totalDeductions,
      netFarmerPayable,
      buyerMarketFee,
      buyerTotalBilled,
      type: 'ManualFloor',
      gatePassIssued: true,
    };

    setTransactions([tx, ...transactions]);

    // Deduct stock
    const remaining = Math.max(0, lot.availableQuantity - weighedQuantity);
    setLots(
      lots.map(l =>
        l.id === lot.id
          ? {
            ...l,
            availableQuantity: remaining,
            status: remaining === 0 ? 'Sold' : 'InAuction',
          }
          : l
      )
    );

    // Update buyer outstanding dues
    setBuyers(
      buyers.map(b =>
        b.id === buyer.id
          ? {
            ...b,
            outstandingDues: b.outstandingDues + buyerTotalBilled,
            status:
              b.outstandingDues + buyerTotalBilled > b.depositAmount + b.creditLimit
                ? 'Blocked'
                : b.outstandingDues + buyerTotalBilled > (b.depositAmount + b.creditLimit) * 0.8
                  ? 'Warning'
                  : 'Active',
          }
          : b
      )
    );

    // Update farmer balance
    setSellers(
      sellers.map(s =>
        s.id === lot.sellerId
          ? {
            ...s,
            payoutBalance: s.payoutBalance + netFarmerPayable,
          }
          : s
      )
    );

    // Record in Financial General Ledger
    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'AUCTION_SALE',
      partyType: 'Buyer',
      partyId: buyer.id,
      partyName: buyer.tradeName,
      partyCode: buyer.paddleNumber,
      debit: buyerTotalBilled,
      credit: 0,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Auction Bill #${billNumber}: ${weighedQuantity} ${lot.unit} ${lot.productName} awarded to ${buyer.tradeName}`,
      narrationTamil: `ஏல பில் #${billNumber}: ${weighedQuantity} ${lot.unit} ${lot.productNameTamil || lot.productName} - வியாபாரி பற்று`,
      category: 'Produce Sale',
    });

    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'AUCTION_SALE',
      partyType: 'Farmer',
      partyId: lot.sellerId,
      partyName: lot.sellerName,
      partyCode: lot.sellerId,
      debit: 0,
      credit: netFarmerPayable,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Farmer Patti Credit: Bill #${billNumber} (${weighedQuantity} ${lot.unit} - Net: ₹${netFarmerPayable.toLocaleString('en-IN')})`,
      narrationTamil: `விவசாயி பட்டி வரவு: பில் #${billNumber} (நிகர வரவு: ₹${netFarmerPayable.toLocaleString('en-IN')})`,
      category: 'Patti Settlement',
    });

    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'COMMISSION_INCOME',
      partyType: 'Mandi',
      partyName: profile.shopName,
      debit: 0,
      credit: commissionAmount,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Mandi Commission (${commissionPercent}%) on Bill #${billNumber}`,
      narrationTamil: `மண்டி கமிஷன் (${commissionPercent}%) பில் #${billNumber}`,
      category: 'Commission',
    });

    addNotification(
      'Mandi Sale Completed',
      `Bill #${billNumber}: ${lot.productName} awarded to ${buyer.tradeName} for ₹${grossAmount}`,
      'success'
    );

    return tx;
  };

  // 6. Online Digital Auction
  const createOnlineAuction = (payload: {
    lot: InwardLot;
    reservePrice: number;
    durationMinutes: number;
  }) => {
    const { lot, reservePrice, durationMinutes } = payload;
    const newAuction: OnlineAuction = {
      id: 'oa-' + (onlineAuctions.length + 1) + '-' + Date.now().toString().slice(-4),
      auctionCode: 'ONL-' + new Date().getFullYear() + '-' + String(onlineAuctions.length + 1).padStart(2, '0'),
      lotId: lot.id,
      productName: lot.productName,
      productNameTamil: lot.productNameTamil,
      variety: lot.variety,
      varietyTamil: lot.varietyTamil,
      itemType: lot.itemType,
      sellerName: lot.sellerName,
      sellerVillage: lot.sellerVillage,
      quantity: lot.availableQuantity,
      unit: lot.unit,
      reservePrice,
      currentHighestBid: reservePrice,
      bidsCount: 0,
      bidsHistory: [],
      durationSeconds: durationMinutes * 60,
      remainingSeconds: durationMinutes * 60,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Live',
      antiSniped: false,
      autoBidActive: true,
    };

    setOnlineAuctions([newAuction, ...onlineAuctions]);
    updateLotStatus(lot.id, 'InAuction');
    addNotification('Digital Auction Started', `${newAuction.productName} is now live for remote bidding!`, 'info');
  };

  const placeOnlineBid = (auctionId: string, amount: number, bidder: Buyer) => {
    setOnlineAuctions((prev: OnlineAuction[]) =>
      prev.map(a => {
        if (a.id !== auctionId || a.status !== 'Live') return a;
        if (amount <= a.currentHighestBid) return a;

        const newBid: OnlineBid = {
          id: 'bid-' + Date.now(),
          bidderId: bidder.id,
          bidderName: bidder.name,
          bidderTradeName: bidder.tradeName,
          paddleNumber: bidder.paddleNumber,
          amount,
          timestamp: new Date().toLocaleTimeString(),
        };

        let extraSecs = 0;
        let antiSniped = a.antiSniped;
        if (a.remainingSeconds <= 30) {
          extraSecs = 60;
          antiSniped = true;
        }

        return {
          ...a,
          currentHighestBid: amount,
          currentLeaderBuyerId: bidder.id,
          currentLeaderBuyerName: bidder.tradeName,
          currentLeaderPaddle: bidder.paddleNumber,
          bidsCount: a.bidsCount + 1,
          bidsHistory: [newBid, ...a.bidsHistory],
          remainingSeconds: a.remainingSeconds + extraSecs,
          antiSniped,
        };
      })
    );
  };

  const toggleAutoBidding = (auctionId: string) => {
    setOnlineAuctions((prev: OnlineAuction[]) =>
      prev.map(a => (a.id === auctionId ? { ...a, autoBidActive: !a.autoBidActive } : a))
    );
  };

  const completeDigitalAuctionLot = (auctionId: string): AuctionTransaction | null => {
    const auction = onlineAuctions.find(a => a.id === auctionId);
    if (!auction || !auction.currentLeaderBuyerId) return null;

    const lot = lots.find(l => l.id === auction.lotId);
    const buyer = buyers.find(b => b.id === auction.currentLeaderBuyerId);
    if (!buyer || !lot) return null;

    const prod = products.find(p => p.id === lot.productId);
    const weighedQuantity = auction.quantity;
    const winningRate = auction.currentHighestBid;
    const grossAmount = weighedQuantity * winningRate;

    const coolieAmount = prod?.coolieRatePerUnit || profile.defaultCooliePerUnit || 16.0;
    const rentAmount = prod?.rentRatePerUnit || profile.defaultRentPerUnit || 60.0;
    const magimaiAmount = prod?.magimaiRatePerUnit || profile.defaultMagimaiPerUnit || 1.0;
    const commissionPercent = prod?.commissionPercent || profile.defaultCommissionPercent || 10.0;
    const commissionAmount = Math.round((grossAmount * commissionPercent) / 100);

    const totalDeductions = coolieAmount + rentAmount + magimaiAmount + commissionAmount;
    const netFarmerPayable = Math.max(0, grossAmount - totalDeductions);

    const buyerMarketFee = Math.round((grossAmount * (prod?.marketFeePercent || 1.0)) / 100);
    const buyerTotalBilled = grossAmount + buyerMarketFee;

    const now = new Date();
    const billNumber = String(transactions.length + 54);
    const chitNumber = `KVS-2026-${String(transactions.length + 54).padStart(3, '0')}`;
    const dateFormatted = now.toLocaleDateString('en-GB');
    const timeFormatted = now.toTimeString().slice(0, 8);

    const tx: AuctionTransaction = {
      id: 'tx-' + Date.now(),
      billNumber,
      chitNumber,
      date: dateFormatted,
      time: timeFormatted,
      lotId: lot.id,
      sellerId: lot.sellerId,
      sellerName: lot.sellerName,
      sellerVillage: lot.sellerVillage,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerTradeName: buyer.tradeName,
      buyerPaddle: buyer.paddleNumber,
      productId: lot.productId,
      productName: lot.productName,
      productNameTamil: lot.productNameTamil,
      variety: lot.variety,
      itemType: lot.itemType,
      unit: lot.unit,
      quantity: weighedQuantity,
      ratePerUnit: winningRate,
      grossAmount,
      coolieAmount,
      rentAmount,
      magimaiAmount,
      commissionPercent,
      commissionAmount,
      totalDeductions,
      netFarmerPayable,
      buyerMarketFee,
      buyerTotalBilled,
      type: 'DigitalOnline',
      gatePassIssued: true,
    };

    setTransactions([tx, ...transactions]);

    setOnlineAuctions((prev: OnlineAuction[]) =>
      prev.map(a =>
        a.id === auctionId
          ? {
            ...a,
            status: 'Awarded' as const,
            remainingSeconds: 0,
            winningBid: winningRate,
            winningBuyerName: buyer.tradeName,
          }
          : a
      )
    );

    setLots(
      lots.map(l =>
        l.id === lot.id
          ? {
            ...l,
            availableQuantity: 0,
            status: 'Sold' as const,
          }
          : l
      )
    );

    setBuyers(
      buyers.map(b =>
        b.id === buyer.id
          ? {
            ...b,
            outstandingDues: b.outstandingDues + buyerTotalBilled,
            status:
              b.outstandingDues + buyerTotalBilled > b.depositAmount + b.creditLimit
                ? ('Blocked' as const)
                : b.outstandingDues + buyerTotalBilled > (b.depositAmount + b.creditLimit) * 0.8
                  ? ('Warning' as const)
                  : ('Active' as const),
          }
          : b
      )
    );

    setSellers(
      sellers.map(s =>
        s.id === lot.sellerId
          ? {
            ...s,
            payoutBalance: s.payoutBalance + netFarmerPayable,
          }
          : s
      )
    );

    // Record in Financial General Ledger
    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'AUCTION_SALE',
      partyType: 'Buyer',
      partyId: buyer.id,
      partyName: buyer.tradeName,
      partyCode: buyer.paddleNumber,
      debit: buyerTotalBilled,
      credit: 0,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Digital Auction Bill #${billNumber}: ${lot.productName} awarded to ${buyer.tradeName}`,
      narrationTamil: `டிஜிட்டல் ஏல பில் #${billNumber}: ${lot.productNameTamil || lot.productName} - வியாபாரி பற்று`,
      category: 'Produce Sale',
    });

    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'AUCTION_SALE',
      partyType: 'Farmer',
      partyId: lot.sellerId,
      partyName: lot.sellerName,
      partyCode: lot.sellerId,
      debit: 0,
      credit: netFarmerPayable,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Farmer Patti Credit: Bill #${billNumber} (Net: ₹${netFarmerPayable.toLocaleString('en-IN')})`,
      narrationTamil: `விவசாயி பட்டி வரவு: பில் #${billNumber} (நிகர வரவு: ₹${netFarmerPayable.toLocaleString('en-IN')})`,
      category: 'Patti Settlement',
    });

    addLedgerEntry({
      date: dateFormatted,
      time: timeFormatted,
      type: 'COMMISSION_INCOME',
      partyType: 'Mandi',
      partyName: profile.shopName,
      debit: 0,
      credit: commissionAmount,
      paymentMode: 'Credit',
      referenceNo: chitNumber,
      narration: `Mandi Commission (${commissionPercent}%) on Digital Bill #${billNumber}`,
      narrationTamil: `மண்டி கமிஷன் (${commissionPercent}%) பில் #${billNumber}`,
      category: 'Commission',
    });

    addNotification(
      'Digital Auction Hammer Fell',
      `Bill #${billNumber}: ${lot.productName} awarded to ${buyer.tradeName} for ₹${grossAmount.toLocaleString()}`,
      'success'
    );

    return tx;
  };

  const recordFarmerPayout = (
    sellerId: string,
    amount: number,
    paymentMode: PaymentMode = 'Cash',
    reference?: string,
    remarks?: string
  ) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;
    const payoutAmount = Math.max(0, amount);

    setSellers(
      sellers.map(s =>
        s.id === sellerId
          ? {
              ...s,
              payoutBalance: Math.max(0, s.payoutBalance - payoutAmount),
            }
          : s
      )
    );

    const now = new Date();
    addLedgerEntry({
      date: now.toLocaleDateString('en-GB'),
      time: now.toTimeString().slice(0, 8),
      type: 'FARMER_PAYOUT',
      partyType: 'Farmer',
      partyId: seller.id,
      partyName: seller.name,
      partyCode: seller.code,
      debit: payoutAmount,
      credit: 0,
      paymentMode,
      referenceNo: reference || `PAY-${seller.code}-${Date.now().toString().slice(-4)}`,
      narration: remarks || `Farmer settlement payout paid to ${seller.name} (${seller.village}) via ${paymentMode}`,
      narrationTamil: `விவசாயி ${seller.nameTamil || seller.name} (${seller.village}) பட்டி பட்டுவாடா - ${paymentMode}`,
      category: 'Patti Settlement',
    });

    addNotification(
      'Farmer Settlement Completed',
      `Paid ₹${payoutAmount.toLocaleString('en-IN')} to ${seller.name} via ${paymentMode}. Balance settled.`,
      'success'
    );
  };

  const recordBuyerReceipt = (
    buyerId: string,
    amount: number,
    paymentMode: PaymentMode = 'Bank Transfer',
    reference?: string,
    remarks?: string
  ) => {
    const buyer = buyers.find(b => b.id === buyerId);
    if (!buyer) return;
    const receiptAmount = Math.max(0, amount);

    const remainingDues = Math.max(0, buyer.outstandingDues - receiptAmount);
    setBuyers(
      buyers.map(b =>
        b.id === buyerId
          ? {
              ...b,
              outstandingDues: remainingDues,
              status:
                remainingDues > b.depositAmount + b.creditLimit
                  ? ('Blocked' as const)
                  : remainingDues > (b.depositAmount + b.creditLimit) * 0.8
                    ? ('Warning' as const)
                    : ('Active' as const),
            }
          : b
      )
    );

    const now = new Date();
    addLedgerEntry({
      date: now.toLocaleDateString('en-GB'),
      time: now.toTimeString().slice(0, 8),
      type: 'BUYER_COLLECTION',
      partyType: 'Buyer',
      partyId: buyer.id,
      partyName: buyer.tradeName,
      partyCode: buyer.paddleNumber,
      debit: 0,
      credit: receiptAmount,
      paymentMode,
      referenceNo: reference || `RCT-${buyer.paddleNumber}-${Date.now().toString().slice(-4)}`,
      narration: remarks || `Payment received from trader ${buyer.tradeName} (${buyer.paddleNumber}) via ${paymentMode}`,
      narrationTamil: `வியாபாரி ${buyer.tradeNameTamil || buyer.tradeName} (${buyer.paddleNumber}) வசூல் வரவு - ${paymentMode}`,
      category: 'Buyer Collection',
    });

    addNotification(
      'Trader Payment Received',
      `Received ₹${receiptAmount.toLocaleString('en-IN')} from ${buyer.tradeName} via ${paymentMode}. Dues cleared.`,
      'success'
    );
  };

  const recordMandiExpense = (data: Omit<MandiExpense, 'id' | 'voucherNo'>): MandiExpense => {
    const voucherNo = `EXP-${new Date().getFullYear()}-${String(mandiExpenses.length + 1).padStart(2, '0')}`;
    const newExpense: MandiExpense = {
      ...data,
      id: 'exp-' + Date.now(),
      voucherNo,
    };
    const updated = [newExpense, ...mandiExpenses];
    setMandiExpenses(updated);

    const now = new Date();
    addLedgerEntry({
      date: data.date || now.toLocaleDateString('en-GB'),
      time: data.time || now.toTimeString().slice(0, 8),
      type: 'EXPENSE_PAYMENT',
      partyType: 'Expense',
      partyName: data.paidTo || data.category,
      debit: data.amount,
      credit: 0,
      paymentMode: data.paymentMode,
      referenceNo: voucherNo,
      narration: data.remarks || `Mandi Operational Expense: ${data.category} paid to ${data.paidTo}`,
      narrationTamil: `மண்டி நிர்வாக செலவு: ${data.categoryTamil || data.category} - ${data.paidTo}`,
      category: data.category,
    });

    addNotification(
      'Mandi Expense Recorded',
      `Disbursed ₹${data.amount.toLocaleString('en-IN')} for ${data.category} (${data.paidTo}).`,
      'warning'
    );
    return newExpense;
  };

  const settleFarmerPayout = (sellerId: string, amount?: number, paymentMode: string = 'Cash') => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;
    const settleAmount = amount !== undefined ? amount : seller.payoutBalance;
    recordFarmerPayout(sellerId, settleAmount, (paymentMode as PaymentMode) || 'Cash');
  };

  const recordBuyerPayment = (buyerId: string, amount: number, paymentMode: string = 'Bank Transfer') => {
    recordBuyerReceipt(buyerId, amount, (paymentMode as PaymentMode) || 'Bank Transfer');
  };

  // Real-time ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineAuctions((prevAuctions: OnlineAuction[]) => {
        let changed = false;
        const next = prevAuctions.map(auction => {
          if (auction.status !== 'Live') return auction;
          changed = true;

          const newRemaining = Math.max(0, auction.remainingSeconds - 1);
          if (newRemaining === 0) {
            const hasMetReserve = auction.currentHighestBid >= auction.reservePrice;
            return {
              ...auction,
              remainingSeconds: 0,
              status: (hasMetReserve ? 'Awarded' : 'Unsold') as OnlineAuction['status'],
              winningBid: hasMetReserve ? auction.currentHighestBid : undefined,
              winningBuyerName: hasMetReserve ? auction.currentLeaderBuyerName : undefined,
            };
          }

          let simulatedAuction = { ...auction, remainingSeconds: newRemaining };
          if (
            auction.autoBidActive &&
            newRemaining > 5 &&
            newRemaining % 8 === 0 &&
            Math.random() > 0.4 &&
            buyers.length > 0
          ) {
            const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
            if (randomBuyer.id !== auction.currentLeaderBuyerId) {
              const increments = [10, 25, 50];
              const inc = increments[Math.floor(Math.random() * increments.length)];
              const newAmount = auction.currentHighestBid + inc;

              const rivalBid: OnlineBid = {
                id: 'bid-sim-' + Date.now(),
                bidderId: randomBuyer.id,
                bidderName: randomBuyer.name,
                bidderTradeName: randomBuyer.tradeName,
                paddleNumber: randomBuyer.paddleNumber,
                amount: newAmount,
                timestamp: new Date().toLocaleTimeString(),
              };

              let extraSecs = 0;
              let antiSniped = simulatedAuction.antiSniped;
              if (newRemaining <= 30) {
                extraSecs = 60;
                antiSniped = true;
              }

              simulatedAuction = {
                ...simulatedAuction,
                currentHighestBid: newAmount,
                currentLeaderBuyerId: randomBuyer.id,
                currentLeaderBuyerName: randomBuyer.tradeName,
                currentLeaderPaddle: randomBuyer.paddleNumber,
                bidsCount: simulatedAuction.bidsCount + 1,
                bidsHistory: [rivalBid, ...simulatedAuction.bidsHistory],
                remainingSeconds: newRemaining + extraSecs,
                antiSniped,
              };
            }
          }

          return simulatedAuction;
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [buyers]);

  // 7. Workforce Management
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + (employees.length + 1) + '-' + Date.now().toString().slice(-4),
    };
    setEmployees([...employees, newEmp]);
    addNotification('Staff Member Added', `${newEmp.name} registered.`, 'success');
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(employees.map(e => (e.id === emp.id ? emp : e)));
  };

  const resetEmployeePassword = (empId: string, newPass: string) => {
    setEmployees(employees.map(e => (e.id === empId ? { ...e, password: newPass } : e)));
    addNotification('Password Updated', 'Staff portal password reset successfully.', 'info');
  };

  // 8. Attendance
  const markAttendance = (data: Omit<AttendanceRecord, 'id' | 'updatedAt'>) => {
    const existingIndex = attendance.findIndex(a => a.date === data.date && a.employeeId === data.employeeId);
    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: data.status,
        overtimeHours: data.overtimeHours,
        branch: data.branch,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const record: AttendanceRecord = {
        ...data,
        id: 'att-' + Date.now(),
        updatedAt: new Date().toISOString(),
      };
      updated = [record, ...attendance];
    }
    setAttendance(updated);
  };

  const markAllPresentForDate = (date: string, branch: string) => {
    const newRecords: AttendanceRecord[] = employees.map(emp => ({
      id: 'att-' + emp.id + '-' + date,
      date,
      employeeId: emp.id,
      status: 'P',
      overtimeHours: 0,
      branch,
      updatedAt: new Date().toISOString(),
    }));

    const filtered = attendance.filter(a => a.date !== date);
    setAttendance([...newRecords, ...filtered]);
    addNotification('Attendance Marked', `All staff marked Present for ${date}.`, 'success');
  };

  // 9. Staff Advances
  const recordCashAdvance = (data: Omit<CashAdvance, 'id' | 'voucherNumber'>): CashAdvance => {
    const voucherNumber = 'ADV-2026-' + Math.floor(100 + Math.random() * 900);
    const newAdv: CashAdvance = {
      ...data,
      id: 'adv-' + Date.now(),
      voucherNumber,
    };
    setAdvances([newAdv, ...advances]);

    const now = new Date();
    addLedgerEntry({
      date: now.toLocaleDateString('en-GB'),
      time: now.toTimeString().slice(0, 8),
      type: 'STAFF_ADVANCE',
      partyType: 'Staff',
      partyId: data.employeeId,
      partyName: data.employeeName,
      debit: data.amount,
      credit: 0,
      paymentMode: 'Cash',
      referenceNo: voucherNumber,
      narration: `Staff Advance disbursed to ${data.employeeName} (${data.reason})`,
      narrationTamil: `பணியாளர் அட்வான்ஸ் ரொக்கம்: ${data.employeeName} (${data.reason})`,
      category: 'Staff Advance',
    });

    addNotification('Cash Advance Disbursed', `₹${data.amount.toLocaleString('en-IN')} disbursed to ${data.employeeName}.`, 'warning');
    return newAdv;
  };

  // 10. Salary & Payroll
  const generateMonthlyPayroll = (monthStr: string): PayrollRecord[] => {
    const records: PayrollRecord[] = employees.map(emp => {
      const empAtt = attendance.filter(a => a.employeeId === emp.id && a.date.startsWith(monthStr));
      const daysPresent = empAtt.filter(a => a.status === 'P').length;
      const daysHalf = empAtt.filter(a => a.status === 'HD').length;
      const daysAbsent = empAtt.filter(a => a.status === 'A').length;
      const daysLeave = empAtt.filter(a => a.status === 'L').length;

      const totalWorkedDays = daysPresent + daysHalf * 0.5;
      const totalOtHours = empAtt.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
      const overtimePay = Math.round(totalOtHours * (emp.overtimeRatePerHour || 100));

      let baseSalaryEarned = 0;
      if (emp.salaryBasis === 'Daily') {
        baseSalaryEarned = Math.round(totalWorkedDays * emp.baseSalary);
      } else {
        const dayRate = emp.baseSalary / 26;
        baseSalaryEarned = Math.round(totalWorkedDays * dayRate);
      }

      const grossSalary = baseSalaryEarned + overtimePay;

      const activeAdv = advances
        .filter(adv => adv.employeeId === emp.id && adv.status === 'Active')
        .reduce((sum, adv) => sum + adv.amount, 0);

      const advanceDeduction = Math.min(activeAdv, Math.round(grossSalary * 0.5));
      const otherDeduction = 0;
      const netSalary = Math.max(0, grossSalary - advanceDeduction - otherDeduction);

      return {
        id: 'pay-' + emp.id + '-' + monthStr,
        payrollMonth: monthStr,
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        role: emp.role,
        baseSalary: emp.baseSalary,
        daysPresent,
        daysHalf,
        daysAbsent,
        daysLeave,
        overtimeHours: totalOtHours,
        overtimePay,
        grossSalary,
        advanceDeduction,
        otherDeduction,
        netSalary,
        paymentStatus: 'Pending',
      };
    });

    setPayrolls(records);
    return records;
  };

  const processSalaryPayment = (payrollId: string, paymentMethod: string, remarks?: string) => {
    const target = payrolls.find(p => p.id === payrollId);
    if (!target) return;

    const updatedPayrolls = payrolls.map(p =>
      p.id === payrollId
        ? {
          ...p,
          paymentStatus: 'Processed' as const,
          paidDate: new Date().toISOString().slice(0, 10),
          paidFromAccount: paymentMethod,
          remarks,
        }
        : p
    );
    setPayrolls(updatedPayrolls);

    if (target.advanceDeduction > 0) {
      let remainingToRecover = target.advanceDeduction;
      const updatedAdvances = advances.map(adv => {
        if (adv.employeeId === target.employeeId && adv.status === 'Active' && remainingToRecover > 0) {
          if (adv.amount <= remainingToRecover) {
            remainingToRecover -= adv.amount;
            return {
              ...adv,
              status: 'Recovered' as const,
              recoveredInMonth: target.payrollMonth,
            };
          }
        }
        return adv;
      });
      setAdvances(updatedAdvances);
    }

    const now = new Date();
    addLedgerEntry({
      date: now.toLocaleDateString('en-GB'),
      time: now.toTimeString().slice(0, 8),
      type: 'SALARY_PAYOUT',
      partyType: 'Staff',
      partyId: target.employeeId,
      partyName: target.employeeName,
      debit: target.netSalary,
      credit: 0,
      paymentMode: (paymentMethod as any) || 'Bank Transfer',
      referenceNo: target.id,
      narration: `Monthly Salary Payout for ${target.payrollMonth} to ${target.employeeName} (${remarks || paymentMethod})`,
      narrationTamil: `மாதாந்திர சம்பளம் பட்டுவாடா: ${target.payrollMonth} - ${target.employeeName}`,
      category: 'Salary Payroll',
    });

    addNotification(
      'Wage Disbursed',
      `Net pay ₹${target.netSalary.toLocaleString('en-IN')} paid to ${target.employeeName}.`,
      'success'
    );
  };

  const loadDemoData = () => {
    setIsLoading(true);
    setLoadingMessage(language === 'ta' ? 'மாதிரி வாழை மண்டி தரவுகள் ஏற்றப்படுகின்றன...' : 'Loading Demo Banana Mandi Data...');
    setTimeout(() => {
      setProfileState(INITIAL_MANDI_PROFILE);
      setStorage('kvs_profile', INITIAL_MANDI_PROFILE);

      setSellersState(INITIAL_SELLERS);
      setStorage('kvs_sellers', INITIAL_SELLERS);

      setBuyersState(INITIAL_BUYERS);
      setStorage('kvs_buyers', INITIAL_BUYERS);

      setProductsState(INITIAL_PRODUCTS);
      setStorage('kvs_products', INITIAL_PRODUCTS);

      setLotsState(INITIAL_INWARD_LOTS);
      setStorage('kvs_lots', INITIAL_INWARD_LOTS);

      setTransactionsState(INITIAL_AUCTION_TRANSACTIONS);
      setStorage('kvs_txs', INITIAL_AUCTION_TRANSACTIONS);

      setOnlineAuctionsState(INITIAL_ONLINE_AUCTIONS);
      setStorage('kvs_online_auctions', INITIAL_ONLINE_AUCTIONS);

      setEmployeesState(INITIAL_EMPLOYEES);
      setStorage('kvs_employees', INITIAL_EMPLOYEES);

      setAttendanceState(INITIAL_ATTENDANCE);
      setStorage('kvs_attendance', INITIAL_ATTENDANCE);

      setAdvancesState(INITIAL_ADVANCES);
      setStorage('kvs_advances', INITIAL_ADVANCES);

      setPayrollsState([]);
      setStorage('kvs_payrolls', []);

      setLedgerEntriesState(INITIAL_LEDGER_ENTRIES);
      setStorage('kvs_ledger_entries', INITIAL_LEDGER_ENTRIES);

      setMandiExpensesState(INITIAL_MANDI_EXPENSES);
      setStorage('kvs_mandi_expenses', INITIAL_MANDI_EXPENSES);

      setIsLoading(false);
      setLoadingMessage('');
      addNotification(
        language === 'ta' ? 'மாதிரி தரவு ஏற்றப்பட்டது' : 'Demo Data Loaded',
        language === 'ta' ? 'கேவிஎஸ் வாழை விவசாயிகள், வியாபாரிகள், ஏல சீட்டுகள் தயார்.' : 'Demo Banana & Leaves Mandi baseline restored with mock data.',
        'success'
      );
    }, 400);
  };

  const clearAllData = () => {
    setIsLoading(true);
    setLoadingMessage(language === 'ta' ? 'அனைத்து தரவுகளும் அழிக்கப்பட்டு புதிய தரவுத்தளம் அமைக்கப்படுகிறது...' : 'Clearing demo data for 100% manual entry...');
    setTimeout(() => {
      setSellersState([]);
      setStorage('kvs_sellers', []);

      setBuyersState([]);
      setStorage('kvs_buyers', []);

      setLotsState([]);
      setStorage('kvs_lots', []);

      setTransactionsState([]);
      setStorage('kvs_txs', []);

      setOnlineAuctionsState([]);
      setStorage('kvs_online_auctions', []);

      setAttendanceState([]);
      setStorage('kvs_attendance', []);

      setAdvancesState([]);
      setStorage('kvs_advances', []);

      setPayrollsState([]);
      setStorage('kvs_payrolls', []);

      setLedgerEntriesState([]);
      setStorage('kvs_ledger_entries', []);

      setMandiExpensesState([]);
      setStorage('kvs_mandi_expenses', []);

      setIsLoading(false);
      setLoadingMessage('');
      addNotification(
        language === 'ta' ? 'தரவுத்தளம் சுத்தப்படுத்தப்பட்டது' : 'Database Cleared',
        language === 'ta' ? 'இப்போது நீங்கள் நேரடி விவரங்களை உள்ளிடலாம். அனைத்து உள்ளீடுகளும் உள்ளூரில் (LocalStorage) சேமிக்கப்படும்.' : 'Demo data removed. Ready for manual entry, all records will save to LocalStorage.',
        'info'
      );
    }, 400);
  };

  const resetAllDemoData = () => {
    loadDemoData();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isLoading,
        loadingMessage,
        language,
        setLanguage,
        t,
        activeRole,
        setActiveRole,
        activeBranch,
        setActiveBranch,
        currentUser,
        hasPermission,
        profile,
        updateProfile,
        sellers,
        addSeller,
        updateSeller,
        buyers,
        addBuyer,
        updateBuyer,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        lots,
        addInwardLot,
        updateLotStatus,
        transactions,
        completeFloorAuctionLot,
        onlineAuctions,
        createOnlineAuction,
        placeOnlineBid,
        toggleAutoBidding,
        completeDigitalAuctionLot,
        settleFarmerPayout,
        recordBuyerPayment,
        ledgerEntries,
        mandiExpenses,
        addLedgerEntry,
        recordFarmerPayout,
        recordBuyerReceipt,
        recordMandiExpense,
        employees,
        addEmployee,
        updateEmployee,
        resetEmployeePassword,
        attendance,
        markAttendance,
        markAllPresentForDate,
        advances,
        recordCashAdvance,
        payrolls,
        generateMonthlyPayroll,
        processSalaryPayment,
        notifications,
        addNotification,
        markNotificationRead,
        smsLogs,
        addSmsLog,
        whatsAppLogs,
        addWhatsAppLog,
        resetAllDemoData,
        loadDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
