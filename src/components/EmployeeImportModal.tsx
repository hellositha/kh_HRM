'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Check,
  Building2,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatLocalizedText } from '@/lib/translations';

interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedPreviewRow {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employment_type: string;
  status: string;
  salary: number;
  location: string;
  join_date: string;
  isValid: boolean;
  validationError?: string;
}

export default function EmployeeImportModal({ isOpen, onClose, onSuccess }: EmployeeImportModalProps) {
  const { showToast, triggerRefresh, language, t } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [parsedRows, setParsedRows] = useState<ParsedPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // RFC 4180 client-side CSV parser
  const parseCSVToRows = (csvContent: string): ParsedPreviewRow[] => {
    const cleanText = csvContent.replace(/^\uFEFF/, '').trim();
    if (!cleanText) return [];

    const rawRows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rawRows.push(currentRow);
      }
    }

    if (rawRows.length < 2) return [];

    const headers = rawRows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
    const rows: ParsedPreviewRow[] = [];

    const getField = (row: string[], ...aliases: string[]): string => {
      for (const alias of aliases) {
        const normAlias = alias.toLowerCase().replace(/[\s_-]+/g, '');
        const idx = headers.indexOf(normAlias);
        if (idx !== -1 && row[idx] !== undefined) {
          return row[idx].trim();
        }
      }
      return '';
    };

    for (let r = 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (row.length === 0 || row.every((c) => !c)) continue;

      let firstName = getField(row, 'first_name', 'firstname', 'fname', 'ឈ្មោះ', 'នាម');
      let lastName = getField(row, 'last_name', 'lastname', 'lname', 'ត្រកូល', 'គោត្តនាម');
      const fullName = getField(row, 'name', 'fullname', 'employeename', 'ឈ្មោះពេញ');

      if (!firstName && fullName) {
        const parts = fullName.split(/\s+/);
        if (parts.length === 1) {
          firstName = parts[0];
          lastName = '';
        } else {
          lastName = parts[0];
          firstName = parts.slice(1).join(' ');
        }
      }

      const role = getField(row, 'role', 'position', 'job_title', 'title', 'មុខតំណែង', 'តួនាទី');
      const department = getField(row, 'department', 'dept', 'division', 'នាយកដ្ឋាន', 'ផ្នែក') || 'General';
      const email = getField(row, 'email', 'e-mail', 'mail', 'អ៊ីមែល');
      const phone = getField(row, 'phone', 'mobile', 'tel', 'លេខទូរស័ព្ទ');
      const employmentType = getField(row, 'employment_type', 'type', 'ប្រភេទការងារ') || 'ពេញម៉ោង (Full-Time)';
      const status = getField(row, 'status', 'ស្ថានភាព') || 'Active';
      const rawSalary = getField(row, 'salary', 'base_salary', 'ប្រាក់បៀវត្សរ៍', 'ប្រាក់ខែ');
      const location = getField(row, 'location', 'branch', 'city', 'ទីតាំង') || 'រាជធានីភ្នំពេញ (Phnom Penh)';
      const joinDate = getField(row, 'join_date', 'start_date', 'hire_date', 'ថ្ងៃចូលបម្រើការងារ') || new Date().toISOString().split('T')[0];
      const id = getField(row, 'id', 'employee_id', 'empid', 'អត្តលេខ');

      const cleanSalary = rawSalary ? Number(rawSalary.replace(/[^0-9.]/g, '')) : 1200;
      const salary = isNaN(cleanSalary) || cleanSalary <= 0 ? 1200 : cleanSalary;

      let isValid = true;
      let validationError = '';

      if (!firstName) {
        isValid = false;
        validationError = language === 'km' ? 'ខ្វះឈ្មោះ (Missing First Name)' : 'Missing First Name';
      } else if (!role) {
        isValid = false;
        validationError = language === 'km' ? 'ខ្វះមុខតំណែង (Missing Role)' : 'Missing Role / Job Title';
      }

      rows.push({
        id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        department,
        employment_type: employmentType,
        status,
        salary,
        location,
        join_date: joinDate,
        isValid,
        validationError,
      });
    }

    return rows;
  };

  const handleFile = async (file: File) => {
    setSelectedFileName(file.name);
    setIsProcessing(true);
    setParseError(null);

    try {
      const text = await file.text();
      const rows = parseCSVToRows(text);
      if (rows.length === 0) {
        setParseError(
          language === 'km'
            ? 'ឯកសារ CSV មិនមានទិន្នន័យត្រឹមត្រូវ ឬខ្វះក្បាលតារាង (Headers)'
            : 'No valid rows found in CSV. Please ensure headers are present.'
        );
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setParseError(err.message || 'Error reading CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleParsePastedText = () => {
    if (!pasteText.trim()) {
      showToast(language === 'km' ? 'សូមបិទភ្ជាប់ទិន្នន័យ CSV ជាមុនសិន' : 'Please paste CSV text first', 'error');
      return;
    }
    setIsProcessing(true);
    setParseError(null);
    try {
      const rows = parseCSVToRows(pasteText);
      if (rows.length === 0) {
        setParseError(
          language === 'km'
            ? 'មិនអាចញែកទិន្នន័យបានទេ។ សូមពិនិត្យមើលក្បាលតារាង (Headers) នៃ CSV'
            : 'Could not parse text. Ensure your CSV has headers and comma/tab separation.'
        );
      } else {
        setParsedRows(rows);
        setSelectedFileName('pasted_workforce_data.csv');
      }
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse pasted CSV text');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/employees/import?template=1', '_blank');
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast(language === 'km' ? 'មិនមានទិន្នន័យត្រឹមត្រូវសម្រាប់នាំចូលទេ' : 'No valid employee rows to import', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/employees/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: validRows }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        showToast(
          language === 'km'
            ? `បាននាំចូលបុគ្គលិកចំនួន ${data.importedCount || validRows.length} នាក់ដោយជោគជ័យ! 🎉`
            : `Successfully imported ${data.importedCount || validRows.length} employees! 🎉`,
          'success'
        );
        triggerRefresh();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Import failed', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(language === 'km' ? 'កំហុសបណ្តាញពេលនាំចូលទិន្នន័យ' : 'Network error during import', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {t('emp_import_modal_title')}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">
                  CSV / Excel
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('emp_import_modal_sub')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs"
              title="Download Sample CSV Template"
            >
              <Download size={14} />
              <span>{t('emp_import_template_btn')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('upload');
                  setParseError(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud size={15} />
                <span>{t('emp_import_upload_tab')}</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('paste');
                  setParseError(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'paste' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={15} />
                <span>{t('emp_import_paste_tab')}</span>
              </button>
            </div>

            <button
              onClick={downloadTemplate}
              className="sm:hidden flex items-center gap-1 text-xs font-bold text-indigo-600"
            >
              <Download size={13} />
              <span>Template</span>
            </button>
          </div>

          {/* Tab 1: Upload Dropzone */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shadow-xs">
                <FileSpreadsheet size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {selectedFileName || t('emp_import_dropzone')}
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'km'
                    ? 'គាំទ្រឯកសារ .CSV ជាមួយ UTF-8 (អក្សរខ្មែរ & អង់គ្លេស)'
                    : 'Supports standard .CSV with UTF-8 encoding (Khmer & English compliant)'}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs mt-1">
                <span>{language === 'km' ? 'រុករកឯកសារ (Browse File)' : 'Browse Computer'}</span>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw CSV Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {language === 'km'
                    ? 'បិទភ្ជាប់ជួរដេកពី Microsoft Excel ឬ Google Sheets'
                    : 'Paste rows directly from Microsoft Excel, Apple Numbers, or Google Sheets'}
                </span>
                <span className="font-mono text-[11px] text-slate-400">Header: First Name, Last Name, Role, Department...</span>
              </div>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="ID,First Name,Last Name,Email,Phone,Role,Department,Salary&#10;EMP-001,Sokha,Meas,sokha@hestra.kh,012345678,Accountant,Finance,1400&#10;EMP-002,Dara,Khim,dara@hestra.kh,098765432,Engineer,Engineering,1800"
                className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParsePastedText}
                  disabled={!pasteText.trim() || isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {language === 'km' ? 'ផ្ទៀងផ្ទាត់ទិន្នន័យ (Parse CSV)' : 'Parse & Validate Data'}
                </button>
              </div>
            </div>
          )}

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <AlertCircle className="shrink-0 text-rose-600" size={18} />
              <p className="font-medium">{parseError}</p>
            </div>
          )}

          {/* Live Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" />
                    {t('emp_import_preview_title')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                    {parsedRows.length} {language === 'km' ? 'នាក់' : 'rows'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <Check size={12} /> {validCount} {language === 'km' ? 'ត្រឹមត្រូវ' : 'Valid'}
                  </span>
                  {invalidCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      <AlertTriangle size={12} /> {invalidCount} {language === 'km' ? 'ខ្វះព័ត៌មាន' : 'Warning'}
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Role / Position</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Salary</th>
                      <th className="py-2.5 px-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/60' : 'bg-amber-50/40 hover:bg-amber-50/70'}>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check size={11} /> Ready
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800"
                              title={row.validationError}
                            >
                              <AlertCircle size={11} /> {row.validationError}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {row.first_name} {row.last_name !== '-' ? row.last_name : ''}
                          {row.email && <div className="text-[10px] text-slate-400 font-normal">{row.email}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{row.role}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            <Building2 size={11} className="text-indigo-500" />
                            {formatLocalizedText(row.department, language)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">${row.salary}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[120px]">
                          {formatLocalizedText(row.location, language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {parsedRows.length > 0 ? (
              <span>
                {language === 'km'
                  ? `ត្រៀមរួចរាល់សម្រាប់នាំចូលបុគ្គលិកចំនួន ${validCount} នាក់ (បង្កើតគណនី និងច្បាប់ឈប់សម្រាកដោយស្វ័យប្រវត្តិ)`
                  : `Ready to onboard ${validCount} employees (auto-creates ESS user logins & leave balances)`}
              </span>
            ) : (
              <span>
                {language === 'km'
                  ? 'ជ្រើសរើសឯកសារ CSV ឬទាញយកគំរូ CSV ដើម្បីចាប់ផ្តើម'
                  : 'Select a CSV file or download the template to begin'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0 || isImporting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="animate-spin" size={15} />
                  <span>{language === 'km' ? 'កំពុងនាំចូល...' : 'Importing Workforce...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>
                    {t('emp_import_btn')} ({validCount})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
