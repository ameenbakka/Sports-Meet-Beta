'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, LogIn, UserCheck, Menu, X, PlusCircle } from 'lucide-react';

interface NavbarProps {
  tenantName: string;
  subtitle?: string;
  onOpenRegisterModal: () => void;
}

export default function Navbar({ tenantName, subtitle, onOpenRegisterModal }: NavbarProps) {
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          setSession(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                {tenantName || 'Sports Meet'}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 hidden sm:block leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#leaderboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              Leaderboard
            </a>
            <a
              href="#results"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              Results
            </a>

            <button
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-medium transition"
            >
              <PlusCircle className="w-4 h-4" />
              Register Club
            </button>

            {session?.authenticated ? (
              <Link
                href={
                  session.user.role === 'TENANT_ADMIN' || session.user.role === 'SUPER_ADMIN'
                    ? '/admin'
                    : '/club'
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Dashboard ({session.user.name})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <a
            href="#leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Leaderboard
          </a>
          <a
            href="#results"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Results
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRegisterModal();
            }}
            className="w-full text-left flex items-center gap-2 text-sm font-medium text-emerald-700 py-2 border-t border-slate-100"
          >
            <PlusCircle className="w-4 h-4" />
            Register Club
          </button>
          <div className="pt-2">
            {session?.authenticated ? (
              <Link
                href={
                  session.user.role === 'TENANT_ADMIN' || session.user.role === 'SUPER_ADMIN'
                    ? '/admin'
                    : '/club'
                }
                className="block text-center py-2 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="block text-center py-2 px-4 rounded-lg bg-slate-900 text-white font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
