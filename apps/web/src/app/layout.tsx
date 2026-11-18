import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Finance Management System - Admin',
  description: 'Daily Microfinance Collection and Administrative Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}

