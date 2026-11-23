import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Bell,
  Globe,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Warehouse,
  Sun,
  Moon,
  Sparkles,
  Trash2,
  ChevronDown,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  Percent,
  CheckCheck,
  ShieldCheck,
  ExternalLink,
  Store,
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    activeRole,
    setActiveRole,
    activeBranch,
    setActiveBranch,
    profile,
    notifications,
    markNotificationRead,
    loadDemoData,
    clearAllData,
  } = useApp();

  const [showMandiDetails, setShowMandiDetails] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mandiDetailsRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: { role: Role; label: string; labelTamil: string; desc: string; icon: string }[] = [
    {
      role: 'Manager',
      label: 'Manager (Admin)',
      labelTamil: 'முழு மேலாளர்',
      desc: 'All 10 modules: Sellers, Buyers, Auction, Reports, Workforce',
      icon: '👑',
    },
    {
      role: 'Supervisor',
      label: 'Supervisor',
      labelTamil: 'கள மேற்பார்வையாளர்',
      desc: 'Shed arrivals, grading, live floor & workforce ops',
      icon: '🛡️',
    },
    {
      role: 'Auctioneer',
      label: 'Auctioneer',
      labelTamil: 'ஏலதாரர்',
      desc: 'Calling desk, floor bids, rapid chit ticketing',
      icon: '🔨',
    },
    {
      role: 'Accountant',
      label: 'Accountant',
      labelTamil: 'கணக்காளர்',
      desc: 'Ledger, Patti settlements, POS invoices & payroll',
      icon: '📊',
    },
    {
      role: 'Quality Checker',
      label: 'Quality Checker',
      labelTamil: 'தர ஆய்வாளர்',
      desc: 'Banana variety inspection, leaf count & freshness',
      icon: '🔍',
    },
    {
      role: 'Worker',
      label: 'Yard Worker',
      labelTamil: 'தொழிலாளி',
      desc: 'Bunch weighing, unloading & shed placement',
      icon: '📦',
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mandiDetailsRef.current && !mandiDetailsRef.current.contains(event.target as Node)) {
        setShowMandiDetails(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-slate-800 shadow-xs px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between transition-colors duration-200">
      {/* Left: Branding & Mandi Details Interactive Dropdown */}
      <div className="relative" ref={mandiDetailsRef}>
        <button
          onClick={() => {
            setShowMandiDetails(!showMandiDetails);
            setShowBranchDropdown(false);
            setShowRoleDropdown(false);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 p-1 sm:p-1.5 -ml-1 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 transition-all text-left cursor-pointer group"
          title="Click to view full Mandi profile, license & statutory details"
        >
          {/* Logo Badge */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shadow-emerald-700/25 shrink-0 group-hover:scale-105 transition-transform">
            🍌
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                {profile.shopName}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                {t('connectedLive')}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform duration-200 ${
                  showMandiDetails ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {language === 'ta' ? profile.shopNameTamil : profile.tagline} •{' '}
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Lic: {profile.mandiLicenseNo}
              </span>
            </p>
          </div>
        </button>

        {/* Mandi Full Details Dropdown Menu */}
        {showMandiDetails && (
          <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            {/* Header info */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  🍌
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {profile.shopName}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    {profile.shopNameTamil}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                APMC Verified
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3 italic">
              {profile.tagline}
            </p>

            {/* Statutory Details Grid */}
            <div className="space-y-2 text-xs">
              {/* License Number with Copy */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Mandi License No</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{profile.mandiLicenseNo}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(profile.mandiLicenseNo, 'lic')}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 cursor-pointer"
                  title="Copy License"
                >
                  {copiedKey === 'lic' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* GSTIN with Copy */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">GSTIN / Tax ID</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{profile.gstin}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(profile.gstin, 'gstin')}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 cursor-pointer"
                  title="Copy GSTIN"
                >
                  {copiedKey === 'gstin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Market Location & Address */}
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Market Yard & Location
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {profile.marketLocation}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {profile.address}
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                    <Phone className="w-3 h-3 text-emerald-600" /> Phone
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{profile.phone}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                    <Mail className="w-3 h-3 text-blue-600" /> Support
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{profile.email}</div>
                </div>
              </div>

              {/* Default Mandi Charges Summary */}
              <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Standard Mandi Tariff</span>
                  <span className="font-mono">80mm & A5 Ready</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                  <div className="bg-white dark:bg-slate-800 p-1 rounded-sm border border-emerald-100 dark:border-emerald-900">
                    <div className="text-[9px] text-slate-400">Comm</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">{profile.defaultCommissionPercent}%</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-1 rounded-sm border border-emerald-100 dark:border-emerald-900">
                    <div className="text-[9px] text-slate-400">Coolie</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">₹{profile.defaultCooliePerUnit}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-1 rounded-sm border border-emerald-100 dark:border-emerald-900">
                    <div className="text-[9px] text-slate-400">Rent</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">₹{profile.defaultRentPerUnit}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-1 rounded-sm border border-emerald-100 dark:border-emerald-900">
                    <div className="text-[9px] text-slate-400">Magimai</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">₹{profile.defaultMagimaiPerUnit}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action to open profile settings */}
            {onNavigate && (
              <button
                onClick={() => {
                  setShowMandiDetails(false);
                  onNavigate('/profile');
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Open Mandi Profile & Statutory Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Custom Shed Dropdown, Role Dropdown, Data Tools, Theme, Lang, Notifs */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
        {/* Custom Branch / Shed Dropdown */}
        <div className="relative hidden md:block" ref={branchRef}>
          <button
            onClick={() => {
              setShowBranchDropdown(!showBranchDropdown);
              setShowMandiDetails(false);
              setShowRoleDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            title="Switch Operating Shed / Branch"
          >
            <Warehouse className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="truncate max-w-[140px] lg:max-w-[180px] font-bold">{activeBranch}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showBranchDropdown && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                Operating Shed Locations
              </div>
              <div className="py-1">
                {profile.branches.map(b => {
                  const isSelected = activeBranch === b;
                  return (
                    <button
                      key={b}
                      onClick={() => {
                        setActiveBranch(b);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Warehouse className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{b}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom RBAC Role Dropdown */}
        <div className="relative hidden sm:block" ref={roleRef}>
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowMandiDetails(false);
              setShowBranchDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-300 transition-all cursor-pointer"
            title="Simulate Staff Role for Dynamic Sidebar RBAC"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline font-medium text-amber-800 dark:text-amber-400">Role:</span>
            <span>{activeRole}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-amber-700 dark:text-amber-400 transition-transform ${
                showRoleDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Select Operating Role (RBAC)</span>
                <span className="text-[9px] text-amber-600 font-bold">Filters Sidebar</span>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {roles.map(r => {
                  const isSelected = activeRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        setActiveRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-start justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">{r.icon}</span>
                        <div>
                          <div className="font-extrabold leading-tight flex items-center gap-1.5">
                            <span>{r.role}</span>
                            <span className="text-[10px] font-normal text-slate-400">({r.labelTamil})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {r.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Demo Data & Clear Group */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={loadDemoData}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title={language === 'ta' ? 'மாதிரி தரவுகளை ஏற்று (Load Mock Banana Mandi Data)' : 'Load Demo Banana Mandi Data'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'ta' ? 'மாதிரி தரவு' : 'Demo Data'}</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  language === 'ta'
                    ? 'அனைத்து மாதிரி தரவுகளையும் அழிக்க விரும்புகிறீர்களா? புதிய நேரடி உள்ளீட்டிற்கு (100% Manual Entry) தரவுத்தளம் அமைக்கப்படும்.'
                    : 'Are you sure you want to remove all demo data? System will be cleared for clean manual data entry.'
                )
              ) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1 px-2 sm:px-2 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-[11px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95"
            title={language === 'ta' ? 'தரவுகளை அழித்து நேரடி உள்ளீடு செய் (Clear for Manual Entry)' : 'Clear Data for Manual Entry'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{language === 'ta' ? 'அழி' : 'Clear'}</span>
          </button>
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          title={theme === 'dark' ? 'Switch to Light Mode (பகல்பொழுது பார்வை)' : 'Switch to Dark Mode (இரவுப்பொழுது பார்வை)'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Toggle English / தமிழ்"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="hidden sm:inline">{t('switchLanguage')}</span>
          <span className="sm:hidden">{language === 'en' ? 'தமிழ்' : 'EN'}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMandiDetails(false);
              setShowBranchDropdown(false);
              setShowRoleDropdown(false);
            }}
            className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Mandi Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Mandi Activity Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active alerts</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-600" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mandi Profile Link */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('/profile')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Mandi Business Profile & Statutory Settings (மண்டி சுயவிவரம் & அமைப்புகள்)"
          >
            <Store className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden xl:inline">{language === 'ta' ? 'சுயவிவரம்' : 'Profile'}</span>
          </button>
        )}
      </div>
    </header>
  );
};