export type Role = 'Admin' | 'Manager' | 'Employee';

export type Theme = 'nordic' | 'midnight' | 'indigo';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote' | 'Terminated';

export interface Department {
  id: string;
  name: string;
  description: string;
  manager_id?: string;
  manager_name?: string;
  budget: number;
  color: string;
  employee_count?: number;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department_id: string;
  department_name?: string;
  employment_type: string;
  status: string;
  salary: number;
  join_date: string;
  manager_id?: string;
  manager_name?: string;
  avatar: string;
  location: string;
  bio?: string;
  // 1. Personal Information
  gender?: string;
  dob?: string;
  nationality?: string;
  marital_status?: string;
  national_id?: string;
  // 2. Contact Information
  current_address?: string;
  province_city?: string;
  district?: string;
  commune_sangkat?: string;
  village?: string;
  // 3. Employee & Contract Information
  employee_type?: string;
  contract_type?: string;
  contract_start?: string;
  contract_end?: string;
  work_location?: string;
  // 4. Salary & Payroll
  salary_currency?: string;
  salary_frequency?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  transport_allowance?: number;
  meal_allowance?: number;
  housing_allowance?: number;
  attendance_allowance?: number;
  seniority_bonus?: number;
  pay_grade?: string;
  last_salary_review?: string;
  // 5. NSSF Information
  nssf_member?: string;
  nssf_number?: string;
  nssf_reg_date?: string;
  // 6. Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_address?: string;
  // 7. Documents
  doc_national_id?: string;
  doc_passport?: string;
  doc_contract?: string;
  doc_others?: string;
  created_at: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Remote' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: AttendanceStatus;
  work_hours: number;
  notes?: string;
}

export type ShiftType = 'morning' | 'office' | 'evening' | 'night' | 'weekend_duty' | 'on_call' | 'off' | 'custom' | (string & {});

export interface ShiftDefinition {
  id: string;
  name_en: string;
  name_km: string;
  short_code: string;
  start_time: string;
  end_time: string;
  default_hours: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  is_active?: boolean;
}

export interface ShiftSettings {
  shifts: Record<string, ShiftDefinition>;
  isCustomized?: boolean;
  updated_at?: string;
}

export interface DutyRosterEntry {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_id?: string;
  department_name?: string;
  date: string;
  shift_type: ShiftType;
  start_time?: string;
  end_time?: string;
  hours: number;
  location?: string;
  notes?: string;
  created_at: string;
}

export type OvertimeRateType = 'normal_day_150' | 'night_200' | 'weekend_200' | 'holiday_200';
export type OvertimeStatus = 'Pending' | 'Pending Manager' | 'Pending Admin' | 'Approved' | 'Rejected';

export interface OvertimeRateConfig {
  id: OvertimeRateType;
  multiplier: number;
  label_km: string;
  label_en: string;
  short_label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  law_reference: string;
  description_km: string;
  description_en: string;
}

export interface OvertimeSettings {
  standardMonthlyHours: number;
  rates: Record<OvertimeRateType, OvertimeRateConfig>;
  isCustomized?: boolean;
  updated_at?: string;
}

export interface OvertimeRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_id?: string;
  department_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  ot_rate_type: OvertimeRateType;
  multiplier: number;
  hourly_rate: number;
  estimated_pay: number;
  reason: string;
  project_name?: string;
  status: OvertimeStatus;
  line_manager_id?: string;
  line_manager_reviewed_at?: string;
  line_manager_comments?: string;
  admin_reviewer_id?: string;
  admin_reviewed_at?: string;
  admin_comments?: string;
  created_at: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Pending Manager' | 'Pending Admin' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  // Step 1: Line Manager
  line_manager_id?: string;
  line_manager_name?: string;
  line_manager_reviewed_at?: string;
  line_manager_comments?: string;
  // Step 2: Administrator
  admin_reviewer_id?: string;
  admin_reviewer_name?: string;
  admin_reviewed_at?: string;
  admin_comments?: string;
  // General Reviewer fields
  reviewer_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  reviewer_comments?: string;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  annual_total: number;
  annual_used: number;
  sick_total: number;
  sick_used: number;
  casual_total: number;
  casual_used: number;
}

export type PayrollStatus = 'Paid' | 'Pending' | 'Draft';

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  pay_period: string;
  payment_date: string;
  base_salary: number;
  allowances: number;
  bonuses: number;
  tax_deduction: number;
  insurance_deduction: number;
  other_deductions: number;
  net_salary: number;
  status: PayrollStatus;
  payment_method: string;
  created_at: string;
}

export type JobStatus = 'Active' | 'Draft' | 'Closed';

export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  department_name?: string;
  location: string;
  type: EmploymentType;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string;
  status: JobStatus;
  posted_date: string;
  applicants_count: number;
}

export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface JobCandidate {
  id: string;
  job_id: string;
  job_title?: string;
  name: string;
  email: string;
  phone: string;
  stage: CandidateStage;
  rating: number;
  applied_date: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  category: 'General' | 'Policy' | 'Celebration' | 'Urgent';
  pinned: number;
  created_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  reviewer_id: string;
  reviewer_name?: string;
  review_period: string;
  rating: number;
  goals_achievement: number;
  strengths: string;
  areas_for_growth: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  created_at: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  attendanceToday: {
    present: number;
    remote: number;
    absent: number;
    late: number;
    percentage: number;
  };
  pendingLeavesCount: number;
  openPositionsCount: number;
  monthlyPayrollTotal: number;
  departmentDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  recentActivities: {
    id: string;
    type: 'leave' | 'hire' | 'payroll' | 'attendance' | 'announcement';
    title: string;
    subtitle: string;
    timestamp: string;
    statusBadge?: string;
  }[];
  upcomingBirthdaysAndAnniversaries: {
    id: string;
    name: string;
    avatar: string;
    type: 'birthday' | 'anniversary';
    date: string;
    subtitle: string;
  }[];
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';
export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface UserAccount {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  employee_id?: string;
  department_name?: string;
  avatar?: string;
  two_factor_enabled: number;
  permissions: string;
  password?: string;
  last_login?: string;
  created_at: string;
}

export interface SalaryAdjustment {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  previous_salary: number;
  new_salary: number;
  increase_amount: number;
  increase_percentage: number;
  effective_date: string;
  adjustment_type: string;
  currency: string;
  reason?: string;
  approved_by?: string;
  created_at: string;
}

export interface SalaryOverview {
  totalMonthlySalary: number;
  totalAllowances: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  compliantCount: number;
  nonCompliantCount: number;
  totalEmployees: number;
  minWageStandard: number;
}

export type ApprovalRequestStatus =
  | 'Pending Line Manager'
  | 'Pending HR'
  | 'Pending Top Management'
  | 'Approved'
  | 'Rejected';

export interface ApprovalRequest {
  id: string;
  request_number: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  department_id?: string;
  request_type: string;
  item_name: string;
  item_category: 'standard_material' | 'high_value_asset' | 'salary_increase';
  requires_top_management: number; // 0 or 1
  current_salary: number;
  proposed_salary: number;
  estimated_cost: number;
  quantity: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  reason: string;
  specifications?: string;
  status: ApprovalRequestStatus;
  line_manager_id?: string;
  line_manager_name?: string;
  line_manager_status: 'Pending' | 'Approved' | 'Rejected';
  line_manager_reviewed_at?: string;
  line_manager_comments?: string;
  hr_reviewer_id?: string;
  hr_reviewer_name?: string;
  hr_status: 'Pending' | 'Approved' | 'Rejected';
  hr_reviewed_at?: string;
  hr_comments?: string;
  top_management_id?: string;
  top_management_name?: string;
  top_management_status: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  top_management_reviewed_at?: string;
  top_management_comments?: string;
  rejected_by_stage?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  currency: string;
  workHours: string;
  timezone: string;
  fiscalYearStart: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'HESTRA HRM Technologies Inc.',
  address: 'Exchange Square, Norodom Blvd, Phnom Penh, Cambodia',
  currency: 'USD ($) & KHR (៛)',
  workHours: '8.0',
  timezone: 'Asia/Phnom_Penh (GMT+7)',
  fiscalYearStart: 'January 1st',
};

export type NotificationType = 'request' | 'leave' | 'overtime' | 'announcement' | 'recruitment' | 'payroll' | 'system';

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  role: 'All' | 'Admin' | 'Manager' | 'Employee';
  title: string;
  title_km?: string;
  message?: string;
  message_km?: string;
  type: NotificationType;
  link: string;
  is_read: boolean;
  created_at: string;
}



