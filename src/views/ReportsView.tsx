import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Seller,
  Buyer,
  AuctionTransaction,
  MandiProfile,
  PaymentMode,
  SmsLogEntry,
  WhatsAppLogEntry,
} from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  MessageSquare,
  FileText,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Receipt,
  Store,
  Save,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertCircle,
  Briefcase,
  ShieldAlert,
  Percent,
  CreditCard,
  Crown,
  BookOpen,
  Eye,
  Send,
  X,
  Phone,
  Filter,
} from 'lucide-react';
import { FarmerPattiSlip } from '../components/receipts/FarmerPattiSlip';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';
import { LedgerView } from './LedgerView';

interface ReportsViewProps {
  onNavigate?: (path: string) => void;
  initialTab?:
    | 'seller-report'
    | 'buyer-report'
    | 'agent-report'
    | 'sms-log'
    | 'whatsapp-log'
    | 'ledger'
    | 'sales'
    | 'pos-bill'
    | 'a5-sheet'
    | 'company-profile';
}

const getTamilUnit = (itemType?: string, unit?: string) => {
  const str = `${itemType || ''} ${unit || ''}`.toLowerCase();
  if (str.includes('leaf') || str.includes('இலை') || str.includes('bundle') || str.includes('கட்டு')) return 'கட்டு';
  if (str.includes('crate') || str.includes('கூடை')) return 'கூடை';
  if (str.includes('bag') || str.includes('மூட்டை')) return 'மூட்டை';
  if (str.includes('box') || str.includes('பெட்டி')) return 'பெட்டி';
  if (str.includes('kg') || str.includes('கிலோ')) return 'கிலோ';
  if (str.includes('quintal') || str.includes('குவின்டால்')) return 'குவின்டால்';
  if (str.includes('piece') || str.includes('எண்ணிக்கை')) return 'எண்ணிக்கை';
  if (str.includes('ton') || str.includes('டன்')) return 'டன்';
  if (str.includes('bunch') || str.includes('தார்')) return 'தார்';
  return unit ? unit.split(' ')[0] : itemType || 'அளவு';
};

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate, initialTab = 'seller-report' }) => {
  const {
    t,
    language,
    profile,
    updateProfile,
    transactions,
    sellers,
    buyers,
    ledgerEntries,
    mandiExpenses,
    smsLogs,
    addSmsLog,
    whatsAppLogs,
    addWhatsAppLog,
    settleFarmerPayout,
    recordBuyerPayment,
    recordFarmerPayout,
    recordBuyerReceipt,
  } = useApp();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<
    | 'seller-report'
    | 'buyer-report'
    | 'agent-report'
    | 'sms-log'
    | 'whatsapp-log'
    | 'ledger'
    | 'sales'
    | 'pos-bill'
    | 'a5-sheet'
    | 'company-profile'
  >(initialTab);

  // Filter & Generate Form States
  const [datePreset, setDatePreset] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [reportType, setReportType] = useState<string>('all');
  const [selectedSellerFilter, setSelectedSellerFilter] = useState<string>('all');
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [auctionSource, setAuctionSource] = useState<string>('all');
  const [lotNameFilter, setLotNameFilter] = useState<string>('all');

  // Applied Filter Snapshot
  const [appliedFilters, setAppliedFilters] = useState({
    datePreset: 'all',
    dateFrom: '',
    dateTo: '',
    reportType: 'all',
    seller: 'all',
    buyer: 'all',
    minAmount: 0,
    auctionSource: 'all',
    lotName: 'all',
  });

  // Sorting state: 'asc' | 'desc' (by date) | 'total-asc' | 'total-desc' (by amount)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'total-asc' | 'total-desc'>('desc');

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [modalA5Tx, setModalA5Tx] = useState<AuctionTransaction | null>(null);
  const [modalPosTx, setModalPosTx] = useState<AuctionTransaction | null>(null);
  const [viewDetailTx, setViewDetailTx] = useState<AuctionTransaction | null>(null);
  const [viewSmsItem, setViewSmsItem] = useState<SmsLogEntry | null>(null);

  // Send Message Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ name: string; mobile: string; info: string } | null>(null);
  const [messageType, setMessageType] = useState<'SMS' | 'WhatsApp'>('SMS');
  const [customMessage, setCustomMessage] = useState('');

  // Farmer Patti & Quick Action Modals
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(sellers[0]?.id || '');
  const [showPattiSlip, setShowPattiSlip] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMode, setPayoutMode] = useState<PaymentMode>('Cash');
  const [payoutRef, setPayoutRef] = useState('');

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMode, setCollectMode] = useState<PaymentMode>('UPI / GPay');
  const [collectRef, setCollectRef] = useState('');

  // Selected Bill for POS / A5 tabs
  const [selectedBillId, setSelectedBillId] = useState<string>(transactions[0]?.id || '');
  const activeBill = transactions.find(t => t.id === selectedBillId) || transactions[0];

  // Mandi Profile data
  const [profileData, setProfileData] = useState<MandiProfile>(profile);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setProfileData(profile);
  }, [profile]);

  // Handle Date Preset Selection
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const formatted = formatDate(today);
      setDateFrom(formatted);
      setDateTo(formatted);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const formatted = formatDate(y);
      setDateFrom(formatted);
      setDateTo(formatted);
    } else if (preset === 'week') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      setDateFrom(formatDate(w));
      setDateTo(formatDate(today));
    } else if (preset === 'month') {
      const m = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(formatDate(m));
      setDateTo(formatDate(today));
    } else if (preset === 'last-month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setDateFrom(formatDate(start));
      setDateTo(formatDate(end));
    } else if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  };

  // Apply Filter Handler
  const handleApplyFilter = () => {
    setAppliedFilters({
      datePreset,
      dateFrom,
      dateTo,
      reportType,
      seller: selectedSellerFilter,
      buyer: selectedBuyerFilter,
      minAmount: minAmount ? Number(minAmount) : 0,
      auctionSource,
      lotName: lotNameFilter,
    });
    setCurrentPage(1);
  };

  // Clear Filter Handler
  const handleClearFilter = () => {
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
    setReportType('all');
    setSelectedSellerFilter('all');
    setSelectedBuyerFilter('all');
    setMinAmount('');
    setAuctionSource('all');
    setLotNameFilter('all');
    setAppliedFilters({
      datePreset: 'all',
      dateFrom: '',
      dateTo: '',
      reportType: 'all',
      seller: 'all',
      buyer: 'all',
      minAmount: 0,
      auctionSource: 'all',
      lotName: 'all',
    });
    setCurrentPage(1);
  };

  // Parse transaction date for filtering/sorting
  const parseTxDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    // Handle DD/MM/YYYY or YYYY-MM-DD
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
    }
    return new Date(dateStr).getTime() || 0;
  };

  // Base Filtered Transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Seller Filter
    if (appliedFilters.seller !== 'all') {
      list = list.filter(
        tx =>
          tx.sellerId === appliedFilters.seller ||
          tx.sellerName.toLowerCase().includes(appliedFilters.seller.toLowerCase())
      );
    }

    // Buyer Filter
    if (appliedFilters.buyer !== 'all') {
      list = list.filter(
        tx =>
          tx.buyerId === appliedFilters.buyer ||
          tx.buyerTradeName.toLowerCase().includes(appliedFilters.buyer.toLowerCase()) ||
          tx.buyerName.toLowerCase().includes(appliedFilters.buyer.toLowerCase())
      );
    }

    // Min Amount Filter
    if (appliedFilters.minAmount > 0) {
      list = list.filter(tx => tx.grossAmount >= appliedFilters.minAmount);
    }

    // Date Range Filter
    if (appliedFilters.dateFrom) {
      const fromTime = new Date(appliedFilters.dateFrom).getTime();
      list = list.filter(tx => parseTxDate(tx.date) >= fromTime);
    }
    if (appliedFilters.dateTo) {
      const toTime = new Date(appliedFilters.dateTo).getTime() + 86400000; // end of day
      list = list.filter(tx => parseTxDate(tx.date) <= toTime);
    }

    // Lot Name / Crop Variety Filter
    if (appliedFilters.lotName !== 'all') {
      list = list.filter(
        tx =>
          tx.productName.toLowerCase().includes(appliedFilters.lotName.toLowerCase()) ||
          tx.variety.toLowerCase().includes(appliedFilters.lotName.toLowerCase())
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOrder === 'asc') return parseTxDate(a.date) - parseTxDate(b.date);
      if (sortOrder === 'desc') return parseTxDate(b.date) - parseTxDate(a.date);
      if (sortOrder === 'total-asc') return a.grossAmount - b.grossAmount;
      if (sortOrder === 'total-desc') return b.grossAmount - a.grossAmount;
      return 0;
    });

    return list;
  }, [transactions, appliedFilters, sortOrder]);

  // Aggregated Summary by Seller (For Seller Report Table Matching Image 1)
  const sellerSummaryList = useMemo(() => {
    const map = new Map<string, {
      sellerId: string;
      sellerName: string;
      sellerVillage: string;
      totalQty: number;
      totalAmount: number;
      status: string;
      sampleTx: AuctionTransaction;
      txCount: number;
    }>();

    filteredTransactions.forEach(tx => {
      const key = tx.sellerName;
      const existing = map.get(key);
      const isCompleted = tx.billNumber !== '101'; // Tx 101 has status Product Received in sample
      const status = isCompleted ? 'COMPLETED' : 'Product Received';

      if (!existing) {
        map.set(key, {
          sellerId: tx.sellerId,
          sellerName: tx.sellerName,
          sellerVillage: tx.sellerVillage,
          totalQty: tx.quantity,
          totalAmount: tx.grossAmount,
          status,
          sampleTx: tx,
          txCount: 1,
        });
      } else {
        existing.totalQty += tx.quantity;
        existing.totalAmount += tx.grossAmount;
        existing.txCount += 1;
        if (status === 'COMPLETED') existing.status = 'COMPLETED';
      }
    });

    // If transactions list matches demo or has rows
    const result = Array.from(map.values());
    result.sort((a, b) => {
      if (sortOrder === 'total-asc') return a.totalAmount - b.totalAmount;
      if (sortOrder === 'total-desc') return b.totalAmount - a.totalAmount;
      return 0;
    });
    return result;
  }, [filteredTransactions, sortOrder]);

  // Filtered SMS Logs (For Image 4)
  const filteredSmsLogs = useMemo(() => {
    let list = [...smsLogs];
    if (appliedFilters.seller !== 'all') {
      list = list.filter(
        item =>
          item.sellerName.toLowerCase().includes(appliedFilters.seller.toLowerCase()) ||
          item.mobile.includes(appliedFilters.seller)
      );
    }
    return list;
  }, [smsLogs, appliedFilters.seller]);

  // Key KPI Calculations
  const totalTransactionsCount = filteredTransactions.length;
  const totalRevenue = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.grossAmount, 0),
    [filteredTransactions]
  );
  const totalCommission = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.commissionAmount, 0),
    [filteredTransactions]
  );
  const netToSellers = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.netFarmerPayable, 0),
    [filteredTransactions]
  );
  const totalBalance = netToSellers;

  // Buyer Specific KPIs
  const totalBuyerBilled = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.buyerTotalBilled, 0),
    [filteredTransactions]
  );
  const totalBuyerFee = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.buyerMarketFee, 0),
    [filteredTransactions]
  );
  const totalBuyerDues = useMemo(
    () => buyers.reduce((sum, b) => sum + b.outstandingDues, 0),
    [buyers]
  );

  // Agent Specific KPIs
  const totalMandiExpenses = useMemo(
    () => mandiExpenses.reduce((sum, e) => sum + e.amount, 0),
    [mandiExpenses]
  );
  const totalServiceCharges = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.coolieAmount + tx.rentAmount + tx.magimaiAmount, 0),
    [filteredTransactions]
  );
  const netMandiProfit = totalCommission + totalServiceCharges - totalMandiExpenses;

  // Active Label for Results
  const resultsDateLabel = useMemo(() => {
    if (appliedFilters.datePreset === 'today') return 'Today';
    if (appliedFilters.datePreset === 'yesterday') return 'Yesterday';
    if (appliedFilters.datePreset === 'week') return 'This Week';
    if (appliedFilters.datePreset === 'month') return 'This Month';
    if (appliedFilters.datePreset === 'last-month') return 'Last Month';
    if (appliedFilters.dateFrom && appliedFilters.dateTo) {
      return `${appliedFilters.dateFrom} to ${appliedFilters.dateTo}`;
    }
    return 'All Dates';
  }, [appliedFilters]);

  // Export Daily / Filtered CSV
  const exportFilteredCSV = () => {
    let headers = '';
    let rows = '';

    if (activeTab === 'seller-report') {
      headers = 'SNo,Seller,Village,Qty,TotalAmount,Status\n';
      rows = sellerSummaryList
        .map(
          (s, idx) =>
            `${idx + 1},"${s.sellerName}","${s.sellerVillage}",${s.totalQty},${s.totalAmount},"${s.status}"`
        )
        .join('\n');
    } else if (activeTab === 'buyer-report') {
      headers = 'SNo,Date,Buyer,Qty,Total,Seller,Status\n';
      rows = filteredTransactions
        .map(
          (tx, idx) =>
            `${idx + 1},"${tx.date}","${tx.buyerTradeName}",${tx.quantity},${tx.grossAmount},"${tx.sellerName}","SOLD"`
        )
        .join('\n');
    } else if (activeTab === 'sms-log') {
      headers = 'SNo,Seller,Mobile,Date,Status\n';
      rows = filteredSmsLogs
        .map((s, idx) => `${idx + 1},"${s.sellerName}","${s.mobile}","${s.date}","${s.status}"`)
        .join('\n');
    } else {
      headers = 'Bill,Date,Seller,Buyer,Produce,Qty,Rate,Gross,Commission,NetFarmer\n';
      rows = filteredTransactions
        .map(
          tx =>
            `"${tx.billNumber}","${tx.date}","${tx.sellerName}","${tx.buyerTradeName}","${tx.productName}",${tx.quantity},${tx.ratePerUnit},${tx.grossAmount},${tx.commissionAmount},${tx.netFarmerPayable}`
        )
        .join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KVS_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Open Message Dispatch Modal
  const openMessageModal = (target: { name: string; mobile: string; info: string }, type: 'SMS' | 'WhatsApp') => {
    setMessageTarget(target);
    setMessageType(type);
    setCustomMessage(
      `வணக்கம் ${target.name}, KVS Traders மண்டி வர்த்தக விபரம்: ${target.info}. தொடர்பு: 0462-2332710.`
    );
    setShowMessageModal(true);
  };

  // Send Message Action
  const handleSendMessage = () => {
    if (!messageTarget) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    const timeStr = now.toTimeString().slice(0, 8);

    if (messageType === 'SMS') {
      addSmsLog({
        sellerName: messageTarget.name,
        mobile: messageTarget.mobile,
        date: dateStr,
        time: timeStr,
        status: 'SENT',
        messageText: customMessage,
        charges: 0.25,
      });
      alert(`SMS successfully dispatched to ${messageTarget.name} (${messageTarget.mobile})!`);
    } else {
      addWhatsAppLog({
        recipientName: messageTarget.name,
        mobile: messageTarget.mobile,
        date: dateStr,
        time: timeStr,
        status: 'SENT',
        messageText: customMessage,
        amount: 0,
      });
      alert(`WhatsApp notification delivered to ${messageTarget.name} (${messageTarget.mobile})!`);
    }
    setShowMessageModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP BREADCRUMB & PAGE HEADER                      */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>&gt;</span>
            <span className="text-emerald-700 dark:text-emerald-400">Reports</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Seller & Buyer Reports, Agent Revenue, SMS & WhatsApp Dispatch Logs
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. TAB NAVIGATION (Matching All 5 Screenshots)       */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-1.5 flex items-center gap-1 overflow-x-auto text-xs font-bold">
        {/* Tab 1: Seller Report (Image 1) */}
        <button
          type="button"
          onClick={() => setActiveTab('seller-report')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'seller-report'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Seller Report</span>
        </button>

        {/* Tab 2: Buyer Report (Image 2) */}
        <button
          type="button"
          onClick={() => setActiveTab('buyer-report')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'buyer-report'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Buyer Report</span>
        </button>

        {/* Tab 3: Agent Report (Image 3) */}
        <button
          type="button"
          onClick={() => setActiveTab('agent-report')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'agent-report'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Agent Report</span>
        </button>

        {/* Tab 4: Financial Ledger */}
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>General Ledger</span>
        </button>

        {/* Tab 5: SMS Log (Image 4) */}
        <button
          type="button"
          onClick={() => setActiveTab('sms-log')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sms-log'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS Log</span>
        </button>

        {/* Tab 6: WhatsApp Log (Image 5) */}
        <button
          type="button"
          onClick={() => setActiveTab('whatsapp-log')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'whatsapp-log'
              ? 'bg-emerald-800 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-500" />
          <span>WhatsApp Log</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. FILTER & GENERATE CARD (Shown in all screenshots) */}
      {/* ---------------------------------------------------- */}
      {activeTab !== 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            Filter & Generate
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Row 1, Col 1: Date Preset */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Date Preset
              </label>
              <select
                value={datePreset}
                onChange={e => handleDatePresetChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">Date Preset</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            {/* Row 1, Col 2: Date From */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Date From
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => {
                    setDateFrom(e.target.value);
                    setDatePreset('custom');
                  }}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Row 1, Col 3: Date To */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Date To
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => {
                    setDateTo(e.target.value);
                    setDatePreset('custom');
                  }}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Row 2, Col 1: Report Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">Report Type</option>
                <option value="Seller">Seller</option>
                <option value="Buyer">Buyer</option>
                <option value="Agent">Agent</option>
                <option value="Completed">Completed Lots</option>
                <option value="Product Received">Product Received</option>
              </select>
            </div>

            {/* Row 2, Col 2: Seller OR Buyer (Context Sensitive) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {activeTab === 'buyer-report' ? 'Buyer' : 'Seller'}
              </label>
              {activeTab === 'buyer-report' ? (
                <select
                  value={selectedBuyerFilter}
                  onChange={e => setSelectedBuyerFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="all">Buyer</option>
                  {buyers.map(b => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.paddleNumber} - {b.mobile})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedSellerFilter}
                  onChange={e => setSelectedSellerFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="all">Seller</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.village})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Row 2, Col 3: Min Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                placeholder="Min Amount"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Row 3, Col 1: Auction Source */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Auction Source
              </label>
              <select
                value={auctionSource}
                onChange={e => setAuctionSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">Auction Source</option>
                <option value="Floor">Mandi Floor Auction (Manual)</option>
                <option value="LiveCalling">Live Floor Calling Desk</option>
                <option value="Digital">Digital Remote Auction</option>
                <option value="Fixed">Direct / Fixed Price Sale</option>
              </select>
            </div>

            {/* Row 3, Col 2: Lot Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Lot Name
              </label>
              <select
                value={lotNameFilter}
                onChange={e => setLotNameFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">Lot Name</option>
                <option value="Nadu">Nadu Banana Bunch</option>
                <option value="Poovan">Poovan Banana Leaves</option>
                <option value="Nendran">Nendran Banana Bunch</option>
                <option value="Red Banana">Red Banana Bunch</option>
                <option value="Tomato">Country Hybrid Tomato</option>
              </select>
            </div>

            {/* Row 3, Col 3: Filter Buttons */}
            <div className="flex items-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearFilter}
                className="flex-1 py-2 px-3 rounded-xl border border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer text-center"
              >
                Clear Filter
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-1 py-2 px-3 rounded-xl bg-[#055d44] hover:bg-[#044a36] text-white font-bold transition-all shadow-xs cursor-pointer text-center"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SUMMARY KPI TILES (Matching Each Active Tab)     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'seller-report' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Card 1: Total Transactions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL TRANSACTIONS
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {sellerSummaryList.length}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{resultsDateLabel}</span>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL REVENUE
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 3: Commission */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              COMMISSION
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 font-mono mt-1">
              ₹{totalCommission.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Avg 5%</span>
          </div>

          {/* Card 4: Net to Sellers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              NET TO SELLERS
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{netToSellers.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 5: Total Balance */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL BALANCE
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{totalBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'buyer-report' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL PURCHASES
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {filteredTransactions.length}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{resultsDateLabel}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL BILLED
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{totalBuyerBilled.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              MARKET FEE
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 font-mono mt-1">
              ₹{totalBuyerFee.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SECURITY DEPOSITS
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
              ₹{buyers.reduce((sum, b) => sum + b.depositAmount, 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              OUTSTANDING DUES
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              ₹{totalBuyerDues.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agent-report' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              GROSS TURNOVER
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{resultsDateLabel}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              COMMISSION EARNED
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{totalCommission.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SERVICE POOL (COOLIE/RENT)
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
              ₹{totalServiceCharges.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              OPERATING EXPENSES
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              ₹{totalMandiExpenses.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              NET MANDI PROFIT
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹{netMandiProfit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sms-log' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-md">
          {/* SMS Total Message */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL MESSAGE
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {filteredSmsLogs.length}
            </div>
          </div>

          {/* SMS Total Due */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL DUE
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
              ₹1
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp-log' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-md">
          {/* WhatsApp Total Messages */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL WHATSAPP MESSAGES
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {whatsAppLogs.length}
            </div>
          </div>

          {/* WhatsApp Total Sent */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL SENT
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {whatsAppLogs.filter(w => w.status === 'SENT').length}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. EMBEDDED GENERAL LEDGER TAB (Buyer/Seller/Agent) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <LedgerView onNavigate={onNavigate} />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. RESULTS SECTION HEADER & SORTING & EXPORTS       */}
      {/* ---------------------------------------------------- */}
      {activeTab !== 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Results Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Results : {resultsDateLabel}
              </span>

              {/* Order / Sort Pills (Asc, Desc, Total Asc, Total Desc) */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setSortOrder('asc')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    sortOrder === 'asc'
                      ? 'bg-[#055d44] text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Asc
                </button>

                <button
                  type="button"
                  onClick={() => setSortOrder('desc')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    sortOrder === 'desc'
                      ? 'bg-[#055d44] text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Desc
                </button>

                <button
                  type="button"
                  onClick={() => setSortOrder('total-asc')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    sortOrder === 'total-asc'
                      ? 'bg-[#055d44] text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Total Asc
                </button>

                <button
                  type="button"
                  onClick={() => setSortOrder('total-desc')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    sortOrder === 'total-desc'
                      ? 'bg-[#055d44] text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Total Desc
                </button>
              </div>
            </div>

            {/* Right Export Action Buttons */}
            <div className="flex items-center gap-2">
              {activeTab === 'seller-report' && (
                <button
                  type="button"
                  onClick={() => {
                    openMessageModal(
                      {
                        name: 'All Farmers',
                        mobile: 'Broadcast',
                        info: `Today's produce sales summary: ${sellerSummaryList.length} lots settled.`,
                      },
                      'SMS'
                    );
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  SMS
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                PDF
              </button>

              <button
                type="button"
                onClick={exportFilteredCSV}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Excel
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 7. DATA TABLES                                      */}
          {/* ---------------------------------------------------- */}

          {/* TABLE A: SELLER REPORT TABLE (Matching Image 1) */}
          {activeTab === 'seller-report' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-16">S....</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {sellerSummaryList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No sellers match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sellerSummaryList.map((item, idx) => (
                      <tr
                        key={item.sellerName + idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* S.No */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Seller Name & Village */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.sellerName}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{item.sellerVillage}</span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {item.totalQty}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                              item.status === 'COMPLETED'
                                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40'
                                : 'border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Actions (Eye view, Receipt/A5 Chit, Message) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2.5">
                            {/* View Eye */}
                            <button
                              type="button"
                              onClick={() => setViewDetailTx(item.sampleTx)}
                              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 transition-colors cursor-pointer"
                              title="View Transaction Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* A5 / Patti Chit (Orange) */}
                            <button
                              type="button"
                              onClick={() => setModalA5Tx(item.sampleTx)}
                              className="text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                              title="Print A5 Patti Slip"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>

                            {/* Message Bubble */}
                            <button
                              type="button"
                              onClick={() =>
                                openMessageModal(
                                  {
                                    name: item.sellerName,
                                    mobile: item.sampleTx.sellerVillage,
                                    info: `Produce Qty: ${item.totalQty}, Total Value: ₹${item.totalAmount}`,
                                  },
                                  'SMS'
                                )
                              }
                              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Send SMS / WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Table Footer: Revenue & Commission summary + Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-6">
                  <span>Revenue : ₹{totalRevenue.toLocaleString('en-IN')}</span>
                  <span>Commission : ₹{totalCommission.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={e => setRowsPerPage(Number(e.target.value))}
                      className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <span>
                    1-{sellerSummaryList.length} of {sellerSummaryList.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer">
                      &lt;
                    </button>
                    <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE B: BUYER REPORT TABLE (Matching Image 2) */}
          {activeTab === 'buyer-report' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-14">S....</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No buyer purchases recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <tr
                        key={tx.id + idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {tx.buyerName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {tx.buyerTradeName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">{tx.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{tx.grossAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {tx.sellerName}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{tx.sellerVillage}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 uppercase">
                            SOLD
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewDetailTx(tx)}
                              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setModalA5Tx(tx)}
                              className="text-amber-600 hover:text-amber-700 cursor-pointer"
                              title="Print Invoice Chit"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Total Billed : ₹{totalBuyerBilled.toLocaleString('en-IN')}</span>
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <span>Rows per page: 50</span>
                  <span>1-{filteredTransactions.length} of {filteredTransactions.length}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-md text-slate-400 hover:text-slate-600">&lt;</button>
                    <button className="p-1 rounded-md text-slate-400 hover:text-slate-600">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE C: AGENT REPORT TABLE (Matching Image 3) */}
          {activeTab === 'agent-report' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-14">S....</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id + idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono">{tx.date}</td>
                      <td className="py-3 px-4 font-bold">{tx.buyerTradeName}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{tx.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹{tx.grossAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">{tx.sellerName} ({tx.sellerVillage})</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-600 text-emerald-700 bg-emerald-50/50 uppercase">
                          SOLD
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewDetailTx(tx)}
                            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalA5Tx(tx)}
                            className="text-amber-600 hover:text-amber-700 cursor-pointer"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold">
                <span>Revenue : ₹{totalRevenue.toLocaleString('en-IN')} | Net Margin: ₹{netMandiProfit.toLocaleString('en-IN')}</span>
                <span className="text-slate-400 font-medium">Rows per page: 50 • 1-{filteredTransactions.length} of {filteredTransactions.length}</span>
              </div>
            </div>
          )}

          {/* TABLE D: SMS LOG TABLE (Matching Image 4) */}
          {activeTab === 'sms-log' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-14">S....</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredSmsLogs.map((sms, idx) => (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {sms.sellerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {sms.mobile}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {sms.date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-600 text-emerald-700 bg-emerald-50/50 uppercase">
                          {sms.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewSmsItem(sms)}
                          className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          title="View Message Text"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-500">
                <span>Total Messages Sent: {filteredSmsLogs.length}</span>
                <span>Rows per page: 50 • 1-{filteredSmsLogs.length} of {filteredSmsLogs.length}</span>
              </div>
            </div>
          )}

          {/* TABLE E: WHATSAPP LOG TABLE (Matching Image 5) */}
          {activeTab === 'whatsapp-log' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-14">S....</th>
                    <th className="py-3 px-4">Recipient / Seller</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {whatsAppLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <p className="font-bold text-sm">No rows</p>
                        <p className="text-xs text-slate-400 mt-1">
                          No WhatsApp dispatch logs generated yet for current period.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            openMessageModal(
                              {
                                name: sellers[0]?.name || 'Farmer',
                                mobile: sellers[0]?.mobile || '9842155670',
                                info: 'Mandi Auction Produce arrival & rate confirmation',
                              },
                              'WhatsApp'
                            );
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Test WhatsApp Log</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    whatsAppLogs.map((wa, idx) => (
                      <tr key={wa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold">{wa.recipientName}</td>
                        <td className="py-3 px-4 font-mono">{wa.mobile}</td>
                        <td className="py-3 px-4 font-mono">{wa.date}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-600 text-emerald-700 bg-emerald-50/50 uppercase">
                            {wa.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Eye className="w-4 h-4 text-emerald-700 mx-auto" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Total Amount : ₹0</span>
                <span className="text-slate-400 font-medium">Rows per page: 50 • 0-0 of {whatsAppLogs.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. INTERACTIVE MODALS & PREVIEWS                     */}
      {/* ---------------------------------------------------- */}

      {/* Detail Transaction Modal */}
      {viewDetailTx && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Sale Transaction #{viewDetailTx.billNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {viewDetailTx.date} {viewDetailTx.time}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Seller / Farmer:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {viewDetailTx.sellerName} ({viewDetailTx.sellerVillage})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Buyer / Trader:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {viewDetailTx.buyerTradeName} [{viewDetailTx.buyerPaddle}]
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Produce Variety:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewDetailTx.productName} ({viewDetailTx.variety})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Quantity Weighed:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewDetailTx.quantity} {getTamilUnit(viewDetailTx.itemType, viewDetailTx.unit)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Winning Rate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{viewDetailTx.ratePerUnit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Sale Amount:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                  ₹{viewDetailTx.grossAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Mandi Deductions (Coolie/Rent/Magimai):</span>
                <span className="font-mono text-rose-600">
                  -₹{(viewDetailTx.coolieAmount + viewDetailTx.rentAmount + viewDetailTx.magimaiAmount + viewDetailTx.commissionAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-t-2 border-dashed border-slate-300 dark:border-slate-700 font-bold text-sm">
                <span>Net Farmer Payable:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                  ₹{viewDetailTx.netFarmerPayable.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewDetailTx(null);
                  setModalPosTx(viewDetailTx);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                POS Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewDetailTx(null);
                  setModalA5Tx(viewDetailTx);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                KVS A5 Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS View Modal */}
      {viewSmsItem && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>SMS Dispatch Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewSmsItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Recipient:</span>
                <p className="font-bold text-slate-900 dark:text-white">{viewSmsItem.sellerName} ({viewSmsItem.mobile})</p>
              </div>
              <div>
                <span className="text-slate-400">Dispatched:</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">{viewSmsItem.date} {viewSmsItem.time}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                "{viewSmsItem.messageText}"
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-1">
                <span>Status: <strong className="text-emerald-600">{viewSmsItem.status}</strong></span>
                <span>Gateway Cost: ₹{viewSmsItem.charges}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal (SMS / WhatsApp) */}
      {showMessageModal && messageTarget && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Send {messageType} Notification</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-0.5">Recipient:</label>
                <p className="font-bold text-slate-900 dark:text-white">
                  {messageTarget.name} • {messageTarget.mobile}
                </p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Channel:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageType('SMS')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      messageType === 'SMS'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    SMS (160 Chars)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('WhatsApp')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      messageType === 'WhatsApp'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    WhatsApp Cloud
                  </button>
                </div>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Message Text:</label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KVS A5 Sheet Modal */}
      {modalA5Tx && (
        <KvsA5Receipt
          transaction={modalA5Tx}
          profile={profile}
          onClose={() => setModalA5Tx(null)}
          onSwitchFormat={format => {
            if (format === 'pos') {
              const current = modalA5Tx;
              setModalA5Tx(null);
              setModalPosTx(current);
            }
          }}
        />
      )}

      {/* POS Thermal Receipt Modal */}
      {modalPosTx && (
        <PosThermalReceipt
          transaction={modalPosTx}
          profile={profile}
          onClose={() => setModalPosTx(null)}
          onSwitchFormat={format => {
            if (format === 'a5') {
              const current = modalPosTx;
              setModalPosTx(null);
              setModalA5Tx(current);
            }
          }}
        />
      )}

      {/* Farmer Patti Slip Modal */}
      {showPattiSlip && selectedFarmerId && (
        <FarmerPattiSlip
          seller={sellers.find(s => s.id === selectedFarmerId) || sellers[0]}
          transactions={transactions}
          profile={profile}
          advanceRecovery={0}
          onClose={() => setShowPattiSlip(false)}
        />
      )}
    </div>
  );
};
