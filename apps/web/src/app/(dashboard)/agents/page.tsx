'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import { formatINR } from '@smart-finance/shared';

export default function AgentsPage() {
  const [agents, setAgents] = useState(financeStore.getAgents());
  const plans = financeStore.getPlans();
  const payments = financeStore.getPayments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Collection Agent Workforce</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Field agents, route allocation, collection targets, and performance tracking.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const agentPlans = plans.filter((p) => p.assignedAgentId === agent.profileId);
          const activePlans = agentPlans.filter((p) => p.status === 'active').length;
          const todayCollectedPaise = payments
            .filter((p) => p.agentId === agent.profileId && !p.isReversed)
            .reduce((sum, p) => sum + p.amountPaidPaise, 0);

          const targetAchievementPct = agent.dailyTargetPaise > 0
            ? Math.round((todayCollectedPaise / agent.dailyTargetPaise) * 100)
            : 0;

          return (
            <div
              key={agent.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {agent.profile?.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{agent.profile?.fullName}</h3>
                      <p className="text-[10px] text-teal-600 font-mono font-semibold">{agent.employeeCode}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Route Area</span>
                    <span className="font-medium text-slate-800">{agent.areaAssigned}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Plans</span>
                      <span className="font-bold text-slate-800">{activePlans} / {agent.maxActivePlans} max</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Daily Target</span>
                      <span className="font-bold text-slate-800">{formatINR(agent.dailyTargetPaise, false)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">Collected Today</span>
                      <span className="text-xs font-bold text-emerald-600">{formatINR(todayCollectedPaise)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, targetAchievementPct)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-right text-slate-400 mt-1">{targetAchievementPct}% achieved</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                <span>Phone: {agent.profile?.phone}</span>
                <span className="text-teal-600 font-semibold cursor-pointer hover:underline">Route Sheet &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

