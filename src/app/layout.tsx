import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'HESTRA HRM | Enterprise Human Resource Management System',
  description: 'Next-Generation Full-Stack HRMS: Employees, Time Off, Payroll, ATS, Performance & Attendance',
  icons: {
    icon: '/hestra-logo.svg',
    shortcut: '/hestra-logo.svg',
    apple: '/hestra-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased font-sans text-slate-900 bg-slate-50">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
