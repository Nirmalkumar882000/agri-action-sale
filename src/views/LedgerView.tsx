import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LedgerEntry, PaymentMode, MandiExpense } from '../types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Filter,
  Search,
  Download,
  Printer,
  PlusCircle,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Tag,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  CreditCard,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

interface LedgerViewProps {
  onNavigate?: (path: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    ledgerEntries,
    sellers,
    buyers,
    mandiExpenses,
    recordFarmerPayout,
    recordBuyerReceipt,
    recordMandiExpense,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'Farmer' | 'Buyer' | 'Mandi' | 'Staff' | 'Expense'>('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState<'ALL' | PaymentMode>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | string>('ALL');

  // Modals state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Farmer Payout Form state
  const [payoutSellerId, setPayoutSellerId] = useState(sellers[0]?.id || '');
  const selectedSeller = sellers.find(s => s.id === payoutSellerId) || sellers[0];
  const [payoutAmount, setPayoutAmount] = useState<number>(selectedSeller?.payoutBalance || 0);
  const [payoutMode, setPayoutMode] = useState<PaymentMode>('Cash');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutRemarks, setPayoutRemarks] = useState('');

  // Buyer Receipt Form state
  const [receiptBuyerId, setReceiptBuyerId] = useState(buyers[0]?.id || '');
  const selectedBuyer = buyers.find(b => b.id === receiptBuyerId) || buyers[0];
  const [receiptAmount, setReceiptAmount] = useState<number>(selectedBuyer?.outstandingDues || 0);
  const [receiptMode, setReceiptMode] = useState<PaymentMode>('UPI / GPay');
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptRemarks, setReceiptRemarks] = useState('');

  // Mandi Expense Form state
  const [expenseCategory, setExpenseCategory] = useState<MandiExpense['category']>('Coolie & Labor');
  const [expenseAmount, setExpenseAmount] = useState<number>(500);
  const [expensePaidTo, setExpensePaidTo] = useState('');
  const [expenseFromAccount, setExpenseFromAccount] = useState('Cash Drawer');
  const [expenseMode, setExpenseMode] = useState<PaymentMode>('Cash');
  const [expenseRemarks, setExpenseRemarks] = useState('');

  // Filtered Ledger entries
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      // Account filter
      if (accountFilter !== 'ALL' && entry.partyType !== accountFilter) return false;
      // Payment mode filter
      if (paymentModeFilter !== 'ALL' && entry.paymentMode !== paymentModeFilter) return false;
      // Type filter
      if (typeFilter !== 'ALL' && entry.type !== typeFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchParty = entry.partyName.toLowerCase().includes(q);
        const matchVoucher = entry.voucherNumber.toLowerCase().includes(q);
        const matchRef = (entry.referenceNo || '').toLowerCase().includes(q);
        const matchNarration = entry.narration.toLowerCase().includes(q);
        const matchTamil = (entry.narrationTamil || '').toLowerCase().includes(q);
        return matchParty || matchVoucher || matchRef || matchNarration || matchTamil;
      }
      return true;
    });
  }, [ledgerEntries, accountFilter, paymentModeFilter, typeFilter, searchTerm]);

  // Overall Financial Aggregates
  const totalCredit = useMemo(() => ledgerEntries.reduce((sum, e) => sum + e.credit, 0), [ledgerEntries]);
  const totalDebit = useMemo(() => ledgerEntries.reduce((sum, e) => sum + e.debit, 0), [ledgerEntries]);
  const netCashBalance = totalCredit - totalDebit;

  const totalFarmerPayables = useMemo(() => sellers.reduce((sum, s) => sum + s.payoutBalance, 0), [sellers]);
  const totalBuyerReceivables = useMemo(() => buyers.reduce((sum, b) => sum + b.outstandingDues, 0), [buyers]);

  // Handle Farmer Payout Submission
  const handleFarmerPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller || payoutAmount <= 0) return;
    recordFarmerPayout(
      selectedSeller.id,
      payoutAmount,
      payoutMode,
      payoutRef || undefined,
      payoutRemarks || undefined
    );
    setShowPayoutModal(false);
    setPayoutRemarks('');
    setPayoutRef('');
  };

  // Handle Buyer Receipt Submission
  const handleBuyerReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer || receiptAmount <= 0) return;
    recordBuyerReceipt(
      selectedBuyer.id,
      receiptAmount,
      receiptMode,
      receiptRef || undefined,
      receiptRemarks || undefined
    );
    setShowReceiptModal(false);
    setReceiptRemarks('');
    setReceiptRef('');
  };

  // Handle Mandi Expense Submission
  const handleMandiExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;
    const now = new Date();
    recordMandiExpense({
      date: now.toLocaleDateString('en-GB'),
      time: now.toTimeString().slice(0, 8),
      category: expenseCategory,
      amount: expenseAmount,
      paymentMode: expenseMode,
      paidTo: expensePaidTo || expenseCategory,
      paidFromAccount: expenseFromAccount,
      remarks: expenseRemarks || `Operational expense for ${expenseCategory}`,
    });
    setShowExpenseModal(false);
    setExpenseRemarks('');
    setExpensePaidTo('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Voucher,Date,Time,Type,AccountType,PartyName,Debit,Credit,RunningBalance,PaymentMode,Reference,Narration\n';
    const rows = filteredEntries
      .map(
        e =>
          `"${e.voucherNumber}","${e.date}","${e.time}","${e.type}","${e.partyType}","${e.partyName}",${e.debit},${e.credit},${e.runningBalance},"${e.paymentMode}","${e.referenceNo || ''}","${e.narration}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KVS_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              {language === 'ta' ? 'முழுமையான நிதி லெட்ஜர்' : 'General Ledger & Accounts'}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {language === 'ta' ? 'மண்டி நிதி லெட்ஜர் & கணக்கு புத்தகம்' : 'Mandi Financial Ledger & Cash Book'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'விவசாயி பட்டுவாடா, வியாபாரி வசூல், மண்டி கமிஷன், கூலி மற்றும் நிர்வாக செலவுகளின் முழுமையான கணக்கு பதிவேடு.'
              : 'Complete Double-Entry Ledger: Farmer settlements, trader collections, mandi commission, labor, and operational expenses.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (selectedSeller) setPayoutAmount(selectedSeller.payoutBalance);
              setShowPayoutModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{language === 'ta' ? '+ விவசாயி பட்டுவாடா' : '+ Farmer Payout'}</span>
          </button>

          <button
            onClick={() => {
              if (selectedBuyer) setReceiptAmount(selectedBuyer.outstandingDues);
              setShowReceiptModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{language === 'ta' ? '+ வியாபாரி வசூல்' : '+ Buyer Collection'}</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ta' ? '+ மண்டி செலவு' : '+ Mandi Expense'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ta' ? 'எக்செல் (CSV)' : 'CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ta' ? 'அச்சு' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Credit / Inflow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'ta' ? 'மொத்த வரவு (Inflow)' : 'Total Inflow (Collections)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCredit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {language === 'ta' ? 'வியாபாரி வசூல் & கமிஷன் வரவுகள்' : 'Trader collections & mandi fees'}
          </div>
        </div>

        {/* Total Debit / Outflow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'ta' ? 'மொத்த பற்று (Outflow)' : 'Total Outflow (Disbursals)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalDebit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {language === 'ta' ? 'விவசாயி பட்டுவாடா & செலவுகள்' : 'Farmer payouts & expenses'}
          </div>
        </div>

        {/* Pending Trader Receivables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'ta' ? 'வியாபாரி வர வேண்டிய பாக்கி' : 'Trader Receivables (Dues)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            ₹{totalBuyerReceivables.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {buyers.filter(b => b.outstandingDues > 0).length} {language === 'ta' ? 'வியாபாரிகளிடம் பாக்கி' : 'traders have balance'}
          </div>
        </div>

        {/* Pending Farmer Payables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'ta' ? 'விவசாயிகளுக்கு கொடுக்க வேண்டியவை' : 'Farmer Payables (Pending)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            ₹{totalFarmerPayables.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {sellers.filter(s => s.payoutBalance > 0).length} {language === 'ta' ? 'விவசாயிகள் பட்டி பாக்கி' : 'farmers pending payout'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'வவுச்சர் எண், பார்ட்டி பெயர், பில் எண், குறிப்பு கொண்டு தேடுக...'
                : 'Search voucher #, party name, reference, remarks...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">{language === 'ta' ? 'அனைத்து கணக்குகளும் (All Accounts)' : 'All Accounts'}</option>
            <option value="Farmer">{language === 'ta' ? 'விவசாயி கணக்கு (Farmers)' : 'Farmers (Sellers)'}</option>
            <option value="Buyer">{language === 'ta' ? 'வியாபாரி கணக்கு (Traders)' : 'Traders (Buyers)'}</option>
            <option value="Mandi">{language === 'ta' ? 'மண்டி கமிஷன் (Mandi)' : 'Mandi Revenue'}</option>
            <option value="Expense">{language === 'ta' ? 'நிர்வாக செலவுகள் (Expenses)' : 'Mandi Expenses'}</option>
            <option value="Staff">{language === 'ta' ? 'பணியாளர் (Staff/Advances)' : 'Staff Suite'}</option>
          </select>

          {/* Payment Mode Filter */}
          <select
            value={paymentModeFilter}
            onChange={e => setPaymentModeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">{language === 'ta' ? 'அனைத்து செலுத்து முறைகள்' : 'All Payment Modes'}</option>
            <option value="Cash">{language === 'ta' ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
            <option value="Bank Transfer">{language === 'ta' ? 'வங்கி பரிமாற்றம் (Bank)' : 'Bank Transfer'}</option>
            <option value="UPI / GPay">{language === 'ta' ? 'UPI / GPay' : 'UPI / GPay'}</option>
            <option value="Cheque">{language === 'ta' ? 'காசோலை (Cheque)' : 'Cheque'}</option>
            <option value="Credit">{language === 'ta' ? 'கடன் வரவு (Credit)' : 'Credit Ledger'}</option>
          </select>

          {/* Reset Filters */}
          {(accountFilter !== 'ALL' || paymentModeFilter !== 'ALL' || searchTerm !== '') && (
            <button
              onClick={() => {
                setAccountFilter('ALL');
                setPaymentModeFilter('ALL');
                setSearchTerm('');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold"
            >
              {language === 'ta' ? 'வடிகட்டி நீக்கு' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ta' ? 'பொது கணக்கு ஏடு' : 'General Ledger Transactions'}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              {filteredEntries.length} {language === 'ta' ? 'பதிவுகள்' : 'entries'}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {language === 'ta' ? 'இருப்பு கணக்கிடப்பட்டது' : 'Running Balance Tracked'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{language === 'ta' ? 'வவுச்சர் #' : 'Voucher #'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'தேதி & நேரம்' : 'Date / Time'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'கணக்கு / பார்ட்டி' : 'Account / Party'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'வகை' : 'Voucher Type'}</th>
                <th className="py-3 px-4 text-right text-rose-600">{language === 'ta' ? 'பற்று (Debit ₹)' : 'Debit (₹)'}</th>
                <th className="py-3 px-4 text-right text-emerald-600">{language === 'ta' ? 'வரவு (Credit ₹)' : 'Credit (₹)'}</th>
                <th className="py-3 px-4 text-right">{language === 'ta' ? 'இருப்பு (Balance ₹)' : 'Balance (₹)'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'செலுத்து முறை' : 'Mode'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'குறிப்பு & விவரம்' : 'Narration / Remarks'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold">{language === 'ta' ? 'பதிவுகள் ஏதுமில்லை' : 'No ledger entries match your filter.'}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'ta' ? 'புதிய வவுச்சர் உள்ளிட மேலே உள்ள பட்டன்களை பயன்படுத்தவும்.' : 'Click any of the action buttons above to record a new entry.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Voucher */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {entry.voucherNumber}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div>{entry.date}</div>
                      <div className="text-[10px] text-slate-400">{entry.time}</div>
                    </td>

                    {/* Account / Party */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{entry.partyName}</span>
                        {entry.partyCode && (
                          <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                            {entry.partyCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            entry.partyType === 'Farmer'
                              ? 'bg-amber-500'
                              : entry.partyType === 'Buyer'
                                ? 'bg-emerald-500'
                                : entry.partyType === 'Mandi'
                                  ? 'bg-purple-500'
                                  : entry.partyType === 'Expense'
                                    ? 'bg-rose-500'
                                    : 'bg-blue-500'
                          }`}
                        />
                        <span>{entry.partyType}</span>
                        {entry.referenceNo && <span>• Ref: {entry.referenceNo}</span>}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          entry.type === 'AUCTION_SALE'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : entry.type === 'FARMER_PAYOUT'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : entry.type === 'BUYER_COLLECTION'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : entry.type === 'COMMISSION_INCOME'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                  : entry.type === 'EXPENSE_PAYMENT'
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Credit */}
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Running Balance */}
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-800 dark:text-slate-200">
                      ₹{entry.runningBalance.toLocaleString('en-IN')}
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                        {entry.paymentMode}
                      </span>
                    </td>

                    {/* Narration */}
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 text-xs">
                      <div>{language === 'ta' && entry.narrationTamil ? entry.narrationTamil : entry.narration}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Farmer Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {language === 'ta' ? 'விவசாயி பட்டி பட்டுவாடா பதிவு' : 'Record Farmer Settlement Payout'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ta' ? 'விவசாயிக்கு ரொக்கம் அல்லது வங்கி மூலம் தொகை செலுத்துதல்.' : 'Disburse pending settlement to registered farmer.'}
                </p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFarmerPayoutSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'விவசாயி தேர்வு (Select Farmer)' : 'Select Farmer'}
                </label>
                <select
                  value={payoutSellerId}
                  onChange={e => {
                    setPayoutSellerId(e.target.value);
                    const s = sellers.find(sel => sel.id === e.target.value);
                    if (s) setPayoutAmount(s.payoutBalance);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.village}) — Pending: ₹{s.payoutBalance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
                {selectedSeller && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>A/c: {selectedSeller.bankDetails.bankName || 'Cash Payout'}</span>
                    <span className="font-bold text-amber-600">Pending: ₹{selectedSeller.payoutBalance.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'செலுத்தும் தொகை (Amount ₹)' : 'Payout Amount (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedSeller ? selectedSeller.payoutBalance || 1000000 : 1000000}
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'செலுத்து முறை (Mode)' : 'Payment Mode'}
                  </label>
                  <select
                    value={payoutMode}
                    onChange={e => setPayoutMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Cash">Cash (ரொக்கம்)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cheque">Cheque (காசோலை)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'பரிவர்த்தனை / UTR குறிப்பு' : 'Reference / UTR #'}
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={e => setPayoutRef(e.target.value)}
                    placeholder="e.g. UTR-98214"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'குறிப்பு (Remarks)' : 'Narration / Remarks'}
                </label>
                <input
                  type="text"
                  value={payoutRemarks}
                  onChange={e => setPayoutRemarks(e.target.value)}
                  placeholder="e.g. Cleared settlement for Poovan lots"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {language === 'ta' ? 'பட்டுவாடா உறுதி செய்' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Buyer Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {language === 'ta' ? 'வியாபாரி தொகை வசூல் பதிவு' : 'Record Trader Payment Collection'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ta' ? 'வியாபாரியிடம் இருந்து பெற்ற தொகை வரவு வைத்து கடன் பாக்கி குறைத்தல்.' : 'Receive trade payments from wholesale buyer.'}
                </p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBuyerReceiptSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'வியாபாரி தேர்வு (Select Trader)' : 'Select Trader'}
                </label>
                <select
                  value={receiptBuyerId}
                  onChange={e => {
                    setReceiptBuyerId(e.target.value);
                    const b = buyers.find(buy => buy.id === e.target.value);
                    if (b) setReceiptAmount(b.outstandingDues);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.tradeName} [{b.paddleNumber}] — Dues: ₹{b.outstandingDues.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
                {selectedBuyer && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Deposit: ₹{selectedBuyer.depositAmount.toLocaleString('en-IN')}</span>
                    <span className="font-bold text-emerald-600">Dues: ₹{selectedBuyer.outstandingDues.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'வசூல் தொகை (Amount ₹)' : 'Received Amount (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={receiptAmount}
                    onChange={e => setReceiptAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'செலுத்து முறை (Mode)' : 'Payment Mode'}
                  </label>
                  <select
                    value={receiptMode}
                    onChange={e => setReceiptMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cash">Cash (ரொக்கம்)</option>
                    <option value="Cheque">Cheque (காசோலை)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'பரிவர்த்தனை ID / குறிப்பு' : 'UPI Txn / Cheque #'}
                  </label>
                  <input
                    type="text"
                    value={receiptRef}
                    onChange={e => setReceiptRef(e.target.value)}
                    placeholder="e.g. UPI-9843-12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'குறிப்பு (Remarks)' : 'Narration / Remarks'}
                </label>
                <input
                  type="text"
                  value={receiptRemarks}
                  onChange={e => setReceiptRemarks(e.target.value)}
                  placeholder="e.g. Floor auction dues clearance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {language === 'ta' ? 'வசூல் பதிவு செய்' : 'Record Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Mandi Operational Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {language === 'ta' ? 'மண்டி நிர்வாக செலவு பதிவு' : 'Record Mandi Operational Expense'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ta' ? 'எடை கூலி, மின்சாரம், பராமரிப்பு, தேநீர் போன்ற செலவுகள்.' : 'Disburse daily operational & labor costs.'}
                </p>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMandiExpenseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'செலவு பிரிவு (Expense Category)' : 'Expense Category'}
                </label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Coolie & Labor">Coolie & Labor (சுமை & எடை கூலி)</option>
                  <option value="Electricity & Water">Electricity & Water (மின்சாரம் & குடிநீர்)</option>
                  <option value="Platform Maintenance">Platform & Shed Maintenance (மண்டி பராமரிப்பு)</option>
                  <option value="Tea & Refreshment">Tea & Refreshment (தேநீர் & சிற்றுண்டி)</option>
                  <option value="Stationery & Printing">Stationery & Printing (ரசீது அச்சு)</option>
                  <option value="Fuel & Transport">Fuel & Transport (எரிபொருள் & போக்குவரத்து)</option>
                  <option value="License & Statutory">License & Statutory (உரிம கட்டணம்)</option>
                  <option value="Other">Other (இதர செலவு)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'செலவு தொகை (Amount ₹)' : 'Amount (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ta' ? 'செலுத்து முறை (Mode)' : 'Payment Mode'}
                  </label>
                  <select
                    value={expenseMode}
                    onChange={e => setExpenseMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Cash">Cash Drawer (ரொக்கம்)</option>
                    <option value="Bank Transfer">Bank Transfer (HDFC/Axis)</option>
                    <option value="UPI / GPay">UPI / GPay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'பெறுபவர் பெயர் (Paid To)' : 'Paid To (Person / Vendor)'}
                </label>
                <input
                  type="text"
                  value={expensePaidTo}
                  onChange={e => setExpensePaidTo(e.target.value)}
                  placeholder="e.g. Nayinarkulam Porter Gang"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ta' ? 'விளக்கம் / குறிப்பு (Remarks)' : 'Remarks'}
                </label>
                <input
                  type="text"
                  value={expenseRemarks}
                  onChange={e => setExpenseRemarks(e.target.value)}
                  placeholder="e.g. Weighment scale calibration & bunch handling"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {language === 'ta' ? 'செலவு சேமி' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
