'use client';

import React, { useState } from 'react';
import { financeStore } from '../../../lib/mockData';
import { StatusBadge } from '../../../components/StatusBadge';
import { customerSchema } from '@smart-finance/validation';
import { Customer } from '@smart-finance/shared';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(financeStore.getCustomers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [shopName, setShopName] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = customerSchema.safeParse({
      fullName,
      phone,
      alternatePhone: alternatePhone || null,
      address,
      shopName: shopName || null,
      isActive: true,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    const created = financeStore.addCustomer({
      fullName: validation.data.fullName,
      phone: validation.data.phone,
      alternatePhone: validation.data.alternatePhone,
      address: validation.data.address,
      shopName: validation.data.shopName,
      photoPath: null,
      createdBy: '00000000-0000-0000-0000-000000000002',
      isActive: true,
    });

    setCustomers(financeStore.getCustomers());
    setIsModalOpen(false);
    // Reset Form
    setFullName('');
    setPhone('');
    setAlternatePhone('');
    setAddress('');
    setShopName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered retail business clients and shop proprietors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
        >
          + Add New Customer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="w-full sm:w-96 relative">
          <input
            type="text"
            placeholder="Search by name, code, phone, or shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredCustomers.length}</span> of {customers.length} customers
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Shop / Business</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{c.customerCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{c.shopName || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {c.phone}
                      {c.alternatePhone && (
                        <span className="block text-[10px] text-slate-400">Alt: {c.alternatePhone}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={c.address}>
                      {c.address}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={c.isActive ? 'active' : 'cancelled'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Customer</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 mt-4">
              {formError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Primary Phone (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Alternate Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Optional 10-digit"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Shop / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Krishna Stores"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Complete street address, landmark, town"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
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
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

