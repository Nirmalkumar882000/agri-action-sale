import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Buyer } from '../types';
import {
  Building2,
  UserPlus,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  Landmark,
  X,
  CreditCard,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface BuyersViewProps {
  onNavigate?: (path: string) => void;
}

export const BuyersView: React.FC<BuyersViewProps> = ({ onNavigate }) => {
  const { t, language, buyers, addBuyer, updateBuyer, transactions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBuyerLedger, setSelectedBuyerLedger] = useState<Buyer | null>(null);
  const [whatsAppBuyer, setWhatsAppBuyer] = useState<Buyer | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'credit'>('directory');

  // New Buyer Form State
  const [formData, setFormData] = useState({
    name: '',
    tradeName: '',
    tradeNameTamil: '',
    mobile: '',
    gstin: '',
    licenseNo: '',
    city: '',
    address: '',
    depositAmount: 100000,
    creditLimit: 300000,
    paddleNumber: 'P-' + Math.floor(10 + Math.random() * 90),
  });

  const handleCreateBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.tradeName || !formData.mobile) {
      alert('Please fill Buyer Name, Trade Name and Mobile Number');
      return;
    }

    addBuyer({
      code: 'BYR-' + Math.floor(200 + Math.random() * 800),
      name: formData.name,
      tradeName: formData.tradeName,
      tradeNameTamil: formData.tradeNameTamil || formData.tradeName,
      mobile: formData.mobile,
      gstin: formData.gstin || '33AAACB' + Math.floor(1000 + Math.random() * 9000) + '1Z1',
      licenseNo: formData.licenseNo || 'MND-BYR-TN-' + Math.floor(100 + Math.random() * 900),
      city: formData.city || 'Tamil Nadu',
      address: formData.address || 'Wholesale Market Complex',
      depositAmount: Number(formData.depositAmount),
      creditLimit: Number(formData.creditLimit),
      outstandingDues: 0,
      paddleNumber: formData.paddleNumber,
      status: 'Active',
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      tradeName: '',
      tradeNameTamil: '',
      mobile: '',
      gstin: '',
      licenseNo: '',
      city: '',
      address: '',
      depositAmount: 100000,
      creditLimit: 300000,
      paddleNumber: 'P-' + Math.floor(10 + Math.random() * 90),
    });
  };

  const filteredBuyers = buyers.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.tradeName.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.paddleNumber.toLowerCase().includes(q) ||
      b.mobile.includes(q) ||
      b.city.toLowerCase().includes(q)
    );
  });

  const totalDeposits = buyers.reduce((sum, b) => sum + b.depositAmount, 0);
  const totalCredit = buyers.reduce((sum, b) => sum + b.creditLimit, 0);
  const totalDues = buyers.reduce((sum, b) => sum + b.outstandingDues, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('buyerManagement')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('buyerSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addBuyer')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalTraders')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">{buyers.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Licensed Wholesale</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalSecurityDeposits')}</div>
          <div className="text-xl font-black text-emerald-800 font-mono-numbers">
            ₹{totalDeposits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Bank Guarantees & Cash</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('creditUtilized')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">
            ₹{totalCredit.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Authorized Mandi Limits</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('outstandingReceivables')}</div>
          <div className="text-xl font-black text-amber-900 font-mono-numbers">
            ₹{totalDues.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Ledger Receivables</div>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Sub Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-3 bg-slate-50/50">
          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-3 border-b-2 transition-all ${
                activeTab === 'directory'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Traders Directory
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'credit'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Credit Requests & Deposits</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </button>
          </div>

          <div className="relative w-64 pb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search by trade name, paddle, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Directory View */}
        {activeTab === 'directory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">{t('paddleNumber')}</th>
                  <th className="py-3 px-4">{t('buyerTradeName')}</th>
                  <th className="py-3 px-4">{t('contactPerson')}</th>
                  <th className="py-3 px-4">{t('gstinMandiLicense')}</th>
                  <th className="py-3 px-4 text-right">{t('depositAmt')}</th>
                  <th className="py-3 px-4 text-right">{t('creditLimit')}</th>
                  <th className="py-3 px-4 text-right">{t('dues')}</th>
                  <th className="py-3 px-4 text-center">{t('creditStatus')}</th>
                  <th className="py-3 px-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No wholesale buyers found. Click [+ Add Buyer] to register one.
                    </td>
                  </tr>
                ) : (
                  filteredBuyers.map(buyer => {
                  const totalLimit = buyer.depositAmount + buyer.creditLimit;
                  const ratio = buyer.outstandingDues / (totalLimit || 1);

                  return (
                    <tr key={buyer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded-md bg-emerald-700 text-white font-mono font-black text-xs shadow-xs">
                          {buyer.paddleNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{buyer.tradeName}</div>
                        {buyer.tradeNameTamil && (
                          <div className="text-[10px] text-slate-500 font-tamil">{buyer.tradeNameTamil}</div>
                        )}
                        <div className="text-[10px] text-slate-400">{buyer.city}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{buyer.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{buyer.mobile}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div>{buyer.gstin}</div>
                        <div className="text-[10px] text-slate-400">{buyer.licenseNo}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-800">
                        ₹{buyer.depositAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                        ₹{buyer.creditLimit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{buyer.outstandingDues.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ratio >= 1.0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            {t('blocked')}
                          </span>
                        ) : ratio >= 0.8 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {t('warning')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                            <ShieldCheck className="w-3 h-3 text-green-600" />
                            {t('safe')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('/offline/live')}
                              className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold cursor-pointer"
                              title="Floor Auction Calling Desk for this Trader"
                            >
                              Bid Desk
                            </button>
                          )}
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('/reports')}
                              className="px-2 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-900 text-[10px] font-bold cursor-pointer"
                              title="View Tax Invoice & Gate Pass in Reports"
                            >
                              Invoice
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBuyerLedger(buyer)}
                            className="p-1.5 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="View Purchases & Ledger"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setWhatsAppBuyer(buyer)}
                            className="p-1.5 rounded-md text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                            title="Send WhatsApp Statement"
                          >
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        )}

        {/* Credit Management Tab */}
        {activeTab === 'credit' && (
          <div className="p-4 space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mandi Live Credit Ceiling Safeguard</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  The floor auction console will automatically inspect trader limit balances. If purchases exceed
                  their advance security deposit + credit limit, an audible and visual lock is applied.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buyers.map(b => {
                const totalCap = b.depositAmount + b.creditLimit;
                const percent = Math.min(100, Math.round((b.outstandingDues / (totalCap || 1)) * 100));

                return (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{b.tradeName}</span>
                      <span className="font-mono text-xs font-black bg-emerald-700 text-white px-2 py-0.5 rounded-sm">
                        {b.paddleNumber}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Limit Utilization</span>
                        <span className="font-bold text-slate-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent >= 100
                              ? 'bg-red-500'
                              : percent >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-400">Security Deposit:</div>
                        <div className="font-bold text-emerald-800 font-mono">₹{b.depositAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Current Dues:</div>
                        <div className="font-bold text-slate-900 font-mono">₹{b.outstandingDues.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Buyer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{t('addBuyer')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBuyer} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Trade / Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Murugan Traders"
                    value={formData.tradeName}
                    onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C. Shanmugam"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9843000000"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Floor Auction Paddle Token #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P-25"
                    value={formData.paddleNumber}
                    onChange={e => setFormData({ ...formData, paddleNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="33AABCS8910H1ZS"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mandi Trade License No.</label>
                  <input
                    type="text"
                    placeholder="MND-BYR-TN-409"
                    value={formData.licenseNo}
                    onChange={e => setFormData({ ...formData, licenseNo: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Advance Security Deposit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.depositAmount}
                    onChange={e => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Credit Limit Ceiling (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
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
                  Save Wholesale Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Ledger Modal */}
      {selectedBuyerLedger && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">{selectedBuyerLedger.tradeName} - Purchases & Ledger</h3>
                <p className="text-xs text-slate-400">
                  Paddle: {selectedBuyerLedger.paddleNumber} • Outstanding: ₹{selectedBuyerLedger.outstandingDues.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedBuyerLedger(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              <h4 className="font-bold text-slate-800">Purchased Lots in Today's Auction:</h4>
              {transactions.filter(tx => tx.buyerId === selectedBuyerLedger.id).length === 0 ? (
                <p className="text-slate-400 italic">No auction lots won today.</p>
              ) : (
                transactions
                  .filter(tx => tx.buyerId === selectedBuyerLedger.id)
                  .map(tx => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{tx.chitNumber} • {tx.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          {tx.quantity} {tx.unit} @ ₹{tx.ratePerUnit}/{tx.unit} • Farmer: {tx.sellerName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-slate-900">
                          ₹{tx.buyerTotalBilled.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">Gate Pass Issued</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Statement Modal */}
      {whatsAppBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-green-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">Send WhatsApp Statement</h3>
              </div>
              <button
                onClick={() => setWhatsAppBuyer(null)}
                className="p-1 rounded-md text-green-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 font-mono text-[11px] text-green-950 space-y-2">
                <p className="font-bold">வணக்கம் {whatsAppBuyer.tradeName},</p>
                <p>
                  உங்கள் இன்றைய கொள்முதல் மற்றும் பாக்கி விவரம்:
                  <br />
                  டோக்கன் எண்: {whatsAppBuyer.paddleNumber}
                  <br />
                  மொத்த பாக்கி: <strong>₹{whatsAppBuyer.outstandingDues.toLocaleString('en-IN')}</strong>
                </p>
                <p>உடனடி பட்டுவாடா செய்யுமாறு கேட்டுக்கொள்கிறோம். - கேவிஎஸ் கமிஷன் மண்டி.</p>
              </div>

              <div className="text-slate-500 text-[11px]">
                To: <span className="font-mono font-bold text-slate-800">+91 {whatsAppBuyer.mobile}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setWhatsAppBuyer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`WhatsApp statement dispatched to ${whatsAppBuyer.mobile}!`);
                    setWhatsAppBuyer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-green-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Statement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
