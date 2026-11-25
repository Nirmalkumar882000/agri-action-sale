import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  User,
  Bell,
  Users,
  ShoppingCart,
  Boxes,
  Archive,
  Gavel,
  Radio,
  FileText,
  Scale,
  ShoppingBag,
  BarChart3,
  Tag,
  Sprout,
  X,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  labelTamil?: string;
  icon: React.ComponentType<{ className?: string }>;
  isMatching?: (path: string) => boolean;
}

interface NavSection {
  title: string;
  titleTamil?: string;
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
      title: 'MAIN',
      titleTamil: 'முதன்மை',
      items: [
        {
          id: 'dashboard',
          path: '/dashboard',
          label: 'Dashboard',
          labelTamil: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'profile',
          path: '/profile',
          label: 'Profile',
          labelTamil: 'Profile',
          icon: User,
        },
        {
          id: 'notifications',
          path: '/dashboard',
          label: 'Notifications',
          labelTamil: 'Notifications',
          icon: Bell,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      titleTamil: 'மேலாண்மை',
      items: [
        {
          id: 'suppliers',
          path: '/sellers',
          label: 'Suppliers',
          labelTamil: 'Suppliers',
          icon: Users,
        },
        {
          id: 'buyers',
          path: '/buyers',
          label: 'Buyers',
          labelTamil: 'Buyers',
          icon: ShoppingCart,
        },
        {
          id: 'products',
          path: '/products',
          label: 'Products',
          labelTamil: 'Products',
          icon: Boxes,
        },
        {
          id: 'inventory-store',
          path: '/products',
          label: 'Inventory Store',
          labelTamil: 'Inventory Store',
          icon: Archive,
        },
        {
          id: 'manual-auction',
          path: '/offline',
          label: 'Manual Auction',
          labelTamil: 'Manual Auction',
          icon: Gavel,
          isMatching: path => path === '/offline' || path === '/offline/live',
        },
        {
          id: 'auction-request',
          path: '/online',
          label: 'Auction Request',
          labelTamil: 'Auction Request',
          icon: Radio,
        },
        {
          id: 'fixed-price-request',
          path: '/online',
          label: 'Fixed Price Request',
          labelTamil: 'Fixed Price Request',
          icon: FileText,
        },
        {
          id: 'ledger',
          path: '/ledger',
          label: 'Ledger',
          labelTamil: 'Ledger',
          icon: Scale,
        },
        {
          id: 'customer-orders',
          path: '/ledger',
          label: 'Customer Orders',
          labelTamil: 'Customer Orders',
          icon: ShoppingBag,
        },
      ],
    },
    {
      title: 'ANALYTICS',
      titleTamil: 'பகுப்பாய்வு',
      items: [
        {
          id: 'reports',
          path: '/reports',
          label: 'Reports',
          labelTamil: 'Reports',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'SALES',
      titleTamil: 'விற்பனை',
      items: [
        {
          id: 'fixed-price-sale',
          path: '/offline',
          label: 'Fixed Price Sale',
          labelTamil: 'Fixed Price Sale',
          icon: Tag,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 lg:static w-64 lg:w-64 flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out bg-[#0e482d] text-white border-r border-emerald-900/60 shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header (Matching Green-Agro in Image) */}
      <div className="p-4 flex items-center justify-between border-b border-emerald-800/40 bg-black/10">
        <div
          onClick={() => handleNav('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-white tracking-tight leading-tight truncate">
              Green-Agro
            </h1>
            <p className="text-[11px] text-emerald-300/80 truncate font-medium">
              Agent Marketplace Portal
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
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

      {/* Nav List with Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 sidebar-green-scroll">
        {sections.map(sec => (
          <div key={sec.title} className="space-y-1">
            {/* Section Header (MAIN, MANAGEMENT, ANALYTICS, SALES) */}
            <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-emerald-300/60">
              {sec.title}
            </div>

            {/* Section Nav Items */}
            <nav className="space-y-0.5">
              {sec.items.map(item => {
                const allowed = hasPermission(item.path);
                const isActive = item.isMatching
                  ? item.isMatching(currentPath)
                  : currentPath === item.path;

                if (!allowed) {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl text-emerald-300/30 text-xs font-medium cursor-not-allowed"
                      title={`Restricted for role: ${activeRole}`}
                    >
                      <div className="flex items-center gap-3 opacity-50">
                        <item.icon className="w-4 h-4 text-emerald-400/40" />
                        <span className="line-through">{item.label}</span>
                      </div>
                      <Lock className="w-3 h-3 text-emerald-400/30" />
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.path)}
                    className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-800/60 text-white font-black shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-6 before:bg-emerald-400 before:rounded-r-full'
                        : 'text-emerald-100/80 hover:bg-emerald-800/30 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                        isActive ? 'text-white' : 'text-emerald-300/80 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info (Matching Green-Agro bottom) */}
      <div className="p-3 border-t border-emerald-800/40 bg-black/15 text-[11px] text-emerald-300/70 flex items-center justify-between">
        <span className="font-mono text-[10px] text-emerald-300/80 font-medium">
          v1.0 • Agent Portal
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online"></span>
      </div>
    </aside>
  );
};
