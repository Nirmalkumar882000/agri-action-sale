import React from 'react';
import { CashAdvance, MandiProfile, Employee } from '../../types';
import { Printer, X } from 'lucide-react';

interface AdvanceReceiptProps {
  advance: CashAdvance;
  employee?: Employee;
  profile: MandiProfile;
  onClose: () => void;
}

export const AdvanceReceipt: React.FC<AdvanceReceiptProps> = ({
  advance,
  employee,
  profile,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Staff Cash Advance Voucher
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-sm">
              {advance.voucherNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Advance Voucher */}
        <div className="p-6 bg-white font-mono text-slate-900 leading-tight print-chit-container space-y-4">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
            <h2 className="font-extrabold text-base tracking-wider uppercase text-slate-900">
              {profile.shopName}
            </h2>
            <p className="text-xs font-semibold font-tamil text-slate-800">
              {profile.shopNameTamil}
            </p>
            <p className="text-[10px] text-slate-600">{profile.address}</p>
            <div className="inline-block px-3 py-0.5 bg-slate-100 rounded-sm text-[11px] font-bold tracking-widest mt-1">
              ** STAFF ADVANCE VOUCHER / அட்வான்ஸ் ரசீது **
            </div>
          </div>

          {/* Voucher Details */}
          <div className="text-xs space-y-2 py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>Voucher No: <strong className="font-mono">{advance.voucherNumber}</strong></span>
              <span>Date: <strong>{advance.date}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Employee: <strong className="font-sans font-bold">{advance.employeeName}</strong></span>
              <span>Role: <strong>{employee?.role || 'Staff'}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Disbursed From: <strong>{advance.disbursementAccount}</strong></span>
              <span>Reason: <strong>{advance.reason}</strong></span>
            </div>
            {advance.remarks && (
              <div className="text-[11px] text-slate-500 italic">
                Notes: {advance.remarks}
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase">
              Advance Cash Disbursed
            </span>
            <div className="text-2xl font-black text-emerald-800 font-mono">
              ₹{advance.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-emerald-700 italic">
              Amount to be recovered in upcoming monthly payroll deduction.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 pb-2 flex justify-between text-[11px] text-slate-600 font-sans">
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span>பணியாளர் கையொப்பம்<br />(Staff Sign)</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span>Mandi Cashier<br />(Authorized Sign)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
