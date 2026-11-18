'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MetricCard } from '../../../components/MetricCard';
import { StatusBadge } from '../../../components/StatusBadge';
import { financeStore } from '../../../lib/mockData';
import { formatINR, paiseToRupees } from '@smart-finance/shared';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(financeStore.getDashboardMetrics());
  const [recentPayments, setRecentPayments] = useState(financeStore.getPayments().slice(0, 5));
  const [plans, setPlans] = useState(financeStore.getPlans().slice(0, 5));

  useEffect(() => {
    // Refresh live metrics
    setMetrics(financeStore.getDashboardMetrics());
    setRecentPayments(financeStore.getPayments().slice(0, 5));
    setPlans(financeStore.getPlans().slice(0, 5));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Collection Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily collection metrics calculated using integer paise accounting.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/collections"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
          >
            + Record Collection
          </Link>
          <Link
            href="/finance-plans"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-900 text-white shadow-sm transition"
          >
            + New Finance Plan
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Customers"
          value={metrics.totalActiveCustomers.toString()}
          subtitle="Verified active accounts"
          accentColor="navy"
        />
        <MetricCard
          title="Principal Distributed"
          value={formatINR(metrics.totalPrincipalDistributedPaise, false)}
          subtitle="Total disbursed capital"
          accentColor="navy"
        />
        <MetricCard
          title="Valid Collections Received"
          value={formatINR(metrics.totalValidCollectionsPaise, false)}
          subtitle={`${metrics.collectionPercentage}% collection progress`}
          trend={`+${metrics.collectionPercentage}%`}
          trendPositive={true}
          accentColor="emerald"
        />
        <MetricCard
          title="Outstanding Scheduled"
          value={formatINR(metrics.outstandingScheduledPaise, false)}
          subtitle="Remaining receivable"
          accentColor="amber"
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Expected"
          value={formatINR(metrics.todayExpectedCollectionPaise, false)}
          subtitle="Scheduled across all active routes"
          accentColor="teal"
        />
        <MetricCard
          title="Today's Actual Collected"
          value={formatINR(metrics.todayActualCollectionPaise, false)}
          subtitle="Confirmed received today"
          trendPositive={metrics.todayActualCollectionPaise >= metrics.todayExpectedCollectionPaise}
          accentColor="emerald"
        />
        <MetricCard
          title="Overdue Amount"
          value={formatINR(metrics.overdueAmountPaise, false)}
          subtitle="Missed or partial installments"
          trend="Attention required"
          trendPositive={false}
          accentColor="rose"
        />
        <MetricCard
          title="Expected Gross Profit"
          value={formatINR(metrics.expectedGrossProfitPaise, false)}
          subtitle={`Realized: ${formatINR(metrics.realizedGrossProfitPaise, false)}`}
          accentColor="teal"
        />
      </div>

      {/* Collection Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Portfolio Collection Completion</h3>
            <p className="text-xs text-slate-500">
              Valid collected {formatINR(metrics.totalValidCollectionsPaise)} of total expected {formatINR(metrics.totalPrincipalDistributedPaise + metrics.expectedGrossProfitPaise)}
            </p>
          </div>
          <span className="text-sm font-bold text-teal-600">{metrics.collectionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${metrics.collectionPercentage}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Recent Collections & Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Collection Ledger</h3>
            <Link href="/collections" className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No collections recorded yet</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.customer?.fullName || 'Customer'}</p>
                    <p className="text-[11px] text-slate-500">
                      Collected by {p.agent?.fullName || 'Agent'} &bull; {p.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">+{formatINR(p.amountPaidPaise)}</p>
                    <StatusBadge status={p.syncStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Finance Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Active Finance Plans</h3>
            <Link href="/finance-plans" className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {plans.map((plan) => (
              <div key={plan.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{plan.customer?.fullName || 'Customer'}</p>
                  <p className="text-[11px] text-slate-500">
                    Principal: {formatINR(plan.principalAmountPaise, false)} &bull; {plan.durationDays} Days @ {formatINR(plan.dailyCollectionAmountPaise, false)}/day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{formatINR(plan.totalCollectionAmountPaise, false)}</p>
                  <StatusBadge status={plan.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

