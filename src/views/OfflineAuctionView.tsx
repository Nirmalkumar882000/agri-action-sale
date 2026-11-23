import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuctionTransaction } from '../types';
import {
  Gavel,
  Play,
  Printer,
  Boxes,
  TrendingUp,
  Search,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface OfflineAuctionViewProps {
  onNavigate: (path: string) => void;
}

export const OfflineAuctionView: React.FC<OfflineAuctionViewProps> = ({ onNavigate }) => {
  const { t, language, profile, lots, transactions } = useApp();

  const [selectedA5Chit, setSelectedA5Chit] = useState<AuctionTransaction | null>(null);
  const [selectedPosChit, setSelectedPosChit] = useState<AuctionTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingLots = lots.filter(l => l.availableQuantity > 0);
  const totalFloorTurnover = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);

  const filteredTransactions = transactions.filter(tx => {
    const q = searchQuery.toLowerCase();
    return (
      tx.billNumber.includes(q) ||
      tx.chitNumber.toLowerCase().includes(q) ||
      tx.sellerName.toLowerCase().includes(q) ||
      tx.buyerTradeName.toLowerCase().includes(q) ||
      tx.buyerPaddle.toLowerCase().includes(q) ||
      tx.variety.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase">
              Primary Mandi Engine (Must)
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('floorAuctionDesk')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('floorAuctionSubtitle')}</p>
        </div>

        <button
          onClick={() => onNavigate('/offline/live')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{t('startLiveAuction')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Pending Produce Lots</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pendingLots.length}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">Ready on mandi calling platform</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Today's Completed Bills</div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono">{transactions.length}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">POS & A5 Chits Printed</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Floor Gross Sales</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalFloorTurnover.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Physical Yard Mandi Turnover</div>
        </div>
      </div>

      {/* Pending Lots Queue Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Arrived Produce Queue</h3>
          </div>
          <button
            onClick={() => onNavigate('/offline/live')}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Calling Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingLots.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No arrived lots pending. Record arrivals in Products or click "Demo Data".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pendingLots.slice(0, 4).map(lot => (
              <div
                key={lot.id}
                onClick={() => onNavigate('/offline/live')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Lot #{lot.lotNumber}</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 uppercase">{lot.variety}</span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{lot.productName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Farmer: <span className="text-slate-700 dark:text-slate-300">{lot.sellerName}</span> ({lot.sellerVillage})
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{lot.shedLocation}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {lot.availableQuantity} {lot.itemType === 'Leaf' ? 'கட்டு' : 'தார்'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Mandi Sales Bills Register */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Completed Floor Auction Bills
            </h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search bill#, buyer, farmer, variety..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No floor bills found matching search.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Farmer (ஊர்)</th>
                  <th className="py-3 px-4">Trader (வியாபாரி)</th>
                  <th className="py-3 px-4">Paddle #</th>
                  <th className="py-3 px-4">Produce & Variety</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-right">Farmer Balance</th>
                  <th className="py-3 px-4 text-center">Print Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      #{tx.billNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{tx.time}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{tx.sellerName}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{tx.sellerVillage}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{tx.buyerTradeName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{tx.buyerPaddle}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 uppercase">
                      {tx.variety}
                      <div className="text-[10px] text-slate-400 font-tamil">{tx.productNameTamil}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {tx.quantity} {tx.itemType === 'Leaf' ? 'கட்டு' : 'தார்'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">₹{tx.ratePerUnit.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{tx.grossAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-800 dark:text-emerald-400">
                      ₹{tx.netFarmerPayable.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedPosChit(tx)}
                          className="px-2 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                          title="Print 80mm POS Slip"
                        >
                          POS
                        </button>
                        <button
                          onClick={() => setSelectedA5Chit(tx)}
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

      {/* A5 Chit Modal */}
      {selectedA5Chit && (
        <KvsA5Receipt
          transaction={selectedA5Chit}
          profile={profile}
          onClose={() => setSelectedA5Chit(null)}
        />
      )}

      {/* POS Thermal Modal */}
      {selectedPosChit && (
        <PosThermalReceipt
          transaction={selectedPosChit}
          profile={profile}
          onClose={() => setSelectedPosChit(null)}
        />
      )}
    </div>
  );
};
