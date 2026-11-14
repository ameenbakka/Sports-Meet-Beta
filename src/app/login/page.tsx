'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, LogIn, AlertCircle, ArrowLeft, Lock, User, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const tenantParam = urlParams?.get('tenant');
      const apiUrl = tenantParam ? `/api/auth/login?tenant=${tenantParam}` : '/api/auth/login';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({
        error: 'Unable to communicate with the authentication server. Please check database configuration.',
      }));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Hard redirect to guarantee cookie is committed and prevent immediate logout
      window.location.href = data.redirectUrl || '/';
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-slate-950/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Portal Sign In</h1>
            <p className="text-xs text-slate-400">
              Sign in with your Super Admin, Institution Admin, or Club Manager credentials
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin or club username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-900 focus:bg-slate-900 placeholder-slate-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-900 focus:bg-slate-900 placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Access helper */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-500">
              Default Credentials Reference
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono text-slate-300">
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Super Admin:</span>
                <span>superadmin / Super@123</span>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-blue-400 font-semibold">Institution Admin:</span>
                <span>admin / Admin@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
