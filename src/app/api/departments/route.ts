import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const departments = db.prepare(`
      SELECT 
        d.*,
        m.first_name || ' ' || m.last_name as manager_name,
        count(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees m ON m.id = d.manager_id
      LEFT JOIN employees e ON e.department_id = d.id AND e.status != 'Terminated'
      GROUP BY d.id
      ORDER BY d.name ASC
    `).all();

    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, description = '', manager_id = null, budget = 100000, color = '#3b82f6' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const id = `dept-${Date.now()}`;
    db.prepare(`
      INSERT INTO departments (id, name, description, manager_id, budget, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, description, manager_id, Number(budget), color);

    const created = db.prepare(`
      SELECT 
        d.*,
        m.first_name || ' ' || m.last_name as manager_name,
        0 as employee_count
      FROM departments d
      LEFT JOIN employees m ON m.id = d.manager_id
      WHERE d.id = ?
    `).get(id);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
