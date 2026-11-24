import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Seller, Buyer, AuctionTransaction, MandiProfile, PaymentMode } from '../types';
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
} from 'lucide-react';
import { FarmerPattiSlip } from '../components/receipts/FarmerPattiSlip';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';
import { LedgerView } from './LedgerView';

interface ReportsViewProps {
  onNavigate?: (path: string) => void;
  initialTab?: 'seller-report' | 'buyer-report' | 'agent-report' | 'ledger' | 'sales' | 'pos-bill' | 'a5-sheet' | 'company-profile';
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
    settleFarmerPayout,
    recordBuyerPayment,
    recordFarmerPayout,
    recordBuyerReceipt,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'seller-report' | 'buyer-report' | 'agent-report' | 'ledger' | 'sales' | 'pos-bill' | 'a5-sheet' | 'company-profile' | 'logs'
  >(initialTab);

  // Selected bill for POS / A5 tabs
  const [selectedBillId, setSelectedBillId] = useState<string>(transactions[0]?.id || '');
  const activeBill = transactions.find(t => t.id === selectedBillId) || transactions[0];

  // Pop-up modals (when clicking print from table)
  const [modalA5Tx, setModalA5Tx] = useState<AuctionTransaction | null>(null);
  const [modalPosTx, setModalPosTx] = useState<AuctionTransaction | null>(null);

  // Seller Report state
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(sellers[0]?.id || '');
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [showPattiSlip, setShowPattiSlip] = useState(false);

  // Buyer Report state
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');

  // Agent Report Timeframe state
  const [agentPeriod, setAgentPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Profile Form state
  const [profileData, setProfileData] = useState<MandiProfile>(profile);
  const [profileSaved, setProfileSaved] = useState(false);

  // Quick Action Modals for Settle & Collect inside reports
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMode, setPayoutMode] = useState<PaymentMode>('Cash');
  const [payoutRef, setPayoutRef] = useState('');

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMode, setCollectMode] = useState<PaymentMode>('UPI / GPay');
  const [collectRef, setCollectRef] = useState('');

  // Keep profile form synced with context profile
  useEffect(() => {
    setProfileData(profile);
  }, [profile]);

  // Keep selectedBillId valid when transactions change
  useEffect(() => {
    if (transactions.length > 0 && !transactions.some(t => t.id === selectedBillId)) {
      setSelectedBillId(transactions[0].id);
    }
  }, [transactions, selectedBillId]);

  const selectedFarmer = sellers.find(s => s.id === selectedFarmerId) || sellers[0];
  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId) || buyers[0];

  // Farmer specific calculations
  const farmerTxs = useMemo(() => {
    return transactions.filter(tx => tx.sellerId === selectedFarmer?.id);
  }, [transactions, selectedFarmer]);

  const farmerGross = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.grossAmount, 0), [farmerTxs]);
  const farmerCommission = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.commissionAmount, 0), [farmerTxs]);
  const farmerCoolie = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.coolieAmount, 0), [farmerTxs]);
  const farmerRent = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.rentAmount, 0), [farmerTxs]);
  const farmerMagimai = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.magimaiAmount, 0), [farmerTxs]);
  const farmerTotalDeductions = farmerCommission + farmerCoolie + farmerRent + farmerMagimai;
  const farmerNetPayable = farmerGross - farmerTotalDeductions;
  const farmerTotalVolume = useMemo(() => farmerTxs.reduce((sum, tx) => sum + tx.quantity, 0), [farmerTxs]);

  // Buyer specific calculations
  const buyerTxs = useMemo(() => {
    return transactions.filter(tx => tx.buyerId === selectedBuyer?.id);
  }, [transactions, selectedBuyer]);

  const buyerGross = useMemo(() => buyerTxs.reduce((sum, tx) => sum + tx.grossAmount, 0), [buyerTxs]);
  const buyerFee = useMemo(() => buyerTxs.reduce((sum, tx) => sum + tx.buyerMarketFee, 0), [buyerTxs]);
  const buyerTotal = useMemo(() => buyerTxs.reduce((sum, tx) => sum + tx.buyerTotalBilled, 0), [buyerTxs]);
  const buyerTotalVolume = useMemo(() => buyerTxs.reduce((sum, tx) => sum + tx.quantity, 0), [buyerTxs]);
  const buyerTotalLimit = (selectedBuyer?.depositAmount || 0) + (selectedBuyer?.creditLimit || 0);
  const buyerUtilization = buyerTotalLimit > 0 ? Math.min(100, Math.round(((selectedBuyer?.outstandingDues || 0) / buyerTotalLimit) * 100)) : 0;

  // Agent (Mandi Agency) calculations
  const totalGrossTurnover = useMemo(() => transactions.reduce((sum, tx) => sum + tx.grossAmount, 0), [transactions]);
  const totalCommissionRevenue = useMemo(() => transactions.reduce((sum, tx) => sum + tx.commissionAmount, 0), [transactions]);
  const totalCoolieRevenue = useMemo(() => transactions.reduce((sum, tx) => sum + tx.coolieAmount, 0), [transactions]);
  const totalRentRevenue = useMemo(() => transactions.reduce((sum, tx) => sum + tx.rentAmount, 0), [transactions]);
  const totalMagimaiRevenue = useMemo(() => transactions.reduce((sum, tx) => sum + tx.magimaiAmount, 0), [transactions]);
  const totalServiceCharges = totalCoolieRevenue + totalRentRevenue + totalMagimaiRevenue;
  const totalMandiGrossRevenue = totalCommissionRevenue + totalServiceCharges;

  const totalMandiExpenses = useMemo(() => mandiExpenses.reduce((sum, e) => sum + e.amount, 0), [mandiExpenses]);
  const netAgencyProfit = totalMandiGrossRevenue - totalMandiExpenses;
  const netProfitMargin = totalGrossTurnover > 0 ? ((netAgencyProfit / totalGrossTurnover) * 100).toFixed(1) : '0.0';

  const totalFarmerPayables = useMemo(() => sellers.reduce((sum, s) => sum + s.payoutBalance, 0), [sellers]);
  const totalBuyerReceivables = useMemo(() => buyers.reduce((sum, b) => sum + b.outstandingDues, 0), [buyers]);

  // Export Daily Sales CSV
  const exportDailySalesCSV = () => {
    const headers = 'Bill,Chit,Date,Time,Farmer,Buyer,Paddle,Produce,Variety,Qty,Unit,Rate,Gross,Rent,Coolie,Magimai,Commission,NetFarmer\n';
    const rows = transactions
      .map(
        tx =>
          `"${tx.billNumber}","${tx.chitNumber}","${tx.date}","${tx.time}","${tx.sellerName}","${tx.buyerTradeName}","${tx.buyerPaddle}","${tx.productName}","${tx.variety}",${tx.quantity},"${tx.unit}",${tx.ratePerUnit},${tx.grossAmount},${tx.rentAmount},${tx.coolieAmount},${tx.magimaiAmount},${tx.commissionAmount},${tx.netFarmerPayable}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KVS_Banana_Mandi_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Export Farmer Statement CSV
  const exportFarmerCSV = () => {
    if (!selectedFarmer) return;
    const headers = 'Bill,Date,Time,Produce,Variety,Qty,Unit,Rate,Gross,Rent,Coolie,Magimai,Commission,NetPayable\n';
    const rows = farmerTxs
      .map(
        tx =>
          `"${tx.billNumber}","${tx.date}","${tx.time}","${tx.productName}","${tx.variety}",${tx.quantity},"${tx.unit}",${tx.ratePerUnit},${tx.grossAmount},${tx.rentAmount},${tx.coolieAmount},${tx.magimaiAmount},${tx.commissionAmount},${tx.netFarmerPayable}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Statement_${selectedFarmer.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Export Buyer Statement CSV
  const exportBuyerCSV = () => {
    if (!selectedBuyer) return;
    const headers = 'Bill,Chit,Date,Time,Produce,Variety,Qty,Unit,Rate,Gross,MarketFee,TotalBilled,Paddle\n';
    const rows = buyerTxs
      .map(
        tx =>
          `"${tx.billNumber}","${tx.chitNumber}","${tx.date}","${tx.time}","${tx.productName}","${tx.variety}",${tx.quantity},"${tx.unit}",${tx.ratePerUnit},${tx.grossAmount},${tx.buyerMarketFee},${tx.buyerTotalBilled},"${tx.buyerPaddle}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buyer_Statement_${selectedBuyer.tradeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Export Agent Report CSV
  const exportAgentReportCSV = () => {
    const content = `KVS TRADERS - MANDI AGENT FINANCIAL P&L STATEMENT\nDate: ${new Date().toLocaleDateString('en-GB')}\nGross Mandi Turnover: ₹${totalGrossTurnover}\nCommission Revenue: ₹${totalCommissionRevenue}\nService Charges (Coolie+Rent+Magimai): ₹${totalServiceCharges}\nTotal Mandi Gross Revenue: ₹${totalMandiGrossRevenue}\nTotal Operating Expenses: ₹${totalMandiExpenses}\nNet Agency Operating Profit: ₹${netAgencyProfit}\nProfit Margin: ${netProfitMargin}%\nTrader Receivables Outstanding: ₹${totalBuyerReceivables}\nFarmer Payables Outstanding: ₹${totalFarmerPayables}\n`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mandi_Agent_PL_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileData);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 text-[10px] font-black uppercase">
              {language === 'ta' ? 'அறிக்கைகள் & லெட்ஜர் மையம்' : 'Reports & Accounting Center'}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {language === 'ta' ? 'மண்டி நிதி அறிக்கைகள் & பில்லிங்' : 'Mandi Financial Reports & Statements'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'விவசாயி அறிக்கை, வியாபாரி அறிக்கை, முகவர் வருமான அறிக்கை மற்றும் முழுமையான நிதி லெட்ஜர்.'
              : 'Complete 3-Tier Reports (Seller, Buyer, Agent) & End-to-End Financial Ledger.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'seller-report' && (
            <button
              onClick={exportFarmerCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ta' ? 'விவசாயி எக்செல்' : 'Farmer CSV'}</span>
            </button>
          )}

          {activeTab === 'buyer-report' && (
            <button
              onClick={exportBuyerCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ta' ? 'வியாபாரி எக்செல்' : 'Buyer CSV'}</span>
            </button>
          )}

          {activeTab === 'agent-report' && (
            <button
              onClick={exportAgentReportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ta' ? 'முகவர் எக்செல்' : 'Agent P&L CSV'}</span>
            </button>
          )}

          {activeTab === 'sales' && (
            <button
              onClick={exportDailySalesCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportExcel')}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('downloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-bold overflow-x-auto">
          {/* Tab 1: Seller (Farmer) Report */}
          <button
            onClick={() => setActiveTab('seller-report')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seller-report'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 text-amber-500" />
            <span>{language === 'ta' ? '1. விவசாயி அறிக்கை (Seller)' : '1. Seller (Farmer) Report'}</span>
          </button>

          {/* Tab 2: Buyer (Trader) Report */}
          <button
            onClick={() => setActiveTab('buyer-report')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'buyer-report'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>{language === 'ta' ? '2. வியாபாரி அறிக்கை (Buyer)' : '2. Buyer (Trader) Report'}</span>
          </button>

          {/* Tab 3: Agent (Mandi P&L) Report */}
          <button
            onClick={() => setActiveTab('agent-report')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agent-report'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-purple-500" />
            <span>{language === 'ta' ? '3. முகவர் வருமான அறிக்கை (Agent)' : '3. Agent (Mandi P&L) Report'}</span>
          </button>

          {/* Tab 4: Financial Ledger */}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>{language === 'ta' ? '4. நிதி லெட்ஜர் (Ledger)' : '4. Financial Ledger'}</span>
          </button>

          {/* Tab 5: Daily Sales Sheet */}
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sales'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t('tabDailySales')}</span>
          </button>

          {/* Tab 6: POS Bill 80mm */}
          <button
            onClick={() => setActiveTab('pos-bill')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pos-bill'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>POS (80mm)</span>
          </button>

          {/* Tab 7: A5 Sheet Print */}
          <button
            onClick={() => setActiveTab('a5-sheet')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'a5-sheet'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>KVS A5 Sheet</span>
          </button>

          {/* Tab 8: Mandi Profile */}
          <button
            onClick={() => setActiveTab('company-profile')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'company-profile'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'சுயவிவரம்' : 'Profile'}</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* REPORT 1: SELLER (FARMER) REPORT                    */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'seller-report' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Farmer Selector Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'விவசாயி தேர்வு (Select Farmer):' : 'Select Farmer / Seller:'}
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={e => setSelectedFarmerId(e.target.value)}
                  className="w-full md:max-w-md p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - {s.village}) • Balance: ₹{s.payoutBalance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFarmer && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPattiSlip(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{language === 'ta' ? 'பட்டி அச்சு (Patti Slip)' : 'Print Patti Slip'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setPayoutAmount(selectedFarmer.payoutBalance);
                      setShowPayoutModal(true);
                    }}
                    disabled={selectedFarmer.payoutBalance <= 0}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer ${
                      selectedFarmer.payoutBalance > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                    <span>
                      {selectedFarmer.payoutBalance > 0
                        ? `${language === 'ta' ? 'பட்டுவாடா' : 'Settle'} ₹${selectedFarmer.payoutBalance.toLocaleString('en-IN')}`
                        : language === 'ta' ? 'முழுவதும் பட்டுவாடா ஆனது' : 'Fully Settled (₹0)'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Farmer Metric Cards */}
            {selectedFarmer && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'விற்பனையான அளவு' : 'Total Volume Sold'}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {farmerTotalVolume} {language === 'ta' ? 'தார் / கட்டு' : 'Units'}
                  </div>
                  <span className="text-[10px] text-slate-400">{farmerTxs.length} {language === 'ta' ? 'ஏல சீட்டுகள்' : 'bills completed'}</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'மொத்த வர்த்தக மதிப்பு' : 'Gross Produce Value'}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    ₹{farmerGross.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">{language === 'ta' ? 'பிடித்தம் முந்தைய தொகை' : 'Before mandi deductions'}</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'மொத்த பிடித்தங்கள்' : 'Total Mandi Deductions'}
                  </span>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                    ₹{farmerTotalDeductions.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    கம்: ₹{farmerCommission} | கூலி: ₹{farmerCoolie} | வாடகை: ₹{farmerRent}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                    {language === 'ta' ? 'நிலுவை பட்டுவாடா இருப்பு' : 'Pending Payout Balance'}
                  </span>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
                    ₹{selectedFarmer.payoutBalance.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
                    A/c: {selectedFarmer.bankDetails.bankName.slice(0, 18)}...
                  </span>
                </div>
              </div>
            )}

            {/* Farmer Lots & Sales Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'ta' ? 'விவசாயி ஏல விற்பனை பதிவேடு' : 'Farmer Auction Sales Register'}
                </h4>
                <span className="text-xs text-slate-500">
                  {farmerTxs.length} {language === 'ta' ? 'விற்பனை சீட்டுகள்' : 'records found'}
                </span>
              </div>

              <div className="overflow-x-auto">
                {farmerTxs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    {language === 'ta' ? 'இந்த விவசாயிக்கு இன்னும் ஏல விற்பனை பதிவுகள் இல்லை.' : 'No auction sales recorded for this farmer yet.'}
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Bill #</th>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Produce / Variety</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Rate (₹)</th>
                        <th className="py-3 px-4 text-right">Gross Total</th>
                        <th className="py-3 px-4 text-right text-rose-600">Deductions</th>
                        <th className="py-3 px-4 text-right text-emerald-600">Net Farmer (₹)</th>
                        <th className="py-3 px-4 text-center">Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {farmerTxs.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-mono font-bold">#{tx.billNumber}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{tx.date} {tx.time}</td>
                          <td className="py-2.5 px-4 font-bold">{tx.productName} ({tx.variety})</td>
                          <td className="py-2.5 px-4 text-center font-bold font-mono">{tx.quantity} {getTamilUnit(tx.itemType, tx.unit)}</td>
                          <td className="py-2.5 px-4 text-right font-mono">₹{tx.ratePerUnit.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">₹{tx.grossAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                            -₹{(tx.rentAmount + tx.coolieAmount + tx.magimaiAmount + tx.commissionAmount).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-600">
                            ₹{tx.netFarmerPayable.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => setModalA5Tx(tx)}
                              className="px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold cursor-pointer hover:bg-emerald-200"
                            >
                              A5 Chit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 2: BUYER (TRADER) REPORT                      */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'buyer-report' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Buyer Selector Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'மொத்த வியாபாரி தேர்வு (Select Trader):' : 'Select Wholesale Buyer / Trader:'}
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={e => setSelectedBuyerId(e.target.value)}
                  className="w-full md:max-w-md p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                >
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>
                      [{b.paddleNumber}] {b.tradeName} ({b.name}) • Dues: ₹{b.outstandingDues.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBuyer && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCollectAmount(selectedBuyer.outstandingDues);
                      setShowCollectModal(true);
                    }}
                    disabled={selectedBuyer.outstandingDues <= 0}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer ${
                      selectedBuyer.outstandingDues > 0
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>
                      {selectedBuyer.outstandingDues > 0
                        ? `${language === 'ta' ? 'வசூல்' : 'Collect'} ₹${selectedBuyer.outstandingDues.toLocaleString('en-IN')}`
                        : language === 'ta' ? 'பாக்கி இல்லை' : 'No Outstanding (₹0)'}
                    </span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{language === 'ta' ? 'வரி விலைப்பட்டியல்' : 'Print Tax Invoice'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Buyer Metric Cards */}
            {selectedBuyer && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'கொள்முதல் செய்த அளவு' : 'Purchased Volume'}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {buyerTotalVolume} {language === 'ta' ? 'தார் / கட்டு' : 'Units'}
                  </div>
                  <span className="text-[10px] text-slate-400">{buyerTxs.length} {language === 'ta' ? 'ஏலங்கள் வெற்றி' : 'lots won today'}</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'மொத்த பில் தொகை' : 'Total Billed Amount'}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    ₹{buyerTotal.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Goods: ₹{buyerGross} + Fee: ₹{buyerFee}</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {language === 'ta' ? 'அட்வான்ஸ் டெபாசிட்' : 'Security Deposit'}
                  </span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ₹{selectedBuyer.depositAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Credit Limit: ₹{selectedBuyer.creditLimit.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                    {language === 'ta' ? 'தற்போதைய கடன் பாக்கி' : 'Current Outstanding Dues'}
                  </span>
                  <div className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono mt-1">
                    ₹{selectedBuyer.outstandingDues.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-rose-600">{buyerUtilization}% Limit Used</span>
                    <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-bold ${
                      selectedBuyer.status === 'Blocked' ? 'bg-red-200 text-red-900' : selectedBuyer.status === 'Warning' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {selectedBuyer.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Purchase History Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'ta' ? 'வியாபாரி கொள்முதல் மற்றும் பில் பதிவேடு' : 'Trader Purchases & Invoices Register'}
                </h4>
                <span className="text-xs text-slate-500">
                  {buyerTxs.length} {language === 'ta' ? 'கொள்முதல் சீட்டுகள்' : 'bills issued'}
                </span>
              </div>

              <div className="overflow-x-auto">
                {buyerTxs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    {language === 'ta' ? 'இந்த வியாபாரிக்கு இன்னும் கொள்முதல் பதிவுகள் இல்லை.' : 'No purchases recorded for this trader yet.'}
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Bill #</th>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Farmer (ஊர்)</th>
                        <th className="py-3 px-4">Produce / Variety</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Rate (₹)</th>
                        <th className="py-3 px-4 text-right">Goods Value</th>
                        <th className="py-3 px-4 text-right">Market Fee</th>
                        <th className="py-3 px-4 text-right font-black">Total Billed (₹)</th>
                        <th className="py-3 px-4 text-center">Gate Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {buyerTxs.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-mono font-bold">#{tx.billNumber}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{tx.date} {tx.time}</td>
                          <td className="py-2.5 px-4 font-bold">{tx.sellerName} <span className="text-[10px] text-slate-400 block">[{tx.sellerVillage}]</span></td>
                          <td className="py-2.5 px-4 font-bold">{tx.productName} ({tx.variety})</td>
                          <td className="py-2.5 px-4 text-center font-bold font-mono">{tx.quantity} {getTamilUnit(tx.itemType, tx.unit)}</td>
                          <td className="py-2.5 px-4 text-right font-mono">₹{tx.ratePerUnit.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">₹{tx.grossAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500">₹{tx.buyerMarketFee.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">₹{tx.buyerTotalBilled.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Gate Pass OK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 3: AGENT (MANDI COMMISSION AGENCY P&L) REPORT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'agent-report' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Timeframe & Overview Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>{language === 'ta' ? 'மண்டி உரிமையாளர் / முகவர் லாப நட்ட அறிக்கை' : 'Mandi Agent Financial Profit & Loss Statement'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ta'
                    ? 'மண்டியின் மொத்த வர்த்தக அளவு, கமிஷன் வருமானம், சேவை கட்டணங்கள் மற்றும் நிகர லாப கணக்கீடு.'
                    : 'Agency Executive Overview: Mandi Commission Revenue, Stacking/Coolie Pools, Operational Expenses, and Net Agency Margin.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ta' ? 'கால அளவு:' : 'Period:'}</span>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                  {(['today', 'week', 'month', 'all'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setAgentPeriod(p)}
                      className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-all ${
                        agentPeriod === p
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Executive Financial Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Mandi Turnover */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'ta' ? 'மொத்த ஏல வர்த்தகம்' : 'Gross Mandi Turnover'}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-2">
                  ₹{totalGrossTurnover.toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {transactions.length} {language === 'ta' ? 'ஏல விற்பனைகள்' : 'total auction chits'}
                </div>
              </div>

              {/* Commission Revenue */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'ta' ? 'கமிஷன் வருமானம் (10%)' : 'Commission Revenue'}
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">
                  ₹{totalCommissionRevenue.toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {language === 'ta' ? 'முதன்மை மண்டி வருவாய்' : 'Primary agency earnings'}
                </div>
              </div>

              {/* Retained Service Charges */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'ta' ? 'சேவை கட்டணங்கள் (Services)' : 'Handling & Service Pool'}
                </span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-2">
                  ₹{totalServiceCharges.toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  வாடகை: ₹{totalRentRevenue} | கூலி: ₹{totalCoolieRevenue} | மகிமை: ₹{totalMagimaiRevenue}
                </div>
              </div>

              {/* Net Agency Profit */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {language === 'ta' ? 'நிகர முகவர் லாபம் (Net Profit)' : 'Net Agency Operating Profit'}
                </span>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-2">
                  ₹{netAgencyProfit.toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {netProfitMargin}% {language === 'ta' ? 'லாப விகிதம்' : 'Operating Profit Margin'}
                </div>
              </div>
            </div>

            {/* Income vs Expenses Itemized Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Streams Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ta' ? 'மண்டி வருவாய் இனங்கள் (Revenues)' : 'Agency Revenue Streams'}</span>
                  </h4>
                  <span className="font-mono font-black text-emerald-600">₹{totalMandiGrossRevenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Mandi Agency Commission ({profile.defaultCommissionPercent}%):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{totalCommissionRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Platform Stacking Rent (வாடகை):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{totalRentRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Weighing & Coolie Collections (கூலி):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{totalCoolieRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Magimai Charity Cess (மகிமை):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{totalMagimaiRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-rose-600" />
                    <span>{language === 'ta' ? 'மண்டி நிர்வாக செலவுகள் (Expenses)' : 'Operational & Labor Expenses'}</span>
                  </h4>
                  <span className="font-mono font-black text-rose-600">₹{totalMandiExpenses.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {mandiExpenses.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No operational expenses recorded yet.
                    </div>
                  ) : (
                    mandiExpenses.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{exp.category}</span>
                          <span className="text-[10px] text-slate-400">{exp.paidTo} • {exp.paymentMode}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-600">-₹{exp.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Market Liquidity and Exposure Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {language === 'ta' ? 'சந்தை பணப்புழக்கம் மற்றும் நிலுவைகள் (Market Exposure)' : 'Market Liquidity & Exposure Statement'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">{language === 'ta' ? 'வியாபாரிகளிடம் வர வேண்டிய பாக்கி:' : 'Total Trader Receivables:'}</span>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                    ₹{totalBuyerReceivables.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">{language === 'ta' ? 'விவசாயிகளுக்கு கொடுக்க வேண்டிய பாக்கி:' : 'Total Farmer Payables:'}</span>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                    ₹{totalFarmerPayables.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">{language === 'ta' ? 'மண்டி மூலதன உபரி / பற்றாக்குறை:' : 'Net Liquidity Position:'}</span>
                  <div className={`text-lg font-black font-mono mt-1 ${
                    totalBuyerReceivables >= totalFarmerPayables ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {totalBuyerReceivables >= totalFarmerPayables ? '+' : '-'}₹{Math.abs(totalBuyerReceivables - totalFarmerPayables).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT 4: FINANCIAL LEDGER EMBEDDED TAB             */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'ledger' && (
          <div className="p-4 sm:p-6">
            <LedgerView onNavigate={onNavigate} />
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: DAILY SALES SHEET                             */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'sales' && (
          <div>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Gross Sales:</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{totalGrossTurnover.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mandi Commission ({profile.defaultCommissionPercent}%):</span>
                <div className="text-lg font-black text-emerald-800 dark:text-emerald-400 font-mono">
                  ₹{totalCommissionRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">வாடகை Stacking Pool:</span>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                  ₹{totalRentRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">கூலி Labor Pool:</span>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                  ₹{totalCoolieRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-16 p-4">
                  <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No Sales Bills Completed Today</p>
                  <p className="text-xs text-slate-400 mt-1">Complete floor lots in Mandi Calling Desk to generate bills, or click "Demo Data" in header.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-3 px-4">Bill #</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Farmer (ஊர்)</th>
                      <th className="py-3 px-4">Trader (வியாபாரி)</th>
                      <th className="py-3 px-4">Variety / ரகம்</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                      <th className="py-3 px-4 text-right">Gross Total</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                      <th className="py-3 px-4 text-right">Farmer Balance</th>
                      <th className="py-3 px-4 text-center">Dual Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{tx.billNumber}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{tx.time}</td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold">{tx.sellerName}</span>
                          <span className="text-[10px] text-slate-400 block uppercase">[{tx.sellerVillage}]</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold">{tx.buyerTradeName}</span>
                          <span className="text-[10px] text-slate-400 block">Paddle: {tx.buyerPaddle}</span>
                        </td>
                        <td className="py-2.5 px-4 uppercase font-bold text-slate-900 dark:text-white">
                          {tx.variety}
                          <span className="text-[10px] font-tamil text-slate-500 dark:text-slate-400 block">{tx.productNameTamil}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold font-mono">
                          {tx.quantity} {getTamilUnit(tx.itemType, tx.unit)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">₹{tx.ratePerUnit.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{tx.grossAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-800 dark:text-emerald-400">
                          ₹{tx.commissionAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-900 dark:text-emerald-300">
                          ₹{tx.netFarmerPayable.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setModalPosTx(tx)}
                              className="px-2 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                              title="Print 80mm POS Slip"
                            >
                              POS
                            </button>
                            <button
                              onClick={() => setModalA5Tx(tx)}
                              className="px-2 py-0.5 rounded-xs bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold cursor-pointer"
                              title="Print KVS A5 Sheet"
                            >
                              A5
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: POS BILL (80MM THERMAL)                       */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'pos-bill' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  80mm POS Thermal Receipt Preview Desk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct thermal roll format for high-speed counter printing.
                </p>
              </div>

              {transactions.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Bill:</label>
                  <select
                    value={selectedBillId}
                    onChange={e => setSelectedBillId(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {transactions.map(tx => (
                      <option key={tx.id} value={tx.id}>
                        Bill #{tx.billNumber} • {tx.sellerName} → {tx.buyerTradeName} (₹{tx.grossAmount})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeBill ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 flex justify-center">
                  <div className="w-full max-w-sm bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 font-mono text-xs leading-tight print-chit-container">
                    <div className="text-center pb-2 border-b-2 border-dashed border-black space-y-0.5">
                      <h2 className="font-black text-lg tracking-wider uppercase">{profile.shopName}</h2>
                      <p className="text-[11px] font-tamil font-bold">{profile.taglineTamil}</p>
                      <p className="text-[10px]">{profile.marketLocationTamil}</p>
                      <p className="text-[10px]">Ph: {profile.phone}</p>
                      <div className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">
                        ** POS SALE SLIP / மண்டி சீட்டு **
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] py-1.5 border-b border-dashed border-black">
                      <div className="flex justify-between font-bold">
                        <span>Bill #: {activeBill.billNumber}</span>
                        <span>Date: {activeBill.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time: {activeBill.time}</span>
                        <span className="font-bold">Paddle: {activeBill.buyerPaddle}</span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span>Farmer: <strong className="uppercase">{activeBill.sellerName}</strong></span>
                        <span>[{activeBill.sellerVillage}]</span>
                      </div>
                      <div>
                        Buyer: <strong>{activeBill.buyerTradeName}</strong>
                      </div>
                    </div>

                    <div className="py-2 border-b-2 border-dashed border-black">
                      <div className="flex justify-between font-bold pb-1 text-[11px]">
                        <span>ITEM / VARIETY</span>
                        <span>AMOUNT</span>
                      </div>
                      <div className="flex justify-between text-xs font-black">
                        <span>{activeBill.quantity} × {activeBill.variety}</span>
                        <span>₹{activeBill.grossAmount.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-tamil">
                        {activeBill.productNameTamil} @ ₹{activeBill.ratePerUnit}/{getTamilUnit(activeBill.itemType, activeBill.unit)}
                      </div>
                    </div>

                    <div className="py-2 border-b-2 border-dashed border-black text-[11px] space-y-1 font-tamil">
                      <div className="flex justify-between font-bold">
                        <span>மொத்த தொகை (Gross):</span>
                        <span className="font-mono">₹{activeBill.grossAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>வாடகை (Rent):</span>
                        <span className="font-mono">-₹{activeBill.rentAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>கூலி (Coolie):</span>
                        <span className="font-mono">-₹{activeBill.coolieAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>மகிமை (Magimai):</span>
                        <span className="font-mono">-₹{activeBill.magimaiAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>கமிஷன் ({profile.defaultCommissionPercent}%):</span>
                        <span className="font-mono">-₹{activeBill.commissionAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="py-2 border-b-2 border-dashed border-black flex justify-between items-center text-sm font-black font-tamil">
                      <span>நிகர பட்டுவாடா:</span>
                      <span className="text-base font-mono">₹{activeBill.netFarmerPayable.toFixed(2)}</span>
                    </div>

                    <div className="text-center pt-2 text-[10px] text-slate-600">
                      நன்றி! மீண்டும் வருக! • Powered by Velaan Bay
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Thermal POS Actions
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Standard 80mm / 3-inch thermal printer output.
                    </p>
                    <button
                      onClick={() => setModalPosTx(activeBill)}
                      className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print 80mm Thermal Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: A5 SHEET PRINT                                */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'a5-sheet' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  KVS Official A5 Portrait Sheet Preview (விற்பனை சீட்டு)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  148mm × 210mm portrait voucher format.
                </p>
              </div>

              {transactions.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Bill:</label>
                  <select
                    value={selectedBillId}
                    onChange={e => setSelectedBillId(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {transactions.map(tx => (
                      <option key={tx.id} value={tx.id}>
                        Bill #{tx.billNumber} • {tx.sellerName} → {tx.buyerTradeName} (₹{tx.grossAmount})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeBill && (
              <div className="flex justify-center">
                <button
                  onClick={() => setModalA5Tx(activeBill)}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open & Print Official KVS A5 Sheet</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: MANDI COMPANY PROFILE                         */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'company-profile' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleSaveProfile} className="max-w-2xl bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Mandi Company Profile & Statutory Deductions
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Settings persist to LocalStorage and update headers, A5 sheets, and receipts.
                    </p>
                  </div>
                </div>

                {profileSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full animate-bounce">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Shop / Firm Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.shopName}
                    onChange={e => setProfileData({ ...profileData, shopName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    கடை பெயர் (தமிழ்)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.shopNameTamil}
                    onChange={e => setProfileData({ ...profileData, shopNameTamil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold font-tamil"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Mandi Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Pop-up Modals for A5 and POS */}
      {modalA5Tx && (
        <KvsA5Receipt
          transaction={modalA5Tx}
          profile={profile}
          onClose={() => setModalA5Tx(null)}
        />
      )}

      {modalPosTx && (
        <PosThermalReceipt
          transaction={modalPosTx}
          profile={profile}
          onClose={() => setModalPosTx(null)}
        />
      )}

      {/* Farmer Patti Slip Modal */}
      {showPattiSlip && selectedFarmer && (
        <FarmerPattiSlip
          seller={selectedFarmer}
          transactions={transactions}
          profile={profile}
          advanceRecovery={advanceDeduction}
          onClose={() => setShowPattiSlip(false)}
        />
      )}

      {/* Quick Payout Modal inside Seller Report */}
      {showPayoutModal && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {language === 'ta' ? 'விவசாயி பட்டி பட்டுவாடா உறுதி செய்' : 'Confirm Farmer Settlement Payout'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Farmer: <strong>{selectedFarmer.name}</strong> ({selectedFarmer.village})
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Amount (₹):</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mode:</label>
                <select
                  value={payoutMode}
                  onChange={e => setPayoutMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="Cash">Cash Drawer</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                  <option value="UPI / GPay">UPI / GPay</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    recordFarmerPayout(selectedFarmer.id, payoutAmount, payoutMode, payoutRef || undefined);
                    setShowPayoutModal(false);
                  }}
                  className="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Collect Modal inside Buyer Report */}
      {showCollectModal && selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {language === 'ta' ? 'வியாபாரி வசூல் பதிவு செய்' : 'Record Trader Payment Collection'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Trader: <strong>{selectedBuyer.tradeName}</strong> [{selectedBuyer.paddleNumber}]
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Amount (₹):</label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mode:</label>
                <select
                  value={collectMode}
                  onChange={e => setCollectMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cash">Cash (ரொக்கம்)</option>
                  <option value="Cheque">Cheque (காசோலை)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    recordBuyerReceipt(selectedBuyer.id, collectAmount, collectMode, collectRef || undefined);
                    setShowCollectModal(false);
                  }}
                  className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Record Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
