'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@smart-finance/validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@smartfinance.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    // Simulate auth token exchange
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const fillCredential = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
          ₹
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Smart Finance Management
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Daily Collection Enterprise Management & Oversight Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-xl border border-slate-700 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Staff Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="admin@smartfinance.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          {/* Demo account quick fill */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Fill Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredential('superadmin@smartfinance.com')}
                className="px-2 py-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[11px] text-left transition"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredential('admin1@smartfinance.com')}
                className="px-2 py-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[11px] text-left transition"
              >
                💼 Operations Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

