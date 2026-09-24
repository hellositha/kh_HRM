'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Employee, OvertimeRateType } from '@/lib/types';
import { OVERTIME_RATES, calculateOvertimePay } from '@/lib/overtime-calc';
import { formatLocalizedText } from '@/lib/translations';
import { X, Clock, Calendar, AlertTriangle, Shield, CheckCircle2, DollarSign, Briefcase } from 'lucide-react';

interface OvertimeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSuccess: () => void;
}

export default function OvertimeRequestModal({
  isOpen,
  onClose,
  employees,
  onSuccess,
}: OvertimeRequestModalProps) {
  const { currentPersona, language, showToast, overtimeSettings } = useApp();
  const isManagerOrAdmin = currentPersona.role === 'Manager' || currentPersona.role === 'Admin';

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentPersona.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [hours, setHours] = useState('2.0');
  const [rateType, setRateType] = useState<OvertimeRateType>('normal_day_150');
  const [projectName, setProjectName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPersona?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(currentPersona.id);
    }
  }, [currentPersona, selectedEmployeeId]);

  if (!isOpen) return null;

  const targetEmp = employees.find((e) => e.id === selectedEmployeeId);
  const salary = targetEmp?.salary || 1000;
  const numHours = Number(hours) || 0;
  const activeRates = overtimeSettings?.rates || OVERTIME_RATES;
  const activeRateList = Object.values(activeRates);
  const activeDivisor = overtimeSettings?.standardMonthlyHours || 208;
  const calculation = calculateOvertimePay(salary, numHours, rateType, activeRates, activeDivisor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលមូលហេតុនៃការថែមម៉ោង' : 'Please provide a reason for overtime', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployeeId,
          date,
          start_time: startTime,
          end_time: endTime,
          hours: numHours,
          ot_rate_type: rateType,
          project_name: projectName,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          language === 'km'
            ? 'បានដាក់ពាក្យស្នើសុំថែមម៉ោងជោគជ័យ!'
            : 'Overtime request submitted successfully!',
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Failed to submit request', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error submitting overtime request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {language === 'km' ? 'ពាក្យស្នើសុំធ្វើការថែមម៉ោង (Overtime Request)' : 'Submit Overtime Request'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'គិតប្រាក់ថែមម៉ោងស្របតាមច្បាប់ការងារកម្ពុជា' : 'Calculated per Cambodian Labor Law standards'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Selection (For Manager/Admin) */}
          {isManagerOrAdmin ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {language === 'km' ? 'បុគ្គលិកស្នើសុំ' : 'Employee'}
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.role}) - Base: ${emp.salary || 1000}/mo
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {currentPersona.name}
                </div>
                <div className="text-[11px] text-slate-500">{currentPersona.title}</div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                ${salary}/mo
              </span>
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'ម៉ោងចាប់ផ្តើម' : 'Start Time'}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'ម៉ោងបញ្ចប់' : 'End Time'}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Hours and Overtime Limit Warning */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                {language === 'km' ? 'ចំនួនម៉ោងថែម (Total OT Hours)' : 'Total Overtime Hours'}
              </label>
              {numHours > 2.0 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {language === 'km' ? 'លើស ២ ម៉ោង (មាត្រា ១៣៩ ច្បាប់ការងារ)' : '> 2h Daily Labor Limit Notice'}
                </span>
              )}
            </div>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Overtime Rate Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {language === 'km' ? 'អត្រាគិតប្រាក់ថែមម៉ោង (OT Rate Multiplier)' : 'Overtime Rate Multiplier'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeRateList.map((rate) => {
                const isSelected = rateType === rate.id;
                return (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setRateType(rate.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${rate.badgeBg} ${rate.badgeBorder} ring-2 ring-indigo-500/30 font-medium`
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${rate.badgeText}`}>
                        {Math.round(rate.multiplier * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400">{rate.law_reference}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {language === 'km' ? rate.label_km : rate.label_en}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project & Task Reason */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'គម្រោង / កិច្ចការ (Project Name)' : 'Project / Task Name'}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={language === 'km' ? 'ឧ. Core Banking API Deployment, Year-End Tax Audit...' : 'e.g. Core Banking API, Server Maintenance...'}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'មូលហេតុចាំបាច់នៃការថែមម៉ោង (Reason)' : 'Justification / Reason for Overtime'}
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder={language === 'km' ? 'បញ្ជាក់ពីភាពបន្ទាន់ ឬការងារដែលត្រូវបំពេញ...' : 'Explain the urgent necessity for overtime...'}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Live Payout Estimation Banner */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                {language === 'km' ? 'ប្រាក់ឈ្នួលថែមម៉ោងប៉ាន់ស្មាន' : 'Estimated Overtime Compensation'}
              </div>
              <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                ${calculation.hourlyRate}/h base × {calculation.multiplier}x × {numHours}h
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
                +${calculation.totalPay.toFixed(2)}
              </div>
              <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-mono">
                ≈ ៛{calculation.khrPay.toLocaleString()} KHR
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{loading ? (language === 'km' ? 'កំពុងបញ្ជូន...' : 'Submitting...') : (language === 'km' ? 'ដាក់ពាក្យស្នើសុំ' : 'Submit OT Request')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
