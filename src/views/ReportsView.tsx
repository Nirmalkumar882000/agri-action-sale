import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Seller, Buyer, AuctionTransaction, MandiProfile } from '../types';
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
} from 'lucide-react';
import { FarmerPattiSlip } from '../components/receipts/FarmerPattiSlip';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface ReportsViewProps {
  onNavigate?: (path: string) => void;
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

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    updateProfile,
    transactions,
    sellers,
    buyers,
    settleFarmerPayout,
    recordBuyerPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'sales' | 'pos-bill' | 'a5-sheet' | 'patti' | 'buyer-invoice' | 'company-profile' | 'logs'
  >('sales');

  // Selected bill for POS / A5 tabs
  const [selectedBillId, setSelectedBillId] = useState<string>(transactions[0]?.id || '');
  const activeBill = transactions.find(t => t.id === selectedBillId) || transactions[0];

  // Pop-up modals (when clicking print from table)
  const [modalA5Tx, setModalA5Tx] = useState<AuctionTransaction | null>(null);
  const [modalPosTx, setModalPosTx] = useState<AuctionTransaction | null>(null);

  // Patti state
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(sellers[0]?.id || '');
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [showPattiSlip, setShowPattiSlip] = useState(false);

  // Buyer Invoice state
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');

  // Profile Form state
  const [profileData, setProfileData] = useState<MandiProfile>(profile);
  const [profileSaved, setProfileSaved] = useState(false);

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

  const totalGross = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalCommission = transactions.reduce((sum, tx) => sum + tx.commissionAmount, 0);
  const totalCoolie = transactions.reduce((sum, tx) => sum + tx.coolieAmount, 0);
  const totalRent = transactions.reduce((sum, tx) => sum + tx.rentAmount, 0);

  // Buyer specific transactions
  const buyerTxs = transactions.filter(tx => tx.buyerId === selectedBuyer?.id);
  const buyerGross = buyerTxs.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const buyerFee = buyerTxs.reduce((sum, tx) => sum + tx.buyerMarketFee, 0);
  const buyerTotal = buyerTxs.reduce((sum, tx) => sum + tx.buyerTotalBilled, 0);

  const exportCSV = () => {
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
              Financials & Dual Printing
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('reportsCenter')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('reportsSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('downloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-bold overflow-x-auto">
          {/* Tab 1: Daily Sales */}
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sales'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('tabDailySales')}
          </button>

          {/* Tab 2: POS Bill 80mm */}
          <button
            onClick={() => setActiveTab('pos-bill')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pos-bill'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>POS Bill (80mm Thermal)</span>
          </button>

          {/* Tab 3: A5 Sheet Print */}
          <button
            onClick={() => setActiveTab('a5-sheet')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'a5-sheet'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>KVS A5 Sheet Print (விற்பனை சீட்டு)</span>
          </button>

          {/* Tab 4: Farmer Patti */}
          <button
            onClick={() => setActiveTab('patti')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'patti'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('tabFarmerPatti')}
          </button>

          {/* Tab 5: Buyer Invoice */}
          <button
            onClick={() => setActiveTab('buyer-invoice')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'buyer-invoice'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('tabBuyerInvoice')}
          </button>

          {/* Tab 6: Mandi Company Profile */}
          <button
            onClick={() => setActiveTab('company-profile')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'company-profile'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Mandi Profile & Statutory Settings</span>
          </button>

          {/* Tab 7: Audit Logs */}
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('tabAuditLogs')}
          </button>
        </div>

        {/* Tab 1: Daily Sales Register */}
        {activeTab === 'sales' && (
          <div>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Gross Sales:</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{totalGross.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mandi Commission ({profile.defaultCommissionPercent}%):</span>
                <div className="text-lg font-black text-emerald-800 dark:text-emerald-400 font-mono">
                  ₹{totalCommission.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">வாடகை Stacking Pool:</span>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                  ₹{totalRent.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">கூலி Labor Pool:</span>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                  ₹{totalCoolie.toLocaleString('en-IN')}
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
                          {tx.quantity} {tx.itemType === 'Leaf' ? 'கட்டு' : 'தார்'}
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

        {/* Tab 2: POS Bill (80mm Thermal Receipt Preview & Print) */}
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
                {/* Receipt Preview (Left 6 Cols) */}
                <div className="md:col-span-6 flex justify-center">
                  <div className="w-full max-w-sm bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 font-mono text-xs leading-tight print-chit-container">
                    {/* Header */}
                    <div className="text-center pb-2 border-b-2 border-dashed border-black space-y-0.5">
                      <h2 className="font-black text-lg tracking-wider uppercase">{profile.shopName}</h2>
                      <p className="text-[11px] font-tamil font-bold">{profile.taglineTamil}</p>
                      <p className="text-[10px]">{profile.marketLocationTamil}</p>
                      <p className="text-[10px]">Ph: {profile.phone}</p>
                      <div className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">
                        ** POS SALE SLIP / மண்டி சீட்டு **
                      </div>
                    </div>

                    {/* Bill Info */}
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

                    {/* Item Row */}
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

                    {/* Calculation Breakdown */}
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

                    {/* Net Balance */}
                    <div className="py-2 border-b-2 border-dashed border-black flex justify-between items-center text-sm font-black font-tamil">
                      <span>நிகர பட்டுவாடா:</span>
                      <span className="text-base font-mono">₹{activeBill.netFarmerPayable.toFixed(2)}</span>
                    </div>

                    <div className="text-center pt-2 text-[10px] text-slate-600">
                      நன்றி! மீண்டும் வருக! • Powered by Velaan Bay
                    </div>
                  </div>
                </div>

                {/* Print Controls (Right 6 Cols) */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Thermal POS Actions
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      This receipt is pre-calibrated for standard 80mm / 3-inch thermal bill printers. Clicking print sends clean typography without browser headers or margins.
                    </p>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300">Active Receipt Parameters:</div>
                      <div className="text-emerald-800 dark:text-emerald-400">Bill Number: #{activeBill.billNumber}</div>
                      <div className="text-emerald-800 dark:text-emerald-400">Total Charged: ₹{activeBill.grossAmount.toFixed(2)}</div>
                      <div className="text-emerald-800 dark:text-emerald-400">Farmer Balance: ₹{activeBill.netFarmerPayable.toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => setModalPosTx(activeBill)}
                      className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print 80mm POS Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                No transactions available to generate POS receipt.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: KVS A5 Sheet Print (Exact kvs_a5_receipt.html Reproduction) */}
        {activeTab === 'a5-sheet' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  KVS Official A5 Portrait Sheet Desk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exact reproduction of traditional mandi A5 Portrait Sheet with KVS Badge, Phone, and Tamil deductions.
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
                {/* A5 Preview Container */}
                <div className="md:col-span-7 flex justify-center">
                  <div className="w-full max-w-[148mm] bg-white text-black p-4 sm:p-5 rounded-xl shadow-lg border-[1.5px] border-black font-mono text-xs leading-tight print-chit-container">
                    {/* Top Phone */}
                    <div className="text-right text-[11px] font-bold">
                      Ph: {profile.phone.split('/')[0].trim()}
                    </div>

                    {/* KVS Badge Logo */}
                    <div className="text-center my-1">
                      <div className="inline-block border-[2px] border-black rounded-xs shadow-[3px_3px_0px_#000] px-5 py-0.5 bg-white">
                        <h1 className="text-xl font-black tracking-widest leading-none">KVS</h1>
                      </div>
                    </div>

                    {/* Tamil Business Details */}
                    <div className="text-center font-tamil text-[12px] font-extrabold leading-snug">
                      {profile.taglineTamil}
                    </div>
                    <div className="text-center font-tamil text-[11px] font-bold text-slate-800">
                      {profile.marketLocationTamil}
                    </div>

                    {/* Bill No & Date */}
                    <div className="flex justify-between text-[12px] font-bold pt-2 border-t border-black mt-2">
                      <span>
                        எண் <strong className="text-sm font-black">{activeBill.billNumber}</strong>
                      </span>
                      <span>
                        தேதி <strong>{activeBill.date}</strong>
                      </span>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-[70px_1fr] gap-x-2 text-[12px] font-bold border-t border-dotted border-black pt-1 my-1">
                      <span className="font-tamil">ஊர்</span>
                      <span className="uppercase">{activeBill.sellerVillage}</span>
                      <span className="font-tamil">பெயர்</span>
                      <span className="uppercase">{activeBill.sellerName}</span>
                      <span className="font-tamil">வியாபாரி</span>
                      <span>{activeBill.buyerTradeName} [{activeBill.buyerPaddle}]</span>
                      <span className="font-tamil">விளைபொருள் / அலகு</span>
                      <div className="flex justify-between">
                        <span className="font-tamil">{getTamilUnit(activeBill.itemType, activeBill.unit)}</span>
                        <span className="font-black pr-2">{activeBill.quantity}</span>
                      </div>
                    </div>

                    {/* Star Separator */}
                    <div className="text-center text-[10px] tracking-widest text-slate-700 py-1 overflow-hidden select-none">
                      ****************************************************
                    </div>

                    {/* Table Row */}
                    <table className="w-full text-[12px] font-bold">
                      <thead>
                        <tr className="border-b border-black text-left">
                          <th className="font-tamil pb-1">விபரம்</th>
                          <th className="font-tamil pb-1 text-center">எண்ணிக்கை</th>
                          <th className="font-tamil pb-1 text-right">விலை</th>
                          <th className="font-tamil pb-1 text-right">ரூபாய்</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="pt-1.5 uppercase">{activeBill.variety}</td>
                          <td className="pt-1.5 text-center font-mono">{activeBill.quantity}</td>
                          <td className="pt-1.5 text-right font-mono">{activeBill.ratePerUnit.toFixed(2)}</td>
                          <td className="pt-1.5 text-right font-mono font-black">{activeBill.grossAmount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Tamil Deduction Rows (Gross - Deductions = Balance) */}
                    <div className="mt-4 pt-2 border-t border-dotted border-black text-[12px] font-bold font-tamil space-y-1">
                      <div className="flex justify-between">
                        <span>வாடகை</span>
                        <span className="font-mono">{activeBill.rentAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>கூலி</span>
                        <span className="font-mono">{activeBill.coolieAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>மகிமை</span>
                        <span className="font-mono">{activeBill.magimaiAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>கமிஷன்</span>
                        <span className="font-mono">{activeBill.commissionAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Bottom Grand Balance */}
                    <div className="mt-3 pt-2 border-t-2 border-black flex justify-between items-center text-sm font-black font-tamil">
                      <span>மீதம் பட்டுவாடா</span>
                      <span className="text-base font-mono">₹{activeBill.netFarmerPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Print Controls (Right 5 Cols) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Official A5 Sheet Format
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Matches the real KVS Mandi receipt layout (from Nayinarkulam Market, Tirunelveli). Formatted exactly to standard 148mm × 210mm portrait sheet.
                    </p>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1 text-xs">
                      <div className="font-bold text-amber-900 dark:text-amber-300">Calculation Formula:</div>
                      <div className="text-amber-800 dark:text-amber-400 font-mono">
                        Gross (₹{activeBill.grossAmount.toFixed(2)}) - Deductions (₹{(activeBill.rentAmount + activeBill.coolieAmount + activeBill.magimaiAmount + activeBill.commissionAmount).toFixed(2)}) = Balance (₹{activeBill.netFarmerPayable.toFixed(2)})
                      </div>
                    </div>

                    <button
                      onClick={() => setModalA5Tx(activeBill)}
                      className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Official A5 Sheet</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                No transactions available to generate A5 receipt.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Farmer Settlement Patti (விற்பனை ரசீது) */}
        {activeTab === 'patti' && (
          <div className="p-6 space-y-6">
            <div className="max-w-xl bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Generate Official Farmer Patti (விற்பனை ரசீது)
              </h3>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-xs">
                  Select Farmer:
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={e => setSelectedFarmerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - {s.village}) • Balance: ₹{s.payoutBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-xs">
                  Cash Advance Recovery Deduction (₹):
                </label>
                <input
                  type="number"
                  min={0}
                  value={advanceDeduction}
                  onChange={e => setAdvanceDeduction(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setShowPattiSlip(true)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('generatePatti')}</span>
                </button>
                <button
                  onClick={() => {
                    if (!selectedFarmer) return;
                    if (selectedFarmer.payoutBalance <= 0) {
                      alert('Farmer payout balance is already settled (₹0).');
                      return;
                    }
                    if (confirm(`Confirm settlement of ₹${selectedFarmer.payoutBalance.toLocaleString('en-IN')} to farmer ${selectedFarmer.name}?`)) {
                      settleFarmerPayout(selectedFarmer.id, selectedFarmer.payoutBalance, 'Cash Drawer');
                    }
                  }}
                  disabled={!selectedFarmer || selectedFarmer.payoutBalance <= 0}
                  className={`w-full sm:flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    selectedFarmer && selectedFarmer.payoutBalance > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span>{selectedFarmer?.payoutBalance > 0 ? `Settle ₹${selectedFarmer.payoutBalance.toLocaleString('en-IN')}` : 'Settled (₹0)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Buyer Tax Invoice & Gate Pass */}
        {activeTab === 'buyer-invoice' && (
          <div className="p-6 space-y-6">
            <div className="max-w-xl bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Generate Buyer Tax Invoice & Delivery Gate Pass
              </h3>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-xs">
                  Select Wholesale Buyer:
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={e => setSelectedBuyerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                >
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>
                      [{b.paddleNumber}] {b.tradeName} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lots Won Today:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{buyerTxs.length} lots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gross Goods Value:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{buyerGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Mandi Market Fee (1%):</span>
                  <span className="font-mono text-slate-900 dark:text-white">₹{buyerFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold text-emerald-900 dark:text-emerald-300">
                  <span>Total Tax Invoice Billed:</span>
                  <span className="font-mono text-sm">₹{buyerTotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedBuyer && (
                  <div className="flex justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <span>Trader Outstanding Dues:</span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">₹{selectedBuyer.outstandingDues.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  onClick={() => {
                    if (!selectedBuyer) return;
                    if (selectedBuyer.outstandingDues <= 0) {
                      alert('Wholesale buyer has zero outstanding dues.');
                      return;
                    }
                    if (confirm(`Confirm receiving payment of ₹${selectedBuyer.outstandingDues.toLocaleString('en-IN')} from ${selectedBuyer.tradeName}?`)) {
                      recordBuyerPayment(selectedBuyer.id, selectedBuyer.outstandingDues, 'Bank Transfer / RTGS');
                    }
                  }}
                  disabled={!selectedBuyer || selectedBuyer.outstandingDues <= 0}
                  className={`w-full sm:flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    selectedBuyer && selectedBuyer.outstandingDues > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-blue-600/20 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{selectedBuyer?.outstandingDues > 0 ? `Collect ₹${selectedBuyer.outstandingDues.toLocaleString('en-IN')}` : 'All Paid (₹0)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Mandi Company Profile & Statutory Settings */}
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
                      Changes persist to LocalStorage and update headers, A5 sheets, and POS slips instantly.
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

              {/* Shop Names */}
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

              {/* Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Business Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={profileData.tagline}
                    onChange={e => setProfileData({ ...profileData, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    விளம்பர வாசகம் (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={profileData.taglineTamil}
                    onChange={e => setProfileData({ ...profileData, taglineTamil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-tamil"
                  />
                </div>
              </div>

              {/* Location & License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    மார்க்கெட் முகவரி (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={profileData.marketLocationTamil}
                    onChange={e => setProfileData({ ...profileData, marketLocationTamil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-tamil"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Contact Phone Numbers
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.phone}
                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* GSTIN & License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Mandi License Number
                  </label>
                  <input
                    type="text"
                    value={profileData.mandiLicenseNo}
                    onChange={e => setProfileData({ ...profileData, mandiLicenseNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={profileData.gstin}
                    onChange={e => setProfileData({ ...profileData, gstin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase mb-3">
                  Default Statutory Rates / பிடித்த விகிதங்கள்
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">வாடகை (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={profileData.defaultRentPerUnit}
                      onChange={e => setProfileData({ ...profileData, defaultRentPerUnit: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">கூலி (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={profileData.defaultCooliePerUnit}
                      onChange={e => setProfileData({ ...profileData, defaultCooliePerUnit: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">மகிமை (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={profileData.defaultMagimaiPerUnit}
                      onChange={e => setProfileData({ ...profileData, defaultMagimaiPerUnit: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">கமிஷன் (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={profileData.defaultCommissionPercent}
                      onChange={e => setProfileData({ ...profileData, defaultCommissionPercent: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Mandi Profile to LocalStorage</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 7: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Real-Time Mandi Notification Logs
            </h3>
            <div className="space-y-2">
              {[
                {
                  id: 1,
                  type: 'WhatsApp',
                  recipient: 'R.M. Mani (+91 9842155670)',
                  text: 'வணக்கம் ஆர்.எம். மணி, உங்கள் வாழைத்தார்கள் ஏலம் முடிவடைந்தது. பட்டுவாடா தொகை: ₹364.00 (ரசீது எண்: #54).',
                  time: '08:45 AM',
                  status: 'Delivered',
                },
                {
                  id: 2,
                  type: 'WhatsApp',
                  recipient: 'Sri Murugan Banana Mandi (+91 9843029182)',
                  text: 'வணக்கம், இன்றைய மண்டி கொள்முதல் ரசீது எண் #54 தயாராக உள்ளது.',
                  time: '08:46 AM',
                  status: 'Delivered',
                },
                {
                  id: 3,
                  type: 'SMS',
                  recipient: 'S. Shanmugam (+91 9788234190)',
                  text: 'KVS Mandi: Your Poovan leaf lot LOT-2026-092 inwarded successfully in Shed 2.',
                  time: '09:15 AM',
                  status: 'Delivered',
                },
              ].map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm font-bold bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-300 text-[10px]">
                        {log.type}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.recipient}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">{log.text}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 block">{log.time}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
};
