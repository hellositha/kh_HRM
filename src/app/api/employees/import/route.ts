import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface IncomingEmployee {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  department?: string;
  department_id?: string;
  employment_type?: string;
  employee_type?: string;
  status?: string;
  salary?: number | string;
  salary_currency?: string;
  join_date?: string;
  location?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  marital_status?: string;
  national_id?: string;
  current_address?: string;
  contract_type?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  nssf_member?: string;
  nssf_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Helper to parse standard RFC 4180 CSV text
export function parseCSV(csvText: string): Record<string, string>[] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
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
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const item: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const headerKey = headers[c];
      const val = row[c] !== undefined ? row[c].trim() : '';
      item[headerKey] = val;
    }
    results.push(item);
  }

  return results;
}

// Helper: Normalize incoming CSV record to standard Employee fields
export function normalizeRecord(raw: Record<string, any>): IncomingEmployee {
  const getVal = (...keys: string[]): string => {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().replace(/[\s_-]+/g, '');
      for (const rawKey of Object.keys(raw)) {
        if (rawKey.toLowerCase().replace(/[\s_-]+/g, '') === normalizedKey) {
          if (raw[rawKey] !== undefined && raw[rawKey] !== null) {
            return String(raw[rawKey]).trim();
          }
        }
      }
    }
    return '';
  };

  let firstName = getVal('first_name', 'firstname', 'fname', 'ឈ្មោះ', 'នាម');
  let lastName = getVal('last_name', 'lastname', 'lname', 'ត្រកូល', 'គោត្តនាម');
  const fullName = getVal('name', 'fullname', 'employeename', 'ឈ្មោះពេញ');

  if (!firstName && fullName) {
    const parts = fullName.split(/\s+/);
    if (parts.length === 1) {
      firstName = parts[0];
      lastName = '';
    } else {
      // In Cambodia: First part is often Family name, second is given name
      lastName = parts[0];
      firstName = parts.slice(1).join(' ');
    }
  }

  return {
    id: getVal('id', 'employee_id', 'empid', 'code', 'អត្តលេខ'),
    first_name: firstName,
    last_name: lastName || '-',
    email: getVal('email', 'e-mail', 'mail', 'អ៊ីមែល'),
    phone: getVal('phone', 'mobile', 'tel', 'telephone', 'លេខទូរស័ព្ទ', 'ទូរស័ព្ទ'),
    role: getVal('role', 'position', 'job_title', 'title', 'មុខតំណែង', 'តួនាទី'),
    department: getVal('department', 'department_name', 'dept', 'division', 'នាយកដ្ឋាន', 'ផ្នែក'),
    department_id: getVal('department_id', 'dept_id'),
    employment_type: getVal('employment_type', 'type', 'emp_type', 'ប្រភេទការងារ') || 'ពេញម៉ោង (Full-Time)',
    employee_type: getVal('employee_type', 'staff_type') || 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
    status: getVal('status', 'state', 'ស្ថានភាព') || 'Active',
    salary: getVal('salary', 'base_salary', 'compensation', 'ប្រាក់បៀវត្សរ៍', 'ប្រាក់ខែ') || 1200,
    salary_currency: getVal('salary_currency', 'currency') || 'USD ($)',
    join_date: getVal('join_date', 'start_date', 'hire_date', 'date_joined', 'ថ្ងៃចូលបម្រើការងារ') || new Date().toISOString().split('T')[0],
    location: getVal('location', 'branch', 'city', 'province', 'ទីតាំង', 'សាខា') || 'រាជធានីភ្នំពេញ (Phnom Penh)',
    gender: getVal('gender', 'sex', 'ភេទ') || 'ប្រុស (Male)',
    dob: getVal('dob', 'birthdate', 'date_of_birth', 'ថ្ងៃខែឆ្នាំកំណើត'),
    nationality: getVal('nationality', 'សញ្ជាតិ') || 'កម្ពុជា (Cambodian)',
    marital_status: getVal('marital_status', 'ស្ថានភាពអាពាហ៍ពិពាហ៍') || 'នៅលីវ (Single)',
    national_id: getVal('national_id', 'id_card', 'អត្តសញ្ញាណប័ណ្ណ'),
    current_address: getVal('current_address', 'address', 'អាសយដ្ឋាន'),
    contract_type: getVal('contract_type', 'ប្រភេទកិច្ចសន្យា') || 'UDC (មិនកំណត់ថិរវេលា)',
    bank_name: getVal('bank_name', 'bank', 'ធនាគារ') || 'ABA Bank',
    bank_account_name: getVal('bank_account_name', 'account_name', 'ឈ្មោះគណនី'),
    bank_account_number: getVal('bank_account_number', 'account_number', 'account_no', 'លេខគណនី'),
    nssf_member: getVal('nssf_member', 'nssf', 'ប.ស.ស') || 'មាន (Yes)',
    nssf_number: getVal('nssf_number', 'nssf_id', 'លេខប.ស.ស'),
    emergency_contact_name: getVal('emergency_contact_name', 'emergency_name', 'ទំនាក់ទំនងអាសន្ន'),
    emergency_contact_phone: getVal('emergency_contact_phone', 'emergency_phone', 'ទូរស័ព្ទអាសន្ន'),
  };
}

// GET: Serve sample CSV Template for 1-click download
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isTemplate = searchParams.get('template') === '1';

  if (isTemplate) {
    const csvHeader = 'ID,First Name,Last Name,Email,Phone,Role,Department,Employment Type,Status,Salary,Join Date,Location,Gender,Bank Name,Bank Account,NSSF Number';
    const sampleRows = [
      'EMP-2026-001,Sokha,Meas,sokha.meas@hestra.kh,012 345 678,Senior Accountant,ផ្នែកគណនេយ្យ & ហិរញ្ញវត្ថុ (Finance & Legal),ពេញម៉ោង (Full-Time),Active,1400,2026-01-15,រាជធានីភ្នំពេញ (Phnom Penh),ស្រី (Female),ABA Bank,001 234 567,10293847',
      'EMP-2026-002,Dara,Khim,dara.khim@hestra.kh,098 765 432,Full-Stack Engineer,ផ្នែកបច្ចេកវិទ្យា & វិស្វកម្ម (Engineering & Tech),ពេញម៉ោង (Full-Time),Active,1800,2026-02-01,រាជធានីភ្នំពេញ (Phnom Penh),ប្រុស (Male),ABA Bank,002 345 678,20394857',
      'EMP-2026-003,Sopheap,Rath,sopheap.rath@hestra.kh,087 112 233,HR Talent Specialist,ផ្នែកធនធានមនុស្ស & វប្បធម៌ (Human Resource & Administrator),ពេញម៉ោង (Full-Time),Active,1100,2026-02-15,រាជធានីភ្នំពេញ (Phnom Penh),ស្រី (Female),Wing Bank,003 456 789,30495867',
      'EMP-2026-004,Chenda,Kong,chenda.kong@hestra.kh,077 445 566,UI/UX Product Designer,ផ្នែករចនា & ផលិតផល (Product & Design),ពេញម៉ោង (Full-Time),Active,1350,2026-03-01,រាជធានីភ្នំពេញ (Phnom Penh),ស្រី (Female),ACLEDA Bank,004 567 890,40596879',
    ];

    // Prepend UTF-8 BOM so Excel opens Khmer characters with perfect fidelity
    const content = '\uFEFF' + [csvHeader, ...sampleRows].join('\r\n');

    return new Response(content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="hestra_hrm_employee_import_template.csv"',
      },
    });
  }

  return NextResponse.json({ message: 'Employee Import API ready. Use POST to upload.' });
}

// POST: Process batch employee import
export async function POST(request: Request) {
  try {
    const db = getDb();
    let recordsToProcess: IncomingEmployee[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (Array.isArray(body.employees)) {
        recordsToProcess = body.employees.map((item: any) => normalizeRecord(item));
      } else if (typeof body.csv === 'string') {
        const parsed = parseCSV(body.csv);
        recordsToProcess = parsed.map((item) => normalizeRecord(item));
      }
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      const rawText = await request.text();
      const parsed = parseCSV(rawText);
      recordsToProcess = parsed.map((item) => normalizeRecord(item));
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file && typeof file === 'object' && 'text' in file) {
        const fileText = await (file as any).text();
        const parsed = parseCSV(fileText);
        recordsToProcess = parsed.map((item) => normalizeRecord(item));
      }
    }

    if (!recordsToProcess || recordsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No valid employee records found in the import payload.' },
        { status: 400 }
      );
    }

    // Load existing departments for auto-matching
    const existingDepts = db.prepare('SELECT id, name FROM departments').all() as { id: string; name: string }[];
    const deptMap: Record<string, string> = {};
    for (const d of existingDepts) {
      deptMap[d.id.toLowerCase()] = d.id;
      deptMap[d.name.toLowerCase()] = d.id;
      // Extract words inside parentheses, e.g. "Finance & Legal"
      const match = d.name.match(/\((.*?)\)/);
      if (match) {
        deptMap[match[1].toLowerCase()] = d.id;
      }
      // Extract main Khmer name before parenthesis
      const khmerPart = d.name.split('(')[0].trim().toLowerCase();
      if (khmerPart) {
        deptMap[khmerPart] = d.id;
      }
    }

    // Default department if none matched
    const defaultDeptId = existingDepts.length > 0 ? existingDepts[0].id : 'dept-1';

    let importedCount = 0;
    let updatedCount = 0;
    const errors: { row: number; reason: string; data?: any }[] = [];
    const createdEmployees: any[] = [];

    // Prepared statements
    const checkEmployeeStmt = db.prepare('SELECT id FROM employees WHERE id = ? OR (email IS NOT NULL AND LOWER(email) = LOWER(?))');
    
    const insertEmployeeStmt = db.prepare(`
      INSERT INTO employees (
        id, first_name, last_name, email, phone, role, department_id,
        employment_type, employee_type, status, salary, join_date, manager_id, avatar,
        location, bio, emergency_contact_name, emergency_contact_phone,
        gender, dob, nationality, marital_status, national_id,
        current_address, province_city, district, commune_sangkat, village,
        contract_type, contract_start, contract_end, work_location,
        salary_currency, salary_frequency, bank_name, bank_account_name, bank_account_number,
        nssf_member, nssf_number, nssf_reg_date,
        emergency_contact_relationship, emergency_contact_address,
        doc_national_id, doc_passport, doc_contract, doc_others,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?
      )
    `);

    const updateEmployeeStmt = db.prepare(`
      UPDATE employees SET
        first_name = ?, last_name = ?, phone = ?, role = ?, department_id = ?,
        employment_type = ?, employee_type = ?, status = ?, salary = ?, join_date = ?,
        location = ?, gender = ?, bank_name = ?, bank_account_number = ?, nssf_number = ?
      WHERE id = ?
    `);

    const insertLeaveBalStmt = db.prepare(`
      INSERT OR IGNORE INTO leave_balances (id, employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
      VALUES (?, ?, 20, 0, 10, 0, 5, 0)
    `);

    const insertUserStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, username, name, email, role, status, employee_id, department_name, avatar, two_factor_enabled, permissions, password, last_login, created_at)
      VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, 0, 'self_service,clock_in,request_leave,view_payslips', 'hestra123', 'Imported', ?)
    `);

    const insertDeptStmt = db.prepare(`
      INSERT INTO departments (id, name, description, manager_id, budget, color)
      VALUES (?, ?, ?, NULL, 180000, ?)
    `);

    // Color palette for newly generated departments
    const deptColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

    // Process all records in a single database transaction for maximum performance & consistency
    const transaction = db.transaction(() => {
      for (let i = 0; i < recordsToProcess.length; i++) {
        const rec = recordsToProcess[i];
        const rowNum = i + 1;

        if (!rec.first_name || !rec.first_name.trim()) {
          errors.push({ row: rowNum, reason: 'First Name is required', data: rec });
          continue;
        }
        if (!rec.role || !rec.role.trim()) {
          errors.push({ row: rowNum, reason: 'Role / Job Title is required', data: rec });
          continue;
        }

        // Match department
        let finalDeptId = defaultDeptId;
        const deptInput = (rec.department_id || rec.department || '').trim();
        if (deptInput) {
          const lowerInput = deptInput.toLowerCase();
          if (deptMap[lowerInput]) {
            finalDeptId = deptMap[lowerInput];
          } else {
            // Check partial matches
            let foundKey = Object.keys(deptMap).find(
              (k) => lowerInput.includes(k) || k.includes(lowerInput)
            );
            if (foundKey) {
              finalDeptId = deptMap[foundKey];
            } else {
              // Auto-create newly referenced department
              const newDeptId = `dept-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
              const randomColor = deptColors[Math.floor(Math.random() * deptColors.length)];
              try {
                insertDeptStmt.run(newDeptId, deptInput, 'Auto-created during bulk employee import', randomColor);
                deptMap[lowerInput] = newDeptId;
                finalDeptId = newDeptId;
              } catch (e) {
                finalDeptId = defaultDeptId;
              }
            }
          }
        }

        // Clean numeric salary (strip $, comma, etc.)
        let numSalary = 1200;
        if (rec.salary !== undefined && rec.salary !== null) {
          const cleanSalary = String(rec.salary).replace(/[^0-9.]/g, '');
          if (cleanSalary && !isNaN(Number(cleanSalary))) {
            numSalary = Number(cleanSalary);
          }
        }

        // Photo allocation: empty by default until employee photo is uploaded
        const assignedAvatar = (rec.avatar && typeof rec.avatar === 'string' && rec.avatar.trim()) ? rec.avatar.trim() : '';

        const finalEmail = rec.email && rec.email.trim() ? rec.email.trim() : null;
        const finalJoinDate = rec.join_date && rec.join_date.trim() ? rec.join_date.trim() : new Date().toISOString().split('T')[0];
        const createdAt = new Date().toISOString();

        // Check if employee already exists
        const existing = rec.id || finalEmail ? (checkEmployeeStmt.get(rec.id || '', finalEmail || '') as any) : null;

        if (existing) {
          // Update existing employee
          updateEmployeeStmt.run(
            rec.first_name,
            rec.last_name || '-',
            rec.phone || '',
            rec.role,
            finalDeptId,
            rec.employment_type || 'ពេញម៉ោង (Full-Time)',
            rec.employee_type || 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
            rec.status || 'Active',
            numSalary,
            finalJoinDate,
            rec.location || 'រាជធានីភ្នំពេញ (Phnom Penh)',
            rec.gender || 'ប្រុស (Male)',
            rec.bank_name || 'ABA Bank',
            rec.bank_account_number || '',
            rec.nssf_number || '',
            existing.id
          );
          updatedCount++;
          createdEmployees.push({ id: existing.id, first_name: rec.first_name, last_name: rec.last_name, updated: true });
        } else {
          // Generate new ID
          const empId = rec.id && rec.id.trim() ? rec.id.trim() : `EMP-2026-${String(Date.now()).slice(-4)}${i + 1}`;

          insertEmployeeStmt.run(
            empId,
            rec.first_name,
            rec.last_name || '-',
            finalEmail,
            rec.phone || '',
            rec.role,
            finalDeptId,
            rec.employment_type || 'ពេញម៉ោង (Full-Time)',
            rec.employee_type || 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
            rec.status || 'Active',
            numSalary,
            finalJoinDate,
            null, // manager_id
            assignedAvatar,
            rec.location || 'រាជធានីភ្នំពេញ (Phnom Penh)',
            'Auto-imported employee record',
            rec.emergency_contact_name || '',
            rec.emergency_contact_phone || '',
            rec.gender || 'ប្រុស (Male)',
            rec.dob || '',
            rec.nationality || 'កម្ពុជា (Cambodian)',
            rec.marital_status || 'នៅលីវ (Single)',
            rec.national_id || '',
            rec.current_address || '',
            rec.location || 'រាជធានីភ្នំពេញ (Phnom Penh)',
            '', '', '',
            rec.contract_type || 'UDC (មិនកំណត់ថិរវេលា)',
            finalJoinDate,
            '',
            'ការិយាល័យកណ្តាល (Head Office)',
            rec.salary_currency || 'USD ($)',
            'ប្រចាំខែ (Monthly)',
            rec.bank_name || 'ABA Bank',
            rec.bank_account_name || `${rec.first_name} ${rec.last_name}`,
            rec.bank_account_number || '',
            rec.nssf_member || 'មាន (Yes)',
            rec.nssf_number || '',
            finalJoinDate,
            '', '',
            '', '', '', '',
            createdAt
          );

          // Initialize leave balances
          insertLeaveBalStmt.run(`bal-${empId}`, empId);

          // Provision user login
          const cleanUsername = rec.first_name.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${i + 1}`;
          const isManager = rec.role.toLowerCase().includes('manager') || rec.role.toLowerCase().includes('head') || rec.role.toLowerCase().includes('director');
          const userRole = isManager ? 'Manager' : 'Employee';

          insertUserStmt.run(
            `usr-${Date.now().toString().slice(-6)}${i}`,
            cleanUsername,
            `${rec.first_name} ${rec.last_name || ''}`.trim(),
            finalEmail,
            userRole,
            empId,
            rec.department || 'General',
            assignedAvatar,
            createdAt.split('T')[0]
          );

          importedCount++;
          createdEmployees.push({ id: empId, first_name: rec.first_name, last_name: rec.last_name, updated: false });
        }
      }
    });

    transaction();

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      totalProcessed: recordsToProcess.length,
      errors,
      createdEmployees,
    });
  } catch (error: any) {
    console.error('Error importing employees:', error);
    return NextResponse.json({ error: error.message || 'Internal import error' }, { status: 500 });
  }
}
