'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Users,
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.authenticated || data.user.role !== 'CLUB_MANAGER') {
          window.location.href = '/login';
        } else {
          setSession(data);
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    // Hard redirect to clear router cache and cookies completely
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Club Dashboard', href: '/club', icon: LayoutDashboard },
    { name: 'Athletes / Participants', href: '/club/participants', icon: Users },
    { name: 'Event Enrollments', href: '/club/events', icon: Calendar },
    { name: 'Grievance / Appeals', href: '/club/appeals', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Verifying Club Session...</p>
        </div>
      </div>
    );
  }

  const club = session?.club;

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-bold text-sm tracking-wide block truncate">
                  {club?.name || 'Club Portal'}
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono">
                  {club?.code ? `[${club.code}]` : 'Manager'}
                </span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span>Live Standings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 truncate">
              {club?.name || 'Club Manager Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {club && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{club.totalPoints || 0} pts</span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {club?.code?.slice(0, 2) || 'CL'}
            </div>

            {/* Direct Sign Out Button in Header (always visible on mobile & desktop) */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
