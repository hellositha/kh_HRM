'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Employee, Department } from '@/lib/types';
import { formatLocalizedText } from '@/lib/translations';
import { CAMBODIA_PROVINCES, CAMBODIA_BANKS } from '@/components/GlobalModals';
import {
  X,
  User,
  Phone,
  Briefcase,
  CreditCard,
  ShieldCheck,
  HeartHandshake,
  FileText,
  Camera,
  Upload,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Trash2,
  IdCard,
} from 'lucide-react';

type EditStaffTab = 'personal' | 'contact' | 'employment' | 'payroll' | 'nssf' | 'emergency' | 'documents';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: Department[];
  onSuccess: (updatedEmployee: Employee) => void;
}

export default function EmployeeEditModal({
  isOpen,
  onClose,
  employee,
  departments,
  onSuccess,
}: EmployeeEditModalProps) {
  const { language, showToast, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<EditStaffTab>('personal');
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    // 1. Personal Information
    last_name: '',
    first_name: '',
    gender: 'ប្រុស (Male)',
    dob: '',
    nationality: 'កម្ពុជា (Cambodian)',
    marital_status: 'នៅលីវ (Single)',
    national_id: '',
    status: 'Active',
    avatar: '',

    // 2. Contact Information
    phone: '',
    email: '',
    current_address: '',
    province_city: 'រាជធានីភ្នំពេញ (Phnom Penh)',
    district: '',
    commune_sangkat: '',
    village: '',

    // 3. Employment Information
    department_id: '',
    role: '',
    employment_type: 'ពេញម៉ោង (Full-Time)',
    employee_type: 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
    join_date: '',
    contract_type: 'UDC (មិនកំណត់ថិរវេលា)',
    contract_start: '',
    contract_end: '',
    manager_id: '',
    work_location: 'ការិយាល័យកណ្តាល (Head Office)',

    // 4. Salary & Payroll
    salary: '1200',
    salary_currency: 'USD ($)',
    salary_frequency: 'ប្រចាំខែ (Monthly)',
    pay_grade: 'Level 3 - Officer',
    transport_allowance: '0',
    meal_allowance: '0',
    housing_allowance: '0',
    attendance_allowance: '0',
    seniority_bonus: '0',
    bank_name: 'ABA Bank (ធនាគារ អេ ប៊ី អេ)',
    bank_account_name: '',
    bank_account_number: '',

    // 5. NSSF Information
    nssf_member: 'មាន (Yes)',
    nssf_number: '',
    nssf_reg_date: '',

    // 6. Emergency Contact
    emergency_contact_name: '',
    emergency_contact_relationship: 'ប្តី/ប្រពន្ធ (Spouse)',
    emergency_contact_phone: '',
    emergency_contact_address: '',

    // 7. Documents & Bio
    bio: '',
    doc_national_id: '',
    doc_passport: '',
    doc_contract: '',
    doc_others: '',
  });

  // Populate form when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      const matchedDept = departments.find(
        (d) => d.id === employee.department_id || d.name === employee.department_id || d.name === employee.department_name
      );
      const resolvedDeptId = matchedDept ? matchedDept.id : (employee.department_id || departments[0]?.id || '');

      setFormData({
        last_name: employee.last_name || '',
        first_name: employee.first_name || '',
        gender: employee.gender || 'ប្រុស (Male)',
        dob: employee.dob || '',
        nationality: employee.nationality || 'កម្ពុជា (Cambodian)',
        marital_status: employee.marital_status || 'នៅលីវ (Single)',
        national_id: employee.national_id || '',
        status: employee.status || 'Active',
        avatar: employee.avatar || '',

        phone: employee.phone || '',
        email: employee.email || '',
        current_address: employee.current_address || '',
        province_city: employee.province_city || 'រាជធានីភ្នំពេញ (Phnom Penh)',
        district: employee.district || '',
        commune_sangkat: employee.commune_sangkat || '',
        village: employee.village || '',

        department_id: resolvedDeptId,
        role: employee.role || '',
        employment_type: employee.employment_type || 'ពេញម៉ោង (Full-Time)',
        employee_type: employee.employee_type || 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
        join_date: employee.join_date || '',
        contract_type: employee.contract_type || 'UDC (មិនកំណត់ថិរវេលា)',
        contract_start: employee.contract_start || employee.join_date || '',
        contract_end: employee.contract_end || '',
        manager_id: employee.manager_id || '',
        work_location: employee.work_location || 'ការិយាល័យកណ្តាល (Head Office)',

        salary: employee.salary !== undefined ? String(employee.salary) : '1200',
        salary_currency: employee.salary_currency || 'USD ($)',
        salary_frequency: employee.salary_frequency || 'ប្រចាំខែ (Monthly)',
        pay_grade: (employee as any).pay_grade || 'Level 3 - Officer',
        transport_allowance: String((employee as any).transport_allowance ?? 0),
        meal_allowance: String((employee as any).meal_allowance ?? 0),
        housing_allowance: String((employee as any).housing_allowance ?? 0),
        attendance_allowance: String((employee as any).attendance_allowance ?? 0),
        seniority_bonus: String((employee as any).seniority_bonus ?? 0),
        bank_name: employee.bank_name || 'ABA Bank (ធនាគារ អេ ប៊ី អេ)',
        bank_account_name: employee.bank_account_name || `${employee.first_name} ${employee.last_name}`.trim(),
        bank_account_number: employee.bank_account_number || '',

        nssf_member: employee.nssf_member || 'មាន (Yes)',
        nssf_number: employee.nssf_number || '',
        nssf_reg_date: employee.nssf_reg_date || employee.join_date || '',

        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_relationship: employee.emergency_contact_relationship || 'ប្តី/ប្រពន្ធ (Spouse)',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_address: employee.emergency_contact_address || '',

        bio: employee.bio || '',
        doc_national_id: employee.doc_national_id || '',
        doc_passport: employee.doc_passport || '',
        doc_contract: employee.doc_contract || '',
        doc_others: employee.doc_others || '',
      });
      setActiveTab('personal');
    }
  }, [employee, isOpen, departments]);

  // Fetch managers
  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter out current employee from potential managers
          setManagers(data.filter((e: Employee) => e.id !== employee?.id));
        }
      })
      .catch((err) => console.error('Error fetching managers:', err));
  }, [employee?.id]);

  if (!isOpen || !employee) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(
        language === 'km' ? 'សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WEBP)' : 'Please select an image file (JPG, PNG, WEBP)',
        'error'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(
        language === 'km' ? 'ទំហំរូបភាពត្រូវតែតូចជាង 10MB' : 'Image file must be smaller than 10MB',
        'error'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and resize image to max 400x400
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          handleInputChange('avatar', compressedDataUrl);
          showToast(
            language === 'km' ? 'បានផ្ទុករូបថតបុគ្គលិកជោគជ័យ!' : 'Employee photo uploaded successfully!',
            'success'
          );
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលនាមត្រកូល និងនាមខ្លួន' : 'First and Last name are required', 'error');
      setActiveTab('personal');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary) || 0,
          transport_allowance: Number(formData.transport_allowance) || 0,
          meal_allowance: Number(formData.meal_allowance) || 0,
          housing_allowance: Number(formData.housing_allowance) || 0,
          attendance_allowance: Number(formData.attendance_allowance) || 0,
          seniority_bonus: Number(formData.seniority_bonus) || 0,
        }),
      });

      const data = await res.json();
      const updatedEmployee = data.employee || (data.id ? data : null);
      if (res.ok && updatedEmployee) {
        showToast(
          language === 'km'
            ? `បានកែប្រែព័ត៌មានបុគ្គលិក ${formData.first_name} ${formData.last_name} ជោគជ័យ!`
            : `Employee ${formData.first_name} ${formData.last_name} updated successfully!`,
          'success'
        );
        onSuccess(updatedEmployee);
        triggerRefresh();
        onClose();
      } else {
        showToast(data.error || (language === 'km' ? 'បរាជ័យក្នុងការកែប្រែព័ត៌មានបុគ្គលិក' : 'Failed to update employee'), 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: EditStaffTab; label_km: string; label_en: string; icon: any }[] = [
    { id: 'personal', label_km: 'ព័ត៌មានផ្ទាល់ខ្លួន', label_en: 'Personal Info', icon: User },
    { id: 'contact', label_km: 'ទំនាក់ទំនង & អាសយដ្ឋាន', label_en: 'Contact & Address', icon: Phone },
    { id: 'employment', label_km: 'ការងារ & កិច្ចសន្យា', label_en: 'Job & Contract', icon: Briefcase },
    { id: 'payroll', label_km: 'បៀវត្សរ៍ & ធនាគារ', label_en: 'Salary & Banking', icon: CreditCard },
    { id: 'nssf', label_km: 'ប.ស.ស (NSSF)', label_en: 'NSSF Social Security', icon: ShieldCheck },
    { id: 'emergency', label_km: 'ទំនាក់ទំនងបន្ទាន់', label_en: 'Emergency Contact', icon: HeartHandshake },
    { id: 'documents', label_km: 'ឯកសារ & ប្រវត្តិសង្ខេប', label_en: 'Docs & Biography', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.first_name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm ring-2 ring-indigo-500/20 shadow-xs">
                  {(formData.first_name?.[0] || 'E') + (formData.last_name?.[0] || '')}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  formData.status === 'Active'
                    ? 'bg-emerald-500'
                    : formData.status === 'Remote'
                    ? 'bg-blue-500'
                    : formData.status === 'On Leave'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>{language === 'km' ? 'កែសម្រួលព័ត៌មានបុគ្គលិក' : 'Edit Employee Profile'}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {employee.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {employee.first_name} {employee.last_name} &bull; {employee.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold shrink-0 gap-1 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/30 dark:bg-indigo-950/20 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={14} />
                <span>{language === 'km' ? tab.label_km : tab.label_en}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Employee Photo Upload Section - ONLY UPLOAD, NO AVATAR */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera size={15} className="text-indigo-600 dark:text-indigo-400" />
                      <span>{language === 'km' ? 'រូបថតបុគ្គលិក (Employee Photo)' : 'Employee Photo'}</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'km'
                        ? 'ផ្ទុករូបថតផ្ទាល់ខ្លួនពីឧបករណ៍/កុំព្យូទ័ររបស់អ្នក (JPG, PNG, WEBP) • អតិបរមា 10MB'
                        : 'Upload photo directly from your device (JPG, PNG, WEBP) • Max 10MB'}
                    </p>
                  </div>
                  {formData.avatar ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300/60 dark:border-emerald-800">
                      <CheckCircle2 size={12} /> {language === 'km' ? 'បានផ្ទុករួចរាល់' : 'Uploaded'}
                    </span>
                  ) : null}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                  }}
                />

                {formData.avatar ? (
                  /* Photo Preview Card */
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
                    <div className="relative group shrink-0">
                      <img
                        src={formData.avatar}
                        alt="Employee Photo Preview"
                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-xs font-semibold"
                        title={language === 'km' ? 'ប្តូររូបថត' : 'Change Photo'}
                      >
                        <Camera size={20} />
                        <span className="text-[10px] mt-0.5">{language === 'km' ? 'ប្តូរ' : 'Change'}</span>
                      </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {formData.first_name || formData.last_name
                          ? `${formData.first_name} ${formData.last_name}`
                          : (language === 'km' ? 'រូបថតបុគ្គលិក' : 'Employee Photo')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {language === 'km' ? 'រូបថតត្រូវបានផ្ទុកឡើង និងរួចរាល់សម្រាប់ការរក្សាទុក ✓' : 'Photo uploaded and ready to save ✓'}
                      </p>
                      <div className="flex items-center gap-2 pt-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                        >
                          <Upload size={13} />
                          <span>{language === 'km' ? 'ប្តូររូបថត' : 'Change Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('avatar', '');
                            if (avatarInputRef.current) avatarInputRef.current.value = '';
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                        >
                          <Trash2 size={13} />
                          <span>{language === 'km' ? 'លុបរូបថត' : 'Remove Photo'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Area */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingAvatar(true);
                    }}
                    onDragLeave={() => setIsDraggingAvatar(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingAvatar(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    onClick={() => avatarInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 ${
                      isDraggingAvatar
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-2xs">
                      <Camera size={26} />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {language === 'km'
                        ? 'ចុចទីនេះ ឬទម្លាក់រូបថតមកដើម្បីផ្ទុកឡើង'
                        : 'Click here or drag & drop photo to upload'}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                      {language === 'km' ? 'JPG, PNG, WEBP (អតិបរមា 10MB) • Upload only' : 'JPG, PNG, WEBP (Max 10MB) • Upload only'}
                    </p>
                    <span className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
                      <Upload size={14} />
                      <span>{language === 'km' ? 'ជ្រើសរើសរូបថតពីកុំព្យូទ័រ' : 'Choose Photo from Device'}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Names & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'នាមត្រកូល (Last Name / Surname) *' : 'Last Name / Surname *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'នាមខ្លួន (First Name / Given Name) *' : 'First Name / Given Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'ស្ថានភាពការងារ (Status)' : 'Employment Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Active">សកម្ម (Active)</option>
                    <option value="Remote">ធ្វើការពីចម្ងាយ (Remote / WFH)</option>
                    <option value="On Leave">កំពុងឈប់សម្រាក (On Leave)</option>
                    <option value="Terminated">បញ្ចប់ការងារ (Terminated)</option>
                  </select>
                </div>
              </div>

              {/* Gender, DOB, Nationality, Marital Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ភេទ (Gender)' : 'Gender'}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ប្រុស (Male)">ប្រុស (Male)</option>
                    <option value="ស្រី (Female)">ស្រី (Female)</option>
                    <option value="ផ្សេងទៀត (Other)">ផ្សេងទៀត (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត (DOB)' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'សញ្ជាតិ (Nationality)' : 'Nationality'}
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ស្ថានភាពអាពាហ៍ពិពាហ៍' : 'Marital Status'}
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleInputChange('marital_status', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="នៅលីវ (Single)">នៅលីវ (Single)</option>
                    <option value="មានគ្រួសារ (Married)">មានគ្រួសារ (Married)</option>
                    <option value="មេម៉ាយ/ពោះម៉ាយ (Divorced/Widowed)">មេម៉ាយ/ពោះម៉ាយ (Divorced/Widowed)</option>
                  </select>
                </div>
              </div>

              {/* National ID Card */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'លេខអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ (National ID)' : 'Cambodian National ID / Passport'}
                </label>
                <div className="relative">
                  <IdCard size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="010XXXXXX"
                    value={formData.national_id}
                    onChange={(e) => handleInputChange('national_id', e.target.value)}
                    className="w-full text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+855 12 345 678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'អ៊ីមែលការងារ (Company Email)' : 'Company Email'}
                  </label>
                  <input
                    type="email"
                    placeholder="name@hestra.kh"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Province / City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'រាជធានី / ខេត្ត (Province / City)' : 'Province / City'}
                  </label>
                  <select
                    value={formData.province_city}
                    onChange={(e) => handleInputChange('province_city', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    {CAMBODIA_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ខណ្ឌ / ស្រុក (District / Khan / Srok)' : 'District / Khan / Srok'}
                  </label>
                  <input
                    type="text"
                    placeholder="ខណ្ឌដូនពេញ / Daun Penh..."
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Commune / Sangkat & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'សង្កាត់ / ឃុំ (Commune / Sangkat)' : 'Commune / Sangkat'}
                  </label>
                  <input
                    type="text"
                    placeholder="សង្កាត់ផ្សារថ្មីទី១..."
                    value={formData.commune_sangkat}
                    onChange={(e) => handleInputChange('commune_sangkat', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ភូមិ (Village / Phum)' : 'Village / Phum'}
                  </label>
                  <input
                    type="text"
                    placeholder="ភូមិ ៤..."
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'អាសយដ្ឋានលំនៅឋានបច្ចុប្បន្នពេញលេញ (Full Current Address)' : 'Full Current Address'}
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ផ្ទះលេខ ១២, ផ្លូវ ២០០, រាជធានីភ្នំពេញ..."
                    value={formData.current_address}
                    onChange={(e) => handleInputChange('current_address', e.target.value)}
                    className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYMENT & CONTRACT */}
          {activeTab === 'employment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'តួនាទី / មុខតំណែង (Position / Role) *' : 'Position / Role *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>{language === 'km' ? 'ផ្នែក / នាយកដ្ឋាន' : 'Department'} *</span>
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => handleInputChange('department_id', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">{language === 'km' ? '-- ជ្រើសរើសនាយកដ្ឋាន --' : '-- Select Department --'}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {formatLocalizedText(dept.name, language)}
                      </option>
                    ))}
                    {formData.department_id && !departments.some((d) => d.id === formData.department_id || d.name === formData.department_id) && (
                      <option value={formData.department_id}>
                        {formatLocalizedText(formData.department_id, language)}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* Manager & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ប្រធានផ្ទាល់ (Line Manager)' : 'Line Manager'}
                  </label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => handleInputChange('manager_id', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">{language === 'km' ? 'គ្មានប្រធានផ្ទាល់ (None / Executive)' : 'None / Executive'}</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ប្រភេទការងារ (Employment Type)' : 'Employment Type'}
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ពេញម៉ោង (Full-Time)">ពេញម៉ោង (Full-Time)</option>
                    <option value="ក្រៅម៉ោង (Part-Time)">ក្រៅម៉ោង (Part-Time)</option>
                    <option value="កិច្ចសន្យា (Contract)">កិច្ចសន្យា (Contract)</option>
                    <option value="កម្មសិក្សា (Intern)">កម្មសិក្សា (Intern)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'លក្ខខណ្ឌបុគ្គលិក (Employee Type)' : 'Employee Type'}
                  </label>
                  <select
                    value={formData.employee_type}
                    onChange={(e) => handleInputChange('employee_type', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)">បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)</option>
                    <option value="បុគ្គលិកសាកល្បង (Probation)">បុគ្គលិកសាកល្បង (Probation)</option>
                    <option value="បុគ្គលិកបណ្តោះអាសន្ន (Casual / Temporary)">បុគ្គលិកបណ្តោះអាសន្ន (Casual / Temporary)</option>
                  </select>
                </div>
              </div>

              {/* Join Date, Contract Type, Start/End */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'កាលបរិច្ឆេទចូលបម្រើការងារ' : 'Join Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => handleInputChange('join_date', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ប្រភេទកិច្ចសន្យា' : 'Contract Type'}
                  </label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => handleInputChange('contract_type', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="UDC (មិនកំណត់ថិរវេលា)">UDC (មិនកំណត់ថិរវេលា)</option>
                    <option value="FDC (កំណត់ថិរវេលា)">FDC (កំណត់ថិរវេលា)</option>
                    <option value="Probation (សាកល្បងការងារ)">Probation (សាកល្បងការងារ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'កាលបរិច្ឆេទកិច្ចសន្យា' : 'Contract Start'}
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start}
                    onChange={(e) => handleInputChange('contract_start', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ផុតកំណត់កិច្ចសន្យា' : 'Contract End'}
                  </label>
                  <input
                    type="date"
                    value={formData.contract_end}
                    onChange={(e) => handleInputChange('contract_end', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Work Location */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'ទីតាំងបំពេញការងារ (Work Location)' : 'Work Location'}
                </label>
                <input
                  type="text"
                  value={formData.work_location}
                  onChange={(e) => handleInputChange('work_location', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PAYROLL & BANKING */}
          {activeTab === 'payroll' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'km' ? 'ប្រាក់បៀវត្សរ៍គោល (Base Salary) *' : 'Base Salary *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className="w-full text-xs font-bold pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'រូបិយប័ណ្ណ (Currency)' : 'Currency'}
                  </label>
                  <select
                    value={formData.salary_currency}
                    onChange={(e) => handleInputChange('salary_currency', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="KHR (៛)">KHR (៛)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'វដ្តបើកប្រាក់ (Payment Frequency)' : 'Payment Frequency'}
                  </label>
                  <select
                    value={formData.salary_frequency}
                    onChange={(e) => handleInputChange('salary_frequency', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ប្រចាំខែ (Monthly)">ប្រចាំខែ (Monthly)</option>
                    <option value="ពីរសប្តាហ៍ម្តង (Bi-weekly)">ពីរសប្តាហ៍ម្តង (Bi-weekly)</option>
                  </select>
                </div>
              </div>

              {/* Pay Grade & Allowances */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'km' ? 'កម្រិតបៀវត្សរ៍ & ប្រាក់ឧបត្ថម្ភ (Pay Grade & Allowances)' : 'Pay Grade & Allowances'}
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {language === 'km' ? 'កញ្ចប់សរុប៖ ' : 'Total Package: '}
                    ${(
                      Number(formData.salary || 0) +
                      Number(formData.transport_allowance || 0) +
                      Number(formData.meal_allowance || 0) +
                      Number(formData.housing_allowance || 0) +
                      Number(formData.attendance_allowance || 0) +
                      Number(formData.seniority_bonus || 0)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'កម្រិតតួនាទី (Pay Grade)' : 'Pay Grade'}
                    </label>
                    <select
                      value={formData.pay_grade}
                      onChange={(e) => handleInputChange('pay_grade', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Level 1 - Intern">Level 1 - Intern</option>
                      <option value="Level 2 - Junior">Level 2 - Junior</option>
                      <option value="Level 3 - Officer">Level 3 - Officer</option>
                      <option value="Level 4 - Senior">Level 4 - Senior</option>
                      <option value="Level 5 - Lead / Supervisor">Level 5 - Lead / Supervisor</option>
                      <option value="Level 6 - Manager">Level 6 - Manager</option>
                      <option value="Level 7 - Director">Level 7 - Director</option>
                      <option value="Level 8 - Executive / C-Suite">Level 8 - Executive / C-Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'ថ្លៃធ្វើដំណើរ (Transport $)' : 'Transport Allowance ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.transport_allowance}
                      onChange={(e) => handleInputChange('transport_allowance', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'ថ្លៃអាហារ (Meal $)' : 'Meal Allowance ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.meal_allowance}
                      onChange={(e) => handleInputChange('meal_allowance', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'ថ្លៃស្នាក់នៅ (Housing $)' : 'Housing Allowance ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.housing_allowance}
                      onChange={(e) => handleInputChange('housing_allowance', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'ប្រាក់វត្តមានការងារ (Attendance $)' : 'Attendance Bonus ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.attendance_allowance}
                      onChange={(e) => handleInputChange('attendance_allowance', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'km' ? 'ប្រាក់អតីតភាព (Seniority $)' : 'Seniority Indemnity ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.seniority_bonus}
                      onChange={(e) => handleInputChange('seniority_bonus', e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ឈ្មោះធនាគារ (Bank Name)' : 'Bank Name'}
                  </label>
                  <select
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    {CAMBODIA_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ឈ្មោះម្ចាស់គណនី (Account Name)' : 'Account Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_name}
                    onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'លេខគណនី (Account Number)' : 'Account Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="000 123 456"
                    value={formData.bank_account_number}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NSSF */}
          {activeTab === 'nssf' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'សមាជិក ប.ស.ស (NSSF Member)' : 'NSSF Member'}
                  </label>
                  <select
                    value={formData.nssf_member}
                    onChange={(e) => handleInputChange('nssf_member', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="មាន (Yes)">មាន (Yes)</option>
                    <option value="មិនទាន់មាន (No)">មិនទាន់មាន (No)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'លេខប័ណ្ណ ប.ស.ស (NSSF Card No.)' : 'NSSF Card Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={formData.nssf_number}
                    onChange={(e) => handleInputChange('nssf_number', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'កាលបរិច្ឆេទចុះឈ្មោះ ប.ស.ស' : 'NSSF Registration Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.nssf_reg_date}
                    onChange={(e) => handleInputChange('nssf_reg_date', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EMERGENCY CONTACT */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ឈ្មោះអ្នកទំនាក់ទំនង (Contact Name)' : 'Contact Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ទំនាក់ទំនង / ត្រូវជា (Relationship)' : 'Relationship'}
                  </label>
                  <select
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ប្តី/ប្រពន្ធ (Spouse)">ប្តី/ប្រពន្ធ (Spouse)</option>
                    <option value="ឪពុក/ម្តាយ (Parents)">ឪពុក/ម្តាយ (Parents)</option>
                    <option value="បងប្អូន (Sibling)">បងប្អូន (Sibling)</option>
                    <option value="មិត្តភក្តិ (Friend)">មិត្តភក្តិ (Friend)</option>
                    <option value="ផ្សេងទៀត (Other)">ផ្សេងទៀត (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'អាសយដ្ឋានអ្នកទំនាក់ទំនង (Address)' : 'Emergency Contact Address'}
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_address}
                  onChange={(e) => handleInputChange('emergency_contact_address', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS & BIO */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'ប្រវត្តិសង្ខេប & ចំណាំ (Bio / Notes)' : 'Biography / Professional Notes'}
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Professional summary, competencies, education..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'តំណឯកសារអត្តសញ្ញាណប័ណ្ណ (National ID Scan)' : 'National ID Document Scan Link'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /docs/nid.pdf"
                    value={formData.doc_national_id}
                    onChange={(e) => handleInputChange('doc_national_id', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'តំណឯកសារលិខិតឆ្លងដែន (Passport Scan)' : 'Passport Document Scan Link'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /docs/passport.pdf"
                    value={formData.doc_passport}
                    onChange={(e) => handleInputChange('doc_passport', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'តំណកិច្ចសន្យាការងារ (Signed Contract)' : 'Signed Contract Link'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /docs/contract.pdf"
                    value={formData.doc_contract}
                    onChange={(e) => handleInputChange('doc_contract', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ឯកសារផ្សេងៗ (Other Attachments)' : 'Other Attachments Link'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /docs/cert.pdf"
                    value={formData.doc_others}
                    onChange={(e) => handleInputChange('doc_others', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="text-[11px] text-slate-400">
              {language === 'km' ? 'ចុច "រក្សាទុក" ដើម្បីធ្វើបច្ចុប្បន្នភាព' : 'Click save to apply changes'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>{loading ? (language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving Changes...') : (language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
