import React from 'react';
import { PayrollRecord, MandiProfile, Employee } from '../../types';
import { Printer, X } from 'lucide-react';

interface SalarySlipReceiptProps {
  payroll: PayrollRecord;
  employee?: Employee;
  profile: MandiProfile;
  onClose: () => void;
}

export const SalarySlipReceipt: React.FC<SalarySlipReceiptProps> = ({
  payroll,
  employee,
  profile,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Mandi Official Salary Slip / ஊதிய ரசீது
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Salary Slip */}
        <div className="p-8 bg-white font-mono text-slate-900 leading-tight print-chit-container space-y-4">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
            <h2 className="font-extrabold text-lg tracking-wider uppercase text-slate-900">
              {profile.shopName}
            </h2>
            <p className="text-xs font-semibold font-tamil text-slate-800">
              {profile.shopNameTamil}
            </p>
            <p className="text-[10px] text-slate-600">{profile.address}</p>
            <div className="inline-block px-3 py-0.5 bg-slate-100 rounded-sm text-[11px] font-bold tracking-widest mt-1">
              ** SALARY DISBURSEMENT SLIP / சம்பள சீட்டு ({payroll.payrollMonth}) **
            </div>
          </div>

          {/* Employee & Bank Info */}
          <div className="grid grid-cols-2 gap-3 text-xs py-2 border-b border-slate-300">
            <div className="space-y-1">
              <div>Employee Code: <strong className="font-mono">{payroll.employeeCode}</strong></div>
              <div>Staff Name: <strong className="font-sans font-bold">{payroll.employeeName}</strong></div>
              <div>Designation: <strong>{payroll.role}</strong></div>
            </div>
            <div className="text-right space-y-1">
              <div>Salary Month: <strong>{payroll.payrollMonth}</strong></div>
              <div>Disbursed On: <strong>{payroll.paidDate || 'Today'}</strong></div>
              <div>Paid From: <strong>{payroll.paidFromAccount || 'Cash Drawer'}</strong></div>
            </div>
          </div>

          {/* Shift Attendance Metrics */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Days Worked</span>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {payroll.daysPresent + payroll.daysHalf * 0.5} Days
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Half Days</span>
              <div className="font-mono font-bold text-amber-700 text-sm">{payroll.daysHalf}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Absent Days</span>
              <div className="font-mono font-bold text-red-700 text-sm">{payroll.daysAbsent}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">OT Hours</span>
              <div className="font-mono font-bold text-emerald-800 text-sm">
                {payroll.overtimeHours} hrs
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Earnings */}
            <div className="p-3 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1 text-[11px] uppercase">
                1. Earnings / வருவாய்
              </h4>
              <div className="flex justify-between">
                <span>Base Wage Earned:</span>
                <span className="font-mono font-bold">
                  ₹{(payroll.grossSalary - payroll.overtimePay).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Overtime (OT) Pay:</span>
                <span className="font-mono font-bold">₹{payroll.overtimePay.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-900">
                <span>Gross Salary:</span>
                <span className="font-mono">₹{payroll.grossSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-3 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1 text-[11px] uppercase">
                2. Deductions / பிடித்தங்கள்
              </h4>
              <div className="flex justify-between text-purple-900">
                <span>Advance Recovery:</span>
                <span className="font-mono font-bold">
                  (-) ₹{payroll.advanceDeduction.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Other Deductions:</span>
                <span className="font-mono">₹{payroll.otherDeduction}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-red-700">
                <span>Total Deductions:</span>
                <span className="font-mono">₹{payroll.advanceDeduction.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-600 flex justify-between items-center text-sm font-black text-emerald-950">
            <span className="font-tamil">நிகர சம்பள தொகை (Net Payable):</span>
            <span className="text-xl font-mono text-emerald-800">
              ₹{payroll.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-8 pb-2 flex justify-between text-[11px] text-slate-600 font-sans">
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span>பணியாளர் கையொப்பம்<br />(Employee Sign)</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>For {profile.shopName}<br />(Authorized Sign)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
