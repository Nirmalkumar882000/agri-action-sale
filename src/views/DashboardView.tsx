import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Package,
  Gavel,
  Coins,
  Users,
  Radio,
  Printer,
  ChevronRight,
  ArrowUpRight,
  CalendarCheck,
  WalletCards,
  Receipt,
  BookOpen,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';
import { AuctionTransaction } from '../types';

interface DashboardViewProps {
  onNavigate: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    sellers,
    buyers,
    products,
    lots,
    transactions,
    onlineAuctions,
  } = useApp();

  const [selectedA5Receipt, setSelectedA5Receipt] = useState<AuctionTransaction | null>(null);
  const [selectedPosReceipt, setSelectedPosReceipt] = useState<AuctionTransaction | null>(null);

  // Computed metrics
  const totalInwardUnits = lots.reduce((sum, l) => sum + l.availableQuantity, 0);
  const totalFloorTurnover = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalCommission = transactions.reduce((sum, tx) => sum + tx.commissionAmount, 0);
  const pendingFarmerPayouts = sellers.reduce((sum, s) => sum + s.payoutBalance, 0);
  const liveOnlineAuctionsCount = onlineAuctions.filter(a => a.status === 'Live').length;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-white">
                Mandi Operational Deck
              </span>
              <span className="text-xs text-emerald-200">
                {profile.marketLocationTamil}
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{profile.shopName}</span>
              <span className="text-sm font-normal text-emerald-200 font-tamil">
                ({profile.shopNameTamil})
              </span>
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl font-medium font-tamil">
              {profile.taglineTamil} • {profile.addressTamil} • தொலைபேசி: {profile.phone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('/offline/live')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Gavel className="w-4 h-4 fill-slate-950" />
              <span>{t('startLiveAuction')}</span>
            </button>
            <button
              onClick={() => onNavigate('/products')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{t('actionNewInward')}</span>
            </button>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none select-none text-9xl">
          🍌
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Today Arrivals */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('todaysArrivals')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {totalInwardUnits.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              {language === 'ta' ? 'அலகுகள்' : 'Units'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{lots.length} active lots</span>
          </div>
        </div>

        {/* Card 2: Floor Auction Turnover */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('todaysFloorTurnover')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalFloorTurnover.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {transactions.length} Mandi Bills Created
          </div>
        </div>

        {/* Card 3: Active Online Digital Auctions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('activeOnlineAuctions')}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-800 dark:text-amber-400 font-mono">
            {liveOnlineAuctionsCount}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Live</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">
            Remote digital stream
          </div>
        </div>

        {/* Card 4: Mandi Commission */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('commissionEarned')}</span>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-green-800 dark:text-green-400 font-mono">
            ₹{totalCommission.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            At {profile.defaultCommissionPercent}% agent fee
          </div>
        </div>

        {/* Card 5: Pending Farmer Settlements */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('farmerPayoutsPending')}</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-900 dark:text-purple-300 font-mono">
            ₹{pendingFarmerPayouts.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Across {sellers.length} farmers
          </div>
        </div>
      </div>

      {/* Quick Mandi Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onNavigate('/offline/live')}
            className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all text-left cursor-pointer"
          >
            <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t('actionStartFloor')}</span>
          </button>
          <button
            onClick={() => onNavigate('/products')}
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all text-left cursor-pointer"
          >
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('actionNewInward')}</span>
          </button>
          <button
            onClick={() => onNavigate('/ledger')}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all text-left cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{language === 'ta' ? 'நிதி லெட்ஜர் (Ledger)' : 'Financial Ledger'}</span>
          </button>
          <button
            onClick={() => onNavigate('/reports')}
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all text-left cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{language === 'ta' ? '3-அறிக்கைகள் (Reports)' : '3-Tier Reports'}</span>
          </button>
          <button
            onClick={() => onNavigate('/workforce/advances')}
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all text-left cursor-pointer"
          >
            <WalletCards className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{t('actionRecordAdvance')}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Banana & Leaves Rates (Left) & Recent Bills (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Banana & Leaves Rates List (No Grades!) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('commodityPriceTicker')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ta'
                  ? 'அனைத்து விளைபொருட்கள் மற்றும் ரகங்களின் அடிப்படை சந்தை விலை விபரம்'
                  : 'Benchmark rates per unit across registered agri commodities'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/products')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No commodity varieties found. Add custom varieties in Products.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400 font-bold">
                    <th className="pb-2">{t('commodity')}</th>
                    <th className="pb-2">வகை (Variety)</th>
                    <th className="pb-2">{t('unit')}</th>
                    <th className="pb-2 text-right text-emerald-800 dark:text-emerald-400">அடிப்படை விலை (Rate)</th>
                    <th className="pb-2 text-center">வாடகை / கூலி</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-tamil">{p.nameTamil}</div>
                      </td>
                      <td className="py-2.5 font-bold font-mono text-slate-700 dark:text-slate-300 uppercase">
                        {p.variety}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-600 dark:text-slate-300 font-tamil">
                        {p.unit}
                      </td>
                      <td className="py-2.5 text-right font-black text-emerald-800 dark:text-emerald-400 font-mono text-sm">
                        ₹{p.baseRatePerUnit.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        வா: ₹{p.rentRatePerUnit} | கூ: ₹{p.coolieRatePerUnit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Floor Auction Bills */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('recentAuctionChits')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Print in POS or A5</p>
            </div>
            <button
              onClick={() => onNavigate('/reports')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px]">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No bills recorded yet. Ready for live floor auctions.
              </div>
            ) : (
              transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">Bill #{tx.billNumber}</span>
                      <span className="text-[10px] text-slate-400">• {tx.time}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {tx.quantity} {tx.itemType === 'Leaf' ? 'இலை கட்டு' : 'தார்'} - {tx.variety}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Farmer: <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.sellerName}</span> → Trader:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.buyerTradeName}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs font-black text-emerald-800 dark:text-emerald-400 font-mono">
                      ₹{tx.grossAmount.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setSelectedPosReceipt(tx)}
                        className="px-1.5 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Print 80mm POS Slip"
                      >
                        POS
                      </button>
                      <button
                        onClick={() => setSelectedA5Receipt(tx)}
                        className="px-1.5 py-0.5 rounded-xs bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-[9px] font-bold text-emerald-900 dark:text-emerald-300 cursor-pointer"
                        title="Print KVS A5 Sheet"
                      >
                        A5 Sheet
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* A5 Receipt Modal */}
      {selectedA5Receipt && (
        <KvsA5Receipt
          transaction={selectedA5Receipt}
          profile={profile}
          onClose={() => setSelectedA5Receipt(null)}
        />
      )}

      {/* POS Thermal Receipt Modal */}
      {selectedPosReceipt && (
        <PosThermalReceipt
          transaction={selectedPosReceipt}
          profile={profile}
          onClose={() => setSelectedPosReceipt(null)}
        />
      )}
    </div>
  );
};
