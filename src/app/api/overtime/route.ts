import { NextResponse } from 'next/server';
import { getDb, getOvertimeSettings } from '@/lib/db';
import { OvertimeRequest } from '@/lib/types';
import { OVERTIME_RATES, getBaseHourlyRate, calculateOvertimePay } from '@/lib/overtime-calc';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g. '2026-09'
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const departmentId = searchParams.get('department_id');
    const employeeId = searchParams.get('employee_id');

    let sql = `
      SELECT 
        o.*,
        COALESCE(e.first_name || ' ' || e.last_name, 'Staff Member') as employee_name,
        COALESCE(e.role, 'Employee') as employee_role,
        COALESCE(e.avatar, '/avatars/khmer_female_1.jpg') as employee_avatar,
        COALESCE(e.department_id, '') as department_id,
        COALESCE(d.name, 'General') as department_name
      FROM overtime_requests o
      JOIN employees e ON e.id = o.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (month && month !== 'all') {
      sql += ` AND o.date LIKE ?`;
      params.push(`${month}%`);
    }

    if (date) {
      sql += ` AND o.date = ?`;
      params.push(date);
    }

    if (status && status !== 'all') {
      if (status === 'Pending') {
        sql += ` AND (o.status = 'Pending' OR o.status = 'Pending Manager' OR o.status = 'Pending Admin')`;
      } else {
        sql += ` AND o.status = ?`;
        params.push(status);
      }
    }

    if (departmentId && departmentId !== 'all') {
      sql += ` AND e.department_id = ?`;
      params.push(departmentId);
    }

    if (employeeId) {
      sql += ` AND o.employee_id = ?`;
      params.push(employeeId);
    }

    sql += ` ORDER BY o.date DESC, o.created_at DESC`;

    const records = db.prepare(sql).all(...params) as OvertimeRequest[];
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching overtime requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      employee_id,
      date,
      start_time,
      end_time,
      hours,
      ot_rate_type,
      reason,
      project_name,
    } = body;

    if (!employee_id || !date || !start_time || !end_time || !hours || !ot_rate_type || !reason) {
      return NextResponse.json({ error: 'All fields including employee, date, times, hours, rate type, and reason are required' }, { status: 400 });
    }

    // Look up employee salary
    const emp = db.prepare('SELECT salary, department_id, manager_id FROM employees WHERE id = ?').get(employee_id) as any;
    const salary = emp?.salary || 1000;
    const otSettings = getOvertimeSettings();
    const rateCalc = calculateOvertimePay(
      salary,
      Number(hours),
      ot_rate_type,
      otSettings.rates,
      otSettings.standardMonthlyHours
    );

    const id = `ot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO overtime_requests (
        id, employee_id, date, start_time, end_time, hours, ot_rate_type, multiplier,
        hourly_rate, estimated_pay, reason, project_name, status,
        line_manager_id, line_manager_reviewed_at, line_manager_comments,
        admin_reviewer_id, admin_reviewed_at, admin_comments, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 'Pending Manager',
        NULL, NULL, NULL,
        NULL, NULL, NULL, ?
      )
    `);

    insertStmt.run(
      id,
      employee_id,
      date,
      start_time,
      end_time,
      Number(hours),
      ot_rate_type,
      rateCalc.multiplier,
      rateCalc.hourlyRate,
      rateCalc.totalPay,
      reason,
      project_name || '',
      createdAt
    );

    const created = db.prepare(`
      SELECT 
        o.*,
        COALESCE(e.first_name || ' ' || e.last_name, 'Staff Member') as employee_name,
        COALESCE(e.role, 'Employee') as employee_role,
        COALESCE(e.avatar, '/avatars/khmer_female_1.jpg') as employee_avatar,
        COALESCE(e.department_id, '') as department_id,
        COALESCE(d.name, 'General') as department_name
      FROM overtime_requests o
      JOIN employees e ON e.id = o.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE o.id = ?
    `).get(id) as OvertimeRequest;

    return NextResponse.json({ success: true, request: created });
  } catch (error: any) {
    console.error('Error creating overtime request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
