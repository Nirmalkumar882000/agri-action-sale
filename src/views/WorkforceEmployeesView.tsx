import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee, Role } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../utils/rbac';
import {
  UserCheck,
  UserPlus,
  Key,
  Lock,
  Unlock,
  ShieldAlert,
  Search,
  X,
  Building2,
  Check,
  Calendar,
  Briefcase,
} from 'lucide-react';

export const WorkforceEmployeesView: React.FC = () => {
  const {
    t,
    language,
    employees,
    addEmployee,
    updateEmployee,
    resetEmployeePassword,
    profile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetPassEmp, setResetPassEmp] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('Agent@12970');

  // Add Employee Form State
  const [formData, setFormData] = useState({
    name: '',
    nameTamil: '',
    mobile: '',
    role: 'Supervisor' as Role,
    joiningDate: new Date().toISOString().slice(0, 10),
    salaryBasis: 'Monthly' as 'Monthly' | 'Daily' | 'Weekly',
    baseSalary: 28000,
    overtimeRatePerHour: 150,
    portalAccess: true,
    password: 'Agent@12970',
    permissions: ROLE_DEFAULT_PERMISSIONS['Supervisor'],
    branches: ['Main Mandi Yard 1'],
  });

  const handleRoleChange = (selectedRole: Role) => {
    const isPortalAllowed = ['Manager', 'Supervisor', 'Auctioneer', 'Accountant'].includes(selectedRole);
    setFormData({
      ...formData,
      role: selectedRole,
      portalAccess: isPortalAllowed,
      permissions: ROLE_DEFAULT_PERMISSIONS[selectedRole] || ['dashboard'],
    });
  };

  const togglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== perm),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm],
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert('Please enter Name and Mobile');
      return;
    }

    addEmployee({
      code: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      name: formData.name,
      nameTamil: formData.nameTamil || formData.name,
      mobile: formData.mobile,
      role: formData.role,
      joiningDate: formData.joiningDate,
      salaryBasis: formData.salaryBasis,
      baseSalary: Number(formData.baseSalary),
      overtimeRatePerHour: Number(formData.overtimeRatePerHour),
      portalAccess: formData.portalAccess,
      password: formData.password,
      permissions: formData.permissions,
      branches: formData.branches,
    });

    setShowAddModal(false);
  };

  const filteredEmployees = employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.mobile.includes(q)
    );
  });

  const allAvailablePermissions = [
    { key: 'dashboard', label: 'Dashboard & KPIs' },
    { key: 'sellers', label: 'Sellers (Farmers)' },
    { key: 'buyers', label: 'Buyers (Traders)' },
    { key: 'products', label: 'Banana Varieties & Inward Lots' },
    { key: 'auction', label: 'Auctions (Floor & Online)' },
    { key: 'reports', label: 'Reports & Settlement Patti' },
    { key: 'workforce', label: 'Workforce & Payroll' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('employeeDetails')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('employeeSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addEmployee')}</span>
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff by name, code, role, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Active Staff: <strong className="text-slate-900">{employees.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">{t('employeeCode')}</th>
                <th className="py-3 px-4">{t('fullName')}</th>
                <th className="py-3 px-4">{t('assignedRole')}</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Salary Basis</th>
                <th className="py-3 px-4 text-right">{t('baseWage')}</th>
                <th className="py-3 px-4 text-center">{t('portalAccess')}</th>
                <th className="py-3 px-4">Assigned Permissions</th>
                <th className="py-3 px-4 text-center">Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{emp.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    {emp.nameTamil && (
                      <div className="text-[10px] text-slate-500 font-tamil">{emp.nameTamil}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{emp.mobile}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {emp.salaryBasis} (OT: ₹{emp.overtimeRatePerHour}/hr)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{emp.baseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        updateEmployee({ ...emp, portalAccess: !emp.portalAccess })
                      }
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        emp.portalAccess
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {emp.portalAccess ? (
                        <>
                          <Unlock className="w-3 h-3 text-green-700" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-red-700" />
                          <span>Locked</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {emp.permissions.map(p => (
                        <span
                          key={p}
                          className="px-1.5 py-0.2 rounded-sm text-[9px] font-mono bg-slate-100 text-slate-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setResetPassEmp(emp)}
                      className="p-1.5 rounded-md text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Reset Staff Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Wizard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">{t('addEmployee')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Step 1: General Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  Step 1: General Staff Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. V. Muthukumar"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 font-tamil">
                      பெயர் தமிழில் (Tamil Name)
                    </label>
                    <input
                      type="text"
                      placeholder="எ.கா. வி. முத்துக்குமார்"
                      value={formData.nameTamil}
                      onChange={e => setFormData({ ...formData, nameTamil: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-tamil"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Mobile Phone (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9842100000"
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Salary Basis</label>
                    <select
                      value={formData.salaryBasis}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          salaryBasis: e.target.value as 'Monthly' | 'Daily' | 'Weekly',
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="Monthly">Monthly Salary</option>
                      <option value="Daily">Daily Wage</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.baseSalary}
                      onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Overtime Rate (₹ / Hour)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.overtimeRatePerHour}
                      onChange={e =>
                        setFormData({ ...formData, overtimeRatePerHour: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Role & Dynamic RBAC Presets */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  Step 2: Assign Mandi Role & RBAC Suite
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ['Manager', 'Supervisor', 'Auctioneer', 'Accountant', 'Quality Checker', 'Worker'] as Role[]
                  ).map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                        formData.role === r
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Fine-Tuning Permissions */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700">
                    Granular Route Permissions:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {allAvailablePermissions.map(p => {
                      const isChecked = formData.permissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 select-none text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.key)}
                            className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
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
                  Complete Staff Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetPassEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Reset Password</h3>
              </div>
              <button
                onClick={() => setResetPassEmp(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Set new portal login password for <strong>{resetPassEmp.name}</strong> ({resetPassEmp.code}):
              </p>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setResetPassEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetEmployeePassword(resetPassEmp.id, newPassword);
                    setResetPassEmp(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
