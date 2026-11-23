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
  Sparkles,
  ShieldCheck,
  Store,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { t, language, activeRole, activeBranch, hasPermission } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: t('navDashboard'),
      labelTamil: 'மண்டி முகப்பு பலகை',
      icon: LayoutDashboard,
    },
    {
      id: 'sellers',
      path: '/sellers',
      label: t('navSellers'),
      labelTamil: 'விவசாயிகள் (Farmers)',
      icon: Users,
    },
    {
      id: 'buyers',
      path: '/buyers',
      label: t('navBuyers'),
      labelTamil: 'வியாபாரிகள் (Traders)',
      icon: Building2,
    },
    {
      id: 'products',
      path: '/products',
      label: t('navProducts'),
      labelTamil: 'விளைபொருட்கள் & ரகங்கள்',
      icon: PackageCheck,
    },
    {
      id: 'offline',
      path: '/offline',
      label: t('navOfflineAuction'),
      labelTamil: 'மண்டி நேரடி தரை ஏலம்',
      icon: Gavel,
      subLinks: [
        {
          path: '/offline/live',
          label: t('navOfflineLive'),
          labelTamil: 'நேரலை கூவல் மேடை',
          highlight: true,
        },
      ],
    },
    {
      id: 'online',
      path: '/online',
      label: t('navOnlineAuction'),
      labelTamil: 'டிஜிட்டல் ஆன்லைன் ஏலம்',
      icon: Radio,
    },
    {
      id: 'reports',
      path: '/reports',
      label: t('navReports'),
      labelTamil: 'பில்லிங் & ரசீதுகள்',
      icon: FileSpreadsheet,
    },
    {
      id: 'profile',
      path: '/profile',
      label: 'Mandi Profile & Settings',
      labelTamil: 'மண்டி சுயவிவரம் & அமைப்புகள்',
      icon: Store,
    },
  ];

  const workforceItems = [
    {
      id: 'employee-details',
      path: '/workforce/employee-details',
      label: t('navEmployees'),
      labelTamil: 'பணியாளர் விவரம் (RBAC)',
      icon: UserCheck,
    },
    {
      id: 'attendance',
      path: '/workforce/attendance',
      label: t('navAttendance'),
      labelTamil: 'ஷிப்ட் வருகை பதிவு',
      icon: CalendarCheck,
    },
    {
      id: 'advances',
      path: '/workforce/advances',
      label: t('navAdvances'),
      labelTamil: 'ரொக்க அட்வான்ஸ்',
      icon: WalletCards,
    },
    {
      id: 'salary-payroll',
      path: '/workforce/salary-payroll',
      label: t('navSalaryPayroll'),
      labelTamil: 'சம்பளம் & பேரோல்',
      icon: ReceiptText,
    },
  ];

  return (
    <aside className="w-64 lg:w-72 flex flex-col shrink-0 select-none transition-colors duration-300 bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#022c22] dark:from-[#022c22] dark:via-slate-950 dark:to-slate-950 text-white border-r border-emerald-800/40 dark:border-slate-800/80 shadow-2xl z-30">
      {/* Current User Role Pill & Status Card (Click to open Profile) */}
      <div
        onClick={() => onNavigate('/profile')}
        className="p-3.5 border-b border-white/10 dark:border-slate-800/80 bg-black/25 dark:bg-slate-900/50 backdrop-blur-xs hover:bg-white/10 dark:hover:bg-slate-900/80 transition-all cursor-pointer group"
        title={language === 'ta' ? 'மண்டி சுயவிவரம் மற்றும் அமைப்புகளை திறக்க கிளிக் செய்யவும்' : 'Click to view Mandi profile & statutory settings'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xs uppercase shadow-md shadow-amber-950/40 ring-2 ring-emerald-400/30 group-hover:scale-105 transition-transform">
                {activeRole.slice(0, 2)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-950 rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5">
                <span>{activeRole}</span>
                <span className="text-[10px] text-amber-300 font-semibold">• Mandi</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 dark:text-emerald-400/80 font-medium group-hover:text-amber-200 transition-colors">
                {language === 'ta' ? 'சுயவிவரம் & அமைப்புகள்' : 'Profile & Settings'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              RBAC OK
            </span>
            <span
              className="text-[8px] font-mono text-emerald-300/60 dark:text-slate-500 uppercase truncate max-w-[90px]"
              title={activeBranch}
            >
              {activeBranch.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav List with Green Scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 sidebar-green-scroll">
        {/* Core Operations Section */}
        <div>
          <div className="px-2 mb-2 flex items-center text-[10px] font-black uppercase tracking-wider text-emerald-300/80 dark:text-emerald-400/70">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {language === 'ta' ? 'மண்டி முதன்மை செயல்பாடுகள்' : 'Core Mandi Operations'}
            </span>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const allowed = hasPermission(item.path);
              const isActive =
                currentPath === item.path ||
                (item.subLinks && item.subLinks.some(s => s.path === currentPath));

              if (!allowed) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-200/30 dark:text-slate-600 text-xs font-medium cursor-not-allowed bg-black/15 dark:bg-slate-900/30 border-l-4 border-transparent pl-2.5"
                    title={`Restricted for role: ${activeRole}`}
                  >
                    <div className="flex items-center gap-2.5 opacity-60">
                      <item.icon className="w-4 h-4 text-emerald-300/30 dark:text-slate-600" />
                      <span className="line-through decoration-emerald-500/30">
                        {language === 'ta' ? item.labelTamil : item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono uppercase text-emerald-300/30">Locked</span>
                      <Lock className="w-3.5 h-3.5 text-emerald-300/40 dark:text-slate-600" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-left group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 dark:from-emerald-700 dark:via-emerald-600 dark:to-emerald-700 text-white font-black shadow-lg shadow-emerald-950/60 border-l-4 border-amber-400 pl-2.5'
                        : 'text-emerald-100/90 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-900/60 hover:text-white font-semibold border-l-4 border-transparent pl-2.5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-amber-300 drop-shadow-xs'
                            : 'text-emerald-300/80 dark:text-emerald-400 group-hover:text-amber-300'
                        }`}
                      />
                      <span>{language === 'ta' ? item.labelTamil : item.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? 'text-white rotate-90'
                          : 'text-emerald-400/40 dark:text-slate-600 group-hover:text-white group-hover:translate-x-0.5'
                      }`}
                    />
                  </button>

                  {/* Sub links like Live Floor Desk */}
                  {item.subLinks && item.subLinks.length > 0 && (
                    <div className="ml-4 pl-3.5 border-l-2 border-emerald-700/60 dark:border-slate-800 space-y-1 pt-1 mt-0.5">
                      {item.subLinks.map(sub => {
                        const isSubActive = currentPath === sub.path;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => onNavigate(sub.path)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-950/40 scale-[1.02]'
                                : 'text-emerald-100/90 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-900 hover:text-white font-bold'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span
                                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                    isSubActive ? 'bg-red-600' : 'bg-red-400'
                                  } opacity-75`}
                                ></span>
                                <span
                                  className={`relative inline-flex rounded-full h-2 w-2 ${
                                    isSubActive ? 'bg-red-600' : 'bg-red-500'
                                  }`}
                                ></span>
                              </span>
                              <span>{language === 'ta' ? sub.labelTamil : sub.label}</span>
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
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

        {/* Workforce Section */}
        <div>
          <div className="px-2 mb-2 flex items-center text-[10px] font-black uppercase tracking-wider text-emerald-300/80 dark:text-emerald-400/70">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {language === 'ta' ? 'பணியாளர் & சம்பள மேலாண்மை' : 'Workforce & Staff Suite'}
            </span>
          </div>
          <nav className="space-y-1">
            {workforceItems.map(item => {
              const allowed = hasPermission(item.path);
              const isActive = currentPath === item.path;

              if (!allowed) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-200/30 dark:text-slate-600 text-xs font-medium cursor-not-allowed bg-black/15 dark:bg-slate-900/30 border-l-4 border-transparent pl-2.5"
                    title={`Restricted for role: ${activeRole}`}
                  >
                    <div className="flex items-center gap-2.5 opacity-60">
                      <item.icon className="w-4 h-4 text-emerald-300/30 dark:text-slate-600" />
                      <span className="line-through decoration-emerald-500/30">
                        {language === 'ta' ? item.labelTamil : item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono uppercase text-emerald-300/30">Locked</span>
                      <Lock className="w-3.5 h-3.5 text-emerald-300/40 dark:text-slate-600" />
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-left group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 dark:from-emerald-700 dark:via-emerald-600 dark:to-emerald-700 text-white font-black shadow-lg shadow-emerald-950/60 border-l-4 border-amber-400 pl-2.5'
                      : 'text-emerald-100/90 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-900/60 hover:text-white font-semibold border-l-4 border-transparent pl-2.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-amber-300 drop-shadow-xs'
                          : 'text-emerald-300/80 dark:text-emerald-400 group-hover:text-amber-300'
                      }`}
                    />
                    <span>{language === 'ta' ? item.labelTamil : item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'text-white rotate-90'
                        : 'text-emerald-400/40 dark:text-slate-600 group-hover:text-white group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 dark:border-slate-800 bg-black/25 dark:bg-slate-950/80 text-[11px] text-emerald-200/80 dark:text-slate-400 flex items-center justify-between backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/40 dark:bg-emerald-900/50 flex items-center justify-center text-amber-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-xs leading-none">KVS Banana Mandi</div>
            <div className="text-[9px] text-emerald-300/70 dark:text-slate-500 font-medium mt-0.5">
              வாழைக்காய் & இலை மையம்
            </div>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 dark:bg-slate-800 text-emerald-200 dark:text-slate-400 border border-white/10 dark:border-slate-700">
          v2.1
        </span>
      </div>
    </aside>
  );
};