import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PayrollRecord } from '../types';
import {
  ReceiptText,
  Calendar,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { SalarySlipReceipt } from '../components/receipts/SalarySlipReceipt';

export const WorkforceSalaryPayrollView: React.FC = () => {
  const {
    t,
    language,
    profile,
    employees,
    attendance,
    advances,
    payrolls,
    generateMonthlyPayroll,
    processSalaryPayment,
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState('2026-11');
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [payingRecord, setPayingRecord] = useState<PayrollRecord | null>(null);
  const [paymentAccount, setPaymentAccount] = useState<'Cash Drawer' | 'HDFC Current' | 'Axis Bank'>('Cash Drawer');

  // Generate or load payroll records for currentMonth on mount / month change
  useEffect(() => {
    generateMonthlyPayroll(currentMonth);
  }, [currentMonth, attendance, advances]);

  const monthRecords = payrolls.filter(p => p.payrollMonth === currentMonth);

  const totalGrossPayroll = monthRecords.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalAdvancesDeducted = monthRecords.reduce((sum, p) => sum + p.advanceDeduction, 0);
  const totalNetDisbursement = monthRecords.reduce((sum, p) => sum + p.netSalary, 0);

  const handleConfirmPayment = () => {
    if (!payingRecord) return;
    processSalaryPayment(payingRecord.id, paymentAccount);
    setPayingRecord(null);
  };

  const changeMonth = (delta: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    let newM = m + delta;
    let newY = y;
    if (newM > 12) {
      newM = 1;
      newY++;
    } else if (newM < 1) {
      newM = 12;
      newY--;
    }
    setCurrentMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('salaryPayrollEngine')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('payrollSubtitle')}</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs font-black text-slate-800 px-2">
            {new Date(currentMonth + '-01').toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">Monthly Gross Wage Bill</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">
            ₹{totalGrossPayroll.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Base Wages + Overtime Pay</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">Advances Auto-Deducted</div>
          <div className="text-xl font-black text-purple-900 font-mono-numbers">
            ₹{totalAdvancesDeducted.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Recovered into Mandi Cash</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">Net Salary Disbursement</div>
          <div className="text-xl font-black text-emerald-800 font-mono-numbers">
            ₹{totalNetDisbursement.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Approved for Payout</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Monthly Automated Wage Roll ({monthRecords.length} Staff Members)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Based on 26 mandi working days & live shift attendance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Days Worked</th>
                <th className="py-3 px-4 text-center">OT Pay</th>
                <th className="py-3 px-4 text-right">Gross Salary</th>
                <th className="py-3 px-4 text-right">Advance Recovery</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No payroll records for this month. Add staff members in Workforce Employees first or click "Demo Data".
                  </td>
                </tr>
              ) : (
                monthRecords.map(rec => {
                  const isPaid = rec.paymentStatus === 'Processed';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{rec.employeeCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.employeeName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-700">
                          {rec.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-slate-800">{rec.daysPresent + rec.daysHalf * 0.5}</span>
                        <span className="text-[10px] text-slate-400 block">
                          (P: {rec.daysPresent}, HD: {rec.daysHalf}, A: {rec.daysAbsent})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-800">
                        ₹{rec.overtimePay.toLocaleString()} ({rec.overtimeHours}h)
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{rec.grossSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-900">
                        {rec.advanceDeduction > 0 ? `(-) ₹${rec.advanceDeduction.toLocaleString()}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                        ₹{rec.netSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                        >
                          {isPaid ? 'Processed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isPaid ? (
                            <button
                              onClick={() => setPayingRecord(rec)}
                              className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs"
                            >
                              Pay
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">Paid</span>
                          )}
                          <button
                            onClick={() => setSelectedSlip(rec)}
                            className="p-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Print Official Salary Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payment Modal */}
      {payingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{t('processPayment')}</h3>
              </div>
              <button
                onClick={() => setPayingRecord(null)}
                className="p-1 rounded-md text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <strong className="text-slate-800">{payingRecord.employeeName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Wage:</span>
                  <span className="font-mono">₹{payingRecord.grossSalary.toLocaleString()}</span>
                </div>
                {payingRecord.advanceDeduction > 0 && (
                  <div className="flex justify-between text-purple-900 font-bold">
                    <span>Advance Recovery Deducted:</span>
                    <span className="font-mono">(-) ₹{payingRecord.advanceDeduction.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-emerald-800">
                  <span>Net Payout Amount:</span>
                  <span className="font-mono">₹{payingRecord.netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Disburse From Mandi Account:
                </label>
                <select
                  value={paymentAccount}
                  onChange={e => setPaymentAccount(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="Cash Drawer">Mandi Yard Cash Drawer</option>
                  <option value="HDFC Current">HDFC Mandi Current Account</option>
                  <option value="Axis Bank">Axis Agricultural Payout Account</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setPayingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Confirm Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Slip Print Modal */}
      {selectedSlip && (
        <SalarySlipReceipt
          payroll={selectedSlip}
          employee={employees.find(e => e.id === selectedSlip.employeeId)}
          profile={profile}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </div>
  );
};
