# PulseHR - Modern Full-Stack Enterprise HRMS

A modern, production-grade Human Resources Management System (HRMS / HRIS) built natively with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and an embedded **SQLite (better-sqlite3)** database with WAL mode concurrency.

---

## 🌟 Key Modules & Features

### 1. 📊 Executive Dashboard (`/`)
- **Key Metrics**: Real-time headcount, today's attendance rate, pending leave approvals, monthly payroll volume, active job openings.
- **Department Distribution**: Interactive breakdown and progress gauges of staff across Engineering, Design, Marketing, Sales, HR, and Finance.
- **Real-Time Attendance Stack**: Live counts of employees present in office, working remotely, late, and on leave.
- **Upcoming Celebrations**: Track work anniversaries and team birthdays.
- **Recent HR Event Stream**: Live audit log of hires, leaves, and approvals.

### 2. 👥 Employee Directory & Deep Profiles (`/employees`)
- **Search & Multi-Filter**: Search by name, role, email; filter by department, employment type (Full-Time, Contract, etc.), and status (Active, Remote, On Leave, Terminated).
- **Dual View Modes**: Switch seamlessly between interactive **Grid Cards** and high-density **Data Table**.
- **Deep Profile Slide-Over Drawer**:
  - Personal & emergency contact information.
  - Leave balances (Annual PTO, Sick, Casual) with visual progress meters.
  - Historical attendance logs (last 14 days) with clock-in/out times and logged hours.
  - Compensation details with historical payslips.
  - Official performance reviews and rating scorecards.
- **Actions**:
  - Onboard new employee with auto-generated ID and initialized leave allowances.
  - Export full filtered employee roster to **CSV**.
  - One-click employee status termination.

### 3. ⏱️ Attendance & Timesheets (`/attendance`)
- **Live Digital Punch Clock**: Real-time ticking clock with instant shift toggle (Clock In / Clock Out) and work duration calculation.
- **KPI Metrics**: Present, Remote (WFH), Late arrivals (> 9:30 AM), and Absent/On-Leave counts.
- **Historical Timesheet Log**: Filter by specific date or date presets.
- **Manual Shift Entry**: HR admin modal to log or correct shifts.

### 4. 🌴 Time Off & Leaves (`/leaves`)
- **Allowance Gauges**: Remaining balances for Annual Leave (20 days), Sick Leave (10 days), Casual/Floating Days (5 days).
- **Time Off Request Modal**: Auto-calculates working days between start and end dates.
- **Approval Queue (Manager / Admin View)**: Review pending requests with requester details, days, reason, and one-click Approve / Reject buttons. Approvals automatically debit the employee's leave balance!

### 5. 💰 Payroll & Compensation (`/payroll`)
- **Compensation KPIs**: Gross payroll, net payout, tax withholdings (22%), stipends/bonuses.
- **Automated Batch Payroll**: Run multi-tier monthly payroll runs for all active employees.
- **Interactive Printable Digital Payslip**:
  - Corporate header with employer information.
  - Itemized earnings (base salary, stipends, bonuses).
  - Itemized statutory deductions (taxes, health/dental, 401(k)).
  - Net take-home pay with transaction reference.
  - Browser-native **Print / Save as PDF** support with clean print styling.

### 6. 🎯 Recruitment & ATS Pipeline (`/recruitment`)
- **Active Job Requisitions**: Roles, departments, locations, salary ranges, and applicant counts.
- **5-Stage Interactive Candidate Kanban Board**:
  - `Applied` &rarr; `Screening` &rarr; `Interview` &rarr; `Offer` &rarr; `Hired`.
  - Candidate cards with rating stars, target role, contact information, and notes.
  - Quick button to advance candidates through the hiring pipeline.
- **Add Candidate Modal**: Recruiters can add candidates and referrals directly.

### 7. 📈 Performance & Appraisals (`/performance`)
- Company-wide average rating and OKR completion metrics.
- Performance review cards showcasing employee accomplishments, strengths, growth areas, and reviewer sign-offs.
- **Conduct Review Modal**: Create formal appraisals with ratings (1-5), OKR achievement percentages, and qualitative feedback.

### 8. 📢 Company Bulletin & Announcements (`/announcements`)
- Pinned and categorized broadcast notices (`General`, `Policy`, `Celebration`, `Urgent`).
- Modal to publish announcements to the entire company.

### 9. ⚙️ System Settings & Role Simulator (`/settings`)
- **Role-Based Persona Simulator**: Switch between **Elena Rostova** (Admin / CPO), **Marcus Vance** (Manager / VP Eng), and **Alex Rivera** (Employee) to inspect permissions and tailored views.
- **SQLite Database Diagnostics**: View connection status, journal mode (WAL), and storage location (`data/hr.db`).
- **Reset to Fresh Seed Data**: One-click restore button to reset all records to initial state anytime.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with Turbopack
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com), [Lucide React Icons](https://lucide.dev)
- **Database**: [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) with WAL Mode
- **Language**: TypeScript 5 with strict typing

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server (defaults to port 3000, or customize with PORT=...)
npm run dev

# 4. Or build and run production server
npm run build
npm run start
# For port 80: npm run start:prod
```

Visit `http://localhost:3000` (or `http://38.252.151.33:3000`) in your browser.

---

## 🐳 Docker Deployment

The application includes a multi-stage Docker build with native SQLite support and volume persistence:

```bash
# Start container with Docker Compose
docker compose up -d --build
```

# kh_HRM
# kh_HRM
