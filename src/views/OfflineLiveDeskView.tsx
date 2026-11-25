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
  Keyboard,
  X,
  Filter,
  Users,
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

  const handleIncrement = (inc: number) => {
    setWinningRate(prev => (prev || 0) + inc);
  };

  const handlePreset = (rate: number) => {
    setWinningRate(rate);
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
        <div className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-2 flex flex-col h-[580px] lg:h-[620px] max-h-[calc(100vh-170px)] ${
          mobileTab === 'queue' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header & Filter Summary */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
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

          {/* 2. Filter Dropdowns: Farmer, Crop, Shed */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {/* Farmer Filter Dropdown */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                <Users className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Farmer</span>
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
                <option value="all">All ({uniqueFarmers.length})</option>
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
                <span>Crop</span>
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
                <option value="all">All</option>
                <option value="Bunch">Bananas (தார்)</option>
                <option value="Leaf">Leaves (கட்டு)</option>
                <option value="CrateBag">Veg / Fruit</option>
              </select>
            </div>

            {/* Shed Filter */}
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-blue-500" />
                <span>Shed</span>
              </label>
              <select
                value={shedFilter}
                onChange={e => setShedFilter(e.target.value)}
                className={`w-full p-1.5 rounded-md border text-xs font-semibold focus:outline-hidden focus:border-emerald-500 truncate cursor-pointer ${
                  shedFilter !== 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-950 dark:text-blue-200 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <option value="all">All Sheds</option>
                {uniqueSheds.map(shed => (
                  <option key={shed} value={shed}>
                    {shed}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
        <div className={`lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-md flex flex-col justify-between space-y-3 ${
          mobileTab === 'desk' ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedLot ? (
            <div className="space-y-3">
              {/* Lot Card Spotlight Header - High Efficiency Compact Cockpit Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-800/40 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-mono text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shrink-0">
                      Lot #{selectedLot.lotNumber}
                    </span>
                    <span className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                      {selectedLot.productName}
                    </span>
                    <span className="text-xs font-tamil text-emerald-300 truncate hidden sm:inline">
                      ({selectedLot.productNameTamil} • {selectedLot.variety})
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-300 font-mono bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                      Available: <strong className="text-white">{selectedLot.availableQuantity}</strong> {selectedLot.unit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-emerald-800/50 text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">Farmer:</span>
                    <strong className="text-white font-bold truncate">{selectedLot.sellerName}</strong>
                    <span className="text-emerald-300/80 text-[11px] truncate">({selectedLot.sellerVillage})</span>
                    {selectedLot.sellerMobile && (
                      <span className="font-mono text-[10px] text-slate-400 hidden md:inline">Ph: {selectedLot.sellerMobile}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedLot.shedLocation && (
                      <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                        {selectedLot.shedLocation}
                      </span>
                    )}
                    {farmerFilter !== selectedLot.sellerId ? (
                      <button
                        type="button"
                        onClick={() => setFarmerFilter(selectedLot.sellerId)}
                        className="px-2 py-0.5 rounded-md bg-emerald-800/60 hover:bg-emerald-700 text-[10px] font-bold text-emerald-200 transition-colors cursor-pointer flex items-center gap-1 border border-emerald-700/50"
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
                        <span>Filtered</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Form: Weighed Quantity & Rate Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Weighed Quantity Input */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Scale className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>{t('weighedQuantity')} ({selectedLot.unit})</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Max: {selectedLot.availableQuantity}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={selectedLot.availableQuantity}
                    value={weighedQty}
                    onChange={e => setWeighedQty(Number(e.target.value))}
                    className="w-full text-2xl font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>Live Scale Weight Verified</span>
                    <button
                      type="button"
                      onClick={() => setWeighedQty(selectedLot.availableQuantity)}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Use Full Lot
                    </button>
                  </div>
                </div>

                {/* 2. Winning Bid Rate Input */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{t('winningRate')} (₹ / {selectedLot.unit})</span>
                    </label>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                      Floor Calling
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={winningRate}
                    onChange={e => setWinningRate(Number(e.target.value))}
                    className="w-full text-2xl font-black font-mono text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-amber-500"
                  />
                  
                  {/* Rapid Increments & Presets */}
                  <div className="space-y-1 pt-0.5">
                    <div className="grid grid-cols-6 gap-1">
                      {[1, 2, 5, 10, 20, 50].map(inc => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => handleIncrement(inc)}
                          className="py-0.5 px-0.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-black font-mono border border-amber-300 dark:border-amber-800 transition-all active:scale-95 cursor-pointer text-center"
                        >
                          +₹{inc}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto text-[10px] no-scrollbar">
                      <span className="text-slate-400 font-semibold shrink-0">Presets:</span>
                      {[
                        { rate: 350, label: '350 Poovan' },
                        { rate: 650, label: '650 Tomato' },
                        { rate: 850, label: '850 Mango' },
                        { rate: 1250, label: '1250 Onion' },
                      ].map(p => (
                        <button
                          key={p.rate}
                          type="button"
                          onClick={() => handlePreset(p.rate)}
                          className="px-1.5 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-mono font-bold whitespace-nowrap cursor-pointer"
                        >
                          ₹{p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Winning Buyer Selector (With Real-Time Search & Paddle Quick-Pick) */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
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
                  <div className="space-y-1.5">
                    {/* Buyer Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search paddle (e.g. 05 / P-01), shop name, mobile..."
                        value={buyerSearchQuery}
                        onChange={e => {
                          const val = e.target.value;
                          setBuyerSearchQuery(val);
                          const clean = val.trim().toLowerCase().replace(/^p-?/i, '');
                          if (clean) {
                            const exact = buyers.find(b => b.paddleNumber.toLowerCase().replace(/^p-?/i, '') === clean);
                            if (exact) {
                              setSelectedBuyerId(exact.id);
                            }
                          }
                        }}
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
                      />
                      {buyerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBuyerSearchQuery('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer p-0.5"
                          title="Clear Search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Quick Paddle Pick Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
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
                          +{filteredBuyers.length - 8}
                        </span>
                      )}
                    </div>

                    {/* Standard Dropdown of filtered buyers */}
                    {filteredBuyers.length > 0 ? (
                      <select
                        value={selectedBuyer?.id || ''}
                        onChange={e => setSelectedBuyerId(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                      >
                        {filteredBuyers.map(b => (
                          <option key={b.id} value={b.id}>
                            [{b.paddleNumber}] {b.tradeName} ({b.name} - {b.mobile})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
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

                {/* Clean buyer info row without overlapping */}
                {selectedBuyer && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-1 text-slate-600 dark:text-slate-400 gap-1 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-1.5 py-0.2 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-black text-[10px]">
                        {selectedBuyer.paddleNumber}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {selectedBuyer.tradeName}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] sm:text-[11px] flex items-center gap-2 shrink-0">
                      <span>Deposit: <strong className="text-emerald-700 dark:text-emerald-400">₹{selectedBuyer.depositAmount.toLocaleString()}</strong></span>
                      <span>|</span>
                      <span>Dues: <strong className={selectedBuyer.outstandingDues > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}>₹{selectedBuyer.outstandingDues.toLocaleString()}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Limit Warning Alert (If applicable) */}
              {isCreditExceeded && selectedBuyer && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">High Risk: Credit Ceiling Exceeded!</span>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      This purchase pushes {selectedBuyer.tradeName}'s dues to ₹{newOutstanding.toLocaleString('en-IN')}, exceeding limit of ₹{totalLimit.toLocaleString('en-IN')}.
                    </p>
                  </div>
                </div>
              )}

              {/* Integrated High-Impact Cockpit CTA Button (Zero Scroll Single-Screen Design) */}
              <button
                type="button"
                onClick={handleCompleteLot}
                className="w-full p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-800 hover:to-emerald-800 text-white font-black shadow-lg shadow-emerald-700/25 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Gavel className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black tracking-wide flex items-center gap-2">
                      <span>{t('completeLotEnter')}</span>
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-black/30 text-[10px] font-mono text-amber-300">
                        ↵ Enter
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 font-medium truncate max-w-[220px]">
                      {selectedBuyer ? `Buyer: [${selectedBuyer.paddleNumber}] ${selectedBuyer.tradeName}` : 'Select winning trader to complete'}
                    </div>
                  </div>
                </div>

                <div className="text-right pl-3 border-l border-white/20 shrink-0">
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight">
                    ₹{grossTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-100 font-mono">
                    {weighedQty} {selectedLot.unit} × ₹{winningRate}
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs space-y-2">
              <span className="text-4xl block">⚖️</span>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Lot Selected</p>
              <p>Select an active inward lot from the left queue to begin floor bidding.</p>
            </div>
          )}
        </div>

        {/* Right Column: Live Sale Chits Feed (3 Cols) */}
        <div className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-2 flex flex-col h-[580px] lg:h-[620px] max-h-[calc(100vh-170px)] ${
          mobileTab === 'chits' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Today's Sale Chits
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black">
                {transactions.length} sales
              </span>
              {transactions.length > 0 && (
                <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{transactions.reduce((acc, t) => acc + t.grossAmount, 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>
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
