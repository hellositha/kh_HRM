import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PayrollRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        p.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        e.avatar as employee_avatar,
        d.name as department_name
      FROM payrolls p
      JOIN employees e ON e.id = p.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (period && period !== 'all') {
      sql += ` AND p.pay_period = ?`;
      params.push(period);
    }

    if (employeeId) {
      sql += ` AND p.employee_id = ?`;
      params.push(employeeId);
    }

    if (status && status !== 'all') {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY p.payment_date DESC, p.net_salary DESC`;

    const records = db.prepare(sql).all(...params) as PayrollRecord[];
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching payroll records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action, period, payment_date } = body;

    // Batch generate payroll for all active employees
    if (action === 'run_batch') {
      const payPeriod = period || 'October 2026';
      const payDate = payment_date || '2026-10-31';

      const activeEmployees = db.prepare("SELECT * FROM employees WHERE status != 'Terminated'").all() as any[];

      const insertStmt = db.prepare(`
        INSERT INTO payrolls (
          id, employee_id, pay_period, payment_date, base_salary,
          allowances, bonuses, tax_deduction, insurance_deduction, other_deductions,
          net_salary, status, payment_method, created_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, 'Paid', 'Direct Deposit', ?
        )
        ON CONFLICT(id) DO UPDATE SET
          status = 'Paid',
          payment_date = excluded.payment_date
      `);

      const now = new Date().toISOString();
      let createdCount = 0;

      for (const emp of activeEmployees) {
        const id = `pay-${payPeriod.replace(' ', '-').toLowerCase()}-${emp.id}`;
        const monthlyBase = Number(emp.salary || 0);
        const allowances =
          Number(emp.transport_allowance || 0) +
          Number(emp.meal_allowance || 0) +
          Number(emp.housing_allowance || 0) +
          Number(emp.attendance_allowance || 0);

        // Fetch approved overtime pay for this employee within this pay period month
        let otEarnings = 0;
        try {
          let ym = payment_date ? payment_date.slice(0, 7) : '';
          if (!ym && payPeriod) {
            const monthsMap: Record<string, string> = {
              january: '01', february: '02', march: '03', april: '04',
              may: '05', june: '06', july: '07', august: '08',
              september: '09', october: '10', november: '11', december: '12',
            };
            const parts = payPeriod.trim().toLowerCase().split(/\s+/);
            const m = monthsMap[parts[0]];
            const y = parts[1];
            if (m && y) ym = `${y}-${m}`;
          }

          let otRow: { total_ot: number } | undefined;
          if (ym) {
            otRow = db.prepare(`
              SELECT COALESCE(SUM(estimated_pay), 0) as total_ot
              FROM overtime_requests
              WHERE employee_id = ? AND status = 'Approved' AND date LIKE ?
            `).get(emp.id, `${ym}%`) as { total_ot: number } | undefined;
          } else {
            otRow = db.prepare(`
              SELECT COALESCE(SUM(estimated_pay), 0) as total_ot
              FROM overtime_requests
              WHERE employee_id = ? AND status = 'Approved'
            `).get(emp.id) as { total_ot: number } | undefined;
          }
          otEarnings = otRow ? Number(otRow.total_ot || 0) : 0;
        } catch (e) {}

        const bonuses = Number(emp.seniority_bonus || 0) + otEarnings;
        const gross = monthlyBase + allowances + bonuses;

        // Cambodia NSSF Pension deduction (2% employee, capped at 1.2M KHR / ~$292.68 USD base -> max ~$5.85 USD)
        const nssfCapUsd = 1200000 / 4100;
        const nssfBase = Math.min(monthlyBase, nssfCapUsd);
        const insurance = Math.round(nssfBase * 0.02 * 100) / 100;

        // Cambodia GDT Progressive Tax on Salary (0%, 5%, 10%, 15%, 20%)
        const grossKhr = gross * 4100;
        let taxKhr = 0;
        if (grossKhr <= 1500000) {
          taxKhr = 0;
        } else if (grossKhr <= 2000000) {
          taxKhr = (grossKhr - 1500000) * 0.05;
        } else if (grossKhr <= 8500000) {
          taxKhr = 500000 * 0.05 + (grossKhr - 2000000) * 0.10;
        } else if (grossKhr <= 12500000) {
          taxKhr = 500000 * 0.05 + 6500000 * 0.10 + (grossKhr - 8500000) * 0.15;
        } else {
          taxKhr = 500000 * 0.05 + 6500000 * 0.10 + 4000000 * 0.15 + (grossKhr - 12500000) * 0.20;
        }
        const tax = Math.round((taxKhr / 4100) * 100) / 100;

        const otherDeductions = 0;
        const net = Math.round((gross - tax - insurance - otherDeductions) * 100) / 100;

        insertStmt.run(
          id,
          emp.id,
          payPeriod,
          payDate,
          monthlyBase,
          allowances,
          bonuses,
          tax,
          insurance,
          otherDeductions,
          net,
          now
        );
        createdCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed payroll for ${createdCount} employees for ${payPeriod}`,
        count: createdCount,
      });
    }

    // Single payroll record create
    const {
      employee_id,
      pay_period,
      payment_date: singleDate,
      base_salary,
      allowances = 0,
      bonuses = 0,
      tax_deduction = 0,
      insurance_deduction = 0,
      other_deductions = 0,
      status = 'Pending',
      payment_method = 'Direct Deposit',
    } = body;

    const netSalary =
      Number(base_salary) +
      Number(allowances) +
      Number(bonuses) -
      Number(tax_deduction) -
      Number(insurance_deduction) -
      Number(other_deductions);

    const id = `pay-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO payrolls (
        id, employee_id, pay_period, payment_date, base_salary,
        allowances, bonuses, tax_deduction, insurance_deduction, other_deductions,
        net_salary, status, payment_method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      employee_id,
      pay_period,
      singleDate,
      Number(base_salary),
      Number(allowances),
      Number(bonuses),
      Number(tax_deduction),
      Number(insurance_deduction),
      Number(other_deductions),
      netSalary,
      status,
      payment_method,
      now
    );

    const record = db.prepare('SELECT * FROM payrolls WHERE id = ?').get(id);
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error processing payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
