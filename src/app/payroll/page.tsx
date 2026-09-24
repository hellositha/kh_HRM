'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatLocalizedText } from '@/lib/translations';
import { PayrollRecord } from '@/lib/types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  FileText,
  X,
  Plus,
  ArrowUpRight,
  Calculator,
} from 'lucide-react';

export default function PayrollPage() {
  const { openModal, showToast, triggerRefresh, refreshKey, language, companySettings } = useApp();

  const currentMonthPeriod = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const availablePeriods = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const str = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!list.includes(str)) list.push(str);
    }
    payrolls.forEach((p) => {
      if (p.pay_period && !list.includes(p.pay_period)) {
        list.push(p.pay_period);
      }
    });
    return list;
  }, [payrolls]);

  // Selected payslip for modal
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
    if (statusFilter !== 'all') params.append('status', statusFilter);

    fetch(`/api/payroll?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPayrolls(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching payroll:', err);
        setLoading(false);
      });
  }, [selectedPeriod, statusFilter, refreshKey]);

  // Aggregate totals
  const totalNet = payrolls.reduce((acc, p) => acc + p.net_salary, 0);
  const totalBase = payrolls.reduce((acc, p) => acc + p.base_salary, 0);
  const totalTax = payrolls.reduce((acc, p) => acc + p.tax_deduction, 0);
  const totalAllowances = payrolls.reduce((acc, p) => acc + p.allowances + p.bonuses, 0);

  const filteredPayrolls = payrolls.filter((p) => {
    const matchName = (p.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.employee_role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.department_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchName;
  });

  // Mark status as Paid
  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' }),
      });
      if (res.ok) {
        showToast('Payslip status updated to Paid!', 'success');
        triggerRefresh();
        if (activePayslip && activePayslip.id === id) {
          setActivePayslip({ ...activePayslip, status: 'Paid' });
        }
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-indigo-600" size={26} />
            {language === 'km' ? 'គ្រប់គ្រងប្រាក់បៀវត្សរ៍ & ប.ស.ស (Payroll & NSSF Management)' : 'Payroll & Statutory Benefits'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'km'
              ? 'បញ្ជីបៀវត្សរ៍ប្រចាំខែ, ការកាត់កងពន្ធ និងវិភាគទាន ប.ស.ស (NSSF), និងប័ណ្ណបើកប្រាក់បៀវត្សរ៍'
              : 'Monthly payroll ledger, salary tax withholding, NSSF statutory contributions, and official payslips'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/tools?tab=calculator"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Calculator size={15} className="text-indigo-600" />
            <span>{language === 'km' ? 'គណនា ប.ស.ស/ពន្ធ/អតីតភាព' : 'Tax & Seniority Calc'}</span>
          </Link>
          <button
            onClick={() => openModal('run-payroll')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> {language === 'km' ? 'រៀបចំបើកប្រាក់ខែ (Run Payroll)' : 'Run Payroll'}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'km' ? 'ប្រាក់បៀវត្សរ៍សុទ្ធសរុប (Net Pay)' : 'Total Net Pay'}
          </span>
          <div className="text-2xl font-black text-slate-900 my-1">
            ${totalNet.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            ~ {((totalNet * 4100) / 1000000).toFixed(1)}M {language === 'km' ? '៛ (KHR)' : 'KHR'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'km' ? 'បៀវត្សរ៍គោលសរុប (Base Pay)' : 'Total Base Pay'}
          </span>
          <div className="text-2xl font-black text-indigo-600 my-1">
            ${totalBase.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            {language === 'km' ? 'ប្រាក់ខែគោលសរុប' : 'Total Base Salaries'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'km' ? 'ពន្ធ & ប.ស.ស (Tax & NSSF)' : 'Tax & NSSF Deductions'}
          </span>
          <div className="text-2xl font-black text-rose-600 my-1">
            ${totalTax.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            {language === 'km' ? 'កាត់បង់ពន្ធ & សន្តិសុខសង្គម' : 'Statutory Deductions'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'km' ? 'ប្រាក់ឧបត្ថម្ភ & រង្វាន់' : 'Allowances & Bonuses'}
          </span>
          <div className="text-2xl font-black text-emerald-600 my-1">
            ${totalAllowances.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            {language === 'km' ? 'ឧបត្ថម្ភទូរស័ព្ទ, ធ្វើដំណើរ, ស្នាក់នៅ' : 'Phone, transport, housing'}
          </span>
        </div>
      </div>

      {/* Period Selector & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-slate-500 font-semibold">Pay Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Periods</option>
              {availablePeriods.map((period: string) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search employee or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Payroll Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading payroll ledger...</div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No payroll entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Base Monthly</th>
                  <th className="px-5 py-3.5">Stipends/Bonus</th>
                  <th className="px-5 py-3.5">Deductions</th>
                  <th className="px-5 py-3.5">Net Pay</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayrolls.map((p) => {
                  const deductions = p.tax_deduction + p.insurance_deduction + p.other_deductions;
                  const additions = p.allowances + p.bonuses;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={p.employee_avatar || '/avatars/khmer_female_1.jpg'}
                          alt={p.employee_name || 'Staff'}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{formatLocalizedText(p.employee_name, language)}</div>
                          <div className="text-[11px] text-slate-400">{formatLocalizedText(p.employee_role, language)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">{formatLocalizedText(p.department_name, language)}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ${p.base_salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-emerald-600 font-medium">
                        +${additions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-rose-600 font-medium">
                        -${deductions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-extrabold text-slate-900 text-sm">
                        ${p.net_salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setActivePayslip(p)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition-colors"
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED DIGITAL PAYSLIP MODAL */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Controls Bar */}
            <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                <span className="font-bold text-sm text-slate-900">
                  Official Payslip &bull; {activePayslip.pay_period}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer size={14} /> Print / PDF
                </button>
                {activePayslip.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(activePayslip.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-800 text-xs font-sans">
              {/* Company Branding Header */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-xl overflow-hidden p-1">
                    <img src="/hestra-logo.svg" alt="HESTRA HRM" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-khmer">
                      {companySettings?.name || (language === 'km' ? 'HESTRA HRM កម្ពុជា (HESTRA HRM Cambodia Co., Ltd.)' : 'HESTRA HRM Cambodia Co., Ltd.')}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-khmer">
                      {companySettings?.address || (language === 'km' ? 'អគារ Exchange Square, មហាវិថីព្រះនរោត្តម, រាជធានីភ្នំពេញ' : 'Exchange Square Building, Norodom Blvd, Phnom Penh')}
                    </p>
                    <p className="text-[11px] text-slate-500 font-khmer">
                      {language === 'km' ? 'លេខសារពើពន្ធ TIN: K009-90218928 • លេខបញ្ជិកា ប.ស.ស (NSSF): 1029482' : 'Tax TIN: K009-90218928 • NSSF Reg: 1029482'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {language === 'km' && (
                    <span className="text-sm text-slate-900 font-khmer-moul block leading-normal">
                      ប័ណ្ណបើកប្រាក់បៀវត្សរ៍
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Official Salary Payslip
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900">{activePayslip.id}</span>
                  <span className="text-xs text-slate-500 block mt-1 font-khmer">
                    {language === 'km' ? `កាលបរិច្ឆេទបើក៖ ${activePayslip.payment_date}` : `Payment Date: ${activePayslip.payment_date}`}
                  </span>
                </div>
              </div>

              {/* Employee & Payroll Meta */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {language === 'km' ? 'ឈ្មោះបុគ្គលិក (Employee Name)' : 'Employee Name'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{formatLocalizedText(activePayslip.employee_name, language)}</span>
                  <span className="text-slate-500 block mt-0.5">{formatLocalizedText(activePayslip.employee_role, language)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {language === 'km' ? 'ដេប៉ាតឺម៉ង់ & អត្តលេខ (Dept & ID)' : 'Department & Staff ID'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{formatLocalizedText(activePayslip.department_name, language)}</span>
                  <span className="text-slate-500 block mt-0.5">{language === 'km' ? `អត្តលេខ៖ ${activePayslip.employee_id}` : `ID: ${activePayslip.employee_id}`}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    {language === 'km' ? 'ប្រាក់ចំណូលសរុប (Gross Earnings)' : 'Gross Earnings'}
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span>{language === 'km' ? 'ប្រាក់ខែគោល (Basic Salary)' : 'Basic Salary'}</span>
                      <span className="font-bold font-mono">${activePayslip.base_salary.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'km' ? 'ប្រាក់ឧបត្ថម្ភការងារ (Allowances)' : 'Allowances'}</span>
                      <span className="font-mono">${activePayslip.allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'km' ? 'ប្រាក់រង្វាន់លើកទឹកចិត្ត (Bonus)' : 'Bonuses'}</span>
                      <span className="font-mono">${activePayslip.bonuses.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                      <span>{language === 'km' ? 'ប្រាក់បៀវត្សរ៍សរុប (Total Gross)' : 'Total Gross'}</span>
                      <span className="font-mono">
                        ${(activePayslip.base_salary + activePayslip.allowances + activePayslip.bonuses).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    {language === 'km' ? 'ការកាត់កងតាមច្បាប់ (Statutory Deductions)' : 'Statutory Deductions'}
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'km' ? 'ពន្ធលើប្រាក់បៀវត្សរ៍ (Salary Tax)' : 'Salary Tax (TOS)'}</span>
                      <span className="font-mono text-rose-600">-${activePayslip.tax_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'km' ? 'វិភាគទាន ប.ស.ស (NSSF Healthcare/Pension)' : 'NSSF (Healthcare & Pension)'}</span>
                      <span className="font-mono text-rose-600">-${activePayslip.insurance_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'km' ? 'ការកាត់កងផ្សេងៗ (Other Deductions)' : 'Other Deductions'}</span>
                      <span className="font-mono text-rose-600">-${activePayslip.other_deductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                      <span>{language === 'km' ? 'ការកាត់កងសរុប (Total Deductions)' : 'Total Deductions'}</span>
                      <span className="font-mono text-rose-600">
                        -${(activePayslip.tax_deduction + activePayslip.insurance_deduction + activePayslip.other_deductions).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">
                    {language === 'km' ? 'ប្រាក់បៀវត្សរ៍សុទ្ធទទួលបាន (Net Take-Home Pay)' : 'Net Take-Home Pay'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-emerald-400">
                    ${activePayslip.net_salary.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-amber-300 font-semibold mt-0.5">
                    ~ {(activePayslip.net_salary * 4100).toLocaleString()} {language === 'km' ? '៛ (រៀលកម្ពុជា KHR)' : 'KHR'}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {language === 'km' ? `បើកប្រាក់តាម៖ ${activePayslip.payment_method} (ABA Bank / Bakong KHQR)` : `Payment Method: ${activePayslip.payment_method} (ABA Bank / Bakong KHQR)`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {language === 'km'
                      ? `ស្ថានភាព៖ ${activePayslip.status === 'Paid' ? 'បានទូទាត់រួចរាល់' : activePayslip.status}`
                      : `Status: ${activePayslip.status}`}
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
                {language === 'km'
                  ? 'នេះជាឯកសារគណនាប្រាក់បៀវត្សរ៍ និងពន្ធស្របតាមច្បាប់ការងារនៃព្រះរាជាណាចក្រកម្ពុជា បញ្ជាក់ដោយ HESTRA HRM Cambodia People Operations។'
                  : 'This official salary and tax statement complies with Cambodia Labour Law and is certified by HESTRA HRM Cambodia People Operations.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
