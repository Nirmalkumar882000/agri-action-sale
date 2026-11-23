import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import {
  CalendarCheck,
  Save,
  CheckCheck,
  Calendar,
  Warehouse,
  Clock,
  Sparkles,
} from 'lucide-react';

export const WorkforceAttendanceView: React.FC = () => {
  const {
    t,
    language,
    employees,
    attendance,
    markAttendance,
    markAllPresentForDate,
    activeBranch,
    profile,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranch);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // Local editing state for attendance on this selected date
  const getRecord = (empId: string) => {
    return (
      attendance.find(a => a.employeeId === empId && a.date === selectedDate) || {
        status: 'P' as AttendanceStatus,
        overtimeHours: 0,
      }
    );
  };

  const handleStatusChange = (empId: string, status: AttendanceStatus) => {
    const current = getRecord(empId);
    markAttendance({
      date: selectedDate,
      employeeId: empId,
      status,
      overtimeHours: current.overtimeHours,
      branch: selectedBranch,
    });
  };

  const handleOtChange = (empId: string, otHours: number) => {
    const current = getRecord(empId);
    markAttendance({
      date: selectedDate,
      employeeId: empId,
      status: current.status,
      overtimeHours: Math.max(0, otHours),
      branch: selectedBranch,
    });
  };

  const handleMarkAllPresent = () => {
    markAllPresentForDate(selectedDate, selectedBranch);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('shiftAttendance')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('attendanceSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-bold transition-all border border-slate-200"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('markAllPresent')}</span>
          </button>
          <button
            onClick={() => alert('Attendance records committed to LocalStorage and linked to Payroll engine!')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveAttendance')}</span>
          </button>
        </div>
      </div>

      {/* Date & Branch Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-700">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-700">Branch:</span>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            >
              {profile.branches.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Records directly feed the Monthly Salary & Payroll Engine.
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Attendance Shift Toggle (P / A / HD / L)</th>
                <th className="py-3 px-4 text-center">Overtime (OT Hours)</th>
                <th className="py-3 px-4 text-right">OT Pay Estimated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No employees registered. Add staff members in Workforce Employees or load demo data.
                  </td>
                </tr>
              ) : (
                employees.map(emp => {
                const rec = getRecord(emp.id);
                const otEarnings = rec.overtimeHours * (emp.overtimeRatePerHour || 100);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{emp.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      {emp.nameTamil && (
                        <div className="text-[10px] text-slate-500 font-tamil">{emp.nameTamil}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-700">
                        {emp.role}
                      </span>
                    </td>

                    {/* Interactive P / A / HD / L Toggles */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'P')}
                          className={`w-8 h-7 rounded-lg text-xs font-black transition-all ${
                            rec.status === 'P'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Present Full Day"
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'A')}
                          className={`w-8 h-7 rounded-lg text-xs font-black transition-all ${
                            rec.status === 'A'
                              ? 'bg-red-600 text-white shadow-xs scale-105'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Absent"
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'HD')}
                          className={`w-8 h-7 rounded-lg text-xs font-black transition-all ${
                            rec.status === 'HD'
                              ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Half Day (0.5 Worked Day)"
                        >
                          HD
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'L')}
                          className={`w-8 h-7 rounded-lg text-xs font-black transition-all ${
                            rec.status === 'L'
                              ? 'bg-blue-600 text-white shadow-xs scale-105'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Approved Leave"
                        >
                          L
                        </button>
                      </div>
                    </td>

                    {/* Overtime Hours Input */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          max={12}
                          value={rec.overtimeHours}
                          onChange={e => handleOtChange(emp.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-md border border-slate-300 text-center font-mono font-bold text-xs"
                        />
                        <span className="text-[10px] text-slate-400">hrs</span>
                      </div>
                    </td>

                    {/* OT Earnings */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      ₹{otEarnings.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
