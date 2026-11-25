import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InwardLot, AuctionTransaction, Seller, Buyer } from '../types';
import {
  Gavel,
  Play,
  Printer,
  Search,
  Plus,
  Users,
  Package,
  Clock,
  Layers,
  Calendar,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  CheckCircle2,
  Scale,
  Building2,
  Coins,
  AlertTriangle,
  X,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface OfflineAuctionViewProps {
  onNavigate: (path: string) => void;
  defaultView?: 'products' | 'auction';
}

export const OfflineAuctionView: React.FC<OfflineAuctionViewProps> = ({ onNavigate, defaultView = 'products' }) => {
  const {
    t,
    language,
    profile,
    lots,
    sellers,
    buyers,
    products,
    transactions,
    addSeller,
    addBuyer,
    addInwardLot,
    completeFloorAuctionLot,
  } = useApp();

  // View state: 'products' (Image 2) or 'auction' (Images 3 & 5)
  const [viewMode, setViewMode] = useState<'products' | 'auction'>(defaultView);

  // Products Table Filter & Pagination States (Image 2)
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-11-25');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Market Auction States (Images 3 & 5)
  const [auctionSellerTab, setAuctionSellerTab] = useState<'pending' | 'completed'>('pending');
  const [sellerSearch, setSellerSearch] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);
  const [lotSubTab, setLotSubTab] = useState<{ [lotId: string]: 'pending' | 'completed' }>({});

  // Bidding inputs for active lot
  const [biddingQty, setBiddingQty] = useState<{ [lotId: string]: number }>({});
  const [biddingRate, setBiddingRate] = useState<{ [lotId: string]: number }>({});
  const [biddingBuyerId, setBiddingBuyerId] = useState<{ [lotId: string]: string }>({});

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<AuctionTransaction | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'a5' | 'pos'>('a5');

  // Quick Action Modals
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddBuyerModal, setShowAddBuyerModal] = useState(false);

  // Form states for Add Seller
  const [newSeller, setNewSeller] = useState({
    name: '',
    nameTamil: '',
    village: '',
    mobile: '',
    district: 'Tirunelveli',
    taluk: 'Ambasamudram',
  });

  // Form states for Add Product (Inward Lot)
  const [newLot, setNewLot] = useState({
    sellerId: sellers[0]?.id || '',
    productName: 'Nadu Banana Bunch',
    productNameTamil: 'நாட்டு வாழைக்காய் - தார்',
    variety: 'NADU',
    category: 'Banana' as const,
    itemType: 'Bunch' as const,
    unit: 'Bunch (தார்)' as const,
    quantity: 20,
    shedLocation: 'Main Shed 1 - Front Bay',
    vehicleNumber: 'TN-72-AB-1234',
  });

  // Form states for Add Buyer
  const [newBuyer, setNewBuyer] = useState({
    name: '',
    tradeName: '',
    mobile: '',
    paddleNumber: 'P-' + Math.floor(20 + Math.random() * 80),
    depositAmount: 50000,
  });

  // Active / Ready Lots
  const activeLots = useMemo(() => lots.filter(l => l.availableQuantity > 0), [lots]);

  // Group lots by seller for Market Auction Queue (Image 3)
  const sellerGroups = useMemo(() => {
    return sellers
      .map(seller => {
        const sellerLots = lots.filter(l => l.sellerId === seller.id);
        const pending = sellerLots.filter(l => l.availableQuantity > 0);
        const completed = sellerLots.filter(l => l.availableQuantity === 0);
        return {
          seller,
          sellerLots,
          totalLots: sellerLots.length,
          pendingLots: pending,
          completedLots: completed,
          isCompleted: sellerLots.length > 0 && pending.length === 0,
        };
      })
      .filter(g => g.totalLots > 0);
  }, [sellers, lots]);

  // Filtered sellers for Auction Queue
  const filteredSellers = useMemo(() => {
    return sellerGroups.filter(g => {
      const matchTab = auctionSellerTab === 'pending' ? !g.isCompleted : g.isCompleted;
      const q = sellerSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        g.seller.name.toLowerCase().includes(q) ||
        (g.seller.nameTamil && g.seller.nameTamil.toLowerCase().includes(q)) ||
        g.seller.village.toLowerCase().includes(q) ||
        g.seller.code.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [sellerGroups, auctionSellerTab, sellerSearch]);

  // Active Selected Seller in Market Auction
  const activeSellerGroup = useMemo(() => {
    if (selectedSellerId) {
      const found = sellerGroups.find(g => g.seller.id === selectedSellerId);
      if (found) return found;
    }
    return filteredSellers[0] || sellerGroups[0] || null;
  }, [sellerGroups, selectedSellerId, filteredSellers]);

  // Filtered lots for the active seller based on top product filter
  const activeSellerLots = useMemo((): InwardLot[] => {
    if (!activeSellerGroup) return [];
    let list: InwardLot[] = activeSellerGroup.sellerLots;
    if (selectedProductFilter !== 'all') {
      list = list.filter((l: InwardLot) => {
        if (selectedProductFilter === 'Bunch') return l.itemType === 'Bunch' || (l.unit && l.unit.includes('தார்'));
        if (selectedProductFilter === 'Leaf') return l.itemType === 'Leaf' || l.itemType === 'Bundle' || (l.unit && l.unit.includes('கட்டு'));
        if (selectedProductFilter === 'Vegetables') return l.itemType === 'Crate' || l.itemType === 'Bag' || l.itemType === 'Box';
        return true;
      });
    }
    return list;
  }, [activeSellerGroup, selectedProductFilter]);

  // Set default expanded lot
  React.useEffect(() => {
    if (activeSellerLots.length > 0 && !expandedLotId) {
      setExpandedLotId(activeSellerLots[0].id);
    }
  }, [activeSellerLots, expandedLotId]);

  // Initialize bidding inputs for a lot if not set
  const getBiddingValues = (lot: InwardLot) => {
    const qty = biddingQty[lot.id] !== undefined ? biddingQty[lot.id] : lot.availableQuantity;
    const rate = biddingRate[lot.id] !== undefined ? biddingRate[lot.id] : 680;
    const buyerId = biddingBuyerId[lot.id] || buyers[0]?.id || '';
    return { qty, rate, buyerId };
  };

  // Products Table Data Filtering (Image 2)
  const filteredProductsTable = useMemo(() => {
    return lots.filter(lot => {
      const q = productSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        lot.productName.toLowerCase().includes(q) ||
        lot.sellerName.toLowerCase().includes(q) ||
        lot.sellerVillage.toLowerCase().includes(q) ||
        lot.variety.toLowerCase().includes(q) ||
        lot.lotNumber.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'Banana' && (lot.itemType === 'Bunch' || lot.productName.toLowerCase().includes('banana'))) ||
        (selectedCategory === 'Leaf' && (lot.itemType === 'Leaf' || lot.itemType === 'Bundle')) ||
        (selectedCategory === 'Vegetable' && (lot.itemType === 'Crate' || lot.itemType === 'Bag'));

      return matchSearch && matchCategory;
    });
  }, [lots, productSearch, selectedCategory]);

  // Metric Stats for Image 2
  const totalSellersCount = useMemo(() => new Set(lots.map(l => l.sellerId)).size, [lots]);
  const totalProductsCount = useMemo(() => new Set(lots.map(l => l.variety)).size, [lots]);
  const pendingAuctionsCount = activeLots.length;
  const totalQuantitySum = useMemo(() => activeLots.reduce((acc, l) => acc + l.availableQuantity, 0), [activeLots]);

  // Handle Quick Add Seller
  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeller.name.trim() || !newSeller.mobile.trim()) {
      alert('Please enter Farmer Name and Mobile');
      return;
    }
    const created = addSeller({
      code: 'FRM-' + Math.floor(100 + Math.random() * 900),
      name: newSeller.name,
      nameTamil: newSeller.nameTamil || newSeller.name,
      village: newSeller.village || 'Tirunelveli Rural',
      mobile: newSeller.mobile,
      district: newSeller.district,
      taluk: newSeller.taluk,
      pincode: '627001',
      aadhaar: 'XXXX-XXXX-XXXX',
      bankDetails: {
        accountHolder: newSeller.name,
        accountNumber: '918020000000',
        ifsc: 'SBIN0001234',
        bankName: 'State Bank of India',
      },
      active: true,
      rating: 4.8,
      payoutBalance: 0,
      totalLotsCount: 0,
      totalVolume: 0,
    });
    alert(`Farmer "${created.name}" registered successfully!`);
    setShowAddSellerModal(false);
    setNewSeller({ name: '', nameTamil: '', village: '', mobile: '', district: 'Tirunelveli', taluk: 'Ambasamudram' });
  };

  // Handle Quick Add Product / Inward Lot
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sel = sellers.find(s => s.id === newLot.sellerId) || sellers[0];
    if (!sel) {
      alert('Please select or add a seller first.');
      return;
    }
    const created = addInwardLot({
      lotNumber: String(lots.length + 50),
      sellerId: sel.id,
      sellerName: sel.name,
      sellerVillage: sel.village,
      sellerMobile: sel.mobile,
      productId: 'prod-' + Date.now(),
      productName: newLot.productName,
      productNameTamil: newLot.productNameTamil,
      variety: newLot.variety,
      varietyTamil: newLot.productNameTamil,
      category: newLot.category,
      itemType: newLot.itemType,
      unit: newLot.unit,
      initialQuantity: Number(newLot.quantity),
      availableQuantity: Number(newLot.quantity),
      arrivalDate: new Date().toISOString().split('T')[0],
      shedLocation: newLot.shedLocation,
      vehicleNumber: newLot.vehicleNumber,
      status: 'Inwarded',
    });
    alert(`Produce Lot #${created.lotNumber} (${created.productName}) inwarded successfully!`);
    setShowAddProductModal(false);
  };

  // Handle Quick Add Buyer
  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyer.tradeName.trim() || !newBuyer.mobile.trim()) {
      alert('Please enter Buyer Shop Name and Mobile');
      return;
    }
    const created = addBuyer({
      code: 'BYR-' + Math.floor(100 + Math.random() * 900),
      tradeName: newBuyer.tradeName,
      name: newBuyer.name || newBuyer.tradeName,
      mobile: newBuyer.mobile,
      paddleNumber: newBuyer.paddleNumber,
      depositAmount: Number(newBuyer.depositAmount),
      creditLimit: 150000,
      outstandingDues: 0,
      city: 'Tirunelveli',
      address: 'Mandi Yard Trading Platform',
      gstin: '33AABCK1234F1Z5',
      licenseNo: 'LIC-MND-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Active',
    });
    alert(`Trader "${created.tradeName}" registered with Paddle ${created.paddleNumber}!`);
    setShowAddBuyerModal(false);
    setNewBuyer({
      name: '',
      tradeName: '',
      mobile: '',
      paddleNumber: 'P-' + Math.floor(20 + Math.random() * 80),
      depositAmount: 50000,
    });
  };

  // Handle Auction Sale Completion
  const handleCompleteSaleForLot = (lot: InwardLot) => {
    const { qty, rate, buyerId } = getBiddingValues(lot);
    const buyer = buyers.find(b => b.id === buyerId) || buyers[0];

    if (!buyer) {
      alert('Please select a wholesale trader with a paddle number.');
      return;
    }
    if (!qty || qty <= 0 || qty > lot.availableQuantity) {
      alert(`Please enter a valid quantity (1 to ${lot.availableQuantity}).`);
      return;
    }
    if (!rate || rate <= 0) {
      alert('Please enter a valid winning bid rate.');
      return;
    }

    const tx = completeFloorAuctionLot({
      lot,
      weighedQuantity: qty,
      winningRate: rate,
      buyer,
    });

    // Automatically trigger instant receipt preview
    setActiveReceipt(tx);
    setReceiptFormat('a5');

    // Switch sub-tab of this lot to 'completed'
    setLotSubTab(prev => ({ ...prev, [lot.id]: 'completed' }));
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* MODE 1: MANUAL AUCTION PRODUCTS DASHBOARD (Matches Image 2 Exactly)       */}
      {/* ========================================================================= */}
      {viewMode === 'products' ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Manual Auction Products
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage products that will participate in today's auction.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddSellerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Add Seller</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('auction')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Auction</span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards (Matching Image 2) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Total Sellers */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalSellersCount}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Sellers</div>
              </div>
            </div>

            {/* 2. Total Products */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalProductsCount}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Products</div>
              </div>
            </div>

            {/* 3. Pending Auctions */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {pendingAuctionsCount}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Auctions</div>
              </div>
            </div>

            {/* 4. Total Quantity */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalQuantitySum}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Quantity</div>
              </div>
            </div>
          </div>

          {/* Table Card: Products Ready For Auction (Matching Image 2) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Table Header Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Products Ready For Auction
                </h3>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search products, sellers..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Date Input */}
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Product Count Pill */}
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                  {filteredProductsTable.length} products
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">S.NO</th>
                    <th className="py-3 px-3.5">SELLER NAME</th>
                    <th className="py-3 px-3.5">PRODUCT</th>
                    <th className="py-3 px-3.5">VARIETY</th>
                    <th className="py-3 px-3.5">CATEGORY</th>
                    <th className="py-3 px-3.5 text-center">QUANTITY</th>
                    <th className="py-3 px-3.5">UNIT</th>
                    <th className="py-3 px-3.5">DATE & TIME</th>
                    <th className="py-3 px-3.5 text-center">STATUS</th>
                    <th className="py-3 px-3.5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredProductsTable.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-bold text-xs text-slate-600 dark:text-slate-400">
                          No products added yet.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "+ Add Product" to inward produce lots for today's auction.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProductsTable
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((lot, idx) => {
                        const isAvailable = lot.availableQuantity > 0;
                        return (
                          <tr
                            key={lot.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400">
                              {(currentPage - 1) * rowsPerPage + idx + 1}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{lot.sellerName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-mono">
                                {lot.sellerVillage}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">
                              {lot.productName}
                              {lot.productNameTamil && (
                                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-tamil font-normal">
                                  {lot.productNameTamil}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                              {lot.variety}
                            </td>
                            <td className="py-3 px-3.5 font-medium text-slate-600 dark:text-slate-400">
                              {lot.category || (lot.itemType === 'Leaf' ? 'Leaves' : 'Bananas')}
                            </td>
                            <td className="py-3 px-3.5 text-center font-mono font-black text-slate-900 dark:text-white text-xs">
                              {lot.availableQuantity}
                            </td>
                            <td className="py-3 px-3.5 font-medium text-slate-600 dark:text-slate-400">
                              {lot.unit}
                            </td>
                            <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {lot.arrivalDate || '2026-11-25'}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              {isAvailable ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Ready
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Sold
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              {isAvailable ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSellerId(lot.sellerId);
                                    setExpandedLotId(lot.id);
                                    setViewMode('auction');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Gavel className="w-3 h-3" />
                                  <span>Start Bidding</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSellerId(lot.sellerId);
                                    setExpandedLotId(lot.id);
                                    setViewMode('auction');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                                >
                                  View Chits
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Table Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono">
                  {filteredProductsTable.length === 0
                    ? '0-0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                        currentPage * rowsPerPage,
                        filteredProductsTable.length
                      )} of ${filteredProductsTable.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={currentPage * rowsPerPage >= filteredProductsTable.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: MARKET AUCTION CALLING DESK (Matches Images 3 & 5 Exactly)       */
        /* ========================================================================= */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Bar with Back Arrow, Title, Product Select, Date & Add Buyer Button */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('products')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Back to Manual Auction Products"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white tracking-wide">
                  MARKET AUCTION
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Conduct auction for registered seller products.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Product Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Product:</span>
                <select
                  value={selectedProductFilter}
                  onChange={e => setSelectedProductFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Products</option>
                  <option value="Bunch">Bananas (தார்)</option>
                  <option value="Leaf">Leaves (கட்டு)</option>
                  <option value="Vegetables">Vegetables / Fruits</option>
                </select>
              </div>

              {/* Date Badge */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>11/25/2026</span>
              </div>

              {/* + Add Buyer Button */}
              <button
                type="button"
                onClick={() => setShowAddBuyerModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Buyer</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Market Auction Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Auction Queue (Sellers) - 4 Cols on Desktop */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex flex-col space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Auction Queue</h3>

              {/* Tabs: Pending Sellers | Completed Sellers */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuctionSellerTab('pending')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    auctionSellerTab === 'pending'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Pending Sellers ({sellerGroups.filter(g => !g.isCompleted).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuctionSellerTab('completed')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    auctionSellerTab === 'completed'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Completed Sellers ({sellerGroups.filter(g => g.isCompleted).length})
                </button>
              </div>

              {/* Search Seller Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Seller"
                  value={sellerSearch}
                  onChange={e => setSellerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                {sellerSearch && (
                  <button
                    type="button"
                    onClick={() => setSellerSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Seller Cards List */}
              <div className="space-y-2 overflow-y-auto max-h-[560px] pr-0.5">
                {filteredSellers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No {auctionSellerTab} sellers found.
                  </div>
                ) : (
                  filteredSellers.map(g => {
                    const isSelected = activeSellerGroup?.seller.id === g.seller.id;
                    const completedCount = g.completedLots.length;
                    const totalCount = g.totalLots;

                    return (
                      <div
                        key={g.seller.id}
                        onClick={() => {
                          setSelectedSellerId(g.seller.id);
                          if (g.pendingLots.length > 0) {
                            setExpandedLotId(g.pendingLots[0].id);
                          } else if (g.completedLots.length > 0) {
                            setExpandedLotId(g.completedLots[0].id);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-black text-slate-900 dark:text-white truncate">
                            {g.seller.name} <span className="font-normal text-slate-500">({g.seller.village})</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          #{g.seller.code} • {g.seller.name}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Seller Details & Produce Accordions - 8 Cols on Desktop */}
            <div className="lg:col-span-8 space-y-4">
              {activeSellerGroup ? (
                <>
                  {/* Active Seller Header Card (Matching Image 3) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1">
                    <div className="text-[11px] font-mono font-bold text-slate-400">
                      #{activeSellerGroup.seller.code} • {activeSellerGroup.seller.name}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {activeSellerGroup.seller.name}, {activeSellerGroup.seller.village}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeSellerGroup.seller.mobile}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{activeSellerGroup.seller.village}, {activeSellerGroup.seller.district}</span>
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Produce Items Accordion List (Matching Images 3 & 5) */}
                  <div className="space-y-3">
                    {activeSellerLots.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                        No lots found for this seller matching the selected product filter.
                      </div>
                    ) : (
                      activeSellerLots.map((lot: InwardLot) => {
                        const isExpanded = expandedLotId === lot.id;
                        const activeSubTab = lotSubTab[lot.id] || (lot.availableQuantity > 0 ? 'pending' : 'completed');
                        const { qty, rate, buyerId } = getBiddingValues(lot);
                        const grossTotal = qty * rate;
                        const selectedBuyer = buyers.find(b => b.id === buyerId) || buyers[0];

                        // Completed transactions for this lot
                        const lotTransactions = transactions.filter(
                          tx => tx.billNumber === lot.lotNumber || tx.sellerId === lot.sellerId
                        );

                        return (
                          <div
                            key={lot.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                          >
                            {/* Accordion Header (Matching Image 3) */}
                            <div
                              onClick={() => setExpandedLotId(isExpanded ? null : lot.id)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                                  🌿
                                </div>
                                <div>
                                  <div className="font-black text-sm text-slate-900 dark:text-white">
                                    {lot.productName} - {lot.variety}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-tamil">
                                    {lot.productNameTamil}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {lot.availableQuantity > 0 ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                    {lot.availableQuantity} remaining
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Sold Out
                                  </span>
                                )}
                                <span className="text-xs font-mono font-bold text-slate-500">
                                  {lot.availableQuantity}/{lot.initialQuantity}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Accordion Expanded Body (Matching Image 5) */}
                            {isExpanded && (
                              <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                                {/* Sub-Tabs: Pending | Completed */}
                                <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setLotSubTab(prev => ({ ...prev, [lot.id]: 'pending' }))}
                                    className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                                      activeSubTab === 'pending'
                                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                  >
                                    Pending ({lot.availableQuantity > 0 ? 1 : 0})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setLotSubTab(prev => ({ ...prev, [lot.id]: 'completed' }))}
                                    className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                                      activeSubTab === 'completed'
                                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                  >
                                    Completed ({lotTransactions.length})
                                  </button>
                                </div>

                                {/* PENDING TAB: Interactive Auction Calling Row (Image 5) */}
                                {activeSubTab === 'pending' ? (
                                  lot.availableQuantity <= 0 ? (
                                    <div className="py-6 text-center text-slate-400 text-xs">
                                      All produce in this lot has been successfully sold! Check the "Completed" tab to reprint sale chits.
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {/* Form Grid: Qty | Buyer Name | Rate (₹) */}
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                        {/* Qty Input (3 Cols) */}
                                        <div className="md:col-span-3 space-y-1">
                                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <span>Qty ({lot.unit})</span>
                                            <span className="text-[10px] text-emerald-600 font-mono">Max: {lot.availableQuantity}</span>
                                          </div>
                                          <input
                                            type="number"
                                            min={1}
                                            max={lot.availableQuantity}
                                            value={qty}
                                            onChange={e =>
                                              setBiddingQty(prev => ({ ...prev, [lot.id]: Number(e.target.value) }))
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-hidden focus:border-emerald-600"
                                          />
                                        </div>

                                        {/* Buyer Name Select (5 Cols) */}
                                        <div className="md:col-span-5 space-y-1">
                                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <span>Buyer Name</span>
                                            <button
                                              type="button"
                                              onClick={() => setShowAddBuyerModal(true)}
                                              className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                                            >
                                              + Quick Add
                                            </button>
                                          </div>
                                          <select
                                            value={buyerId}
                                            onChange={e =>
                                              setBiddingBuyerId(prev => ({ ...prev, [lot.id]: e.target.value }))
                                            }
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                                          >
                                            {buyers.map(b => (
                                              <option key={b.id} value={b.id}>
                                                [{b.paddleNumber}] {b.tradeName} ({b.name})
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Rate (₹) Input (4 Cols) */}
                                        <div className="md:col-span-4 space-y-1">
                                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <span>Rate (₹ / {lot.unit})</span>
                                            <span className="text-[10px] text-amber-600 font-mono">Floor Calling</span>
                                          </div>
                                          <input
                                            type="number"
                                            min={1}
                                            value={rate}
                                            onChange={e =>
                                              setBiddingRate(prev => ({ ...prev, [lot.id]: Number(e.target.value) }))
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-mono font-black text-base focus:outline-hidden focus:border-emerald-600"
                                          />
                                        </div>
                                      </div>

                                      {/* Quick Increments & Presets Toolbar */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                                        <div className="flex items-center gap-1">
                                          <span className="text-slate-400 font-bold uppercase text-[10px]">Calls:</span>
                                          {[1, 2, 5, 10, 20, 50].map(inc => (
                                            <button
                                              key={inc}
                                              type="button"
                                              onClick={() =>
                                                setBiddingRate(prev => ({
                                                  ...prev,
                                                  [lot.id]: (rate || 0) + inc,
                                                }))
                                              }
                                              className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono font-bold border border-amber-300 dark:border-amber-800 transition-all active:scale-95 cursor-pointer"
                                            >
                                              +₹{inc}
                                            </button>
                                          ))}
                                        </div>

                                        <div className="flex items-center gap-1 font-mono text-xs">
                                          <span className="text-slate-400 font-sans text-[11px]">Gross Total:</span>
                                          <strong className="text-slate-900 dark:text-white font-black text-base">
                                            ₹{grossTotal.toLocaleString('en-IN')}
                                          </strong>
                                          <span className="text-[10px] text-slate-400">
                                            ({qty} × ₹{rate})
                                          </span>
                                        </div>
                                      </div>

                                      {/* Complete Sale Action Button (Green) */}
                                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // Reset inputs
                                            setBiddingQty(prev => ({ ...prev, [lot.id]: lot.availableQuantity }));
                                            setBiddingRate(prev => ({ ...prev, [lot.id]: 680 }));
                                          }}
                                          className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                                        >
                                          Reset
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleCompleteSaleForLot(lot)}
                                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                        >
                                          <Gavel className="w-4 h-4" />
                                          <span>Complete Sale (Enter) • ₹{grossTotal.toLocaleString('en-IN')}</span>
                                        </button>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  /* COMPLETED TAB: Transactions for this produce */
                                  <div className="space-y-2">
                                    {lotTransactions.length === 0 ? (
                                      <div className="text-center py-6 text-slate-400 text-xs">
                                        No sales completed for this produce yet.
                                      </div>
                                    ) : (
                                      lotTransactions.map(tx => (
                                        <div
                                          key={tx.id}
                                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                Bill #{tx.billNumber}
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-mono">{tx.time}</span>
                                            </div>
                                            <div className="text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                              Trader: <strong>{tx.buyerTradeName}</strong> ({tx.buyerPaddle}) • {tx.quantity} {tx.unit} @ ₹{tx.ratePerUnit}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3">
                                            <div className="text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                                              ₹{tx.grossAmount.toLocaleString('en-IN')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveReceipt(tx);
                                                  setReceiptFormat('pos');
                                                }}
                                                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-300 dark:border-slate-600 cursor-pointer"
                                              >
                                                POS
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveReceipt(tx);
                                                  setReceiptFormat('a5');
                                                }}
                                                className="px-2 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                                              >
                                                A5
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
                  Select a seller from the left queue to conduct auction.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD SELLER MODAL                                                 */}
      {/* ========================================================================= */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <h3 className="font-extrabold text-sm">Add New Farmer (Seller)</h3>
              </div>
              <button
                onClick={() => setShowAddSellerModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSeller} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Farmer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Palanisamy"
                  value={newSeller.name}
                  onChange={e => setNewSeller({ ...newSeller, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Village / Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alangulam"
                  value={newSeller.village}
                  onChange={e => setNewSeller({ ...newSeller, village: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9842100000"
                    value={newSeller.mobile}
                    onChange={e => setNewSeller({ ...newSeller, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={newSeller.district}
                    onChange={e => setNewSeller({ ...newSeller, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddSellerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Save Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD PRODUCT / INWARD PRODUCE LOT MODAL                           */}
      {/* ========================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <h3 className="font-extrabold text-sm">Add Inward Produce Lot for Auction</h3>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Select Farmer (Seller) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newLot.sellerId}
                  onChange={e => setNewLot({ ...newLot, sellerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.village}) - {s.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Produce Name</label>
                  <input
                    type="text"
                    required
                    value={newLot.productName}
                    onChange={e => setNewLot({ ...newLot, productName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Variety Code</label>
                  <input
                    type="text"
                    required
                    value={newLot.variety}
                    onChange={e => setNewLot({ ...newLot, variety: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newLot.quantity}
                    onChange={e => setNewLot({ ...newLot, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unit</label>
                  <select
                    value={newLot.unit}
                    onChange={e => setNewLot({ ...newLot, unit: e.target.value as any })}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Bunch (தார்)">Bunch (தார்)</option>
                    <option value="Bundle (கட்டு)">Bundle (கட்டு)</option>
                    <option value="Crate (கூடை)">Crate (கூடை)</option>
                    <option value="Bag (மூட்டை)">Bag (மூட்டை)</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Shed Platform</label>
                  <input
                    type="text"
                    value={newLot.shedLocation}
                    onChange={e => setNewLot({ ...newLot, shedLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Inward Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK ADD BUYER MODAL                                            */}
      {/* ========================================================================= */}
      {showAddBuyerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <h3 className="font-extrabold text-sm">Quick Add Wholesale Trader (Buyer)</h3>
              </div>
              <button
                onClick={() => setShowAddBuyerModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBuyer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Trader Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nellai Leaves & Fruits Agency"
                  value={newBuyer.tradeName}
                  onChange={e => setNewBuyer({ ...newBuyer, tradeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. K. Krishnan"
                  value={newBuyer.name}
                  onChange={e => setNewBuyer({ ...newBuyer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9789012345"
                    value={newBuyer.mobile}
                    onChange={e => setNewBuyer({ ...newBuyer, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Floor Paddle #</label>
                  <input
                    type="text"
                    required
                    value={newBuyer.paddleNumber}
                    onChange={e => setNewBuyer({ ...newBuyer, paddleNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddBuyerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Register Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT PRINT MODAL FOR POS / A5 SALE CHITS                               */}
      {/* ========================================================================= */}
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
