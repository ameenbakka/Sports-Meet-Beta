'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Leaderboard from '@/components/Leaderboard';
import ResultsViewer from '@/components/ResultsViewer';
import ClubRegisterModal from '@/components/ClubRegisterModal';
import { Trophy, Users, Flame, CalendarCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchStats = () => {
    fetch('/api/public/stats')
      .then(async (res) => {
        const resData = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(resData?.error || 'Database connection error');
        }
        return resData;
      })
      .then((resData) => {
        if (resData) {
          setData(resData);
          setDbError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setDbError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const settings = data?.settings || data?.tenant || {
    name: 'ചെറുകാവ് ഗ്രാമപഞ്ചായത്ത് കേരളോത്സവം 2024',
    subtitle: 'Sports & Athletic Meet - Cherukavu Grama Panchayat',
  };

  const stats = data?.stats || {
    totalClubs: 0,
    totalEvents: 0,
    completedEvents: 0,
    totalParticipants: 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      {/* Navigation */}
      <Navbar
        tenantName={settings.name}
        subtitle={settings.subtitle}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      {/* Database Diagnostic Warning (If MONGODB_URI not set or unreachable) */}
      {dbError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-900 text-xs text-center flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="font-bold">⚠️ Database Setup Notice:</span>
          <span>{dbError}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-4 backdrop-blur">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Live Sports Meet Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl leading-tight text-white mb-3">
            {settings.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-light mb-8">
            {settings.subtitle || 'Track real-time points, event rankings, and championship standings.'}
          </p>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.totalClubs}</div>
              <div className="text-xs text-slate-300 font-medium mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Participating Clubs
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-300">{stats.totalEvents}</div>
              <div className="text-xs text-slate-300 font-medium mt-1 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Total Events
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.completedEvents}</div>
              <div className="text-xs text-slate-300 font-medium mt-1 flex items-center justify-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5" /> Events Decided
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-300">{stats.totalParticipants}</div>
              <div className="text-xs text-slate-300 font-medium mt-1 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Registered Athletes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Section 1: Leaderboard */}
        <Leaderboard clubs={data?.leaderboard || []} loading={loading} />

        {/* Section 2: Event Results */}
        <ResultsViewer categories={data?.categories || []} />
      </main>

      {/* Club Registration Modal */}
      <ClubRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          fetchStats();
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">{settings.name}</p>
            <p className="text-[11px] text-slate-400">Sports Meet Championship Platform</p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Antigravity SaaS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
