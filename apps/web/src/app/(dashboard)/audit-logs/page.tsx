'use client';

import React, { useState } from 'react';

interface AuditRow {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}

const sampleAuditLogs: AuditRow[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-07T11:00:15Z',
    userName: 'Kumar Velu',
    userRole: 'Collection Agent',
    action: 'RECORD_PAYMENT',
    entity: 'Payment (₹200.00)',
    details: 'Collection for Anandhi Selvam via UPI (Ref: UPI-98371982)',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log-002',
    timestamp: '2026-11-07T10:15:20Z',
    userName: 'Kumar Velu',
    userRole: 'Collection Agent',
    action: 'RECORD_PAYMENT',
    entity: 'Payment (₹100.00)',
    details: 'Cash collection for Murugan Chettiar (Plan 3000-0001)',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log-003',
    timestamp: '2026-11-07T09:30:00Z',
    userName: 'Suresh Balakrishnan',
    userRole: 'Super Admin',
    action: 'SYSTEM_AUDIT_VERIFIED',
    entity: 'Ledger Reconciliation',
    details: 'Daily portfolio closure balance validated across 5 active plans',
    ipAddress: '10.0.0.12',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-15T10:00:00Z',
    userName: 'Kavitha Sundaram',
    userRole: 'Admin',
    action: 'DISBURSE_FINANCE_PLAN',
    entity: 'Finance Plan (₹9,000.00)',
    details: 'Plan approved for Selvam Arumugam (100 days @ ₹100/day)',
    ipAddress: '10.0.0.15',
  },
  {
    id: 'log-005',
    timestamp: '2026-10-01T08:00:00Z',
    userName: 'Suresh Balakrishnan',
    userRole: 'Super Admin',
    action: 'SYSTEM_INITIALIZED',
    entity: 'Database Migrations',
    details: 'RLS policies activated and cryptographic keys confirmed',
    ipAddress: '10.0.0.12',
  },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditRow[]>(sampleAuditLogs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system audit trail tracking administrative actions, disbursements, and payments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Audit Trail Active
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{log.userName}</p>
                    <p className="text-[10px] text-teal-600 font-medium">{log.userRole}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.entity}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

