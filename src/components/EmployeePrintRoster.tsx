'use client';

import React from 'react';
import { Employee } from '@/lib/types';
import { formatLocalizedText } from '@/lib/translations';

interface EmployeePrintRosterProps {
  employees: Employee[];
  language?: 'en' | 'km';
  filterSummary?: string;
}

export default function EmployeePrintRoster({
  employees,
  language = 'en',
  filterSummary,
}: EmployeePrintRosterProps) {
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  return (
    <div className="bg-white text-slate-900 font-sans p-6 text-xs leading-relaxed max-w-[297mm] mx-auto print:p-0 print:max-w-none">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 text-white font-black flex items-center justify-center text-base">
              H
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 font-khmer">
                ក្រុមហ៊ុន ហេស្ត្រា អេចអរអឹម (ខេមបូឌា)
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                HESTRA HRM (CAMBODIA) CO., LTD. &bull; WORKFORCE MANAGEMENT
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-600">
            <p>
              <strong className="text-slate-900">កាលបរិច្ឆេទ / Date:</strong> {todayStr}
            </p>
            <p>
              <strong className="text-slate-900">ចំនួនបុគ្គលិកសរុប / Headcount:</strong>{' '}
              <span className="font-bold text-indigo-700">{employees.length} នាក់</span>
            </p>
            <p>
              <strong className="text-slate-900">ប្រាក់ខែសរុប / Payroll:</strong>{' '}
              <span className="font-bold font-mono">${totalMonthlyPayroll.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-3 pt-2 border-t border-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900 font-khmer uppercase tracking-wide">
            បញ្ជីរាយនាមបុគ្គលិកសរុប (Workforce Directory Roster)
          </h2>
          {filterSummary && (
            <p className="text-[10px] text-slate-500 mt-0.5">Filter criteria: {filterSummary}</p>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto border border-slate-300 rounded-lg">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead className="bg-slate-800 text-white font-semibold">
            <tr>
              <th className="py-2 px-2.5 border-r border-slate-700 w-8 text-center">#</th>
              <th className="py-2 px-2.5 border-r border-slate-700">អត្តលេខ / ID</th>
              <th className="py-2 px-2.5 border-r border-slate-700">ឈ្មោះបុគ្គលិក / Full Name</th>
              <th className="py-2 px-2.5 border-r border-slate-700">មុខតំណែង / Role</th>
              <th className="py-2 px-2.5 border-r border-slate-700">ដេប៉ាតឺម៉ង់ / Department</th>
              <th className="py-2 px-2.5 border-r border-slate-700">ប្រភេទការងារ / Type</th>
              <th className="py-2 px-2.5 border-r border-slate-700">ស្ថានភាព / Status</th>
              <th className="py-2 px-2.5 border-r border-slate-700 text-right">បៀវត្សរ៍ / Salary</th>
              <th className="py-2 px-2.5 text-center">ថ្ងៃចូល / Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.map((emp, idx) => (
              <tr key={emp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                <td className="py-1.5 px-2.5 text-center font-mono text-slate-400 border-r border-slate-200">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-2.5 font-mono font-bold text-slate-800 border-r border-slate-200">
                  {emp.id}
                </td>
                <td className="py-1.5 px-2.5 font-bold text-slate-900 border-r border-slate-200">
                  {emp.first_name} {emp.last_name !== '-' ? emp.last_name : ''}
                  {emp.email && <div className="text-[9px] text-slate-400 font-normal font-mono">{emp.email}</div>}
                </td>
                <td className="py-1.5 px-2.5 text-slate-800 border-r border-slate-200">
                  {formatLocalizedText(emp.role, language)}
                </td>
                <td className="py-1.5 px-2.5 text-slate-700 border-r border-slate-200">
                  {formatLocalizedText(emp.department_name || '', language)}
                </td>
                <td className="py-1.5 px-2.5 text-slate-600 border-r border-slate-200">
                  {formatLocalizedText(emp.employment_type, language)}
                </td>
                <td className="py-1.5 px-2.5 border-r border-slate-200">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      emp.status === 'Active'
                        ? 'text-emerald-800 bg-emerald-100'
                        : emp.status === 'On Leave'
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-slate-700 bg-slate-100'
                    }`}
                  >
                    {formatLocalizedText(emp.status, language)}
                  </span>
                </td>
                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  ${Number(emp.salary || 0).toLocaleString()}
                </td>
                <td className="py-1.5 px-2.5 text-center font-mono text-slate-600">
                  {emp.join_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verification Signatures */}
      <div className="mt-8 pt-4 border-t border-slate-300">
        <div className="grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <p className="font-khmer font-bold text-slate-800">អ្នករៀបចំបញ្ជី (Prepared By HR Officer)</p>
            <div className="h-16 flex items-end justify-center">
              <div className="border-b border-dotted border-slate-400 w-48"></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">កាលបរិច្ឆេទ / Date: ____/____/2026</p>
          </div>

          <div>
            <p className="font-khmer font-bold text-slate-800">នាយកប្រតិបត្តិ / ប្រធានធនធានមនុស្ស (HR Director Approval)</p>
            <div className="h-16 flex items-end justify-center">
              <div className="border-b border-dotted border-slate-400 w-48"></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">កាលបរិច្ឆេទ / Date: ____/____/2026</p>
          </div>
        </div>

        <div className="mt-4 text-center text-[9px] text-slate-400">
          HESTRA HRM System &bull; Cambodia Labor Standard Compliant &bull; Confidential
        </div>
      </div>
    </div>
  );
}
