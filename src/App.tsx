import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AccessDenied } from './components/common/AccessDenied';

// Views
import { DashboardView } from './views/DashboardView';
import { SellersView } from './views/SellersView';
import { BuyersView } from './views/BuyersView';
import { ProductsView } from './views/ProductsView';
import { OfflineAuctionView } from './views/OfflineAuctionView';
import { OfflineLiveDeskView } from './views/OfflineLiveDeskView';
import { OnlineAuctionView } from './views/OnlineAuctionView';
import { ReportsView } from './views/ReportsView';
import { LedgerView } from './views/LedgerView';
import { ProfileView } from './views/ProfileView';
import { WorkforceEmployeesView } from './views/WorkforceEmployeesView';
import { WorkforceAttendanceView } from './views/WorkforceAttendanceView';
import { WorkforceAdvancesView } from './views/WorkforceAdvancesView';
import { WorkforceSalaryPayrollView } from './views/WorkforceSalaryPayrollView';

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { hasPermission, theme, isLoading, loadingMessage } = useApp();

  const isAllowed = hasPermission(currentPath);

  const renderActiveView = () => {
    if (!isAllowed) {
      return <AccessDenied onGoHome={() => setCurrentPath('/dashboard')} />;
    }

    switch (currentPath) {
      case '/dashboard':
        return <DashboardView onNavigate={setCurrentPath} />;
      case '/sellers':
        return <SellersView onNavigate={setCurrentPath} />;
      case '/buyers':
        return <BuyersView onNavigate={setCurrentPath} />;
      case '/products':
        return <ProductsView onNavigate={setCurrentPath} />;
      case '/offline':
        return <OfflineAuctionView onNavigate={setCurrentPath} />;
      case '/offline/live':
        return <OfflineLiveDeskView onNavigate={setCurrentPath} />;
      case '/online':
        return <OnlineAuctionView onNavigate={setCurrentPath} />;
      case '/reports':
        return <ReportsView onNavigate={setCurrentPath} />;
      case '/ledger':
        return <LedgerView onNavigate={setCurrentPath} />;
      case '/profile':
        return <ProfileView onNavigate={setCurrentPath} />;
      case '/workforce/employee-details':
        return <WorkforceEmployeesView />;
      case '/workforce/attendance':
        return <WorkforceAttendanceView />;
      case '/workforce/advances':
        return <WorkforceAdvancesView />;
      case '/workforce/salary-payroll':
        return <WorkforceSalaryPayrollView />;
      default:
        return <DashboardView onNavigate={setCurrentPath} />;
    }
  };

  return (
    <div className={`h-screen max-h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      <Navbar
        onNavigate={setCurrentPath}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile Sidebar Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
            aria-hidden="true"
          />
        )}
        <Sidebar
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 h-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Real-Time Mandi Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900/50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
              <span className="text-2xl animate-bounce">🍌</span>
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                KVS Banana Mandi Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {loadingMessage || 'Processing Mandi operation...'}
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
