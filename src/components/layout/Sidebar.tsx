import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  PackageCheck,
  Gavel,
  Radio,
  FileSpreadsheet,
  UserCheck,
  CalendarCheck,
  WalletCards,
  ReceiptText,
  Lock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Store,
  BookOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSubLink {
  path: string;
  labelEn: string;
  labelTa: string;
  highlight?: boolean;
}

interface NavItem {
  id: string;
  path: string;
  labelEn: string;
  labelTa: string;
  icon: React.ComponentType<{ className?: string }>;
  subLinks?: NavSubLink[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { language, activeRole, activeBranch, hasPermission } = useApp();

  const handleNav = (path: string) => {
    if (onClose) onClose();
    onNavigate(path);
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      labelEn: 'Mandi Dashboard',
      labelTa: 'மண்டி முகப்பு பலகை',
      icon: LayoutDashboard,
    },
    {
      id: 'sellers',
      path: '/sellers',
      labelEn: 'Farmers (Sellers)',
      labelTa: 'விவசாயிகள்',
      icon: Users,
    },
    {
      id: 'buyers',
      path: '/buyers',
      labelEn: 'Buyers (Wholesale Traders)',
      labelTa: 'மொத்த வியாபாரிகள்',
      icon: Building2,
    },
    {
      id: 'products',
      path: '/products',
      labelEn: 'Commodities & Products',
      labelTa: 'விளைபொருட்கள் & ரகங்கள்',
      icon: PackageCheck,
    },
    {
      id: 'offline',
      path: '/offline',
      labelEn: 'Mandi Floor Auction (Manual)',
      labelTa: 'மண்டி நேரடி தரை ஏலம்',
      icon: Gavel,
      subLinks: [
        {
          path: '/offline/live',
          labelEn: 'Live Floor Calling Desk',
          labelTa: 'நேரலை ஏல கூவல் மேடை',
          highlight: true,
        },
      ],
    },
    {
      id: 'online',
      path: '/online',
      labelEn: 'Digital Remote Auction',
      labelTa: 'டிஜிட்டல் ஆன்லைன் ஏலம்',
      icon: Radio,
    },
    {
      id: 'ledger',
      path: '/ledger',
      labelEn: 'Financial Ledger & Cash Book',
      labelTa: 'நிதி லெட்ஜர் & கணக்கு ஏடு',
      icon: BookOpen,
    },
    {
      id: 'reports',
      path: '/reports',
      labelEn: 'Reports & Billing (POS / A5)',
      labelTa: 'அறிக்கைகள் & பில்லிங்',
      icon: FileSpreadsheet,
    },
    {
      id: 'profile',
      path: '/profile',
      labelEn: 'Mandi Profile & Settings',
      labelTa: 'மண்டி சுயவிவரம் & அமைப்புகள்',
      icon: Store,
    },
  ];

  const workforceItems: NavItem[] = [
    {
      id: 'employee-details',
      path: '/workforce/employee-details',
      labelEn: 'Employee Details (RBAC)',
      labelTa: 'பணியாளர் விவரம் (RBAC)',
      icon: UserCheck,
    },
    {
      id: 'attendance',
      path: '/workforce/attendance',
      labelEn: 'Daily Shift Attendance',
      labelTa: 'ஷிப்ட் வருகை பதிவு',
      icon: CalendarCheck,
    },
    {
      id: 'advances',
      path: '/workforce/advances',
      labelEn: 'Staff Cash Advances',
      labelTa: 'ரொக்க அட்வான்ஸ்',
      icon: WalletCards,
    },
    {
      id: 'salary-payroll',
      path: '/workforce/salary-payroll',
      labelEn: 'Salary & Payroll Engine',
      labelTa: 'சம்பளம் & பேரோல்',
      icon: ReceiptText,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 lg:static w-72 lg:w-72 flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out bg-[#021812] text-white border-r border-emerald-950/80 shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Card: Manager Profile & Settings (Matches image exactly) */}
      <div className="p-3.5 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <div
          onClick={() => handleNav('/profile')}
          className="flex items-center justify-between flex-1 hover:opacity-95 transition-opacity cursor-pointer group pr-2"
          title="Click to view Mandi profile & settings"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs uppercase shadow-md shadow-amber-950/40 ring-2 ring-emerald-400/20 group-hover:scale-105 transition-transform">
                {activeRole.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#021812] rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5">
                <span>{activeRole}</span>
                <span className="text-[10px] text-amber-400 font-bold">• Mandi</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium group-hover:text-amber-200 transition-colors">
                {language === 'ta' ? 'சுயவிவரம் & அமைப்புகள்' : 'Profile & Settings'}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              RBAC OK
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase">
              MAIN
            </span>
          </div>
        </div>

        {/* Mobile Close Drawer Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List with Core Operations & Workforce */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 sidebar-green-scroll">
        {/* Section 1: Core Mandi Operations */}
        <div>
          <div className="px-2 mb-2 flex items-center text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
              <span>{language === 'ta' ? 'மண்டி முதன்மை செயல்பாடுகள்' : 'CORE MANDI OPERATIONS'}</span>
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const allowed = hasPermission(item.path);
              const isActive =
                currentPath === item.path ||
                (item.subLinks && item.subLinks.some(s => s.path === currentPath));

              const primaryTitle = language === 'ta' ? item.labelTa : item.labelEn;
              const secondarySubtitle = language === 'ta' ? item.labelEn : item.labelTa;

              if (!allowed) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-300/30 text-xs font-medium cursor-not-allowed bg-black/15 border-l-4 border-transparent pl-2.5"
                    title={`Restricted for role: ${activeRole}`}
                  >
                    <div className="flex items-center gap-2.5 opacity-50 truncate min-w-0">
                      <item.icon className="w-4 h-4 text-emerald-400/40 shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="line-through block truncate">{primaryTitle}</span>
                        <span className="text-[10px] text-emerald-300/30 block truncate">{secondarySubtitle}</span>
                      </div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-emerald-400/40 shrink-0 ml-1" />
                  </div>
                );
              }

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all duration-150 text-left group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black shadow-lg shadow-emerald-950/60 border-l-4 border-amber-400 pl-2.5'
                        : 'text-emerald-100/90 hover:bg-white/10 hover:text-white font-bold border-l-4 border-transparent pl-2.5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <item.icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-emerald-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="text-xs font-bold truncate">
                          {primaryTitle}
                        </div>
                        <div
                          className={`text-[10px] font-normal truncate mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-emerald-300/70 group-hover:text-emerald-200'
                          }`}
                        >
                          {secondarySubtitle}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <ChevronDown className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>

                  {/* Nested Sublinks (e.g. Live Floor Calling Desk) */}
                  {item.subLinks && item.subLinks.length > 0 && (
                    <div className="ml-4 pl-3.5 border-l-2 border-emerald-800/80 space-y-1 pt-1 mt-0.5">
                      {item.subLinks.map(sub => {
                        const isSubActive = currentPath === sub.path;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => handleNav(sub.path)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-950/40'
                                : 'text-emerald-100/90 hover:bg-white/10 hover:text-white font-bold'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              <span className="truncate">
                                {language === 'ta' ? sub.labelTa : sub.labelEn}
                              </span>
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-black shrink-0 ml-1 ${
                                isSubActive
                                  ? 'bg-slate-950 text-amber-400'
                                  : 'bg-red-500 text-white animate-pulse'
                              }`}
                            >
                              LIVE
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Workforce & Staff Suite */}
        <div>
          <div className="px-2 mb-2 flex items-center text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
              <span>{language === 'ta' ? 'பணியாளர் மேலாண்மை' : 'WORKFORCE & STAFF SUITE'}</span>
            </span>
          </div>

          <nav className="space-y-1">
            {workforceItems.map(item => {
              const allowed = hasPermission(item.path);
              const isActive = currentPath === item.path;

              const primaryTitle = language === 'ta' ? item.labelTa : item.labelEn;
              const secondarySubtitle = language === 'ta' ? item.labelEn : item.labelTa;

              if (!allowed) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-300/30 text-xs font-medium cursor-not-allowed bg-black/15 border-l-4 border-transparent pl-2.5"
                    title={`Restricted for role: ${activeRole}`}
                  >
                    <div className="flex items-center gap-2.5 opacity-50 truncate min-w-0">
                      <item.icon className="w-4 h-4 text-emerald-400/40 shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="line-through block truncate">{primaryTitle}</span>
                        <span className="text-[10px] text-emerald-300/30 block truncate">{secondarySubtitle}</span>
                      </div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-emerald-400/40 shrink-0 ml-1" />
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all duration-150 text-left group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black shadow-lg shadow-emerald-950/60 border-l-4 border-amber-400 pl-2.5'
                      : 'text-emerald-100/90 hover:bg-white/10 hover:text-white font-bold border-l-4 border-transparent pl-2.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-emerald-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs font-bold truncate">
                        {primaryTitle}
                      </div>
                      <div
                        className={`text-[10px] font-normal truncate mt-0.5 ${
                          isActive ? 'text-emerald-100' : 'text-emerald-300/70 group-hover:text-emerald-200'
                        }`}
                      >
                        {secondarySubtitle}
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <ChevronDown className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 bg-black/25 text-[11px] text-emerald-200/80 flex items-center justify-between backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/40 flex items-center justify-center text-amber-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-xs leading-none">KVS Banana Mandi</div>
            <div className="text-[9px] text-emerald-300/70 font-medium mt-0.5">
              வாழைக்காய் & இலை மையம்
            </div>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10">
          v2.1
        </span>
      </div>
    </aside>
  );
};
