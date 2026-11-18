'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatINR, paiseToRupees } from '@smart-finance/shared';
import { Payment } from '@smart-finance/shared';

export default function CollectionsPage() {
  const [payments, setPayments] = useState<Payment[]>(financeStore.getPayments());
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const filtered = payments.filter((p) => {
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    const matchesSearch =
      p.customer?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.agent?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  const totalCollectedFiltered = filtered
    .filter((p) => !p.isReversed)
    .reduce((sum, p) => sum + p.amountPaidPaise, 0);

  const handleReversePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !adjustmentReason.trim()) return;

    // Execute reversal
    selectedPayment.isReversed = true;
    selectedPayment.reversedAt = new Date().toISOString();
    selectedPayment.reversalReason = adjustmentReason;

    setPayments([...financeStore.getPayments()]);
    setIsAdjustModalOpen(false);
    setSelectedPayment(null);
    setAdjustmentReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Collections & Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable payment audit log with reversal and adjustment controls.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Filtered Total: </span>
          <span className="text-base font-bold text-emerald-600">{formatINR(totalCollectedFiltered)}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search customer, agent, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash Only</option>
            <option value="upi">UPI Only</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> payment events
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Recorded Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Collecting Agent</th>
                <th className="py-3 px-4">Amount Collected</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference / Idempotency</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className={`hover:bg-slate-50/80 transition ${p.isReversed ? 'bg-rose-50/40 opacity-75' : ''}`}>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(p.recordedAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.customer?.fullName}</td>
                  <td className="py-3 px-4 text-slate-700">{p.agent?.fullName}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className={p.isReversed ? 'line-through text-rose-500' : 'text-emerald-700'}>
                      {formatINR(p.amountPaidPaise)}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-semibold text-[11px] text-slate-600">
                    {p.paymentMethod}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                    {p.referenceNumber || p.idempotencyKey.slice(0, 13) + '...'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.isReversed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        REVERSED
                      </span>
                    ) : (
                      <StatusBadge status={p.syncStatus} />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!p.isReversed ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment(p);
                          setIsAdjustModalOpen(true);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Adjust / Reverse
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Audited</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reversal / Adjustment Modal */}
      {isAdjustModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Payment Adjustment & Reversal</h2>
            <p className="text-xs text-slate-500 mb-4">
              Authorized correction for payment of <span className="font-bold text-slate-800">{formatINR(selectedPayment.amountPaidPaise)}</span> by {selectedPayment.customer?.fullName}.
            </p>

            <form onSubmit={handleReversePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Mandatory Reversal Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this collection requires reversal or adjustment (e.g. wrong amount entered by agent, customer paid twice)..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
                >
                  Confirm Reversal (Audit Logged)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

