import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // 1. Employee base info
    const employee = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        d.color as department_color,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id) as any;

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // 2. Leave balance
    const leaveBalance = db.prepare('SELECT * FROM leave_balances WHERE employee_id = ?').get(id);

    // 3. Recent attendance
    const attendance = db.prepare(`
      SELECT * FROM attendance 
      WHERE employee_id = ? 
      ORDER BY date DESC 
      LIMIT 14
    `).all(id);

    // 4. Leave requests
    const leaves = db.prepare(`
      SELECT 
        lr.*,
        COALESCE(lm.first_name || ' ' || lm.last_name, lmu.name) as line_manager_name,
        COALESCE(adm.first_name || ' ' || adm.last_name, admu.name) as admin_reviewer_name,
        COALESCE(m.first_name || ' ' || m.last_name, mu.name) as reviewer_name
      FROM leave_requests lr
      LEFT JOIN employees lm ON lm.id = lr.line_manager_id
      LEFT JOIN users lmu ON (lmu.id = lr.line_manager_id OR lmu.employee_id = lr.line_manager_id)
      LEFT JOIN employees adm ON adm.id = lr.admin_reviewer_id
      LEFT JOIN users admu ON (admu.id = lr.admin_reviewer_id OR admu.employee_id = lr.admin_reviewer_id)
      LEFT JOIN employees m ON m.id = lr.reviewer_id
      LEFT JOIN users mu ON (mu.id = lr.reviewer_id OR mu.employee_id = lr.reviewer_id)
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `).all(id);

    // 5. Payroll history
    const payrolls = db.prepare(`
      SELECT * FROM payrolls
      WHERE employee_id = ?
      ORDER BY payment_date DESC
    `).all(id);

    // 6. Performance reviews
    const reviews = db.prepare(`
      SELECT pr.*, m.first_name || ' ' || m.last_name as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN employees m ON m.id = pr.reviewer_id
      WHERE pr.employee_id = ?
      ORDER BY pr.created_at DESC
    `).all(id);

    return NextResponse.json({
      employee,
      leaveBalance,
      attendance,
      leaves,
      payrolls,
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      department_id,
      employment_type,
      status,
      salary,
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
      employee_type,
      join_date,
      contract_type,
      contract_start,
      contract_end,
      manager_id,
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
      avatar,
      doc_national_id,
      doc_passport,
      doc_contract,
      doc_others,
      transport_allowance,
      meal_allowance,
      housing_allowance,
      attendance_allowance,
      seniority_bonus,
      pay_grade,
    } = body;

    const hasEmail = email !== undefined;
    const finalEmail = (email && typeof email === 'string' && email.trim()) ? email.trim() : null;

    if (finalEmail) {
      const existing = db.prepare('SELECT id, first_name, last_name FROM employees WHERE LOWER(email) = LOWER(?) AND id != ?').get(finalEmail, id) as any;
      if (existing) {
        return NextResponse.json(
          { error: `Email "${finalEmail}" is already used by ${existing.first_name} ${existing.last_name} (${existing.id})` },
          { status: 400 }
        );
      }
    }

    const hasManager = manager_id !== undefined;
    const finalManagerId = (manager_id && typeof manager_id === 'string' && manager_id.trim()) ? manager_id.trim() : null;

    let finalDeptId = department_id;
    if (department_id) {
      const deptRow = db.prepare('SELECT id, name FROM departments WHERE id = ? OR name = ?').get(department_id, department_id) as any;
      if (deptRow) {
        finalDeptId = deptRow.id;
      }
    }

    db.prepare(`
      UPDATE employees SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = CASE WHEN ? = 1 THEN ? ELSE email END,
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        department_id = COALESCE(?, department_id),
        employment_type = COALESCE(?, employment_type),
        status = COALESCE(?, status),
        salary = COALESCE(?, salary),
        location = COALESCE(?, location),
        bio = COALESCE(?, bio),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        gender = COALESCE(?, gender),
        dob = COALESCE(?, dob),
        nationality = COALESCE(?, nationality),
        marital_status = COALESCE(?, marital_status),
        national_id = COALESCE(?, national_id),
        current_address = COALESCE(?, current_address),
        province_city = COALESCE(?, province_city),
        district = COALESCE(?, district),
        commune_sangkat = COALESCE(?, commune_sangkat),
        village = COALESCE(?, village),
        employee_type = COALESCE(?, employee_type),
        join_date = COALESCE(?, join_date),
        contract_type = COALESCE(?, contract_type),
        contract_start = COALESCE(?, contract_start),
        contract_end = COALESCE(?, contract_end),
        manager_id = CASE WHEN ? = 1 THEN ? ELSE manager_id END,
        work_location = COALESCE(?, work_location),
        salary_currency = COALESCE(?, salary_currency),
        salary_frequency = COALESCE(?, salary_frequency),
        bank_name = COALESCE(?, bank_name),
        bank_account_name = COALESCE(?, bank_account_name),
        bank_account_number = COALESCE(?, bank_account_number),
        nssf_member = COALESCE(?, nssf_member),
        nssf_number = COALESCE(?, nssf_number),
        nssf_reg_date = COALESCE(?, nssf_reg_date),
        emergency_contact_relationship = COALESCE(?, emergency_contact_relationship),
        emergency_contact_address = COALESCE(?, emergency_contact_address),
        avatar = COALESCE(?, avatar),
        doc_national_id = COALESCE(?, doc_national_id),
        doc_passport = COALESCE(?, doc_passport),
        doc_contract = COALESCE(?, doc_contract),
        doc_others = COALESCE(?, doc_others),
        transport_allowance = COALESCE(?, transport_allowance),
        meal_allowance = COALESCE(?, meal_allowance),
        housing_allowance = COALESCE(?, housing_allowance),
        attendance_allowance = COALESCE(?, attendance_allowance),
        seniority_bonus = COALESCE(?, seniority_bonus),
        pay_grade = COALESCE(?, pay_grade)
      WHERE id = ?
    `).run(
      first_name !== undefined ? first_name : null,
      last_name !== undefined ? last_name : null,
      hasEmail ? 1 : 0,
      finalEmail,
      phone !== undefined ? phone : null,
      role !== undefined ? role : null,
      finalDeptId !== undefined ? finalDeptId : null,
      employment_type !== undefined ? employment_type : null,
      status !== undefined ? status : null,
      salary !== undefined ? Number(salary) : null,
      location !== undefined ? location : null,
      bio !== undefined ? bio : null,
      emergency_contact_name !== undefined ? emergency_contact_name : null,
      emergency_contact_phone !== undefined ? emergency_contact_phone : null,
      gender !== undefined ? gender : null,
      dob !== undefined ? dob : null,
      nationality !== undefined ? nationality : null,
      marital_status !== undefined ? marital_status : null,
      national_id !== undefined ? national_id : null,
      current_address !== undefined ? current_address : null,
      province_city !== undefined ? province_city : null,
      district !== undefined ? district : null,
      commune_sangkat !== undefined ? commune_sangkat : null,
      village !== undefined ? village : null,
      employee_type !== undefined ? employee_type : null,
      join_date !== undefined ? join_date : null,
      contract_type !== undefined ? contract_type : null,
      contract_start !== undefined ? contract_start : null,
      contract_end !== undefined ? contract_end : null,
      hasManager ? 1 : 0,
      finalManagerId,
      work_location !== undefined ? work_location : null,
      salary_currency !== undefined ? salary_currency : null,
      salary_frequency !== undefined ? salary_frequency : null,
      bank_name !== undefined ? bank_name : null,
      bank_account_name !== undefined ? bank_account_name : null,
      bank_account_number !== undefined ? bank_account_number : null,
      nssf_member !== undefined ? nssf_member : null,
      nssf_number !== undefined ? nssf_number : null,
      nssf_reg_date !== undefined ? nssf_reg_date : null,
      emergency_contact_relationship !== undefined ? emergency_contact_relationship : null,
      emergency_contact_address !== undefined ? emergency_contact_address : null,
      avatar !== undefined ? avatar : null,
      doc_national_id !== undefined ? doc_national_id : null,
      doc_passport !== undefined ? doc_passport : null,
      doc_contract !== undefined ? doc_contract : null,
      doc_others !== undefined ? doc_others : null,
      transport_allowance !== undefined ? Number(transport_allowance) : null,
      meal_allowance !== undefined ? Number(meal_allowance) : null,
      housing_allowance !== undefined ? Number(housing_allowance) : null,
      attendance_allowance !== undefined ? Number(attendance_allowance) : null,
      seniority_bonus !== undefined ? Number(seniority_bonus) : null,
      pay_grade !== undefined ? pay_grade : null,
      id
    );

    if (first_name) {
      db.prepare('UPDATE users SET username = ? WHERE employee_id = ?').run(first_name.trim().toLowerCase(), id);
    }

    if (avatar !== undefined) {
      db.prepare('UPDATE users SET avatar = ? WHERE employee_id = ?').run(avatar, id);
    }

    if (hasEmail) {
      db.prepare('UPDATE users SET email = ? WHERE employee_id = ?').run(finalEmail, id);
    }

    const updated = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id) as any;

    if (!updated) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Keep corresponding user account strictly in sync with employee
    if (updated.department_name) {
      db.prepare('UPDATE users SET department_name = ? WHERE employee_id = ?').run(updated.department_name, id);
    }
    if (first_name !== undefined || last_name !== undefined) {
      db.prepare('UPDATE users SET name = ? WHERE employee_id = ?').run(`${updated.first_name} ${updated.last_name}`.trim(), id);
    }

    return NextResponse.json({
      success: true,
      employee: updated,
      ...updated,
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const url = new URL(request.url);
    const isTerminate = url.searchParams.get('action') === 'terminate';

    if (isTerminate) {
      db.prepare("UPDATE employees SET status = 'Terminated' WHERE id = ?").run(id);
      return NextResponse.json({ success: true, message: 'Employee status set to Terminated' });
    }

    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
    if (!emp) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const deleteTx = db.transaction(() => {
      db.prepare('DELETE FROM attendance WHERE employee_id = ?').run(id);
      db.prepare('DELETE FROM leave_requests WHERE employee_id = ?').run(id);
      db.prepare('DELETE FROM leave_balances WHERE employee_id = ?').run(id);
      db.prepare('DELETE FROM payrolls WHERE employee_id = ?').run(id);
      db.prepare('DELETE FROM performance_reviews WHERE employee_id = ?').run(id);
      db.prepare('UPDATE leave_requests SET reviewer_id = NULL WHERE reviewer_id = ?').run(id);
      db.prepare('UPDATE leave_requests SET line_manager_id = NULL WHERE line_manager_id = ?').run(id);
      db.prepare('UPDATE leave_requests SET admin_reviewer_id = NULL WHERE admin_reviewer_id = ?').run(id);
      db.prepare('UPDATE performance_reviews SET reviewer_id = NULL WHERE reviewer_id = ?').run(id);
      db.prepare('UPDATE departments SET manager_id = NULL WHERE manager_id = ?').run(id);
      db.prepare('UPDATE employees SET manager_id = NULL WHERE manager_id = ?').run(id);
      db.prepare('DELETE FROM users WHERE employee_id = ?').run(id);
      db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    });

    deleteTx();

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
