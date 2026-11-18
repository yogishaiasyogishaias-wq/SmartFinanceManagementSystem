'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatINR, isInstallmentOverdue } from '@smart-finance/shared';

interface InstallmentRow {
  id: string;
  customerName: string;
  customerPhone: string;
  agentName: string;
  planId: string;
  installmentNumber: number;
  scheduledDate: string;
  expectedPaise: number;
  paidPaise: number;
  status: 'paid' | 'partially_paid' | 'pending' | 'missed';
  daysOverdue: number;
}

export default function InstallmentsPage() {
  const today = '2026-11-07';
  const plans = financeStore.getPlans();

  // Generate realistic live installment list from plans
  const [installments, setInstallments] = useState<InstallmentRow[]>([
    {
      id: 'inst-1',
      customerName: 'Murugan Chettiar',
      customerPhone: '9876500001',
      agentName: 'Kumar Velu',
      planId: plans[0]?.id || '1',
      installmentNumber: 3,
      scheduledDate: '2026-11-05',
      expectedPaise: 10000,
      paidPaise: 5000,
      status: 'partially_paid',
      daysOverdue: 2,
    },
    {
      id: 'inst-2',
      customerName: 'Murugan Chettiar',
      customerPhone: '9876500001',
      agentName: 'Kumar Velu',
      planId: plans[0]?.id || '1',
      installmentNumber: 4,
      scheduledDate: '2026-11-06',
      expectedPaise: 10000,
      paidPaise: 0,
      status: 'missed',
      daysOverdue: 1,
    },
    {
      id: 'inst-3',
      customerName: 'Murugan Chettiar',
      customerPhone: '9876500001',
      agentName: 'Kumar Velu',
      planId: plans[0]?.id || '1',
      installmentNumber: 5,
      scheduledDate: '2026-11-07',
      expectedPaise: 10000,
      paidPaise: 0,
      status: 'pending',
      daysOverdue: 0,
    },
    {
      id: 'inst-4',
      customerName: 'Anandhi Selvam',
      customerPhone: '9876500002',
      agentName: 'Kumar Velu',
      planId: plans[1]?.id || '2',
      installmentNumber: 12,
      scheduledDate: '2026-11-04',
      expectedPaise: 20000,
      paidPaise: 0,
      status: 'missed',
      daysOverdue: 3,
    },
    {
      id: 'inst-5',
      customerName: 'Anandhi Selvam',
      customerPhone: '9876500002',
      agentName: 'Kumar Velu',
      planId: plans[1]?.id || '2',
      installmentNumber: 15,
      scheduledDate: '2026-11-07',
      expectedPaise: 20000,
      paidPaise: 20000,
      status: 'paid',
      daysOverdue: 0,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'overdue' | 'pending'>('overdue');

  const filtered = installments.filter((item) => {
    if (filter === 'overdue') return item.daysOverdue > 0 && item.paidPaise < item.expectedPaise;
    if (filter === 'pending') return item.status === 'pending';
    return true;
  });

  const totalOverduePaise = installments
    .filter((i) => i.daysOverdue > 0 && i.paidPaise < i.expectedPaise)
    .reduce((sum, i) => sum + (i.expectedPaise - i.paidPaise), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Installment Schedule Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily collection tracking, missed collections, and risk management.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            Total Overdue: {formatINR(totalOverduePaise)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('overdue')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
            filter === 'overdue'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overdue Installments ({installments.filter((i) => i.daysOverdue > 0).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
            filter === 'pending'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Today's Scheduled
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
            filter === 'all'
              ? 'border-navy-800 text-navy-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Installments
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Inst #</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4 text-center">Overdue Days</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filtered.map((item) => {
                const balanceDuePaise = Math.max(0, item.expectedPaise - item.paidPaise);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      Day {item.installmentNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.scheduledDate}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {formatINR(item.expectedPaise)}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {formatINR(item.paidPaise)}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      {balanceDuePaise > 0 ? formatINR(balanceDuePaise) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.daysOverdue > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          {item.daysOverdue} d late
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">On Track</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

