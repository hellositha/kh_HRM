'use client';

import React from 'react';
import { formatLocalizedText } from '@/lib/translations';

interface EmployeePrintDossierProps {
  employee: any;
  language?: 'en' | 'km';
}

export default function EmployeePrintDossier({ employee, language = 'en' }: EmployeePrintDossierProps) {
  if (!employee) return null;

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none text-xs leading-relaxed">
      {/* 1. OFFICIAL CAMBODIAN & COMPANY LETTERHEAD */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex justify-between items-start text-center">
          {/* Left: Company Identification */}
          <div className="text-left w-1/3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 text-white font-black flex items-center justify-center text-sm">
                H
              </div>
              <div>
                <h2 className="font-bold text-xs tracking-tight text-slate-900 font-khmer">
                  ក្រុមហ៊ុន ហេស្ត្រា អេចអរអឹម
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  HESTRA HRM CAMBODIA CO., LTD.
                </p>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 font-khmer leading-tight">
              អគារ Vattanac Capital Tower, រាជធានីភ្នំពេញ
            </p>
            <p className="text-[9px] text-slate-500">Tel: +855 (0) 23 999 888 &bull; info@hestra.kh</p>
          </div>

          {/* Center: National Emblem Header */}
          <div className="w-1/3">
            <h1 className="font-khmer text-sm font-bold text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</h1>
            <h2 className="font-khmer text-xs text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
            <div className="w-20 h-0.5 bg-slate-900 mx-auto my-1"></div>
            <p className="text-[9px] font-serif uppercase tracking-widest text-slate-600">
              KINGDOM OF CAMBODIA
            </p>
          </div>

          {/* Right: Document Reference & QR/Ref */}
          <div className="text-right w-1/3 text-[10px] text-slate-600 space-y-0.5">
            <p>
              <strong className="text-slate-900">REF:</strong> HESTRA-EMP-{employee.id}
            </p>
            <p>
              <strong className="text-slate-900">DATE:</strong> {todayStr}
            </p>
            <p>
              <strong className="text-slate-900">STATUS:</strong>{' '}
              <span className="font-bold uppercase text-emerald-700">{employee.status || 'Active'}</span>
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-3 pt-2 border-t border-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900 font-khmer uppercase tracking-wide">
            ទម្រង់ព័ត៌មាន & ប្រវត្តិរូបសង្ខេបបុគ្គលិកផ្លូវការ
          </h2>
          <p className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
            OFFICIAL WORKFORCE ENROLMENT & EMPLOYEE DOSSIER
          </p>
        </div>
      </div>

      {/* 2. PHOTO & KEY EMPLOYMENT BADGE */}
      <div className="flex items-start gap-5 p-4 rounded-xl border border-slate-300 bg-slate-50/50 mb-5">
        {/* Photo 4x6 frame */}
        <div className="w-24 h-32 border-2 border-dashed border-slate-400 rounded-lg overflow-hidden bg-white shrink-0 flex flex-col items-center justify-center p-1 text-center shadow-xs">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.first_name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="text-[10px] text-slate-400 font-khmer">
              រូបថត<br />4 x 6 cm
            </div>
          )}
        </div>

        {/* Top Summary Table */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">ឈ្មោះពេញ / Full Name:</span>
            <strong className="text-xs text-slate-900">
              {employee.first_name} {employee.last_name !== '-' ? employee.last_name : ''}
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">អត្តលេខ / Employee ID:</span>
            <strong className="font-mono text-indigo-700">{employee.id}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">មុខតំណែង / Position:</span>
            <strong className="text-slate-900">{formatLocalizedText(employee.role, language)}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">ដេប៉ាតឺម៉ង់ / Department:</span>
            <strong className="text-slate-900">{formatLocalizedText(employee.department_name || employee.department, language)}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">ប្រភេទការងារ / Employment:</span>
            <strong className="text-slate-900">{formatLocalizedText(employee.employment_type, language)}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-medium font-khmer">ថ្ងៃចូលធ្វើការ / Join Date:</span>
            <strong className="font-mono text-slate-900">{employee.join_date || todayStr}</strong>
          </div>
        </div>
      </div>

      {/* 3. SECTION 1: PERSONAL INFORMATION */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>ផ្នែកទី ១៖ ព័ត៌មានផ្ទាល់ខ្លួន (1. PERSONAL DETAILS)</span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">ភេទ / Gender</td>
              <td className="p-2 w-1/4 border-r border-slate-300">{formatLocalizedText(employee.gender || 'ប្រុស (Male)', language)}</td>
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">ថ្ងៃខែឆ្នាំកំណើត / DOB</td>
              <td className="p-2 w-1/4">{employee.dob || '—'}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">សញ្ជាតិ / Nationality</td>
              <td className="p-2 border-r border-slate-300">{formatLocalizedText(employee.nationality || 'កម្ពុជា (Cambodian)', language)}</td>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">ស្ថានភាពគ្រួសារ / Marital Status</td>
              <td className="p-2">{formatLocalizedText(employee.marital_status || 'នៅលីវ (Single)', language)}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">អត្តសញ្ញាណប័ណ្ណ / National ID</td>
              <td className="p-2 font-mono border-r border-slate-300">{employee.national_id || '—'}</td>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">កាតបុគ្គលិក / Staff Card</td>
              <td className="p-2 font-mono">{employee.id}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. SECTION 2: CONTACT & ADDRESS */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-t">
          <span>ផ្នែកទី ២៖ ទំនាក់ទំនង & ទីលំនៅ (2. CONTACT & RESIDENCY)</span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">លេខទូរស័ព្ទ / Phone Number</td>
              <td className="p-2 font-mono w-1/4 border-r border-slate-300">{employee.phone || '—'}</td>
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">អ៊ីមែលក្រុមហ៊ុន / Work Email</td>
              <td className="p-2 w-1/4">{employee.email || '—'}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">អាសយដ្ឋានបច្ចុប្បន្ន / Current Address</td>
              <td colSpan={3} className="p-2">
                {employee.current_address || ''} {employee.location ? `(${formatLocalizedText(employee.location, language)})` : 'រាជធានីភ្នំពេញ (Phnom Penh)'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. SECTION 3: CONTRACT & COMPENSATION */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-t">
          <span>ផ្នែកទី ៣៖ កិច្ចសន្យាការងារ & បៀវត្សរ៍ (3. CONTRACT & COMPENSATION)</span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">ប្រភេទកិច្ចសន្យា / Contract Type</td>
              <td className="p-2 w-1/4 border-r border-slate-300">{formatLocalizedText(employee.contract_type || 'UDC (មិនកំណត់ថិរវេលា)', language)}</td>
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">ទីតាំងបំពេញការងារ / Work Location</td>
              <td className="p-2 w-1/4">{formatLocalizedText(employee.work_location || 'ការិយាល័យកណ្តាល (Head Office)', language)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">បៀវត្សរ៍មូលដ្ឋាន / Base Salary</td>
              <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-300">
                ${Number(employee.salary || 0).toLocaleString()} USD ({((Number(employee.salary || 0)) * 4100).toLocaleString()} KHR)
              </td>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">វដ្តបើកប្រាក់ខែ / Frequency</td>
              <td className="p-2">{formatLocalizedText(employee.salary_frequency || 'ប្រចាំខែ (Monthly)', language)}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">ធនាគារ & លេខគណនី / Bank & Account</td>
              <td colSpan={3} className="p-2 font-mono">
                {employee.bank_name || 'ABA Bank'} &bull; {employee.bank_account_name || `${employee.first_name} ${employee.last_name}`} &bull; #{employee.bank_account_number || '001 234 567'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. SECTION 4: STATUTORY NSSF & EMERGENCY */}
      <div className="mb-6">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-t">
          <span>ផ្នែកទី ៤៖ ប.ស.ស & ទំនាក់ទំនងអាសន្ន (4. NSSF & EMERGENCY)</span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">សមាជិក ប.ស.ស / NSSF Member</td>
              <td className="p-2 w-1/4 border-r border-slate-300 font-semibold text-indigo-700">
                {formatLocalizedText(employee.nssf_member || 'មាន (Yes)', language)}
              </td>
              <td className="p-2 font-semibold bg-slate-100/70 w-1/4 border-r border-slate-300">លេខកាត ប.ស.ស / NSSF No.</td>
              <td className="p-2 w-1/4 font-mono">{employee.nssf_number || 'NSSF-2026-KH'}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold bg-slate-100/70 border-r border-slate-300">អ្នកទាក់ទងគ្រាអាសន្ន / Emergency Contact</td>
              <td colSpan={3} className="p-2">
                {employee.emergency_contact_name || 'Mrs. Sokha'} {employee.emergency_contact_relationship ? `(${employee.emergency_contact_relationship})` : '(Family)'} &bull; Tel: {employee.emergency_contact_phone || '012 999 888'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 7. OFFICIAL SIGNATURES & VERIFICATION BOX */}
      <div className="pt-4 border-t border-slate-300">
        <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
          <div>
            <p className="font-khmer font-bold text-slate-800">ហត្ថលេខាបុគ្គលិក</p>
            <p className="text-[9px] text-slate-500 uppercase">Employee Signature</p>
            <div className="h-16 flex items-end justify-center">
              <div className="border-b border-dotted border-slate-400 w-36"></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">កាលបរិច្ឆេទ / Date: ____/____/2026</p>
          </div>

          <div>
            <p className="font-khmer font-bold text-slate-800">ប្រធានផ្នែកផ្ទាល់</p>
            <p className="text-[9px] text-slate-500 uppercase">Line Manager Verification</p>
            <div className="h-16 flex items-end justify-center">
              <div className="border-b border-dotted border-slate-400 w-36"></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">កាលបរិច្ឆេទ / Date: ____/____/2026</p>
          </div>

          <div>
            <p className="font-khmer font-bold text-slate-800">នាយកដ្ឋានធនធានមនុស្ស & ត្រា</p>
            <p className="text-[9px] text-slate-500 uppercase">HR Director & Official Seal</p>
            <div className="h-16 flex items-end justify-center">
              <div className="border-b border-dotted border-slate-400 w-36"></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">កាលបរិច្ឆេទ / Date: ____/____/2026</p>
          </div>
        </div>

        <div className="mt-6 text-center text-[9px] text-slate-400">
          ឯកសារនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិតាមប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្ស HESTRA HRM System ស្របតាមច្បាប់ការងារនៃព្រះរាជាណាចក្រកម្ពុជា។
        </div>
      </div>
    </div>
  );
}
