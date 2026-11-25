import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, InwardLot, CommodityCategory, ProductItemType, ProductUnit, AuctionTransaction } from '../types';
import {
  PackageCheck,
  Plus,
  Search,
  Check,
  Edit2,
  X,
  Truck,
  Sparkles,
  ArrowRight,
  Boxes,
  Layers,
  Trash2,
  Printer,
  Receipt,
  Eye,
  Gavel,
  Building2,
  User,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { KvsA5Receipt } from '../components/receipts/KvsA5Receipt';
import { PosThermalReceipt } from '../components/receipts/PosThermalReceipt';

interface ProductsViewProps {
  onNavigate?: (path: string) => void;
}

const COMMODITY_CATEGORIES: CommodityCategory[] = [
  'Fruits (பழங்கள்)',
  'Vegetables (காய்கறிகள்)',
  'Plantation & Cash (தோட்டப் பயிர்கள்)',
  'Commercial & Leaves (இலைகள் & வர்த்தகம்)',
  'Flowers (மலர்கள்)',
  'Spices & Condiments (நறுமணப் பொருட்கள்)',
  'Grains & Pulses (தானியங்கள்)',
  'General (பொதுவானவை)',
];

const ITEM_TYPES: { type: ProductItemType; label: string; defaultUnit: ProductUnit }[] = [
  { type: 'Bunch', label: 'Bunch (தார் - Banana, Palm)', defaultUnit: 'Bunch (தார்)' },
  { type: 'Bundle', label: 'Bundle (கட்டு - Leaves, Greens, Sugarcane)', defaultUnit: 'Bundle (கட்டு)' },
  { type: 'Bag', label: 'Bag / மூட்டை (Onion, Potato, Grains, Coconut)', defaultUnit: 'Bag (மூட்டை)' },
  { type: 'Crate', label: 'Crate / கூடை (Tomato, Vegetables, Mango)', defaultUnit: 'Crate (கூடை)' },
  { type: 'Box', label: 'Box / பெட்டி (Apples, Export Quality Produce)', defaultUnit: 'Box (பெட்டி)' },
  { type: 'Basket', label: 'Basket / கூடை (Flowers, Small Fruits)', defaultUnit: 'Basket (கூடை)' },
  { type: 'Piece', label: 'Piece / எண்ணிக்கை (Coconut, Watermelon)', defaultUnit: 'Piece (எண்ணிக்கை)' },
  { type: 'Kg', label: 'Kg / கிலோ (Spices, Loose Produce)', defaultUnit: 'Kg (கிலோ)' },
  { type: 'Loose / Bulk', label: 'Loose / மொத்த எடை (Grains, Pulses)', defaultUnit: 'Quintal (குவின்டால்)' },
];

const PRESET_COMMODITY_TEMPLATES: Partial<Product>[] = [
  {
    name: 'Country Hybrid Tomato',
    nameTamil: 'நாட்டு ஹைப்ரிட் தக்காளி - கூடை',
    variety: 'TOMATO HYBRID',
    varietyTamil: 'தக்காளி கூடை',
    category: 'Vegetables (காய்கறிகள்)',
    itemType: 'Crate',
    unit: 'Crate (கூடை)',
    baseRatePerUnit: 650,
    coolieRatePerUnit: 10,
    rentRatePerUnit: 15,
    magimaiRatePerUnit: 1,
    commissionPercent: 8.0,
    marketFeePercent: 1.0,
    gstPercent: 0,
  },
  {
    name: 'Bellary Red Onion',
    nameTamil: 'பல்லாரி சிவப்பு வெங்காயம் - மூட்டை',
    variety: 'BELLARY RED',
    varietyTamil: 'பல்லாரி வெங்காயம்',
    category: 'Vegetables (காய்கறிகள்)',
    itemType: 'Bag',
    unit: 'Bag (மூட்டை)',
    baseRatePerUnit: 1250,
    coolieRatePerUnit: 25,
    rentRatePerUnit: 20,
    magimaiRatePerUnit: 2,
    commissionPercent: 6.0,
    marketFeePercent: 1.0,
    gstPercent: 0,
  },
  {
    name: 'Alphonso Farm Mango',
    nameTamil: 'அல்போன்சா மாம்பழம் - பெட்டி',
    variety: 'ALPHONSO',
    varietyTamil: 'அல்போன்சா',
    category: 'Fruits (பழங்கள்)',
    itemType: 'Box',
    unit: 'Box (பெட்டி)',
    baseRatePerUnit: 850,
    coolieRatePerUnit: 15,
    rentRatePerUnit: 20,
    magimaiRatePerUnit: 1,
    commissionPercent: 10.0,
    marketFeePercent: 1.0,
    gstPercent: 0,
  },
  {
    name: 'Pollachi Grade-A Coconut',
    nameTamil: 'பொள்ளாச்சி தேங்காய் - மூட்டை',
    variety: 'POLLACHI COCONUT',
    varietyTamil: 'தேங்காய் மூட்டை',
    category: 'Plantation & Cash (தோட்டப் பயிர்கள்)',
    itemType: 'Bag',
    unit: 'Bag (மூட்டை)',
    baseRatePerUnit: 1800,
    coolieRatePerUnit: 30,
    rentRatePerUnit: 25,
    magimaiRatePerUnit: 2,
    commissionPercent: 5.0,
    marketFeePercent: 1.0,
    gstPercent: 0,
  },
  {
    name: 'Grade-1 Green Cardamom',
    nameTamil: 'ஏலக்காய் முதல் தரம் - கிலோ',
    variety: 'CARDAMOM 8MM',
    varietyTamil: 'ஏலக்காய்',
    category: 'Spices & Condiments (நறுமணப் பொருட்கள்)',
    itemType: 'Kg',
    unit: 'Kg (கிலோ)',
    baseRatePerUnit: 2400,
    coolieRatePerUnit: 10,
    rentRatePerUnit: 20,
    magimaiRatePerUnit: 5,
    commissionPercent: 4.0,
    marketFeePercent: 1.0,
    gstPercent: 0,
  },
];

export const ProductsView: React.FC<ProductsViewProps> = ({ onNavigate }) => {
  const {
    t,
    language,
    profile,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    lots,
    sellers,
    transactions,
    addInwardLot,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'varieties' | 'inward-lots'>('varieties');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [lotStatusFilter, setLotStatusFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showInwardLotModal, setShowInwardLotModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<AuctionTransaction | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'a5' | 'pos'>('a5');
  const [selectedSoldLot, setSelectedSoldLot] = useState<{ lot: InwardLot; tx?: AuctionTransaction } | null>(null);

  // New Variety Form
  const [productForm, setProductForm] = useState({
    name: '',
    nameTamil: '',
    variety: '',
    varietyTamil: '',
    category: 'Fruits (பழங்கள்)' as CommodityCategory,
    itemType: 'Bunch' as ProductItemType,
    unit: 'Bunch (தார்)' as ProductUnit,
    baseRatePerUnit: 450,
    coolieRatePerUnit: 16,
    rentRatePerUnit: 20,
    magimaiRatePerUnit: 1,
    commissionPercent: 10,
  });

  // Inward Lot Form
  const [inwardForm, setInwardForm] = useState({
    sellerId: sellers[0]?.id || '',
    productId: products[0]?.id || '',
    quantity: 20,
    shedLocation: 'Main Shed 1 - Platform A',
    vehicleNumber: 'TN-72-AZ-' + Math.floor(1000 + Math.random() * 9000),
  });

  // Keep inwardForm synchronized when sellers or products change
  React.useEffect(() => {
    if (sellers.length > 0 && (!inwardForm.sellerId || !sellers.some(s => s.id === inwardForm.sellerId))) {
      setInwardForm(prev => ({ ...prev, sellerId: sellers[0].id }));
    }
  }, [sellers]);

  React.useEffect(() => {
    if (products.length > 0 && (!inwardForm.productId || !products.some(p => p.id === inwardForm.productId))) {
      setInwardForm(prev => ({ ...prev, productId: products[0].id }));
    }
  }, [products]);

  const selectedInwardProduct = products.find(p => p.id === inwardForm.productId) || products[0];

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      p.name.toLowerCase().includes(q) ||
      p.nameTamil.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q));

    if (selectedFilter === 'All') return matchQuery;
    if (selectedFilter === 'Bunch') return matchQuery && (p.itemType === 'Bunch' || p.unit.includes('தார்'));
    if (selectedFilter === 'Leaf') return matchQuery && (p.itemType === 'Leaf' || p.itemType === 'Bundle' || p.unit.includes('கட்டு'));
    if (selectedFilter === 'Vegetables') return matchQuery && (p.category?.includes('Vegetables') || p.name.includes('Tomato') || p.name.includes('Onion'));
    if (selectedFilter === 'Fruits') return matchQuery && (p.category?.includes('Fruits') || p.name.includes('Banana') || p.name.includes('Mango'));
    if (selectedFilter === 'BagCrate') return matchQuery && (p.itemType === 'Bag' || p.itemType === 'Crate' || p.itemType === 'Box');
    return matchQuery;
  });

  const availableLotsCount = lots.filter(l => l.availableQuantity > 0).length;
  const soldLotsCount = lots.filter(l => l.availableQuantity === 0 || l.status === 'Sold').length;

  const filteredLots = lots.filter(l => {
    if (lotStatusFilter === 'available' && l.availableQuantity <= 0) return false;
    if (lotStatusFilter === 'sold' && l.availableQuantity > 0 && l.status !== 'Sold') return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.lotNumber.toLowerCase().includes(q) ||
      `#${l.lotNumber}`.toLowerCase().includes(q) ||
      l.sellerName.toLowerCase().includes(q) ||
      l.sellerVillage.toLowerCase().includes(q) ||
      l.productName.toLowerCase().includes(q) ||
      l.productNameTamil.toLowerCase().includes(q) ||
      l.variety.toLowerCase().includes(q)
    );
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.variety) {
      alert('Please enter commodity name and variety code');
      return;
    }

    addProduct({
      name: productForm.name,
      nameTamil: productForm.nameTamil || productForm.name,
      variety: productForm.variety.toUpperCase(),
      varietyTamil: productForm.varietyTamil || productForm.nameTamil,
      category: productForm.category,
      itemType: productForm.itemType,
      unit: productForm.unit,
      baseRatePerUnit: Number(productForm.baseRatePerUnit),
      coolieRatePerUnit: Number(productForm.coolieRatePerUnit),
      rentRatePerUnit: Number(productForm.rentRatePerUnit),
      magimaiRatePerUnit: Number(productForm.magimaiRatePerUnit),
      commissionPercent: Number(productForm.commissionPercent),
      marketFeePercent: 1.0,
      gstPercent: 0,
    });

    setShowAddProductModal(false);
    // Reset form
    setProductForm({
      name: '',
      nameTamil: '',
      variety: '',
      varietyTamil: '',
      category: 'Fruits (பழங்கள்)',
      itemType: 'Bunch',
      unit: 'Bunch (தார்)',
      baseRatePerUnit: 450,
      coolieRatePerUnit: 16,
      rentRatePerUnit: 20,
      magimaiRatePerUnit: 1,
      commissionPercent: 10,
    });
  };

  const handleCreateInwardLot = (e: React.FormEvent) => {
    e.preventDefault();
    const seller = sellers.find(s => s.id === inwardForm.sellerId);
    const prod = products.find(p => p.id === inwardForm.productId);

    if (!seller || !prod) {
      alert('Please select farmer and commodity variety');
      return;
    }

    addInwardLot({
      lotNumber: String(lots.length + 54),
      sellerId: seller.id,
      sellerName: seller.name,
      sellerVillage: seller.village,
      sellerMobile: seller.mobile,
      productId: prod.id,
      productName: prod.name,
      productNameTamil: prod.nameTamil,
      variety: prod.variety,
      varietyTamil: prod.varietyTamil,
      category: prod.category,
      itemType: prod.itemType,
      unit: prod.unit,
      initialQuantity: Number(inwardForm.quantity),
      availableQuantity: Number(inwardForm.quantity),
      arrivalDate: new Date().toLocaleDateString('en-GB'),
      shedLocation: inwardForm.shedLocation,
      vehicleNumber: inwardForm.vehicleNumber,
      status: 'Inwarded',
    });

    setShowInwardLotModal(false);
    if (onNavigate && confirm(`Produce Lot for ${prod.name} (${inwardForm.quantity} ${prod.unit}) successfully recorded! Do you want to launch the Live Floor Auction Desk to call bids for this lot now?`)) {
      onNavigate('/offline/live');
    }
  };

  const handleLoadTemplate = (tpl: Partial<Product>) => {
    if (products.some(p => p.variety === tpl.variety)) {
      alert(`Variety ${tpl.variety} already exists in catalog.`);
      return;
    }
    addProduct({
      name: tpl.name || '',
      nameTamil: tpl.nameTamil || '',
      variety: (tpl.variety || '').toUpperCase(),
      varietyTamil: tpl.varietyTamil || '',
      category: tpl.category || 'General (பொதுவானவை)',
      itemType: tpl.itemType || 'Bag',
      unit: tpl.unit || 'Bag (மூட்டை)',
      baseRatePerUnit: tpl.baseRatePerUnit || 500,
      coolieRatePerUnit: tpl.coolieRatePerUnit || 15,
      rentRatePerUnit: tpl.rentRatePerUnit || 20,
      magimaiRatePerUnit: tpl.magimaiRatePerUnit || 1,
      commissionPercent: tpl.commissionPercent || 8.0,
      marketFeePercent: 1.0,
      gstPercent: 0,
    });
    addNotification('Commodity Added', `Added ${tpl.name} (${tpl.variety}) to catalog.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-[10px] font-black uppercase">
              Multi-Commodity Mandi Catalog
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {language === 'ta' ? 'விளைபொருட்கள் & ரகங்கள் மேலாண்மை' : 'Commodities & Products Master'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'அனைத்து விவசாய விளைபொருட்கள் (வாழை, தக்காளி, வெங்காயம், மாம்பழம், தேங்காய், தானியங்கள்), அளவு அலகுகள் மற்றும் குறைந்தபட்ச விலை நிர்ணயம்.'
              : 'Configure produce varieties, packaging units, benchmark floor rates, and statutory mandi fees for any agricultural commodity.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Preset Templates Dropdown or Button */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ta' ? 'விளைபொருள் மாதிரிகள்' : 'Sample Commodities'}</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 hidden group-hover:block space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                1-Click Add Other Commodities:
              </div>
              {PRESET_COMMODITY_TEMPLATES.map(tpl => (
                <button
                  key={tpl.variety}
                  type="button"
                  onClick={() => handleLoadTemplate(tpl)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between"
                >
                  <span className="truncate">{tpl.name}</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">+{tpl.unit?.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowInwardLotModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{language === 'ta' ? '+ புதிய வரத்து பதிவு' : '+ Inward Produce Entry'}</span>
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ta' ? '+ புதிய விளைபொருள்' : '+ Add Commodity'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 pt-3 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('varieties')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'varieties'
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{language === 'ta' ? 'விளைபொருட்கள் & ரகங்கள் பட்டியல்' : 'Commodity Catalog & Benchmark Rates'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('inward-lots')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inward-lots'
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{language === 'ta' ? 'வந்தடைந்த விளைபொருள் வரத்து' : 'Arrived Produce Lots'}</span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold">
                  {availableLotsCount} Avail
                </span>
                {soldLotsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
                    {soldLotsCount} Sold
                  </span>
                )}
              </div>
            </button>
          </div>

          <div className="relative w-full sm:w-64 pb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search commodity, variety, code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tab 1: Varieties Master Table */}
        {activeTab === 'varieties' && (
          <div>
            {/* Filter Chips */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter:</span>
              {[
                { id: 'All', label: 'All Commodities (அனைத்தும்)' },
                { id: 'Bunch', label: 'Bananas (வாழைக்காய்)' },
                { id: 'Leaf', label: 'Leaves (இலைகள்)' },
                { id: 'Vegetables', label: 'Vegetables (காய்கறிகள்)' },
                { id: 'Fruits', label: 'Fruits (பழங்கள்)' },
                { id: 'BagCrate', label: 'Bags & Crates (மூட்டை / கூடை)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('commodity')}</th>
                    <th className="py-3 px-4">வகை (Variety)</th>
                    <th className="py-3 px-4">பிரிவு (Packaging / Type)</th>
                    <th className="py-3 px-4">{t('unit')}</th>
                    <th className="py-3 px-4 text-right text-emerald-800 dark:text-emerald-400">அடிப்படை விலை (Benchmark)</th>
                    <th className="py-3 px-4 text-right">வாடகை (Rent)</th>
                    <th className="py-3 px-4 text-right">கூலி (Coolie)</th>
                    <th className="py-3 px-4 text-right">மகிமை (Magimai)</th>
                    <th className="py-3 px-4 text-center">கமிஷன்</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
                  {filteredProducts.map(p => {
                    const isEditing = editingProduct?.id === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-tamil">{p.nameTamil}</div>
                          {p.category && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-xs text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {p.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold uppercase">
                          {p.variety}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.itemType === 'Leaf' || p.itemType === 'Bundle'
                                ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300'
                                : p.itemType === 'Crate' || p.itemType === 'Box'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                : p.itemType === 'Bag'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                            }`}
                          >
                            {p.itemType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 font-tamil">
                          {p.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-800 dark:text-emerald-400 text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingProduct.baseRatePerUnit}
                              onChange={e =>
                                setEditingProduct({
                                  ...editingProduct,
                                  baseRatePerUnit: Number(e.target.value),
                                })
                              }
                              className="w-24 px-1 py-0.5 border border-emerald-500 rounded-sm text-right font-mono font-bold bg-white dark:bg-slate-800"
                            />
                          ) : (
                            `₹${p.baseRatePerUnit.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          ₹{p.rentRatePerUnit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          ₹{p.coolieRatePerUnit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          ₹{p.magimaiRatePerUnit}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {p.commissionPercent}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  updateProduct(editingProduct);
                                  setEditingProduct(null);
                                }}
                                className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingProduct(null)}
                                className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="Edit Rate"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {products.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove commodity ${p.name} (${p.variety})?`)) {
                                      deleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  title="Delete Commodity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Arrived Inward Produce Lots */}
        {activeTab === 'inward-lots' && (
          <div>
            {/* Status Filter Sub-Bar (All, Available, Sold) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1">Status:</span>
                <button
                  type="button"
                  onClick={() => setLotStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    lotStatusFilter === 'all'
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Lots</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                    {lots.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLotStatusFilter('available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    lotStatusFilter === 'available'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Available / இருப்பு</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-mono font-bold">
                    {availableLotsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLotStatusFilter('sold')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    lotStatusFilter === 'sold'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Sold Lots (விற்கப்பட்டவை)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-mono font-bold">
                    {soldLotsCount}
                  </span>
                </button>
              </div>

              {/* Inward Produce CTA */}
              <button
                type="button"
                onClick={() => setShowInwardLotModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Inward Produce</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {filteredLots.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-3xl block">📦</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lotStatusFilter === 'sold'
                      ? 'No sold lots found.'
                      : lotStatusFilter === 'available'
                      ? 'No available lots remaining on the floor.'
                      : 'No produce lots found.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLotStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    View All Lots
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLots.map(lot => {
                    const isAvailable = lot.availableQuantity > 0 && lot.status !== 'Sold';
                    // Find matching completed auction transaction for this lot
                    const tx = transactions.find(t => t.lotId === lot.id || t.billNumber === lot.lotNumber);

                    return (
                      <div
                        key={lot.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isAvailable
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500'
                            : 'bg-gradient-to-br from-amber-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between text-xs mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                                Lot #{lot.lotNumber}
                              </span>
                              {tx && (
                                <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-xs">
                                  Bill #{tx.billNumber}
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isAvailable
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                                  : 'bg-amber-500 text-slate-950 shadow-2xs'
                              }`}
                            >
                              {isAvailable ? 'Available' : 'Sold / விற்கப்பட்டது'}
                            </span>
                          </div>

                          {/* Produce Info */}
                          <div className="space-y-1">
                            <div className="font-black text-sm text-slate-900 dark:text-white">{lot.productName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-tamil">
                              {lot.productNameTamil} • <span className="font-mono font-bold uppercase">{lot.variety}</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                              Farmer: <strong>{lot.sellerName}</strong> ({lot.sellerVillage})
                            </div>
                          </div>

                          {/* Volume & Shed Line */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-500 dark:text-slate-400">
                              {isAvailable ? 'Available:' : 'Sold Volume:'}
                            </span>
                            <span className={`font-black text-sm ${isAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {isAvailable ? `${lot.availableQuantity} / ${lot.initialQuantity}` : `${lot.initialQuantity}`} {lot.unit}
                            </span>
                          </div>

                          {/* If Sold: Individual Sold Details Box */}
                          {!isAvailable && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                  Winning Trader (Buyer):
                                </span>
                                <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded-xs bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200">
                                  {tx ? tx.buyerPaddle : 'Paddle'}
                                </span>
                              </div>

                              <div className="font-extrabold text-slate-900 dark:text-white truncate">
                                {tx ? tx.buyerTradeName : 'Wholesale Buyer'}
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-amber-200/60 dark:border-slate-700/60 text-[11px] font-mono">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Sold Rate:</span>
                                  <span className="font-black text-emerald-700 dark:text-emerald-400">
                                    {tx ? `₹${tx.ratePerUnit}/${lot.unit.split(' ')[0]}` : 'Floor Price'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block">Gross Sale:</span>
                                  <span className="font-black text-slate-900 dark:text-white">
                                    {tx ? `₹${tx.grossAmount.toLocaleString('en-IN')}` : '₹0'}
                                  </span>
                                </div>
                              </div>

                              {tx && (
                                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                                  <span>Chit #{tx.chitNumber}</span>
                                  <span>{tx.time} ({tx.date})</span>
                                </div>
                              )}

                              {/* Sold Action Buttons: Dual Chit Print & Details */}
                              <div className="flex items-center gap-1.5 pt-2 border-t border-amber-200/60 dark:border-slate-700/60">
                                {tx ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveReceipt(tx);
                                        setReceiptFormat('pos');
                                      }}
                                      className="flex-1 py-1 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-bold border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-1 cursor-pointer"
                                      title="Print 80mm Thermal POS Receipt"
                                    >
                                      <Printer className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                      <span>POS Chit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveReceipt(tx);
                                        setReceiptFormat('a5');
                                      }}
                                      className="flex-1 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-1 cursor-pointer"
                                      title="Print KVS A5 Sheet Bill"
                                    >
                                      <Printer className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                      <span>A5 Sheet</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSoldLot({ lot, tx })}
                                      className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 cursor-pointer"
                                      title="View Individual Sold Audit & Breakdown"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSoldLot({ lot })}
                                    className="w-full py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                                  >
                                    View Lot Details
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Available Produce CTA */}
                        {isAvailable && onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate('/offline/live')}
                            className="mt-3 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <Gavel className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Call in Floor Auction</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Commodity Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{language === 'ta' ? 'புதிய விளைபொருள் & ரகம் பதிவு' : 'Add Agricultural Commodity / Variety'}</h3>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Commodity Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato, Mango, Banana, Onion..."
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-tamil">
                    பெயர் தமிழில் <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா. தக்காளி, மாம்பழம், வாழைக்காய்..."
                    value={productForm.nameTamil}
                    onChange={e => setProductForm({ ...productForm, nameTamil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-tamil bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Variety Code / Trade Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POOVAN, HYBRID, NASHIK"
                    value={productForm.variety}
                    onChange={e => setProductForm({ ...productForm, variety: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Commodity Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as CommodityCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {COMMODITY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Packaging / Type</label>
                  <select
                    value={productForm.itemType}
                    onChange={e => {
                      const selectedType = e.target.value as ProductItemType;
                      const matched = ITEM_TYPES.find(it => it.type === selectedType);
                      setProductForm({
                        ...productForm,
                        itemType: selectedType,
                        unit: matched?.defaultUnit || 'Bag (மூட்டை)',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {ITEM_TYPES.map(it => (
                      <option key={it.type} value={it.type}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Unit of Measure</label>
                  <select
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-tamil"
                  >
                    <option value="Bunch (தார்)">Bunch (தார்)</option>
                    <option value="Bundle (கட்டு)">Bundle (கட்டு)</option>
                    <option value="Bag (மூட்டை)">Bag (மூட்டை - 50/100kg)</option>
                    <option value="Crate (கூடை)">Crate (கூடை - 25kg)</option>
                    <option value="Box (பெட்டி)">Box (பெட்டி)</option>
                    <option value="Basket (கூடை)">Basket (கூடை)</option>
                    <option value="Kg (கிலோ)">Kg (கிலோ)</option>
                    <option value="Quintal (குவின்டால்)">Quintal (குவின்டால்)</option>
                    <option value="Piece (எண்ணிக்கை)">Piece (எண்ணிக்கை)</option>
                    <option value="Ton (டன்)">Ton (டன்)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Benchmark Floor Rate (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={productForm.baseRatePerUnit}
                    onChange={e => setProductForm({ ...productForm, baseRatePerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Commission (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step="0.5"
                    value={productForm.commissionPercent}
                    onChange={e => setProductForm({ ...productForm, commissionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-slate-500 font-medium mb-1 text-[10px]">வாடகை Rent (₹)</label>
                  <input
                    type="number"
                    value={productForm.rentRatePerUnit}
                    onChange={e => setProductForm({ ...productForm, rentRatePerUnit: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1 text-[10px]">கூலி Coolie (₹)</label>
                  <input
                    type="number"
                    value={productForm.coolieRatePerUnit}
                    onChange={e => setProductForm({ ...productForm, coolieRatePerUnit: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1 text-[10px]">மகிமை Magimai (₹)</label>
                  <input
                    type="number"
                    value={productForm.magimaiRatePerUnit}
                    onChange={e => setProductForm({ ...productForm, magimaiRatePerUnit: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Save Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Produce Entry Modal */}
      {showInwardLotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{language === 'ta' ? 'விளைபொருள் வரத்து பதிவு' : 'Inward Produce / Stock Entry'}</h3>
              </div>
              <button
                onClick={() => setShowInwardLotModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInwardLot} className="p-5 space-y-3.5 text-xs">
              {sellers.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300 text-xs">
                  <p className="font-bold">No registered farmers found!</p>
                  <p className="text-[11px] mt-0.5">Please add a farmer in the Sellers view first or click "Demo Data" in header.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Farmer (Supplier / Seller) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={inwardForm.sellerId}
                    onChange={e => setInwardForm({ ...inwardForm, sellerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {sellers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.village} • {s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Select Produce / Commodity Variety <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={inwardForm.productId}
                  onChange={e => setInwardForm({ ...inwardForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.variety}] ({p.unit})
                    </option>
                  ))}
                </select>
                {selectedInwardProduct && (
                  <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
                    <span>Category: {selectedInwardProduct.category || selectedInwardProduct.itemType}</span>
                    <span>Floor: ₹{selectedInwardProduct.baseRatePerUnit} / {selectedInwardProduct.unit?.split(' ')[0]}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Quantity ({selectedInwardProduct?.unit ? selectedInwardProduct.unit.split(' ')[0] : 'Units'}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={inwardForm.quantity}
                    onChange={e => setInwardForm({ ...inwardForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mandi Shed / Yard</label>
                  <input
                    type="text"
                    required
                    value={inwardForm.shedLocation}
                    onChange={e => setInwardForm({ ...inwardForm, shedLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vehicle / Cart Number</label>
                <input
                  type="text"
                  required
                  value={inwardForm.vehicleNumber}
                  onChange={e => setInwardForm({ ...inwardForm, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInwardLotModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Inward Produce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Sold Lot Audit & Settlement Breakdown Modal */}
      {selectedSoldLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    Sold Lot #{selectedSoldLot.lot.lotNumber} • Settlement Audit
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-tamil">
                    {selectedSoldLot.lot.productNameTamil} ({selectedSoldLot.lot.variety})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSoldLot(null)}
                className="p-1 rounded-md text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Top Banner Status */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400">Auction Result:</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedSoldLot.tx ? 'Successfully Sold on Floor' : 'Marked as Sold'}
                  </div>
                </div>
                {selectedSoldLot.tx && (
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400">Bill Number:</span>
                    <div className="font-black text-emerald-700 dark:text-emerald-400">
                      #{selectedSoldLot.tx.billNumber}
                    </div>
                  </div>
                )}
              </div>

              {/* 2-Column: Farmer & Trader Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Farmer Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Farmer (Seller / வழங்குபவர்)</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedSoldLot.lot.sellerName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Village: {selectedSoldLot.lot.sellerVillage}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    Mobile: {selectedSoldLot.lot.sellerMobile || 'N/A'}
                  </div>
                </div>

                {/* Trader Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Winning Buyer (வியாபாரி)</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedSoldLot.tx ? selectedSoldLot.tx.buyerTradeName : 'Wholesale Buyer'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    Paddle: <strong className="text-amber-600 dark:text-amber-400">{selectedSoldLot.tx ? selectedSoldLot.tx.buyerPaddle : 'P-01'}</strong>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Time: {selectedSoldLot.tx ? `${selectedSoldLot.tx.time} (${selectedSoldLot.tx.date})` : 'Floor Auction'}
                  </div>
                </div>
              </div>

              {/* Financial Calculation Audit */}
              {selectedSoldLot.tx ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 font-mono">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span>Mandi Sale Calculation Breakdown</span>
                    <span>Rate: ₹{selectedSoldLot.tx.ratePerUnit}/{selectedSoldLot.lot.unit.split(' ')[0]}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Gross Volume ({selectedSoldLot.tx.quantity} {selectedSoldLot.lot.unit}):
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        ₹{selectedSoldLot.tx.grossAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div className="flex justify-between text-red-600 dark:text-red-400 text-[11px]">
                      <span>- Mandi Commission:</span>
                      <span>₹{selectedSoldLot.tx.commissionAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-red-600 dark:text-red-400 text-[11px]">
                      <span>- Coolie / Loading:</span>
                      <span>₹{selectedSoldLot.tx.coolieAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-red-600 dark:text-red-400 text-[11px]">
                      <span>- Platform Rent & Magimai:</span>
                      <span>₹{(selectedSoldLot.tx.rentAmount + selectedSoldLot.tx.magimaiAmount).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                      <span className="text-emerald-800 dark:text-emerald-400">Net Farmer Payout:</span>
                      <span className="text-emerald-800 dark:text-emerald-400">
                        ₹{selectedSoldLot.tx.netFarmerPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                  Original auction transaction record archived.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {selectedSoldLot.tx && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReceipt(selectedSoldLot.tx!);
                        setReceiptFormat('pos');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print 80mm POS Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReceipt(selectedSoldLot.tx!);
                        setReceiptFormat('a5');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print KVS A5 Sheet</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSoldLot(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
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
