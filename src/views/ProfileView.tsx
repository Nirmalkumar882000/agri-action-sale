import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MandiProfile } from '../types';
import {
  Store,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Percent,
  Coins,
  Warehouse,
  CheckCircle2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Calculator,
  QrCode,
  CreditCard,
  Check,
  Copy,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate?: (path: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { profile, updateProfile, activeBranch, setActiveBranch, language, t, addNotification } = useApp();

  const [formData, setFormData] = useState<MandiProfile>({ ...profile });
  const [newBranchInput, setNewBranchInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bank & UPI Settlement settings (stored in Mandi profile or local extension)
  const [bankName, setBankName] = useState('HDFC Bank - Tirunelveli Junction');
  const [accountNo, setAccountNo] = useState('50200088991122');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [upiId, setUpiId] = useState('kvstraders@hdfcbank');

  // Interactive Live Calculation Test
  const [testQuantity, setTestQuantity] = useState<number>(200);
  const [testRate, setTestRate] = useState<number>(320);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    if (formData.branches.includes(newBranchInput.trim())) {
      alert('This shed or branch location already exists.');
      return;
    }
    const updatedBranches = [...formData.branches, newBranchInput.trim()];
    setFormData({ ...formData, branches: updatedBranches });
    setNewBranchInput('');
  };

  const handleRemoveBranch = (branchToRemove: string) => {
    if (formData.branches.length <= 1) {
      alert('At least one operating shed must be maintained.');
      return;
    }
    const updatedBranches = formData.branches.filter(b => b !== branchToRemove);
    let nextActive = formData.activeBranch;
    if (formData.activeBranch === branchToRemove) {
      nextActive = updatedBranches[0];
      setActiveBranch(nextActive);
    }
    setFormData({
      ...formData,
      branches: updatedBranches,
      activeBranch: nextActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        language === 'ta'
          ? 'தொழில்நுட்ப இயல்புநிலை அமைப்புகளுக்கு மீட்டமைக்கவா (Reset to KVS Defaults)?'
          : 'Reset all Mandi profile and statutory settings to default KVS values?'
      )
    ) {
      const defaultProf: MandiProfile = {
        shopName: 'KVS TRADERS',
        shopNameTamil: 'கே.வி.எஸ் டிரேடர்ஸ்',
        tagline: 'Banana & Banana Leaves Wholesale Commission Mandi',
        taglineTamil: 'வாழைக்காய் & வாழை இலை கமிஷன் மண்டி',
        marketLocation: 'Nayinarkulam APMC Market Yard, Tirunelveli - 627006',
        marketLocationTamil: 'நயினார்குளம் மார்க்கெட், திருநெல்வேலி',
        mandiLicenseNo: 'TNV-MND-BNN-2024-889',
        gstin: '33AABCK8899Z1ZX',
        address: 'Shop No. 12 & 14, Commercial Banana Complex, Nayinarkulam, Tirunelveli - 627006',
        addressTamil: 'கடை எண் 12 & 14, வாழை வணிக வளாகம், நயினார்குளம், திருநெல்வேலி - 627006',
        phone: '94431 23456 / 98421 87654',
        email: 'kvs.traders.mandi@gmail.com',
        defaultCommissionPercent: 10,
        defaultCooliePerUnit: 2,
        defaultRentPerUnit: 1,
        defaultMagimaiPerUnit: 1,
        activeBranch: 'Main Shed 1 (Nayinarkulam)',
        branches: [
          'Main Shed 1 (Nayinarkulam)',
          'North Yard Shed 2 (Gate 3)',
          'Auction Shed 3 (Thiruchendur Rd)',
        ],
      };
      setFormData(defaultProf);
      updateProfile(defaultProf);
      addNotification('Profile Reset', 'Reset to default KVS Traders Mandi profile.', 'info');
    }
  };

  // Tariff calculation preview
  const testGross = testQuantity * testRate;
  const testCommission = (testGross * (formData.defaultCommissionPercent || 0)) / 100;
  const testCoolie = testQuantity * (formData.defaultCooliePerUnit || 0);
  const testRent = testQuantity * (formData.defaultRentPerUnit || 0);
  const testMagimai = testQuantity * (formData.defaultMagimaiPerUnit || 0);
  const testTotalDeductions = testCommission + testCoolie + testRent + testMagimai;
  const testNetFarmerPayout = testGross - testTotalDeductions;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/25 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {language === 'ta' ? 'மண்டி சுயவிவரம் & ஒழுங்குமுறை அமைப்புகள்' : 'Mandi Profile & Statutory Settings'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Official APMC Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ta'
                ? 'அரசு உரிமம், ஜிஎஸ்டி, மண்டி ஏல மேடைகள், கமிஷன் மற்றும் கூலி விதிமுறைகள்'
                : 'Configure legal identity, APMC Mandi License, GSTIN, Sheds, Tariff Rates, and Settlement Accounts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Reset to official KVS defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white shadow-md shadow-emerald-700/25 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'ta' ? 'சேமிக்கவும்' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert Banner */}
      {saveSuccess && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">
                {language === 'ta'
                  ? 'மண்டி சுயவிவர அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!'
                  : 'Mandi profile & statutory settings successfully saved!'}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                All POS invoices, KVS A5 Sheets, farmer settlements, and header titles are updated immediately across the system.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950 dark:hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">APMC Mandi License</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {formData.mandiLicenseNo}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified & Compliant
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Shed</span>
            <Warehouse className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {formData.activeBranch.split(' ')[0]}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-1">
            {formData.branches.length} locations configured
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default Commission</span>
            <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 font-mono font-black text-sm sm:text-base text-amber-600 dark:text-amber-400">
            {formData.defaultCommissionPercent}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Standard Mandi Cut
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coolie + Rent + Cess</span>
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white">
            ₹{formData.defaultCooliePerUnit + formData.defaultRentPerUnit + formData.defaultMagimaiPerUnit}
            <span className="text-xs font-normal text-slate-400"> / unit</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            ₹{formData.defaultCooliePerUnit} C + ₹{formData.defaultRentPerUnit} R + ₹{formData.defaultMagimaiPerUnit} M
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Shop & Firm Identity */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'ta' ? 'மண்டி வர்த்தக அடையாள விபரம்' : 'Mandi Business & Firm Identity'}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Prints on POS & A5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="e.g. KVS TRADERS"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Name (Tamil) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopNameTamil}
                  onChange={e => setFormData({ ...formData, shopNameTamil: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold font-tamil bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="எ.கா. கே.வி.எஸ் டிரேடர்ஸ்"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Specialization (English)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Banana & Banana Leaves Wholesale Commission Mandi"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline (Tamil)
                </label>
                <input
                  type="text"
                  value={formData.taglineTamil}
                  onChange={e => setFormData({ ...formData, taglineTamil: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-tamil bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="வாழைக்காய் & வாழை இலை கமிஷன் மண்டி"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Market Yard Location (English)
                </label>
                <input
                  type="text"
                  value={formData.marketLocation}
                  onChange={e => setFormData({ ...formData, marketLocation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Nayinarkulam APMC Market Yard, Tirunelveli"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Market Yard (Tamil)
                </label>
                <input
                  type="text"
                  value={formData.marketLocationTamil}
                  onChange={e => setFormData({ ...formData, marketLocationTamil: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-tamil bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="நயினார்குளம் மார்க்கெட், திருநெல்வேலி"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Mandi Address (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Shop No. 12 & 14, Commercial Banana Complex, Nayinarkulam, Tirunelveli - 627006"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile / Phone Numbers
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="94431 23456 / 98421 87654"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact / Support Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="kvs.traders.mandi@gmail.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Statutory Licensing & Tax Info */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'ta' ? 'அரசு உரிமம் & வரி பதிவு விவரங்கள்' : 'Statutory Licensing & Tax Registrations'}
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                Mandatory for Trade
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  APMC Mandi License Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.mandiLicenseNo}
                    onChange={e => setFormData({ ...formData, mandiLicenseNo: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="TNV-MND-BNN-2024-889"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.mandiLicenseNo, 'lic')}
                    className="px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Copy License"
                  >
                    {copiedKey === 'lic' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN / Goods & Services Tax ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="33AABCK8899Z1ZX"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.gstin, 'gstin')}
                    className="px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Copy GSTIN"
                  >
                    {copiedKey === 'gstin' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Mandi Tariff & Standard Commission Charges */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'ta' ? 'கமிஷன் & கூலி கட்டண விதிகள்' : 'Mandi Tariff, Commission & Statutory Deductions'}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Deducted from Farmer Patti</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commission %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    required
                    value={formData.defaultCommissionPercent}
                    onChange={e => setFormData({ ...formData, defaultCommissionPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standard 10% cut</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Coolie / Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.defaultCooliePerUnit}
                    onChange={e => setFormData({ ...formData, defaultCooliePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">கூலி per bunch/bundle</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rent / Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.defaultRentPerUnit}
                    onChange={e => setFormData({ ...formData, defaultRentPerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">வாடகை per unit</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Magimai / Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.defaultMagimaiPerUnit}
                    onChange={e => setFormData({ ...formData, defaultMagimaiPerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">மகிமை charity cess</span>
              </div>
            </div>
          </div>

          {/* Card 4: Operating Shed Locations */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'ta' ? 'மண்டி ஏல மேடைகள் & கிடங்குகள்' : 'Operating Mandi Sheds & Yard Branches'}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Multi-Branch Support</span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Shed for Current Session:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {formData.branches.map(branch => {
                  const isCurActive = formData.activeBranch === branch;
                  return (
                    <div
                      key={branch}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isCurActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, activeBranch: branch });
                          setActiveBranch(branch);
                        }}
                        className="flex items-center gap-2 text-left cursor-pointer flex-1"
                      >
                        <Warehouse className={`w-4 h-4 ${isCurActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-xs truncate">{branch}</span>
                      </button>

                      {formData.branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBranch(branch)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors ml-1 cursor-pointer"
                          title="Remove Shed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Shed Form */}
              <form onSubmit={handleAddBranch} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newBranchInput}
                  onChange={e => setNewBranchInput(e.target.value)}
                  placeholder="e.g. South Yard Shed 4 (Express Gate)"
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Shed</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 5: Bank & Digital Settlement Accounts */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'ta' ? 'மண்டி வங்கி கணக்கு & UPI விபரங்கள்' : 'Mandi Bank Accounts & Digital Settlement'}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">RTGS / NEFT / UPI</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Settlement Bank & Branch
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="HDFC Bank - Tirunelveli Junction"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Account Number
                </label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="50200088991122"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="HDFC0001234"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mandi Official UPI VPA
                </label>
                <div className="relative">
                  <QrCode className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="kvstraders@hdfcbank"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: 4 Columns (Live Simulator & Print Links) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 6: Live Mandi Tariff Calculation Simulator */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 border border-emerald-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Live Tariff Simulation
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-Time
              </span>
            </div>

            <p className="text-[11px] text-emerald-100/80 leading-relaxed">
              Test how your configured Commission %, Coolie, Rent, and Magimai charges affect a farmer settlement lot right now:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-emerald-200/80 font-bold uppercase block mb-1">
                  Quantity (Bunches/Bundles):
                </label>
                <input
                  type="number"
                  min={1}
                  value={testQuantity}
                  onChange={e => setTestQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-xl bg-black/40 border border-emerald-700/60 text-white font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-200/80 font-bold uppercase block mb-1">
                  Rate per Unit (₹):
                </label>
                <input
                  type="number"
                  min={1}
                  value={testRate}
                  onChange={e => setTestRate(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full p-2 rounded-xl bg-black/40 border border-emerald-700/60 text-white font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Simulated Calculations Breakdown */}
            <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-800/50 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Gross Auction Value:</span>
                <span className="font-bold text-white">₹{testGross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Commission ({formData.defaultCommissionPercent}%):</span>
                <span>- ₹{testCommission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Coolie (₹{formData.defaultCooliePerUnit}/unit):</span>
                <span>- ₹{testCoolie.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Rent (₹{formData.defaultRentPerUnit}/unit):</span>
                <span>- ₹{testRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Magimai (₹{formData.defaultMagimaiPerUnit}/unit):</span>
                <span>- ₹{testMagimai.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-emerald-700/60 pt-2 flex justify-between font-black text-amber-300 text-sm">
                <span>Farmer Net Payout:</span>
                <span>₹{testNetFarmerPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-200/70 italic text-center">
              Formula: Net Payout = Gross - (Comm + Coolie + Rent + Magimai)
            </div>
          </div>

          {/* Card 7: Live Receipts & Print Desk Shortcuts */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Dual-Format Print Desk</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Ready</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The Mandi profile settings configured on this page feed directly into both live printing formats:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>80mm Thermal POS Chit</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">POS</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Instant slip printed for floor auction winning bids with buyer paddle & QR code.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>KVS Official A5 Portrait Sheet</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">A5 Sheet</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Traditional Tamil receipt with phone, KVS boxed badge, and full deduction grid.
                </p>
              </div>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/reports')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Reports & Print Center</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
