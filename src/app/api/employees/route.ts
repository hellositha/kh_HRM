import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Employee } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const employmentType = searchParams.get('type') || '';

    let sql = `
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      sql += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.role LIKE ?)`;
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (department && department !== 'all') {
      sql += ` AND e.department_id = ?`;
      params.push(department);
    }

    if (status && status !== 'all') {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    if (employmentType && employmentType !== 'all') {
      sql += ` AND e.employment_type = ?`;
      params.push(employmentType);
    }

    sql += ` ORDER BY e.first_name ASC`;

    const employees = db.prepare(sql).all(...params) as Employee[];

    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      id: customId,
      first_name,
      last_name,
      email,
      phone = '',
      role,
      department_id,
      employment_type = 'ពេញម៉ោង (Full-Time)',
      employee_type = 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
      status = 'Active',
      salary = 1200,
      join_date = new Date().toISOString().split('T')[0],
      manager_id = null,
      avatar,
      location = 'រាជធានីភ្នំពេញ (Phnom Penh)',
      bio = '',
      gender = 'ប្រុស (Male)',
      dob = '',
      nationality = 'កម្ពុជា (Cambodian)',
      marital_status = 'នៅលីវ (Single)',
      national_id = '',
      current_address = '',
      province_city = 'រាជធានីភ្នំពេញ (Phnom Penh)',
      district = '',
      commune_sangkat = '',
      village = '',
      contract_type = 'UDC (មិនកំណត់ថិរវេលា)',
      contract_start = '',
      contract_end = '',
      work_location = 'ការិយាល័យកណ្តាល (Head Office)',
      salary_currency = 'USD ($)',
      salary_frequency = 'ប្រចាំខែ (Monthly)',
      bank_name = 'ABA Bank',
      bank_account_name = '',
      bank_account_number = '',
      nssf_member = 'មាន (Yes)',
      nssf_number = '',
      nssf_reg_date = '',
      emergency_contact_name = '',
      emergency_contact_relationship = '',
      emergency_contact_phone = '',
      emergency_contact_address = '',
      doc_national_id = '',
      doc_passport = '',
      doc_contract = '',
      doc_others = '',
      transport_allowance = 0,
      meal_allowance = 0,
      housing_allowance = 0,
      attendance_allowance = 0,
      seniority_bonus = 0,
      pay_grade = 'Level 3 - Officer',
    } = body;

    if (!first_name || !last_name || !role || !department_id) {
      return NextResponse.json(
        { error: 'first_name, last_name, role, and department_id are required' },
        { status: 400 }
      );
    }

    const finalEmail = email && typeof email === 'string' && email.trim() ? email.trim() : null;

    // Only use uploaded photo, no default avatar
    const finalAvatar = avatar && typeof avatar === 'string' && avatar.trim() ? avatar.trim() : '';

    let finalDeptId = department_id;
    if (department_id) {
      const deptRow = db.prepare('SELECT id, name FROM departments WHERE id = ? OR name = ?').get(department_id, department_id) as any;
      if (deptRow) {
        finalDeptId = deptRow.id;
      }
    }

    const id = customId && customId.trim() ? customId.trim() : `emp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
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
        transport_allowance, meal_allowance, housing_allowance, attendance_allowance,
        seniority_bonus, pay_grade,
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
        ?, ?, ?, ?,
        ?, ?,
        ?
      )
    `);

    insertStmt.run(
      id,
      first_name,
      last_name,
      finalEmail,
      phone,
      role,
      finalDeptId,
      employment_type,
      employee_type,
      status,
      Number(salary) || 0,
      join_date,
      manager_id || null,
      finalAvatar,
      location,
      bio,
      emergency_contact_name,
      emergency_contact_phone,
      gender,
      dob,
      nationality,
      marital_status,
      national_id,
      current_address,
      province_city,
      district,
      commune_sangkat,
      village,
      contract_type,
      contract_start,
      contract_end,
      work_location,
      salary_currency,
      salary_frequency,
      bank_name,
      bank_account_name,
      bank_account_number,
      nssf_member,
      nssf_number,
      nssf_reg_date,
      emergency_contact_relationship,
      emergency_contact_address,
      doc_national_id,
      doc_passport,
      doc_contract,
      doc_others,
      Number(transport_allowance) || 0,
      Number(meal_allowance) || 0,
      Number(housing_allowance) || 0,
      Number(attendance_allowance) || 0,
      Number(seniority_bonus) || 0,
      pay_grade || 'Level 3 - Officer',
      createdAt
    );

    // Also initialize leave balance
    db.prepare(`
      INSERT INTO leave_balances (id, employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
      VALUES (?, ?, 20, 0, 10, 0, 5, 0)
    `).run(`bal-${id}`, id);

    // Fetch the newly created employee with relations
    const newEmployee = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id) as any;

    // Automatically provision / sync user account with First Name as username
    const calculatedUsername = first_name.trim().toLowerCase();
    const userRole = (role && (role.toLowerCase().includes('manager') || role.toLowerCase().includes('head') || role.toLowerCase().includes('director'))) 
      ? 'Manager' 
      : 'Employee';
    const existingUser = db.prepare(`
      SELECT id FROM users 
      WHERE employee_id = ? 
         OR (? IS NOT NULL AND LOWER(email) = LOWER(?))
    `).get(id, finalEmail, finalEmail);

    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (id, username, name, email, role, status, employee_id, department_name, avatar, two_factor_enabled, permissions, password, last_login, created_at)
        VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, 0, 'self_service,clock_in,request_leave,view_payslips', 'hestra123', 'Just now', ?)
      `).run(
        `usr-${Date.now().toString().slice(-6)}`,
        calculatedUsername,
        `${first_name} ${last_name}`.trim(),
        finalEmail,
        userRole,
        id,
        newEmployee?.department_name || 'ទូទៅ (General)',
        finalAvatar,
        createdAt.split('T')[0]
      );
    } else {
      db.prepare('UPDATE users SET username = ?, department_name = ?, name = ? WHERE employee_id = ?').run(
        calculatedUsername,
        newEmployee?.department_name || 'ទូទៅ (General)',
        `${first_name} ${last_name}`.trim(),
        id
      );
    }

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { getDb, clearAllEmployees } = await import('@/lib/db');
    const db = getDb();
    clearAllEmployees(db);
    return NextResponse.json({ success: true, message: 'All employees and related records have been removed.' });
  } catch (error: any) {
    console.error('Error clearing employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

