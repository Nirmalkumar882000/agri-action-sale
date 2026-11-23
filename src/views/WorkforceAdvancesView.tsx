import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CashAdvance } from '../types';
import {
  WalletCards,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Landmark,
  X,
  FileText,
} from 'lucide-react';
import { AdvanceReceipt } from '../components/receipts/AdvanceReceipt';

export const WorkforceAdvancesView: React.FC = () => {
  const { t, language, profile, employees, advances, recordCashAdvance } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CashAdvance | null>(null);

  // New Advance Form State
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    amount: 3000,
    disbursementAccount: 'Cash Drawer' as 'Cash Drawer' | 'HDFC Current' | 'Axis Bank',
    reason: 'Festival Advance' as 'Festival Advance' | 'Medical Emergency' | 'Family Travel' | 'Personal',
    remarks: '',
  });

  // Keep employeeId synchronized when employees update
  React.useEffect(() => {
    if (employees.length > 0 && (!formData.employeeId || !employees.some(e => e.id === formData.employeeId))) {
      setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees]);

  const totalGiven = advances.reduce((sum, a) => sum + a.amount, 0);
  const totalRecovered = advances
    .filter(a => a.status === 'Recovered')
    .reduce((sum, a) => sum + a.amount, 0);
  const netOutstanding = totalGiven - totalRecovered;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === formData.employeeId);
    if (!emp) {
      alert('Please select an employee');
      return;
    }

    const newAdv = recordCashAdvance({
      date: new Date().toISOString().slice(0, 10),
      employeeId: emp.id,
      employeeName: emp.name,
      amount: Number(formData.amount),
      disbursementAccount: formData.disbursementAccount,
      reason: formData.reason,
      remarks: formData.remarks,
      status: 'Active',
    });

    setShowAddModal(false);
    setSelectedReceipt(newAdv);
  };

  const filteredAdvances = advances.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.employeeName.toLowerCase().includes(q) ||
      a.voucherNumber.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('staffAdvances')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('advancesSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recordAdvance')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalAdvancesDisbursed')}</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers">
            ₹{totalGiven.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across all staff</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('totalRecovered')}</div>
          <div className="text-xl font-black text-emerald-800 font-mono-numbers">
            ₹{totalRecovered.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Deducted in past payrolls</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold mb-1">{t('netAdvancesOutstanding')}</div>
          <div className="text-xl font-black text-amber-900 font-mono-numbers">
            ₹{netOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Auto-queued for next wage run
          </div>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search voucher, staff name, purpose..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Active Records: <strong className="text-slate-900">{filteredAdvances.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Disbursed Date</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Purpose / Reason</th>
                <th className="py-3 px-4">Disbursement Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.map(adv => (
                <tr key={adv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{adv.voucherNumber}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{adv.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{adv.employeeName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700">{adv.reason}</span>
                    {adv.remarks && (
                      <span className="block text-[10px] text-slate-400 italic">{adv.remarks}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{adv.disbursementAccount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{adv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        adv.status === 'Recovered'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {adv.status === 'Recovered' ? 'Recovered in Payroll' : 'Active (Pending)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(adv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-[11px] font-bold transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Voucher</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Cash Advance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletCards className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">{t('recordAdvance')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Select Staff Member <span className="text-red-500">*</span>
                </label>
                {employees.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300 text-xs">
                    No employees registered yet. Add staff members in Workforce Employees first or click "Demo Data".
                  </div>
                ) : (
                  <select
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 font-bold"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.code} - {emp.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Cash Advance Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold text-lg text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Disbursement Account</label>
                <select
                  value={formData.disbursementAccount}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      disbursementAccount: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Cash Drawer">Mandi Cash Drawer</option>
                  <option value="HDFC Current">HDFC Current Account</option>
                  <option value="Axis Bank">Axis Mandi Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason / Purpose</label>
                <select
                  value={formData.reason}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      reason: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Festival Advance">Festival Advance (Deepavali / Pongal)</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Family Travel">Family Travel</option>
                  <option value="Personal">Personal Loan / Advance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Notes for ledger entry..."
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Disburse & Print Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advance Voucher Receipt Modal */}
      {selectedReceipt && (
        <AdvanceReceipt
          advance={selectedReceipt}
          employee={employees.find(e => e.id === selectedReceipt.employeeId)}
          profile={profile}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
