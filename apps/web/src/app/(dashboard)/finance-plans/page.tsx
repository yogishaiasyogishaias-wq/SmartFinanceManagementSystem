'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import { StatusBadge } from '../../../components/StatusBadge';
import {
  calculateExpectedProfit,
  calculateEndDate,
  formatINR,
  rupeesToPaise,
  paiseToRupees,
} from '@smart-finance/shared';
import { financePlanSchema } from '@smart-finance/validation';

export default function FinancePlansPage() {
  const [plans, setPlans] = useState(financeStore.getPlans());
  const customers = financeStore.getCustomers();
  const agents = financeStore.getAgents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form States
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [principalRupees, setPrincipalRupees] = useState(9000);
  const [durationDays, setDurationDays] = useState(100);
  const [dailyRupees, setDailyRupees] = useState(100);
  const [totalRupees, setTotalRupees] = useState(10000);
  const [startDate, setStartDate] = useState('2026-11-08');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.profileId || '');

  // Derived calculations
  const expectedProfitPaise = totalRupees >= principalRupees
    ? (totalRupees - principalRupees) * 100
    : 0;

  const calculatedEndDate = startDate && durationDays > 0
    ? calculateEndDate(startDate, Number(durationDays))
    : '—';

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const principalPaise = rupeesToPaise(Number(principalRupees));
    const totalPaise = rupeesToPaise(Number(totalRupees));
    const dailyPaise = rupeesToPaise(Number(dailyRupees));

    const validation = financePlanSchema.safeParse({
      customerId,
      principalAmountPaise: principalPaise,
      totalCollectionAmountPaise: totalPaise,
      dailyCollectionAmountPaise: dailyPaise,
      durationDays: Number(durationDays),
      startDate,
      assignedAgentId,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    financeStore.addPlan({
      customerId,
      principalAmountPaise: principalPaise,
      totalCollectionAmountPaise: totalPaise,
      dailyCollectionAmountPaise: dailyPaise,
      durationDays: Number(durationDays),
      startDate,
      endDate: calculatedEndDate,
      assignedAgentId,
      status: 'active',
      createdBy: '00000000-0000-0000-0000-000000000002',
    });

    setPlans(financeStore.getPlans());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finance Plan Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Microfinance contracts, disbursement agreements, and daily collection schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
        >
          + Disburse New Finance Plan
        </button>
      </div>

      {/* Plans List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Principal</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Total Expected</th>
                <th className="py-3 px-4">Profit Margin</th>
                <th className="py-3 px-4">Schedule Period</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {plans.map((p) => {
                const profitPaise = calculateExpectedProfit(
                  p.totalCollectionAmountPaise,
                  p.principalAmountPaise
                );
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.customer?.fullName}</p>
                      <p className="text-[10px] text-teal-600 font-mono">{p.customer?.customerCode}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatINR(p.principalAmountPaise, false)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {formatINR(p.dailyCollectionAmountPaise, false)}/day
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatINR(p.totalCollectionAmountPaise, false)}
                    </td>
                    <td className="py-3 px-4 text-teal-600 font-semibold">
                      +{formatINR(profitPaise, false)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {p.startDate} &rarr; {p.endDate}
                      <span className="block text-[10px] text-slate-400">{p.durationDays} days</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {p.assignedAgent?.fullName || 'Assigned'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse New Finance Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Disburse New Daily Finance Plan</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
              {formError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Select Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assign Route Agent *</label>
                  <select
                    value={assignedAgentId}
                    onChange={(e) => setAssignedAgentId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.profileId}>
                        {a.profile?.fullName} ({a.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Principal (₹) *</label>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    value={principalRupees}
                    onChange={(e) => setPrincipalRupees(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Duration (Days) *</label>
                  <input
                    type="number"
                    min={10}
                    max={365}
                    value={durationDays}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDurationDays(d);
                      setTotalRupees(dailyRupees * d);
                    }}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Daily Amount (₹) *</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={dailyRupees}
                    onChange={(e) => {
                      const daily = Number(e.target.value);
                      setDailyRupees(daily);
                      setTotalRupees(daily * durationDays);
                    }}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Total Collection (₹) *</label>
                  <input
                    type="number"
                    value={totalRupees}
                    onChange={(e) => setTotalRupees(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Calculated End Date:</span>
                  <span className="font-bold text-slate-900 font-mono">{calculatedEndDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Expected Gross Profit:</span>
                  <span className="font-bold text-teal-600">{formatINR(expectedProfitPaise)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Margin:</span>
                  <span className="font-bold text-slate-800">
                    {totalRupees > 0 ? ((expectedProfitPaise / (totalRupees * 100)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-sm"
                >
                  Authorize & Disburse Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

