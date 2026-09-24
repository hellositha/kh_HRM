'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatLocalizedText } from '@/lib/translations';
import {
  Building2,
  Users,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Edit3,
  Trash2,
  DollarSign,
  UserCheck,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  FolderOpen,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  manager_name: string | null;
  manager_avatar?: string | null;
  budget: number;
  color: string;
  employee_count: number;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
}

interface DepartmentDetail extends Department {
  members?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    status: string;
    employment_type: string;
    salary: number;
  }>;
}

const COLOR_OPTIONS = [
  { label: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { label: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
  { label: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500' },
  { label: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { label: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { label: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { label: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { label: 'Rose', value: '#f43f5e', bg: 'bg-rose-500' },
];

function parseDeptName(raw: string | null | undefined): { km: string; en: string } {
  if (!raw) return { km: '', en: '' };
  const str = String(raw).trim();
  const match = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const p1 = match[1].trim();
    const p2 = match[2].trim();
    if (/[\u1780-\u17FF]/.test(p1)) {
      return { km: p1, en: p2 };
    }
    return { km: p2, en: p1 };
  }
  if (/[\u1780-\u17FF]/.test(str)) {
    return { km: str, en: '' };
  }
  return { km: '', en: str };
}

function buildDeptName(km: string, en: string): string {
  const cleanKm = (km || '').trim();
  const cleanEn = (en || '').trim();
  if (cleanKm && cleanEn) {
    return `${cleanKm} (${cleanEn})`;
  }
  return cleanKm || cleanEn;
}

export default function DepartmentsPage() {
  const { language, showToast, refreshKey, triggerRefresh, currentPersona } = useApp();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Permission: Admins and Managers have write permissions
  const canManage = currentPersona?.role === 'Manager' || currentPersona?.role === 'Admin';

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [renamingDepartment, setRenamingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [activeDrawerDeptId, setActiveDrawerDeptId] = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail] = useState<DepartmentDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick Rename form inputs
  const [renameKm, setRenameKm] = useState('');
  const [renameEn, setRenameEn] = useState('');
  const [renameSubmitting, setRenameSubmitting] = useState(false);

  // Full Create/Edit form inputs
  const [formData, setFormData] = useState({
    name_km: '',
    name_en: '',
    description: '',
    manager_id: '',
    budget: '150000',
    color: '#3b82f6',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/employees'),
      ]);

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
      }

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }
    } catch {
      showToast(
        language === 'km' ? 'កំហុសក្នុងការទាញយកទិន្នន័យនាយកដ្ឋាន' : 'Error loading departments data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Check URL param for ?action=new to automatically open create modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        handleOpenCreate();
      }
    }
  }, []);

  // Fetch single department detail when drawer is open
  useEffect(() => {
    if (!activeDrawerDeptId) {
      setDrawerDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setDrawerLoading(true);
      try {
        const res = await fetch(`/api/departments/${activeDrawerDeptId}`);
        if (res.ok) {
          const data = await res.json();
          setDrawerDetail(data);
        }
      } catch {
        showToast(
          language === 'km' ? 'កំហុសក្នុងការទាញយកព័ត៌មានលម្អិត' : 'Error loading department details',
          'error'
        );
      } finally {
        setDrawerLoading(false);
      }
    };

    fetchDetail();
  }, [activeDrawerDeptId]);

  // Open modal for Create
  const handleOpenCreate = () => {
    if (!canManage) {
      showToast(
        language === 'km'
          ? 'មានតែគណៈគ្រប់គ្រង ឬ Admin ប៉ុណ្ណោះដែលអាចបង្កើតនាយកដ្ឋាន'
          : 'Only Managers and Admins can create departments',
        'error'
      );
      return;
    }
    setEditingDepartment(null);
    setFormData({
      name_km: '',
      name_en: '',
      description: '',
      manager_id: '',
      budget: '150000',
      color: '#3b82f6',
    });
    setIsFormModalOpen(true);
  };

  // Open modal for Full Edit
  const handleOpenEdit = (dept: Department) => {
    if (!canManage) {
      showToast(
        language === 'km'
          ? 'មានតែគណៈគ្រប់គ្រង ឬ Admin ប៉ុណ្ណោះដែលអាចកែប្រែនាយកដ្ឋាន'
          : 'Only Managers and Admins can edit departments',
        'error'
      );
      return;
    }
    const { km, en } = parseDeptName(dept.name);
    setEditingDepartment(dept);
    setFormData({
      name_km: km,
      name_en: en,
      description: dept.description || '',
      manager_id: dept.manager_id || '',
      budget: String(dept.budget || 0),
      color: dept.color || '#3b82f6',
    });
    setIsFormModalOpen(true);
  };

  // Open Quick Rename Modal
  const handleOpenRename = (dept: Department) => {
    if (!canManage) {
      showToast(
        language === 'km'
          ? 'មានតែគណៈគ្រប់គ្រង ឬ Admin ប៉ុណ្ណោះដែលអាចប្តូរឈ្មោះនាយកដ្ឋាន'
          : 'Only Managers and Admins can rename departments',
        'error'
      );
      return;
    }
    setRenamingDepartment(dept);
    const { km, en } = parseDeptName(dept.name);
    setRenameKm(km);
    setRenameEn(en);
  };

  // Submit Quick Rename
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingDepartment) return;

    const newName = buildDeptName(renameKm, renameEn);
    if (!newName) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលឈ្មោះនាយកដ្ឋាន' : 'Department name is required',
        'error'
      );
      return;
    }

    setRenameSubmitting(true);
    try {
      const res = await fetch(`/api/departments/${renamingDepartment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        showToast(
          language === 'km'
            ? `បានប្តូរឈ្មោះនាយកដ្ឋានទៅជា "${newName}" ដោយជោគជ័យ! ✓`
            : `Department renamed to "${newName}" successfully! ✓`,
          'success'
        );
        setRenamingDepartment(null);
        triggerRefresh();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to rename department', 'error');
      }
    } catch {
      showToast(
        language === 'km' ? 'កំហុសក្នុងការប្តូរឈ្មោះនាយកដ្ឋាន' : 'Error renaming department',
        'error'
      );
    } finally {
      setRenameSubmitting(false);
    }
  };

  // Submit Full Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = buildDeptName(formData.name_km, formData.name_en);
    if (!finalName) {
      showToast(
        language === 'km' ? 'សូមបញ្ចូលឈ្មោះនាយកដ្ឋាន' : 'Department name is required',
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: finalName,
        description: formData.description.trim(),
        manager_id: formData.manager_id || null,
        budget: Number(formData.budget) || 0,
        color: formData.color,
      };

      const url = editingDepartment
        ? `/api/departments/${editingDepartment.id}`
        : '/api/departments';
      const method = editingDepartment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          editingDepartment
            ? (language === 'km' ? 'បានកែប្រែនាយកដ្ឋានជោគជ័យ! ✓' : 'Department updated successfully! ✓')
            : (language === 'km' ? 'បានបង្កើតនាយកដ្ឋានថ្មីជោគជ័យ! ✓' : 'Department created successfully! ✓'),
          'success'
        );
        setIsFormModalOpen(false);
        triggerRefresh();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save department', 'error');
      }
    } catch {
      showToast(
        language === 'km' ? 'កំហុសប្រព័ន្ធក្នុងការរក្សាទុក' : 'System error saving department',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete department
  const handleConfirmDelete = async () => {
    if (!deletingDepartment) return;

    try {
      const res = await fetch(`/api/departments/${deletingDepartment.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast(
          language === 'km'
            ? `បានលុបនាយកដ្ឋាន ${formatLocalizedText(deletingDepartment.name, language)} ជោគជ័យ`
            : `Department ${formatLocalizedText(deletingDepartment.name, language)} deleted successfully`,
          'info'
        );
        setDeletingDepartment(null);
        if (activeDrawerDeptId === deletingDepartment.id) {
          setActiveDrawerDeptId(null);
        }
        triggerRefresh();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete department', 'error');
      }
    } catch {
      showToast(
        language === 'km' ? 'កំហុសក្នុងការលុបនាយកដ្ឋាន' : 'Error deleting department',
        'error'
      );
    }
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter((d) => {
      const localizedName = formatLocalizedText(d.name, language).toLowerCase();
      const rawName = d.name.toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const mgr = (d.manager_name || '').toLowerCase();
      return (
        localizedName.includes(q) ||
        rawName.includes(q) ||
        desc.includes(q) ||
        mgr.includes(q)
      );
    });
  }, [departments, searchQuery, language]);

  // Aggregate statistics
  const totalHeadcount = useMemo(() => {
    return departments.reduce((acc, d) => acc + (d.employee_count || 0), 0);
  }, [departments]);

  const totalBudget = useMemo(() => {
    return departments.reduce((acc, d) => acc + (d.budget || 0), 0);
  }, [departments]);

  const avgTeamSize = useMemo(() => {
    if (departments.length === 0) return 0;
    return Math.round(totalHeadcount / departments.length);
  }, [departments, totalHeadcount]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Building2 size={24} />
            </div>
            <span>{language === 'km' ? 'នាយកដ្ឋាន & រចនាសម្ព័ន្ធស្ថាប័ន' : 'Departments & Organizational Units'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'km'
              ? 'គ្រប់គ្រងអង្គភាពការងារ បន្ថែម ប្តូរឈ្មោះ លុប និងចាត់ចែងកម្លាំងពលកម្មតាមផ្នែក'
              : 'Manage organizational units, add new divisions, rename, delete, and allocate workforce'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManage ? (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>{language === 'km' ? 'បង្កើតនាយកដ្ឋានថ្មី' : 'Add Department'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <ShieldAlert size={14} className="text-amber-600" />
              <span>{language === 'km' ? 'ទិដ្ឋភាពមើលរចនាសម្ព័ន្ធ (View Only)' : 'Organizational Directory (Read Only)'}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'km' ? 'នាយកដ្ឋានសរុប' : 'Total Units'}
            </span>
            <Building2 size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{departments.length}</div>
          <p className="text-[10px] text-slate-500">
            {language === 'km' ? 'ផ្នែកការងារសកម្មទាំងអស់' : 'Active operational divisions'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'km' ? 'កម្លាំងពលកម្មសរុប' : 'Assigned Workforce'}
            </span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalHeadcount}</div>
          <p className="text-[10px] text-slate-500">
            {language === 'km' ? 'បុគ្គលិកពេញសិទ្ធិ និងកិច្ចសន្យា' : 'Total deployed headcount'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'km' ? 'ថវិកាប្រតិបត្តិការ' : 'Annual Budget'}
            </span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ${totalBudget.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            {language === 'km' ? 'ថវិកាបែងចែកសរុបប្រចាំឆ្នាំ' : 'Total annual allocation'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'km' ? 'មធ្យមភាគសមាជិក' : 'Avg Team Size'}
            </span>
            <UserCheck size={16} className="text-violet-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{avgTeamSize}</div>
          <p className="text-[10px] text-slate-500">
            {language === 'km' ? 'បុគ្គលិកក្នុងមួយនាយកដ្ឋាន' : 'Members per department'}
          </p>
        </div>
      </div>

      {/* Search & View Mode Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              language === 'km'
                ? 'ស្វែងរកនាយកដ្ឋាន ឬប្រធានផ្នែក...'
                : 'Search departments or leaders...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={15} />
              <span className="text-[11px]">{language === 'km' ? 'ក្រឡា' : 'Grid'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon size={15} />
              <span className="text-[11px]">{language === 'km' ? 'តារាង' : 'Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          {language === 'km' ? 'កំពុងទាញយកទិន្នន័យនាយកដ្ឋាន...' : 'Loading departments data...'}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Building2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'km' ? 'មិនមាននាយកដ្ឋានត្រូវនឹងការស្វែងរកទេ' : 'No departments found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'km'
              ? 'សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេង ឬបង្កើតនាយកដ្ឋានថ្មី។'
              : 'Try adjusting your search criteria or create a new department unit.'}
          </p>
          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{language === 'km' ? 'បង្កើតនាយកដ្ឋានថ្មី' : 'Add Department'}</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const localizedName = formatLocalizedText(dept.name, language);
            const deptColor = dept.color || '#3b82f6';
            const { km: nameKm, en: nameEn } = parseDeptName(dept.name);

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Colored Top Bar */}
                <div className="h-2 w-full" style={{ backgroundColor: deptColor }} />

                <div className="p-5 flex-1 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: deptColor }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                          {localizedName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {dept.id}
                          </span>
                          {nameKm && nameEn && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium truncate max-w-[120px]">
                              {language === 'km' ? nameEn : nameKm}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {dept.employee_count}{' '}
                      {language === 'km' ? 'នាក់' : dept.employee_count === 1 ? 'colleague' : 'colleagues'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {dept.description ||
                      (language === 'km'
                        ? 'នាយកដ្ឋានប្រតិបត្តិការចម្បងក្នុងរចនាសម្ព័ន្ធស្ថាប័ន។'
                        : 'Core operational unit within organizational structure.')}
                  </p>

                  {/* Metadata Details */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        {language === 'km' ? 'ប្រធានផ្នែក' : 'Department Head'}
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block">
                        {dept.manager_name
                          ? formatLocalizedText(dept.manager_name, language)
                          : language === 'km'
                          ? 'មិនទាន់ចាត់តាំង'
                          : 'Unassigned'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        {language === 'km' ? 'ថវិកាប្រចាំឆ្នាំ' : 'Operating Budget'}
                      </span>
                      <span className="font-extrabold text-slate-900 text-[11px] block">
                        ${(dept.budget || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveDrawerDeptId(dept.id)}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{language === 'km' ? 'មើលសមាជិក' : 'View Members'}</span>
                    <ChevronRight size={14} />
                  </button>

                  {canManage ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenRename(dept)}
                        title={language === 'km' ? 'ប្តូរឈ្មោះនាយកដ្ឋាន (Rename)' : 'Rename Department'}
                        className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>{language === 'km' ? 'ប្តូរឈ្មោះ' : 'Rename'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(dept)}
                        title={language === 'km' ? 'កែប្រែព័ត៌មានលម្អិត' : 'Edit Details'}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => setDeletingDepartment(dept)}
                        title={language === 'km' ? 'លុបនាយកដ្ឋាន' : 'Delete Department'}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold italic">
                      {language === 'km' ? 'ទិដ្ឋភាពមើល' : 'Read only'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">{language === 'km' ? 'នាយកដ្ឋាន' : 'Department'}</th>
                  <th className="px-5 py-3.5">{language === 'km' ? 'ប្រធានផ្នែក' : 'Department Head'}</th>
                  <th className="px-5 py-3.5 text-center">{language === 'km' ? 'សមាជិក' : 'Headcount'}</th>
                  <th className="px-5 py-3.5">{language === 'km' ? 'ថវិកាប្រចាំឆ្នាំ' : 'Budget'}</th>
                  <th className="px-5 py-3.5 text-right">{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => {
                  const localizedName = formatLocalizedText(dept.name, language);
                  const deptColor = dept.color || '#3b82f6';
                  const { km: nameKm, en: nameEn } = parseDeptName(dept.name);

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => setActiveDrawerDeptId(dept.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: deptColor }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{localizedName}</span>
                            {nameKm && nameEn && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                                {language === 'km' ? nameEn : nameKm}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {dept.description || 'No description provided'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {dept.manager_name ? (
                          <div className="font-semibold text-slate-800">
                            {formatLocalizedText(dept.manager_name, language)}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            {language === 'km' ? 'មិនទាន់ចាត់តាំង' : 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {dept.employee_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        ${(dept.budget || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDrawerDeptId(dept.id);
                            }}
                            className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold text-xs cursor-pointer"
                          >
                            {language === 'km' ? 'សមាជិក' : 'Members'}
                          </button>

                          {canManage && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRename(dept);
                                }}
                                title={language === 'km' ? 'ប្តូរឈ្មោះ (Rename)' : 'Rename'}
                                className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 size={13} />
                                <span>{language === 'km' ? 'ប្តូរឈ្មោះ' : 'Rename'}</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(dept);
                                }}
                                title={language === 'km' ? 'កែប្រែ' : 'Edit'}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingDepartment(dept);
                                }}
                                title={language === 'km' ? 'លុប' : 'Delete'}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK RENAME MODAL */}
      {renamingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'km' ? 'ប្តូរឈ្មោះនាយកដ្ឋាន' : 'Rename Department'}
                </h3>
              </div>
              <button
                onClick={() => setRenamingDepartment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {language === 'km' ? 'ឈ្មោះបច្ចុប្បន្ន' : 'Current Name'}
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatLocalizedText(renamingDepartment.name, language)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {renamingDepartment.id}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះនាយកដ្ឋាន (ភាសាខ្មែរ)' : 'Department Name (Khmer)'}
                </label>
                <input
                  type="text"
                  value={renameKm}
                  onChange={(e) => setRenameKm(e.target.value)}
                  placeholder="ឧ. ផ្នែកបច្ចេកវិទ្យា & វិស្វកម្ម"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ឈ្មោះនាយកដ្ឋាន (English)' : 'Department Name (English)'}
                </label>
                <input
                  type="text"
                  value={renameEn}
                  onChange={(e) => setRenameEn(e.target.value)}
                  placeholder="e.g. Engineering & Technology"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Live Preview */}
              {(renameKm.trim() || renameEn.trim()) && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl text-indigo-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    {language === 'km' ? 'ទម្រង់ឈ្មោះដែលត្រូវរក្សាទុក (Live Preview)' : 'Final Saved Name (Live Preview)'}
                  </span>
                  <p className="font-extrabold text-xs">
                    {buildDeptName(renameKm, renameEn)}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRenamingDepartment(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={renameSubmitting || (!renameKm.trim() && !renameEn.trim())}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {renameSubmitting
                    ? (language === 'km' ? 'កំពុងប្តូរឈ្មោះ...' : 'Renaming...')
                    : (language === 'km' ? 'រក្សាទុកឈ្មោះថ្មី' : 'Save New Name')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / FULL EDIT DEPARTMENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Building2 size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDepartment
                    ? (language === 'km' ? 'កែប្រែព័ត៌មាននាយកដ្ឋាន' : 'Edit Department Details')
                    : (language === 'km' ? 'បង្កើតនាយកដ្ឋានថ្មី' : 'Create New Department')}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះជាភាសាខ្មែរ' : 'Name in Khmer'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_km}
                    onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
                    placeholder="ឧ. ផ្នែកបច្ចេកវិទ្យា & វិស្វកម្ម"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ឈ្មោះជាភាសាអង់គ្លេស' : 'Name in English'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g. Engineering & Technology"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bilingual preview */}
              {(formData.name_km.trim() || formData.name_en.trim()) && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                  <span className="font-semibold text-slate-400">
                    {language === 'km' ? 'ឈ្មោះសរុប:' : 'Combined:'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {buildDeptName(formData.name_km, formData.name_en)}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ប្រធានផ្នែក (Department Head / Manager)' : 'Department Head / Lead'}
                </label>
                <select
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  <option value="">{language === 'km' ? '-- មិនទាន់ចាត់តាំង --' : '-- Unassigned / None --'}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {formatLocalizedText(`${emp.first_name} ${emp.last_name}`, language)} ({emp.id}) - {formatLocalizedText(emp.role, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ថវិកាប្រចាំឆ្នាំ ($ USD)' : 'Annual Budget ($ USD)'}
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="150000"
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'km' ? 'ពណ៌សម្គាល់ (Theme Color)' : 'Theme Color'}
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer ${
                          formData.color === c.value
                            ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                      >
                        {formData.color === c.value && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ការពិពណ៌នាពីតួនាទីនាយកដ្ឋាន' : 'Role & Mission Description'}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    language === 'km'
                      ? 'ពិពណ៌នាអំពីបេសកកម្ម និងភារកិច្ចចម្បងរបស់នាយកដ្ឋាន...'
                      : 'Outline the responsibilities, focus areas, and deliverables of this unit...'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!formData.name_km.trim() && !formData.name_en.trim())}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? (language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...')
                    : editingDepartment
                    ? (language === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Update Department')
                    : (language === 'km' ? 'បង្កើតនាយកដ្ឋាន' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'km' ? 'បញ្ជាក់ការលុបនាយកដ្ឋាន?' : 'Confirm Delete Department?'}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {language === 'km'
                ? `តើអ្នកប្រាកដជាចង់លុបនាយកដ្ឋាន "${formatLocalizedText(deletingDepartment.name, language)}" (${deletingDepartment.id}) មែនទេ?`
                : `Are you sure you want to delete department "${formatLocalizedText(deletingDepartment.name, language)}" (${deletingDepartment.id})?`}
            </p>
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-left text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span>{language === 'km' ? 'សុវត្ថិភាពទិន្នន័យបុគ្គលិក' : 'Employee Data Safety'}</span>
              </div>
              <p>
                {language === 'km'
                  ? `បុគ្គលិកដែលមាននៅក្នុងនាយកដ្ឋាននេះ (${deletingDepartment.employee_count} នាក់) នឹងមិនត្រូវលុបឡើយ ដោយគ្រាន់តែកំណត់ជាគ្មាននាយកដ្ឋានជាបណ្តោះអាសន្ន។`
                  : `Currently assigned staff members (${deletingDepartment.employee_count} colleagues) will NOT be deleted; they will simply be unassigned.`}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingDepartment(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-xs cursor-pointer"
              >
                {language === 'km' ? 'ទេ, បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs cursor-pointer"
              >
                {language === 'km' ? 'បាទ/ចាស, លុបនាយកដ្ឋាន' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MEMBERS SLIDE-OVER DRAWER */}
      {activeDrawerDeptId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: drawerDetail?.color || '#3b82f6' }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {drawerDetail ? formatLocalizedText(drawerDetail.name, language) : 'Department Members'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {drawerDetail
                      ? `${drawerDetail.employee_count} ${
                          language === 'km' ? 'សមាជិកដែលបានចាត់តាំង' : 'assigned team members'
                        }`
                      : 'Loading members...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawerDeptId(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {drawerLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {language === 'km' ? 'កំពុងទាញយកបញ្ជីសមាជិក...' : 'Loading member roster...'}
                </div>
              ) : !drawerDetail || !drawerDetail.members || drawerDetail.members.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Users size={32} className="text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {language === 'km'
                      ? 'មិនទាន់មានបុគ្គលិកចាត់តាំងក្នុងនាយកដ្ឋាននេះនៅឡើយទេ'
                      : 'No employees currently assigned to this department'}
                  </p>
                  <Link
                    href="/employees"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2"
                  >
                    <span>{language === 'km' ? 'ទៅកាន់បញ្ជីបុគ្គលិក' : 'Go to Employee Directory'}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">
                      {language === 'km' ? 'បុគ្គលិកក្នុងនាយកដ្ឋាន' : 'Team Members'}
                    </span>
                    <Link
                      href="/employees"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <span>{language === 'km' ? 'គ្រប់គ្រងក្នុងបញ្ជីបុគ្គលិក' : 'Manage in Directory'}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>

                  {drawerDetail.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.avatar || '/avatars/khmer_female_1.jpg'}
                          alt={member.first_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {formatLocalizedText(member.first_name, language)}{' '}
                            {formatLocalizedText(member.last_name, language)}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {formatLocalizedText(member.role, language)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {formatLocalizedText(member.employment_type, language)}
                        </span>
                        <Link
                          href="/employees"
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Open Employee Profile"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {canManage && drawerDetail ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenRename(drawerDetail)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 size={13} />
                    <span>{language === 'km' ? 'ប្តូរឈ្មោះ' : 'Rename'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(drawerDetail)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit2 size={13} />
                    <span>{language === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                  </button>
                </div>
              ) : (
                <div />
              )}
              <button
                onClick={() => setActiveDrawerDeptId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
              >
                {language === 'km' ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
