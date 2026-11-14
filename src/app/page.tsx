'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Leaderboard from '@/components/Leaderboard';
import ResultsViewer from '@/components/ResultsViewer';
import ClubRegisterModal from '@/components/ClubRegisterModal';
import {
  Trophy,
  Users,
  Flame,
  CalendarCheck,
  Building2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
  Zap,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchStats = () => {
    // Preserve local tenant query if present
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const tenantParam = urlParams?.get('tenant');
    const apiUrl = tenantParam ? `/api/public/stats?tenant=${tenantParam}` : '/api/public/stats';

    fetch(apiUrl)
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
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1. Root Domain View (kalolsavam.online SaaS Homepage)
  if (data?.isRoot) {
    const stats = data.stats || {
      totalInstitutions: 0,
      totalClubs: 0,
      totalParticipants: 0,
      totalEvents: 0,
    };
    const tenants = data.tenants || [];

    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        {/* Top Navbar */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
                K
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">Kalolsavam.online</span>
                <span className="text-[10px] text-amber-400 font-mono ml-2 uppercase px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                  SaaS Platform
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-sm font-semibold transition-colors border border-slate-700"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/super-admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Super Admin</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>

          <div className="relative max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold backdrop-blur">
              <Globe className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>Multi-Tenant Sports Meet & Kalolsavam Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Dedicated Subdomains for Every{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                School & College
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal">
              Host your institution&apos;s annual athletic championship on a custom branded portal (e.g.{' '}
              <code className="text-amber-400 font-mono">yourschool.kalolsavam.online</code>) with live leaderboards,
              real-time result publishing, automated club credential issuance, and an appeals desk.
            </p>

            {/* Platform Overall Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-extrabold text-amber-400">{stats.totalInstitutions}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Institutions
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-extrabold text-blue-400">{stats.totalClubs}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Clubs / Houses
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-extrabold text-emerald-400">{stats.totalEvents}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Track & Field Events
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-3xl font-extrabold text-purple-400">{stats.totalParticipants}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Enrolled Athletes
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Meets Directory */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Active School & College Sports Meets</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any institution to view their live leaderboard and sports portal
              </p>
            </div>
            <Link
              href="/super-admin"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Manage Institutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tenants.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500">
              No active sports meets registered yet. Log into Super Admin to create your first meet!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant: any) => (
                <div
                  key={tenant.id}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all hover:shadow-xl hover:shadow-amber-500/5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {tenant.slug}.kalolsavam.online
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Meet
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                      {tenant.name}
                    </h3>

                    {tenant.venue && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500">Venue:</span> {tenant.venue}
                      </p>
                    )}
                    {tenant.meetDates && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500">Dates:</span> {tenant.meetDates}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-4">
                    <a
                      href={`/?tenant=${tenant.slug}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                      title="Preview this meet locally"
                    >
                      Local Preview
                    </a>
                    <a
                      href={tenant.subdomainUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                    >
                      <span>Open Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Features Showcase */}
        <section className="bg-slate-900/60 border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Features</h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Built specifically for Kerala School & College Athletic Championships and Cultural Meets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Wildcard Subdomains</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every institution gets its own unique subdomain under <code className="text-amber-400 font-mono">*.kalolsavam.online</code> with automated SSL and complete data isolation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Real-Time Points Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Publish 1st, 2nd, and 3rd place winners with automated point distribution (5-3-1 or custom) and instant live leaderboard updates.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Automated Club Desk</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Public club registration with one-click admin approval that auto-generates secure manager credentials and WhatsApp shareable passcodes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kalolsavam.online — Multi-Tenant Sports Meet SaaS Platform</p>
        </footer>
      </div>
    );
  }

  // 2. Tenant Subdomain View (School Sports Meet Portal)
  const settings = data?.settings || data?.tenant || {
    name: 'Sports & Athletic Championship',
    subtitle: 'Sports Meet Management Portal',
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

      {/* Database Diagnostic Warning */}
      {dbError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-900 text-xs text-center flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="font-bold">⚠️ Database Notice:</span>
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
            <p className="text-[11px] text-slate-400">Sports Meet Championship Portal</p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Kalolsavam.online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
