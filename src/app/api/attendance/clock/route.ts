import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const rawEmployeeId = searchParams.get('employee_id');

    if (!rawEmployeeId) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
    }

    let employeeId = rawEmployeeId;
    if (employeeId.startsWith('usr-')) {
      const u = db.prepare('SELECT employee_id FROM users WHERE id = ?').get(employeeId) as any;
      if (u?.employee_id) employeeId = u.employee_id;
    }

    const today = new Date().toISOString().split('T')[0];
    const records = db.prepare(
      'SELECT * FROM attendance WHERE (employee_id = ? OR employee_id = ?) AND date = ? ORDER BY id DESC'
    ).all(employeeId, rawEmployeeId, today) as any[];

    const activeShift = records.find((r) => !r.clock_out);
    const latestRecord = activeShift || records[0] || null;
    const isClockedIn = !!activeShift;
    const isClockedOut = !isClockedIn && records.length > 0;

    return NextResponse.json({
      today,
      record: latestRecord,
      isClockedIn,
      isClockedOut,
      hasRecord: records.length > 0,
      shiftsToday: records.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const rawEmployeeId = body.employee_id;

    if (!rawEmployeeId) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
    }

    let employeeId = rawEmployeeId;
    if (employeeId.startsWith('usr-')) {
      const u = db.prepare('SELECT employee_id FROM users WHERE id = ?').get(employeeId) as any;
      if (u?.employee_id) employeeId = u.employee_id;
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const records = db.prepare(
      'SELECT * FROM attendance WHERE (employee_id = ? OR employee_id = ?) AND date = ? ORDER BY id DESC'
    ).all(employeeId, rawEmployeeId, today) as any[];

    const activeShift = records.find((r) => !r.clock_out);

    if (!activeShift) {
      // MANUAL CLOCK IN
      const id = `att-${employeeId}-${today}-${Date.now().toString().slice(-4)}`;
      const hour = now.getHours();
      const status = hour >= 10 ? 'Late' : 'Present';

      db.prepare(`
        INSERT INTO attendance (id, employee_id, date, clock_in, clock_out, status, work_hours, notes)
        VALUES (?, ?, ?, ?, NULL, ?, 0, 'Clocked in manually via HESTRA HRM Web')
      `).run(id, employeeId, today, timeString, status);

      const created = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
      return NextResponse.json({
        action: 'clock_in',
        message: `បានកត់ត្រាចូលដោយជោគជ័យនៅម៉ោង ${timeString} (Clocked in successfully)`,
        record: created,
        isClockedIn: true,
      });
    } else {
      // MANUAL CLOCK OUT
      let workHours = 8.0;
      if (activeShift.clock_in) {
        const [inH, inM] = activeShift.clock_in.split(':').map(Number);
        const [outH, outM] = timeString.split(':').map(Number);
        let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMinutes < 0) {
          // Overnight shift that crossed midnight (e.g. 22:00 -> 06:00)
          diffMinutes += 24 * 60;
        }
        const diffHours = diffMinutes / 60;
        workHours = Math.max(0.1, Math.round(diffHours * 10) / 10);
      }

      db.prepare(`
        UPDATE attendance 
        SET clock_out = ?, work_hours = ?, notes = notes || ' | Shift ended manually'
        WHERE id = ?
      `).run(timeString, workHours, activeShift.id);

      const updated = db.prepare('SELECT * FROM attendance WHERE id = ?').get(activeShift.id);
      return NextResponse.json({
        action: 'clock_out',
        message: `បានកត់ត្រាចេញដោយជោគជ័យនៅម៉ោង ${timeString} (Clocked out: ${workHours} hrs)`,
        record: updated,
        isClockedIn: false,
      });
    }
  } catch (error: any) {
    console.error('Error handling clock in/out:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
