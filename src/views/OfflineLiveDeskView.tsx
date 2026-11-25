import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InwardLot, Buyer, AuctionTransaction } from '../types';
import {
  Gavel,
  ArrowLeft,
  Search,
  Plus,
  Scale,
  Building2,
  Coins,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Keyboard,
  X,
  UserCheck,
  Filter,
  Users,
  RotateCcw,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface OfflineLiveDeskViewProps {
  onNavigate: (path: string) => void;
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

export const OfflineLiveDeskView: React.FC<OfflineLiveDeskViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    lots,
    buyers,
    addBuyer,
    transactions,
    completeFloorAuctionLot,
  } = useApp();

  const activeLots = lots.filter(l => l.availableQuantity > 0);

  // Mobile/Tablet Tab Switcher for auction floor ergonomics
  const [mobileTab, setMobileTab] = useState<'desk' | 'queue' | 'chits'>('desk');

  // Filter & Search states for Pending Lots Queue
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('all');
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [shedFilter, setShedFilter] = useState('all');

  const uniqueFarmers = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; village: string; count: number }>();
    activeLots.forEach(l => {
      const existing = map.get(l.sellerId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(l.sellerId, {
          id: l.sellerId,
          name: l.sellerName,
          village: l.sellerVillage,
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [activeLots]);

  const uniqueSheds = React.useMemo(() => {
    const set = new Set<string>();
    activeLots.forEach(l => {
      if (l.shedLocation) set.add(l.shedLocation);
    });
    return Array.from(set);
  }, [activeLots]);

  const filteredLots = React.useMemo(() => {
    return activeLots.filter(lot => {
      const q = lotSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        lot.sellerName.toLowerCase().includes(q) ||
        lot.sellerVillage.toLowerCase().includes(q) ||
        lot.lotNumber.toLowerCase().includes(q) ||
        `#${lot.lotNumber}`.toLowerCase().includes(q) ||
        lot.productName.toLowerCase().includes(q) ||
        lot.productNameTamil.toLowerCase().includes(q) ||
        lot.variety.toLowerCase().includes(q) ||
        (lot.vehicleNumber && lot.vehicleNumber.toLowerCase().includes(q)) ||
        (lot.sellerMobile && lot.sellerMobile.includes(q));

      const matchFarmer = farmerFilter === 'all' || lot.sellerId === farmerFilter;

      let matchCommodity = true;
      if (commodityFilter === 'Bunch') {
        matchCommodity = lot.itemType === 'Bunch' || Boolean(lot.unit && lot.unit.includes('தார்'));
      } else if (commodityFilter === 'Leaf') {
        matchCommodity = lot.itemType === 'Leaf' || lot.itemType === 'Bundle' || Boolean(lot.unit && lot.unit.includes('கட்டு'));
      } else if (commodityFilter === 'CrateBag') {
        matchCommodity = lot.itemType === 'Crate' || lot.itemType === 'Bag' || lot.itemType === 'Box' || lot.itemType === 'Kg';
      }

      const matchShed = shedFilter === 'all' || lot.shedLocation === shedFilter;

      return matchSearch && matchFarmer && matchCommodity && matchShed;
    });
  }, [activeLots, lotSearchQuery, farmerFilter, commodityFilter, shedFilter]);

  const hasActiveFilters = Boolean(
    lotSearchQuery.trim() || farmerFilter !== 'all' || commodityFilter !== 'all' || shedFilter !== 'all'
  );

  const clearAllFilters = () => {
    setLotSearchQuery('');
    setFarmerFilter('all');
    setCommodityFilter('all');
    setShedFilter('all');
  };

  const [selectedLot, setSelectedLot] = useState<InwardLot | null>(activeLots[0] || null);

  // Keep selectedLot synchronized with filtered lots
  useEffect(() => {
    if (selectedLot && !filteredLots.some(l => l.id === selectedLot.id)) {
      if (filteredLots.length > 0) {
        setSelectedLot(filteredLots[0]);
      }
    } else if (!selectedLot && filteredLots.length > 0) {
      setSelectedLot(filteredLots[0]);
    }
  }, [filteredLots, selectedLot]);

  // Calling form inputs
  const [weighedQty, setWeighedQty] = useState<number>(selectedLot?.availableQuantity || 20);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');
  const [buyerSearchQuery, setBuyerSearchQuery] = useState<string>('');
  const [winningRate, setWinningRate] = useState<number>(680);
  const [showQuickAddBuyer, setShowQuickAddBuyer] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<AuctionTransaction | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'a5' | 'pos'>('a5');

  // Quick Add Buyer State
  const [quickBuyerData, setQuickBuyerData] = useState({
    name: '',
    tradeName: '',
    mobile: '',
    paddleNumber: 'P-' + Math.floor(20 + Math.random() * 80),
  });

  // Filtered Buyers based on search query (Paddle, Shop Name, Contact, Mobile)
  const filteredBuyers = React.useMemo(() => {
    if (!buyerSearchQuery.trim()) return buyers;
    const q = buyerSearchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/^p-?/i, '');
    return buyers.filter(b => {
      const matchPaddle =
        b.paddleNumber.toLowerCase().includes(q) ||
        b.paddleNumber.toLowerCase().replace(/^p-?/i, '').includes(cleanQ);
      const matchTrade = b.tradeName.toLowerCase().includes(q);
      const matchTradeTamil = (b.tradeNameTamil || '').toLowerCase().includes(q);
      const matchName = b.name.toLowerCase().includes(q);
      const matchMobile = b.mobile.includes(q);
      const matchCity = (b.city || '').toLowerCase().includes(q);
      return matchPaddle || matchTrade || matchTradeTamil || matchName || matchMobile || matchCity;
    });
  }, [buyers, buyerSearchQuery]);

  // Keep quantity synced when selected lot changes
  useEffect(() => {
    if (selectedLot) {
      setWeighedQty(selectedLot.availableQuantity);
    }
  }, [selectedLot]);

  // Keep buyer selected if list updates
  useEffect(() => {
    if (buyers.length > 0 && (!selectedBuyerId || !buyers.some(b => b.id === selectedBuyerId))) {
      setSelectedBuyerId(buyers[0].id);
    }
  }, [buyers, selectedBuyerId]);

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId) || filteredBuyers[0] || buyers[0];

  const [biddingCalls, setBiddingCalls] = useState<string[]>([
    'Floor desk ready. Open cry bidding initiated.'
  ]);

  const handleIncrement = (inc: number) => {
    const newRate = (winningRate || 0) + inc;
    setWinningRate(newRate);
    if (selectedBuyer && selectedLot) {
      setBiddingCalls(prev => [
        `₹${newRate} called by [${selectedBuyer.paddleNumber}] ${selectedBuyer.tradeName}`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  const handlePreset = (rate: number, label: string) => {
    setWinningRate(rate);
    if (selectedBuyer) {
      setBiddingCalls(prev => [
        `Preset ₹${rate} (${label}) set for [${selectedBuyer.paddleNumber}]`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  // Live calculations
  const grossTotal = (weighedQty || 0) * (winningRate || 0);

  // Credit ceiling check
  const totalLimit = (selectedBuyer?.depositAmount || 0) + (selectedBuyer?.creditLimit || 0);
  const newOutstanding = (selectedBuyer?.outstandingDues || 0) + grossTotal;
  const isCreditExceeded = newOutstanding > totalLimit && totalLimit > 0;

  // Complete Lot Handler
  const handleCompleteLot = () => {
    if (!selectedLot) {
      alert('Please select an active produce lot from the queue');
      return;
    }
    if (!selectedBuyer) {
      alert('Please register and select the winning wholesale buyer');
      return;
    }
    if (!weighedQty || weighedQty <= 0) {
      alert('Please enter valid weighed quantity');
      return;
    }
    if (weighedQty > selectedLot.availableQuantity) {
      alert(`Weighed quantity cannot exceed available quantity (${selectedLot.availableQuantity})`);
      return;
    }
    if (!winningRate || winningRate <= 0) {
      alert('Please enter winning bid rate');
      return;
    }

    const tx = completeFloorAuctionLot({
      lot: selectedLot,
      weighedQuantity: weighedQty,
      winningRate,
      buyer: selectedBuyer,
    });

    // Automatically trigger instant A5 Chit Receipt modal
    setActiveReceipt(tx);
    setReceiptFormat('a5');

    // Load next lot if current one is exhausted
    const remainingLots = activeLots.filter(l => l.id !== selectedLot.id || l.availableQuantity - weighedQty > 0);
    if (remainingLots.length > 0) {
      setSelectedLot(remainingLots[0]);
    } else {
      setSelectedLot(null);
    }
  };

  // Keyboard shortcut listener: Enter key completes lot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showQuickAddBuyer && !activeReceipt && selectedLot && selectedBuyer) {
        handleCompleteLot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLot, selectedBuyer, weighedQty, winningRate, showQuickAddBuyer, activeReceipt]);

  const handleQuickAddBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBuyerData.tradeName || !quickBuyerData.mobile) {
      alert('Please fill Trade Name and Mobile Number');
      return;
    }

    const created = addBuyer({
      code: 'BYR-' + Math.floor(200 + Math.random() * 800),
      name: quickBuyerData.name || quickBuyerData.tradeName,
      tradeName: quickBuyerData.tradeName,
      mobile: quickBuyerData.mobile,
      gstin: '33AAACQ' + Math.floor(1000 + Math.random() * 9000) + '1Z5',
      licenseNo: 'MND-BYR-QUICK-' + Math.floor(10 + Math.random() * 90),
      city: 'Floor Spot Registration',
      address: 'Mandi Yard Floor',
      depositAmount: 50000,
      creditLimit: 150000,
      outstandingDues: 0,
      paddleNumber: quickBuyerData.paddleNumber,
      status: 'Active',
    });

    setSelectedBuyerId(created.id);
    setShowQuickAddBuyer(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/offline')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Exit Calling Desk"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">
                Floor Calling Desk / நேரலை ஏல கூவல் மேடை
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              High-Speed Floor Bidding • Live Scale Input • Instant Dual Printing (POS / A5)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-mono">Shortcut: [Enter] to Complete Lot</span>
        </div>
      </div>

      {/* Mobile/Tablet Segmented Desk Mode Tabs (< lg screens) */}
      <div className="grid grid-cols-3 lg:hidden bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('desk')}
          className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'desk'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span className="truncate">Calling Desk</span>
          {selectedLot && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('queue')}
          className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'queue'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="truncate">Lots Queue</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
            {filteredLots.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('chits')}
          className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'chits'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="truncate">Sale Chits</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
            {transactions.length}
          </span>
        </button>
      </div>

      {/* 3-Column Live Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Arrived Lots Queue (3 Cols) */}
        <div className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-2.5 flex flex-col h-[620px] lg:h-[740px] ${
          mobileTab === 'queue' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header & Filter Summary */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pending Lots Queue
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black">
                {filteredLots.length} / {activeLots.length}
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                title="Clear all filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Farmer Name & Lot Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search farmer, village, lot #, crop..."
              value={lotSearchQuery}
              onChange={e => setLotSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium"
            />
            {lotSearchQuery && (
              <button
                type="button"
                onClick={() => setLotSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Filter Dropdowns: Farmer & Crop Type */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {/* Farmer Filter Dropdown */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                <Users className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Farmer:</span>
              </label>
              <select
                value={farmerFilter}
                onChange={e => setFarmerFilter(e.target.value)}
                className={`w-full p-1.5 rounded-md border text-xs font-semibold focus:outline-hidden focus:border-emerald-500 truncate cursor-pointer ${
                  farmerFilter !== 'all'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <option value="all">All Farmers ({uniqueFarmers.length})</option>
                {uniqueFarmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Produce / Crop Filter */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                <Filter className="w-2.5 h-2.5 text-amber-500" />
                <span>Crop:</span>
              </label>
              <select
                value={commodityFilter}
                onChange={e => setCommodityFilter(e.target.value)}
                className={`w-full p-1.5 rounded-md border text-xs font-semibold focus:outline-hidden focus:border-emerald-500 cursor-pointer ${
                  commodityFilter !== 'all'
                    ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 text-amber-950 dark:text-amber-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <option value="all">All Produce</option>
                <option value="Bunch">Bananas (தார்)</option>
                <option value="Leaf">Leaves (கட்டு)</option>
                <option value="CrateBag">Veg / Fruits (கூடை/மூட்டை)</option>
              </select>
            </div>
          </div>

          {/* Quick Shed Filter Chips */}
          {uniqueSheds.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] no-scrollbar">
              <span className="text-slate-400 font-semibold shrink-0">Shed:</span>
              <button
                type="button"
                onClick={() => setShedFilter('all')}
                className={`px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer ${
                  shedFilter === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {uniqueSheds.map(shed => (
                <button
                  key={shed}
                  type="button"
                  onClick={() => setShedFilter(shed)}
                  className={`px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer truncate max-w-[100px] ${
                    shedFilter === shed
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={shed}
                >
                  {shed.split(' - ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Active Filter Pill Badge */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[10px]">
              <span className="text-amber-900 dark:text-amber-300 font-bold truncate">
                Showing {filteredLots.length} of {activeLots.length} lots
                {farmerFilter !== 'all' && ` • Farmer: ${uniqueFarmers.find(f => f.id === farmerFilter)?.name || ''}`}
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-amber-800 dark:text-amber-200 font-black hover:underline cursor-pointer shrink-0 ml-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* Filtered Lots List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeLots.length === 0 ? (
              <div className="text-center py-16 p-3 space-y-2">
                <span className="text-3xl block">📦</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No inward produce lots available!
                </p>
                <p className="text-[11px] text-slate-400">
                  Record an inward produce lot in Products or click "Demo Data" in the top bar.
                </p>
                <button
                  onClick={() => onNavigate('/products')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  + Inward Produce
                </button>
              </div>
            ) : filteredLots.length === 0 ? (
              <div className="text-center py-12 p-3 space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Search className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No lots match filter
                </p>
                <p className="text-[10px] text-slate-400">
                  Try another farmer name, village, or clear filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredLots.map(lot => {
                const isSelected = selectedLot?.id === lot.id;

                return (
                  <div
                    key={lot.id}
                    onClick={() => {
                      setSelectedLot(lot);
                      setMobileTab('desk');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span className="font-mono">#{lot.lotNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-black uppercase ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                        }`}
                      >
                        {lot.variety}
                      </span>
                    </div>
                    <div className="font-extrabold text-xs leading-snug">{lot.productName}</div>
                    
                    {/* Farmer Details Line */}
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="flex items-center gap-1 truncate font-semibold">
                        <Users className={`w-3 h-3 shrink-0 ${isSelected ? 'text-slate-950' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span className={isSelected ? 'text-slate-950 font-black' : 'text-slate-900 dark:text-white'}>
                          {lot.sellerName}
                        </span>
                      </span>
                      <span className={`text-[10px] font-medium truncate max-w-[80px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {lot.sellerVillage}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1.5 mt-1 border-t border-black/10 dark:border-white/10 font-mono">
                      <span className="truncate max-w-[110px] text-[10px] opacity-80">{lot.shedLocation}</span>
                      <span className="font-extrabold">
                        {lot.availableQuantity} {getTamilUnit(lot.itemType, lot.unit)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Active Calling Card Desk (6 Cols) */}
        <div className={`lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-md flex flex-col justify-between space-y-4 ${
          mobileTab === 'desk' ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedLot ? (
            <div className="space-y-4">
              {/* Lot Card Spotlight Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-green-800 text-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded-sm">
                    Lot #{selectedLot.lotNumber}
                  </span>
                  <span className="text-xs font-bold text-emerald-200 font-mono">
                    Shed: {selectedLot.shedLocation}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black">{selectedLot.productName}</h3>
                  <p className="text-xs font-tamil text-emerald-200">
                    {selectedLot.productNameTamil} • {selectedLot.variety}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs pt-1 border-t border-white/20 text-emerald-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Farmer: <strong className="text-white text-sm">{selectedLot.sellerName}</strong> ({selectedLot.sellerVillage})</span>
                    {selectedLot.sellerMobile && (
                      <span className="font-mono text-[10px] text-emerald-200">Ph: {selectedLot.sellerMobile}</span>
                    )}
                    {farmerFilter !== selectedLot.sellerId ? (
                      <button
                        type="button"
                        onClick={() => setFarmerFilter(selectedLot.sellerId)}
                        className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="Filter pending lots by this farmer"
                      >
                        <Filter className="w-2.5 h-2.5 text-amber-300" />
                        <span>Filter Farmer</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFarmerFilter('all')}
                        className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Remove farmer filter"
                      >
                        <X className="w-2.5 h-2.5" />
                        <span>Filtered (Reset)</span>
                      </button>
                    )}
                  </div>
                  <span className="font-bold">Available: {selectedLot.availableQuantity} {selectedLot.unit}</span>
                </div>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Weighed Quantity Input */}
                <div className="p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{t('weighedQuantity')} ({selectedLot.unit})</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedLot.availableQuantity}
                    value={weighedQty}
                    onChange={e => setWeighedQty(Number(e.target.value))}
                    className="w-full text-2xl font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Live Scale Weight Verified</span>
                </div>

                {/* 2. Winning Bid Rate Input */}
                <div className="p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('winningRate')} (₹ / {selectedLot.unit})</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={winningRate}
                    onChange={e => setWinningRate(Number(e.target.value))}
                    className="w-full text-2xl font-black font-mono text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-amber-500"
                  />
                  
                  {/* Rapid Bid Increments */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Live Call Increments:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono">Floor Calling</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[1, 2, 5, 10, 20, 50].map(inc => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => handleIncrement(inc)}
                          className="py-1 px-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-black font-mono border border-amber-300 dark:border-amber-800 transition-all active:scale-95 cursor-pointer text-center"
                        >
                          +₹{inc}
                        </button>
                      ))}
                    </div>

                    {/* Commodity Presets */}
                    <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                      <span className="text-slate-400 font-semibold">Presets:</span>
                      <button
                        type="button"
                        onClick={() => handlePreset(350, selectedLot?.variety || 'Base')}
                        className="px-2 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-mono font-bold cursor-pointer"
                      >
                        ₹350 (Poovan/Bunch)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreset(650, 'Tomato/Crate')}
                        className="px-2 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-mono font-bold cursor-pointer"
                      >
                        ₹650 (Tomato/Crate)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreset(850, 'Mango/Box')}
                        className="px-2 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-mono font-bold cursor-pointer"
                      >
                        ₹850 (Mango/Box)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreset(1250, 'Onion/Bag')}
                        className="px-2 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-mono font-bold cursor-pointer"
                      >
                        ₹1250 (Onion/Bag)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Winning Buyer Selector (With Real-Time Search & Paddle Quick-Pick) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('selectBuyer')} / ஏல வியாபாரி
                    </label>
                    {filteredBuyers.length > 0 && buyerSearchQuery && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                        {filteredBuyers.length} found
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddBuyer(true)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('quickAddBuyer')}</span>
                  </button>
                </div>

                {buyers.length === 0 ? (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between">
                    <span className="text-amber-900 dark:text-amber-300 font-bold">No wholesale traders registered yet.</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddBuyer(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      + Quick Add Trader
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Buyer Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search buyer by Paddle (e.g. 05 / P-01), Shop Name, Person, Mobile..."
                        value={buyerSearchQuery}
                        onChange={e => {
                          const val = e.target.value;
                          setBuyerSearchQuery(val);
                          // Instant Auto-Select if matches paddle exactly (e.g., "5" or "05" or "P-05")
                          const clean = val.trim().toLowerCase().replace(/^p-?/i, '');
                          if (clean) {
                            const exact = buyers.find(b => b.paddleNumber.toLowerCase().replace(/^p-?/i, '') === clean);
                            if (exact) {
                              setSelectedBuyerId(exact.id);
                            }
                          }
                        }}
                        className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                      {buyerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBuyerSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer p-0.5"
                          title="Clear Search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick Paddle Pick Buttons (Top Paddles) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Paddles:</span>
                      {filteredBuyers.slice(0, 8).map(b => {
                        const isPicked = selectedBuyer?.id === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setSelectedBuyerId(b.id);
                              setBuyerSearchQuery('');
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black border transition-all shrink-0 cursor-pointer ${
                              isPicked
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                            }`}
                            title={`${b.tradeName} (${b.name})`}
                          >
                            {b.paddleNumber}
                          </button>
                        );
                      })}
                      {filteredBuyers.length > 8 && (
                        <span className="text-[10px] text-slate-400 font-mono self-center">
                          +{filteredBuyers.length - 8} more
                        </span>
                      )}
                    </div>

                    {/* Standard Dropdown of filtered buyers */}
                    {filteredBuyers.length > 0 ? (
                      <select
                        value={selectedBuyer?.id || ''}
                        onChange={e => setSelectedBuyerId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                      >
                        {filteredBuyers.map(b => (
                          <option key={b.id} value={b.id}>
                            [{b.paddleNumber}] {b.tradeName} ({b.name} - {b.mobile})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                        <span>No buyer found matching "{buyerSearchQuery}"</span>
                        <button
                          type="button"
                          onClick={() => setBuyerSearchQuery('')}
                          className="font-bold underline text-[11px] cursor-pointer"
                        >
                          Reset Search
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedBuyer && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-1 text-slate-600 dark:text-slate-400 gap-1 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-2">
                      <span>
                        Paddle: <strong className="font-mono text-slate-900 dark:text-white">{selectedBuyer.paddleNumber}</strong>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="truncate max-w-[180px] font-semibold text-slate-800 dark:text-slate-200">
                        {selectedBuyer.tradeName}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] sm:text-[11px]">
                      Deposit: ₹{selectedBuyer.depositAmount.toLocaleString()} | Outstanding: ₹{selectedBuyer.outstandingDues.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Limit Warning Alert */}
              {isCreditExceeded && selectedBuyer && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-300 text-xs flex items-start gap-2 animate-bounce">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">High Risk: Credit Ceiling Exceeded!</span>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      This purchase pushes {selectedBuyer.tradeName}'s dues to ₹
                      {newOutstanding.toLocaleString('en-IN')}, exceeding their deposit + limit of ₹
                      {totalLimit.toLocaleString('en-IN')}. Mandi Admin clearance recommended.
                    </p>
                  </div>
                </div>
              )}

              {/* Live Open Cry Audio Stream Log */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Open Floor Cry Stream
                  </span>
                  <span>Rate: ₹{winningRate}/{selectedLot.unit}</span>
                </div>
                <div className="pt-1.5 space-y-1 text-[11px]">
                  {biddingCalls.slice(0, 3).map((call, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-600 font-bold">›</span>
                      <span className={idx === 0 ? 'font-bold text-emerald-900 dark:text-emerald-200' : 'text-slate-500 dark:text-slate-400 opacity-80'}>
                        {call}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time Total Calculation Card */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {t('calculatedTotal')}
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {weighedQty} {selectedLot.unit} × ₹{winningRate}
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{grossTotal.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Complete Lot CTA Button */}
              <button
                type="button"
                onClick={handleCompleteLot}
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Gavel className="w-5 h-5 text-amber-400" />
                <span>{t('completeLotEnter')}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-28 text-slate-400 text-xs space-y-2">
              <span className="text-4xl block">⚖️</span>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Lot Selected</p>
              <p>Select an active inward lot from the left queue to begin floor bidding.</p>
            </div>
          )}
        </div>

        {/* Right Column: Live Sale Chits Feed (3 Cols) */}
        <div className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-3 flex flex-col h-[620px] lg:h-[680px] ${
          mobileTab === 'chits' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Sale Chits ({transactions.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No sale chits generated yet today.
              </div>
            ) : (
              transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Bill #{tx.billNumber}</span>
                    <span className="text-slate-400 font-mono">{tx.time}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {tx.quantity} {getTamilUnit(tx.itemType, tx.unit)} • {tx.variety}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    Trader: <strong className="text-slate-800 dark:text-slate-200">{tx.buyerTradeName}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold font-mono text-emerald-800 dark:text-emerald-400">
                      ₹{tx.grossAmount.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setActiveReceipt(tx);
                          setReceiptFormat('pos');
                        }}
                        className="px-2 py-0.5 rounded-xs bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold border border-slate-300 dark:border-slate-600 cursor-pointer"
                        title="Print 80mm POS Slip"
                      >
                        POS
                      </button>
                      <button
                        onClick={() => {
                          setActiveReceipt(tx);
                          setReceiptFormat('a5');
                        }}
                        className="px-2 py-0.5 rounded-xs bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                        title="Print KVS A5 Sheet"
                      >
                        A5
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Buyer Modal */}
      {showQuickAddBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">15-Second Floor Buyer Onboarding</h3>
              </div>
              <button
                onClick={() => setShowQuickAddBuyer(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddBuyer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Trader Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Selvam Banana Traders"
                  value={quickBuyerData.tradeName}
                  onChange={e => setQuickBuyerData({ ...quickBuyerData, tradeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. M. Selvam"
                  value={quickBuyerData.name}
                  onChange={e => setQuickBuyerData({ ...quickBuyerData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9842100000"
                    value={quickBuyerData.mobile}
                    onChange={e => setQuickBuyerData({ ...quickBuyerData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Floor Paddle #</label>
                  <input
                    type="text"
                    required
                    value={quickBuyerData.paddleNumber}
                    onChange={e => setQuickBuyerData({ ...quickBuyerData, paddleNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowQuickAddBuyer(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Enable Bidding
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
