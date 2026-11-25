import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Seller } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  MessageSquare,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  MapPin,
  X,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

interface SellersViewProps {
  onNavigate?: (path: string) => void;
}

export const SellersView: React.FC<SellersViewProps> = ({ onNavigate }) => {
  const { t, language, sellers, addSeller, lots, transactions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSellerHistory, setSelectedSellerHistory] = useState<Seller | null>(null);
  const [whatsAppSeller, setWhatsAppSeller] = useState<Seller | null>(null);

  // New Seller Form State
  const [formData, setFormData] = useState({
    name: '',
    nameTamil: '',
    mobile: '',
    village: '',
    taluk: 'Oddanchatram',
    district: 'Dindigul',
    pincode: '624619',
    aadhaar: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
  });

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert('Please enter Farmer Name and Mobile Number');
      return;
    }

    addSeller({
      code: 'FRM-' + Math.floor(100 + Math.random() * 900),
      name: formData.name,
      nameTamil: formData.nameTamil || formData.name,
      mobile: formData.mobile,
      village: formData.village || 'Oddanchatram Rural',
      taluk: formData.taluk,
      district: formData.district,
      pincode: formData.pincode,
      aadhaar: formData.aadhaar || 'XXXX-XXXX-XXXX',
      bankDetails: {
        accountHolder: formData.accountHolder || formData.name,
        bankName: formData.bankName || 'State Bank of India',
        accountNumber: formData.accountNumber || '109283749281',
        ifsc: formData.ifsc || 'SBIN0000891',
      },
      active: true,
      payoutBalance: 0,
      totalLotsCount: 0,
      totalVolume: 0,
      rating: 5.0,
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      nameTamil: '',
      mobile: '',
      village: '',
      taluk: 'Oddanchatram',
      district: 'Dindigul',
      pincode: '624619',
      aadhaar: '',
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
    });
  };

  const filteredSellers = sellers.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.mobile.includes(q) ||
      s.village.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  });

  const totalVolume = sellers.reduce((sum, s) => sum + s.totalVolume, 0);
  const totalPending = sellers.reduce((sum, s) => sum + s.payoutBalance, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('sellerManagement')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('sellerSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addSeller')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalFarmers')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">{sellers.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Verified Registry</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('activeInwardFarmers')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">
            {sellers.filter(s => s.totalLotsCount > 0).length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Supplied produce</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalProduceSupplied')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">
            {(totalVolume / 100).toFixed(1)} <span className="text-xs font-normal text-slate-500">Qtl</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Cumulative weight</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('pendingPayouts')}</div>
          <div className="text-xl font-black text-purple-900 font-mono-numbers">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Direct Bank / Cash Dues</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, mobile, village, code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredSellers.length}</strong> of {sellers.length} farmers
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">{t('farmerCode')}</th>
                <th className="py-3 px-4">{t('farmerName')}</th>
                <th className="py-3 px-4">{t('farmerMobile')}</th>
                <th className="py-3 px-4">{t('village')}</th>
                <th className="py-3 px-4">{t('bankAccount')}</th>
                <th className="py-3 px-4 text-center">{t('lotsSupplied')}</th>
                <th className="py-3 px-4 text-right">{t('payoutBalance')}</th>
                <th className="py-3 px-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No farmers found matching search query.
                  </td>
                </tr>
              ) : (
                filteredSellers.map(seller => (
                  <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{seller.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{seller.name}</div>
                      {seller.nameTamil && (
                        <div className="text-[10px] text-slate-500 font-tamil">{seller.nameTamil}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{seller.mobile}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{seller.village}</div>
                      <div className="text-[10px] text-slate-400">{seller.taluk}, {seller.district}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{seller.bankDetails.bankName}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {seller.bankDetails.accountNumber} ({seller.bankDetails.ifsc})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {seller.totalLotsCount} Lots
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-purple-900">
                      ₹{seller.payoutBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('/products')}
                            className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold cursor-pointer"
                            title="Record Inward Produce Arrival for this Farmer"
                          >
                            + Lot
                          </button>
                        )}
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('/reports')}
                            className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold cursor-pointer"
                            title="Generate Settlement Patti in Reports"
                          >
                            Patti
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSellerHistory(seller)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="View Inward History & Lots"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setWhatsAppSeller(seller)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                          title="Send WhatsApp Balance / Notification"
                        >
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Farmer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{t('addSeller')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSeller} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  1. Farmer Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Farmer Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. K. Murugan"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 font-tamil">
                      பெயர் தமிழில் (Name in Tamil)
                    </label>
                    <input
                      type="text"
                      placeholder="எ.கா. கே. முருகன்"
                      value={formData.nameTamil}
                      onChange={e => setFormData({ ...formData, nameTamil: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-tamil"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Mobile Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9842100000"
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Aadhaar Card No.</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.aadhaar}
                      onChange={e => setFormData({ ...formData, aadhaar: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Village / Town</label>
                    <input
                      type="text"
                      placeholder="Virupachi"
                      value={formData.village}
                      onChange={e => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Taluk</label>
                    <input
                      type="text"
                      value={formData.taluk}
                      onChange={e => setFormData({ ...formData, taluk: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Direct Bank Settlement Details (Optional)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Name as per Passbook"
                      value={formData.accountHolder}
                      onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Bank Name & Branch</label>
                    <input
                      type="text"
                      placeholder="Canara Bank, Oddanchatram"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="1098201004821"
                      value={formData.accountNumber}
                      onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="CNRB0001098"
                      value={formData.ifsc}
                      onChange={e => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md shadow-emerald-700/20"
                >
                  {t('saveFarmer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer Inward History Modal */}
      {selectedSellerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">{selectedSellerHistory.name} - Inward Lots & Sales</h3>
                <p className="text-xs text-slate-400">
                  {selectedSellerHistory.code} • {selectedSellerHistory.village} • Balance: ₹{selectedSellerHistory.payoutBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedSellerHistory(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <h4 className="font-bold text-slate-800">Current Inward Stock Lots:</h4>
              {lots.filter(l => l.sellerId === selectedSellerHistory.id).length === 0 ? (
                <p className="text-slate-400 italic">No lots currently in warehouse.</p>
              ) : (
                <div className="space-y-2">
                  {lots
                    .filter(l => l.sellerId === selectedSellerHistory.id)
                    .map(lot => (
                      <div
                        key={lot.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{lot.lotNumber} - {lot.productName}</div>
                          <div className="text-[11px] text-slate-500">
                            Location: {lot.shedLocation} • Arrived: {lot.arrivalDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-800 font-mono">
                            {lot.availableQuantity} / {lot.initialQuantity} {lot.unit}
                          </span>
                          <span className="block text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-900 mt-1">
                            {lot.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <h4 className="font-bold text-slate-800 pt-2 border-t border-slate-200">
                Completed Auction Transactions:
              </h4>
              {transactions.filter(tx => tx.sellerId === selectedSellerHistory.id).length === 0 ? (
                <p className="text-slate-400 italic">No auction sales recorded today.</p>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .filter(tx => tx.sellerId === selectedSellerHistory.id)
                    .map(tx => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-lg border border-slate-200 bg-emerald-50/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{tx.chitNumber} • {tx.productName}</div>
                          <div className="text-[11px] text-slate-500">
                            Buyer: {tx.buyerTradeName} • Rate: ₹{tx.ratePerUnit}/{tx.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-emerald-900">
                            Net: ₹{tx.netFarmerPayable.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">{tx.time}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Preview Modal */}
      {whatsAppSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-green-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">Send Mandi WhatsApp Notice</h3>
              </div>
              <button
                onClick={() => setWhatsAppSeller(null)}
                className="p-1 rounded-md text-green-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 font-mono text-[11px] text-green-950 space-y-2">
                <p className="font-bold">வணக்கம் {whatsAppSeller.name} அய்யா,</p>
                <p>
                  உங்கள் மண்டி கணக்கு நிலவரம்:
                  <br />
                  விற்பனை லாட்கள்: {whatsAppSeller.totalLotsCount}
                  <br />
                  வழங்க வேண்டிய நிலுவை தொகை: <strong>₹{whatsAppSeller.payoutBalance.toLocaleString('en-IN')}</strong>
                </p>
                <p>தங்கள் வரவுக்கு நன்றி! - கேவிஎஸ் கமிஷன் மண்டி, ஒட்டன்சத்திரம்.</p>
              </div>

              <div className="text-slate-500 text-[11px]">
                To: <span className="font-mono font-bold text-slate-800">+91 {whatsAppSeller.mobile}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setWhatsAppSeller(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`WhatsApp message dispatched to ${whatsAppSeller.mobile}!`);
                    setWhatsAppSeller(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-green-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
