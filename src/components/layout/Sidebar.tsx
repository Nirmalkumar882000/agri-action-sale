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
  ShieldCheck,
  Store,
  BookOpen,
  X,
  Sparkles,
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
}

interface NavItem {
  id: string;
  path: string;
  labelEn: string;
  labelTa: string;
  icon: React.ComponentType<{ className?: string }>;
  subLinks?: NavSubLink[];
}

interface NavSection {
  titleEn: string;
  titleTa: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { language, activeRole, hasPermission } = useApp();

  const handleNav = (path: string) => {
    if (onClose) onClose();
    onNavigate(path);
  };

  const sections: NavSection[] = [
    {
      titleEn: 'CORE MANDI OPERATIONS',
      titleTa: 'மண்டி முதன்மை செயல்பாடுகள்',
      items: [
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
          labelTa: 'விவசாயிகள் (Farmers)',
          icon: Users,
        },
        {
          id: 'buyers',
          path: '/buyers',
          labelEn: 'Buyers (Wholesale Traders)',
          labelTa: 'வியாபாரிகள் (Traders)',
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
          labelEn: 'Mandi Floor Auction',
          labelTa: 'மண்டி நேரடி தரை ஏலம்',
          icon: Gavel,
          subLinks: [
            {
              path: '/offline/live',
              labelEn: 'Live Floor Calling Desk',
              labelTa: 'நேரலை கூவல் மேடை',
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
          labelEn: 'Reports & Billing',
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
      ],
    },
    {
      titleEn: 'WORKFORCE & STAFF SUITE',
      titleTa: 'பணியாளர் மேலாண்மை',
      items: [
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
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 lg:static w-72 lg:w-72 flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out bg-[#061e16] text-white border-r border-emerald-950/80 shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Profile Card: Supervisor / Manager Info */}
      <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-xs">
        <div
          onClick={() => handleNav('/profile')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
          title="Click to view Mandi profile & settings"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xs uppercase shadow-md shadow-amber-950/40 ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform">
              {activeRole.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#061e16] rounded-full animate-pulse"></span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5 truncate">
              <span>{activeRole}</span>
              <span className="text-[10px] text-amber-400 font-semibold">• Mandi</span>
            </div>
            <div className="text-[10px] text-emerald-300/70 font-medium truncate group-hover:text-amber-200 transition-colors">
              {language === 'ta' ? 'சுயவிவரம் & அமைப்புகள்' : 'Profile & Settings'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            RBAC OK
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav List with Clean Single-Line Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 sidebar-green-scroll">
        {sections.map(sec => (
          <div key={sec.titleEn} className="space-y-1">
            {/* Section Header */}
            <div className="px-2 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
              <span>{language === 'ta' ? sec.titleTa : sec.titleEn}</span>
            </div>

            {/* Nav Items List */}
            <nav className="space-y-1">
              {sec.items.map(item => {
                const allowed = hasPermission(item.path);
                const isActive =
                  currentPath === item.path ||
                  (item.subLinks && item.subLinks.some(s => s.path === currentPath));
                const label = language === 'ta' ? item.labelTa : item.labelEn;

                if (!allowed) {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-300/30 text-xs font-medium cursor-not-allowed bg-black/15 border-l-4 border-transparent pl-2.5"
                      title={`Restricted for role: ${activeRole}`}
                    >
                      <div className="flex items-center gap-2.5 opacity-50 truncate min-w-0">
                        <item.icon className="w-4 h-4 text-emerald-400/40 shrink-0" />
                        <span className="line-through truncate">{label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-emerald-400/40 shrink-0 ml-1" />
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => handleNav(item.path)}
                      className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 text-left group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black shadow-md shadow-emerald-950/40 border-l-4 border-amber-400 pl-2.5'
                          : 'text-emerald-100/90 hover:bg-white/8 hover:text-white font-semibold border-l-4 border-transparent pl-2.5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            isActive
                              ? 'bg-white/20 text-white shadow-xs'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isActive
                            ? 'text-white rotate-90'
                            : 'text-emerald-400/40 group-hover:text-white group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* Sublinks (e.g. Live Floor Calling Desk) */}
                    {item.subLinks && item.subLinks.length > 0 && (
                      <div className="ml-5 pl-3 border-l-2 border-emerald-800/60 space-y-1 pt-1 mt-0.5">
                        {item.subLinks.map(sub => {
                          const isSubActive = currentPath === sub.path;
                          const subLabel = language === 'ta' ? sub.labelTa : sub.labelEn;
                          return (
                            <button
                              key={sub.path}
                              onClick={() => handleNav(sub.path)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-left transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                  : 'text-emerald-200/90 hover:bg-white/8 hover:text-white'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="truncate">{subLabel}</span>
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
        ))}
      </div>

      {/* Footer Branding Info */}
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
