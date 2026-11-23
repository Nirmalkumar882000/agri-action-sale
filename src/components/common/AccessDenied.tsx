import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldX, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  onGoHome: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onGoHome }) => {
  const { t, activeRole, language } = useApp();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900">{t('accessDenied')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('accessDeniedDesc')}</p>
        </div>

        <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-800">
          <span className="font-bold">Current Assigned Role: </span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-sm border border-red-200">
            {activeRole}
          </span>
          <p className="text-[11px] text-red-600 mt-1">
            {language === 'ta'
              ? 'மேல் பக்கப்பட்டியில் உள்ள Role மாற்றியை பயன்படுத்தி மேலாளர் (Manager) நிலைக்கு மாற்றவும்.'
              : 'Tip: Switch role to "Manager" in the top bar to inspect this restricted module.'}
          </p>
        </div>

        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முகப்பு பலகைக்கு திரும்புக' : 'Return to Dashboard'}</span>
        </button>
      </div>
    </div>
  );
};
