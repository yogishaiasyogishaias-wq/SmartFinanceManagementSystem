'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import {
  formatINR,
  calculateExpectedProfit,
  calculateRemainingCollection,
  calculateCollectionPercentage,
} from '@smart-finance/shared';

type ReportType =
  | 'daily_collection'
  | 'customer_outstanding'
  | 'agent_performance'
  | 'plan_profitability';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily_collection');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-07');

  const plans = financeStore.getPlans();
  const customers = financeStore.getCustomers();
  const payments = financeStore.getPayments();
  const agents = financeStore.getAgents();

  const exportCSV = () => {
    let rows: string[][] = [];
    let filename = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'daily_collection') {
      rows.push(['Payment ID', 'Recorded At', 'Customer Code', 'Customer Name', 'Agent Name', 'Amount (INR)', 'Method', 'Reference']);
      payments.forEach((p) => {
        rows.push([
          p.id,
          p.recordedAt,
          p.customer?.customerCode || '',
          p.customer?.fullName || '',
          p.agent?.fullName || '',
          (p.amountPaidPaise / 100).toFixed(2),
          p.paymentMethod,
          p.referenceNumber || '',
        ]);
      });
    } else if (reportType === 'customer_outstanding') {
      rows.push(['Customer Code', 'Customer Name', 'Phone', 'Total Expected (INR)', 'Collected (INR)', 'Outstanding (INR)', 'Status']);
      plans.forEach((plan) => {
        const collectedPaise = payments
          .filter((p) => p.financePlanId === plan.id && !p.isReversed)
          .reduce((sum, p) => sum + p.amountPaidPaise, 0);
        const outstandingPaise = calculateRemainingCollection(plan.totalCollectionAmountPaise, collectedPaise);
        rows.push([
          plan.customer?.customerCode || '',
          plan.customer?.fullName || '',
          plan.customer?.phone || '',
          (plan.totalCollectionAmountPaise / 100).toFixed(2),
          (collectedPaise / 100).toFixed(2),
          (outstandingPaise / 100).toFixed(2),
          plan.status,
        ]);
      });
    } else if (reportType === 'agent_performance') {
      rows.push(['Employee Code', 'Agent Name', 'Area Assigned', 'Active Plans', 'Collected (INR)', 'Daily Target (INR)']);
      agents.forEach((ag) => {
        const agCollectedPaise = payments
          .filter((p) => p.agentId === ag.profileId && !p.isReversed)
          .reduce((sum, p) => sum + p.amountPaidPaise, 0);
        rows.push([
          ag.employeeCode,
          ag.profile?.fullName || '',
          ag.areaAssigned,
          plans.filter((p) => p.assignedAgentId === ag.profileId).length.toString(),
          (agCollectedPaise / 100).toFixed(2),
          (ag.dailyTargetPaise / 100).toFixed(2),
        ]);
      });
    } else {
      rows.push(['Customer Name', 'Principal (INR)', 'Total Expected (INR)', 'Expected Profit (INR)', 'Margin %', 'Duration Days']);
      plans.forEach((p) => {
        const profitPaise = calculateExpectedProfit(p.totalCollectionAmountPaise, p.principalAmountPaise);
        rows.push([
          p.customer?.fullName || '',
          (p.principalAmountPaise / 100).toFixed(2),
          (p.totalCollectionAmountPaise / 100).toFixed(2),
          (profitPaise / 100).toFixed(2),
          ((profitPaise / p.totalCollectionAmountPaise) * 100).toFixed(1) + '%',
          p.durationDays.toString(),
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Financial Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready daily, weekly, and monthly collection reports with CSV export.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
        >
          ⬇ Export Report to CSV
        </button>
      </div>

      {/* Report Selection Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="daily_collection">Daily Collection Breakdown</option>
            <option value="customer_outstanding">Customer Outstanding & Balance Report</option>
            <option value="agent_performance">Agent Route Collection Performance</option>
            <option value="plan_profitability">Finance Plan Profitability Analysis</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      {/* Render Selected Report Preview Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'daily_collection' && (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Collected Amount</th>
                  <th className="py-3 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-mono">{p.scheduledDate}</td>
                    <td className="py-3 px-4 font-semibold">{p.customer?.fullName}</td>
                    <td className="py-3 px-4">{p.agent?.fullName}</td>
                    <td className="py-3 px-4 uppercase font-mono">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{formatINR(p.amountPaidPaise)}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{p.referenceNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customer_outstanding' && (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Expected</th>
                  <th className="py-3 px-4">Valid Collected</th>
                  <th className="py-3 px-4">Remaining Outstanding</th>
                  <th className="py-3 px-4">Progress %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => {
                  const collected = payments
                    .filter((p) => p.financePlanId === plan.id && !p.isReversed)
                    .reduce((sum, p) => sum + p.amountPaidPaise, 0);
                  const remaining = calculateRemainingCollection(plan.totalCollectionAmountPaise, collected);
                  const pct = calculateCollectionPercentage(collected, plan.totalCollectionAmountPaise);
                  return (
                    <tr key={plan.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold">{plan.customer?.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{plan.customer?.customerCode}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold">{formatINR(plan.totalCollectionAmountPaise)}</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">{formatINR(collected)}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">{formatINR(remaining)}</td>
                      <td className="py-3 px-4 font-bold text-teal-600">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'agent_performance' && (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Agent Code</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Area Assigned</th>
                  <th className="py-3 px-4">Daily Target</th>
                  <th className="py-3 px-4">Actual Collected</th>
                  <th className="py-3 px-4">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((ag) => {
                  const collected = payments
                    .filter((p) => p.agentId === ag.profileId && !p.isReversed)
                    .reduce((sum, p) => sum + p.amountPaidPaise, 0);
                  const pct = ag.dailyTargetPaise > 0 ? Math.round((collected / ag.dailyTargetPaise) * 100) : 0;
                  return (
                    <tr key={ag.id}>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{ag.employeeCode}</td>
                      <td className="py-3 px-4 font-semibold">{ag.profile?.fullName}</td>
                      <td className="py-3 px-4">{ag.areaAssigned}</td>
                      <td className="py-3 px-4 font-bold">{formatINR(ag.dailyTargetPaise)}</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">{formatINR(collected)}</td>
                      <td className="py-3 px-4 font-bold text-teal-600">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'plan_profitability' && (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Principal Amount</th>
                  <th className="py-3 px-4">Total Expected</th>
                  <th className="py-3 px-4">Expected Profit</th>
                  <th className="py-3 px-4">Profit Margin</th>
                  <th className="py-3 px-4">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => {
                  const profit = calculateExpectedProfit(p.totalCollectionAmountPaise, p.principalAmountPaise);
                  const margin = ((profit / p.totalCollectionAmountPaise) * 100).toFixed(1);
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-semibold">{p.customer?.fullName}</td>
                      <td className="py-3 px-4">{formatINR(p.principalAmountPaise)}</td>
                      <td className="py-3 px-4 font-bold">{formatINR(p.totalCollectionAmountPaise)}</td>
                      <td className="py-3 px-4 font-bold text-teal-600">+{formatINR(profit)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{margin}%</td>
                      <td className="py-3 px-4 font-mono">{p.durationDays} days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

