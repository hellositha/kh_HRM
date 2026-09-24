import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { OvertimeRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const record = db.prepare(`
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

    if (!record) {
      return NextResponse.json({ error: 'Overtime request not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Error fetching overtime request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    const { action, reviewer_id, comments, status } = body;

    const existing = db.prepare('SELECT * FROM overtime_requests WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Overtime request not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (action === 'manager_approve') {
      db.prepare(`
        UPDATE overtime_requests 
        SET status = 'Pending Admin',
            line_manager_id = ?,
            line_manager_reviewed_at = ?,
            line_manager_comments = ?
        WHERE id = ?
      `).run(reviewer_id || 'mgr-1', now, comments || 'Line Manager Approved', id);
    } else if (action === 'manager_reject') {
      db.prepare(`
        UPDATE overtime_requests 
        SET status = 'Rejected',
            line_manager_id = ?,
            line_manager_reviewed_at = ?,
            line_manager_comments = ?
        WHERE id = ?
      `).run(reviewer_id || 'mgr-1', now, comments || 'Line Manager Rejected', id);
    } else if (action === 'admin_approve') {
      db.prepare(`
        UPDATE overtime_requests 
        SET status = 'Approved',
            admin_reviewer_id = ?,
            admin_reviewed_at = ?,
            admin_comments = ?
        WHERE id = ?
      `).run(reviewer_id || 'usr-1', now, comments || 'Admin Final Approved', id);
    } else if (action === 'admin_reject') {
      db.prepare(`
        UPDATE overtime_requests 
        SET status = 'Rejected',
            admin_reviewer_id = ?,
            admin_reviewed_at = ?,
            admin_comments = ?
        WHERE id = ?
      `).run(reviewer_id || 'usr-1', now, comments || 'Admin Rejected', id);
    } else if (status) {
      db.prepare('UPDATE overtime_requests SET status = ? WHERE id = ?').run(status, id);
    }

    const updated = db.prepare(`
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

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error('Error updating overtime request:', error);
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
    db.prepare('DELETE FROM overtime_requests WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting overtime request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
