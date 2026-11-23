import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OnlineAuction, InwardLot, AuctionTransaction } from '../types';
import {
  Radio,
  Plus,
  Clock,
  Coins,
  Gavel,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  X,
  Play,
  Award,
  CheckCircle2,
  Sparkles,
  Printer,
  FileText,
  Receipt,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface OnlineAuctionViewProps {
  onNavigate?: (path: string) => void;
}

export const OnlineAuctionView: React.FC<OnlineAuctionViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    transactions,
    onlineAuctions,
    createOnlineAuction,
    placeOnlineBid,
    toggleAutoBidding,
    completeDigitalAuctionLot,
    lots,
    buyers,
  } = useApp();

  const [selectedAuctionId, setSelectedAuctionId] = useState<string>(onlineAuctions[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [activeBidderId, setActiveBidderId] = useState<string>(buyers[0]?.id || '');
  const [activeReceipt, setActiveReceipt] = useState<AuctionTransaction | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'a5' | 'pos'>('a5');

  // Create Auction Form State
  const [formData, setFormData] = useState({
    lotId: lots[0]?.id || '',
    reservePrice: 650,
    durationMinutes: 15,
  });

  const activeAuction = onlineAuctions.find(a => a.id === selectedAuctionId) || onlineAuctions[0];
  const activeBidder = buyers.find(b => b.id === activeBidderId) || buyers[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const lot = lots.find(l => l.id === formData.lotId);
    if (!lot) {
      alert('Please select an inward lot');
      return;
    }

    createOnlineAuction({
      lot,
      reservePrice: Number(formData.reservePrice),
      durationMinutes: Number(formData.durationMinutes),
    });

    setShowCreateModal(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleQuickBid = (increment: number) => {
    if (!activeAuction || !activeBidder) return;
    const newBid = activeAuction.currentHighestBid + increment;
    placeOnlineBid(activeAuction.id, newBid, activeBidder);
  };

  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuction || !activeBidder) return;
    if (customBidAmount <= activeAuction.currentHighestBid) {
      alert(`Bid must be greater than current highest bid (₹${activeAuction.currentHighestBid})`);
      return;
    }
    placeOnlineBid(activeAuction.id, customBidAmount, activeBidder);
    setCustomBidAmount(0);
  };

  const handleHammerFall = () => {
    if (!activeAuction || !activeAuction.currentLeaderBuyerId) {
      alert('Cannot award lot: No leading bids placed yet.');
      return;
    }
    const tx = completeDigitalAuctionLot(activeAuction.id);
    if (tx) {
      setActiveReceipt(tx);
      setReceiptFormat('a5');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('digitalAuctionTitle')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('digitalAuctionSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createOnlineAuction')}</span>
        </button>
      </div>

      {/* Main Grid: Active Room (Left 8 Cols) & Live Rooms List (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Digital Bidding Arena (8 Cols) */}
        {activeAuction ? (
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
            {/* Room Header & WebSocket Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{activeAuction.productName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {activeAuction.auctionCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
                    {activeAuction.productNameTamil} • {activeAuction.variety}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                  {activeAuction.status === 'Live' ? 'LIVE AUCTION' : activeAuction.status}
                </span>

                {/* Simulation Toggle */}
                <button
                  onClick={() => toggleAutoBidding(activeAuction.id)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeAuction.autoBidActive
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Simulate rival traders bidding"
                >
                  {activeAuction.autoBidActive ? '🤖 Simulation: ON' : '🤖 Simulation: OFF'}
                </button>
              </div>
            </div>

            {/* Countdown Clock & Highest Bid Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Countdown Clock */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Countdown to Hammer Fall</span>
                  </span>
                  {activeAuction.antiSniped && (
                    <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                      +60s Anti-Sniping
                    </span>
                  )}
                </div>

                <div className="py-4 text-center">
                  <div className="font-mono text-5xl font-black tracking-widest text-amber-400">
                    {formatTimer(activeAuction.remainingSeconds)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {activeAuction.remainingSeconds === 0 ? 'AUCTION ENDED' : 'HOURS : MINUTES : SECONDS'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700/80 text-slate-300">
                  <span>Reserve: ₹{activeAuction.reservePrice}/{activeAuction.unit}</span>
                  <span className="font-bold text-emerald-400">
                    Total Lots: {activeAuction.quantity} {activeAuction.unit}
                  </span>
                </div>
              </div>

              {/* Current Highest Bid */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-green-800 text-white flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span className="font-bold uppercase tracking-wider">Current Highest Bid</span>
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded-sm text-[11px]">
                    {activeAuction.bidsCount} Bids Placed
                  </span>
                </div>

                <div className="py-2">
                  <div className="font-mono text-4xl sm:text-5xl font-black text-white">
                    ₹{activeAuction.currentHighestBid}
                    <span className="text-sm font-normal text-emerald-200">/{activeAuction.unit}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-100">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>
                      Leader:{' '}
                      <strong className="text-white">
                        {activeAuction.currentLeaderBuyerName || 'Opening Reserve'}
                      </strong>{' '}
                      {activeAuction.currentLeaderPaddle && `[${activeAuction.currentLeaderPaddle}]`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-200 pt-2 border-t border-emerald-700/80 flex justify-between">
                  <span>Gross Lot Value:</span>
                  <strong className="font-mono text-white text-xs">
                    ₹{(activeAuction.currentHighestBid * activeAuction.quantity).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Hammer Fall Winner Banner (If Ended) */}
            {activeAuction.status === 'Awarded' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <Gavel className="w-8 h-8 text-slate-950 animate-bounce shrink-0" />
                  <div>
                    <h4 className="font-black text-base uppercase tracking-wider">
                      🔨 Hammer Has Fallen! Lot Awarded!
                    </h4>
                    <p className="text-xs font-semibold">
                      Winner: <strong>{activeAuction.winningBuyerName || activeAuction.currentLeaderBuyerName}</strong> at winning rate of{' '}
                      <strong>₹{activeAuction.winningBid || activeAuction.currentHighestBid}/{activeAuction.unit}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const tx = transactions.find(t => t.lotId === activeAuction.lotId) || activeReceipt;
                      if (tx) {
                        setActiveReceipt(tx);
                        setReceiptFormat('a5');
                      } else {
                        alert('Transaction record saved in Reports & Billing.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 text-white hover:bg-slate-800 text-xs font-black shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print KVS A5 Chit</span>
                  </button>
                  <button
                    onClick={() => {
                      const tx = transactions.find(t => t.lotId === activeAuction.lotId) || activeReceipt;
                      if (tx) {
                        setActiveReceipt(tx);
                        setReceiptFormat('pos');
                      } else {
                        alert('Transaction record saved in Reports & Billing.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/90 text-slate-950 hover:bg-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Print POS</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bidding Controls (If Live) */}
            {activeAuction.status === 'Live' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                {/* Active Bidder Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Place Bid as Wholesale Trader:</span>
                  </label>
                  <select
                    value={activeBidderId}
                    onChange={e => setActiveBidderId(e.target.value)}
                    className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    {buyers.map(b => (
                      <option key={b.id} value={b.id}>
                        [{b.paddleNumber}] {b.tradeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Bid Increment Chips */}
                <div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Quick Increments:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 50].map(inc => (
                      <button
                        key={inc}
                        onClick={() => handleQuickBid(inc)}
                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700 hover:border-emerald-600 font-mono font-black text-sm transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+₹{inc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Bid Input & Instant Hammer Down */}
                <div className="space-y-3">
                  <form onSubmit={handleCustomBid} className="flex gap-2">
                    <input
                      type="number"
                      min={activeAuction.currentHighestBid + 1}
                      placeholder={`Custom Bid > ₹${activeAuction.currentHighestBid}`}
                      value={customBidAmount || ''}
                      onChange={e => setCustomBidAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold focus:outline-hidden focus:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      Place Custom Bid
                    </button>
                  </form>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Leading Trader: <strong className="text-slate-800 dark:text-white">{activeAuction.currentLeaderBuyerName || 'None'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleHammerFall}
                      disabled={!activeAuction.currentLeaderBuyerId}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
                        activeAuction.currentLeaderBuyerId
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Hammer Down / Award Lot Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Bid Stream Ticker */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Bid Stream Ticker ({activeAuction.bidsHistory.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {activeAuction.bidsHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No bids recorded yet. Place opening bid!</p>
                ) : (
                  activeAuction.bidsHistory.map(bid => (
                    <div
                      key={bid.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-sm text-[10px]">
                          {bid.paddleNumber}
                        </span>
                        <span className="font-bold text-slate-900">{bid.bidderTradeName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-emerald-800 text-sm">
                          ₹{bid.amount}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{bid.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center text-slate-400">
            <Radio className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 animate-pulse" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Active Digital Auction Room</p>
            <p className="text-xs text-slate-400 mt-1">Click "+ Create Digital Room" to launch a live room or click "Demo Data".</p>
          </div>
        )}

        {/* Right Column: Other Digital Auction Rooms (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              All Scheduled Digital Rooms ({onlineAuctions.length})
            </h3>
            <div className="space-y-2.5">
              {onlineAuctions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No scheduled digital auctions.
                </div>
              ) : (
                onlineAuctions.map(a => {
                  const isSelected = activeAuction?.id === a.id;

                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAuctionId(a.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          {a.auctionCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            a.status === 'Live'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>

                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">{a.productName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {a.quantity} {a.unit} • Farmer: {a.sellerName}
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          ⏱ {formatTimer(a.remainingSeconds)}
                        </span>
                        <span className="font-mono font-black text-emerald-800 dark:text-emerald-400">
                          ₹{a.currentHighestBid}/{a.unit}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Digital Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{t('createOnlineAuction')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Select Inward Stock Lot <span className="text-red-500">*</span>
                </label>
                {lots.filter(l => l.availableQuantity > 0).length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300 text-xs">
                    No active inward lots in yard! Please record an arrival in Products or click "Demo Data".
                  </div>
                ) : (
                  <select
                    required
                    value={formData.lotId}
                    onChange={e => setFormData({ ...formData, lotId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-bold"
                  >
                    {lots.filter(l => l.availableQuantity > 0).map(l => (
                      <option key={l.id} value={l.id}>
                        Lot #{l.lotNumber} - {l.productName} ({l.availableQuantity} {l.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Reserve Minimum Price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.reservePrice}
                    onChange={e => setFormData({ ...formData, reservePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Launch Digital Auction Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Instant Print Preview Modal for KVS A5 Sheet or POS Bill */}
      {activeReceipt && (
        receiptFormat === 'a5' ? (
          <KvsA5Receipt
            transaction={activeReceipt}
            profile={profile}
            onClose={() => setActiveReceipt(null)}
          />
        ) : (
          <PosThermalReceipt
            transaction={activeReceipt}
            profile={profile}
            onClose={() => setActiveReceipt(null)}
          />
        )
      )}
    </div>
  );
};
