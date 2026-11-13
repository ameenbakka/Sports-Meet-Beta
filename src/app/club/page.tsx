'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Medal,
} from 'lucide-react';

export default function ClubDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/club/participants').then((r) => (r.ok ? r.json() : { participants: [] })),
      fetch('/api/club/events').then((r) => (r.ok ? r.json() : { events: [], registrations: [] })),
    ])
      .then(([authData, pData, eData]) => {
        setData({
          club: authData?.club,
          participantsCount: pData.participants?.length || 0,
          registrationsCount: eData.registrations?.length || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const club = data?.club;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Club Overview</h1>
        <p className="text-sm text-slate-500">
          Manage your athletes, event entries, and track tournament scores
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Points */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Points
            </span>
            <div className="text-3xl font-black text-blue-600 mt-1">{club?.totalPoints || 0}</div>
            <span className="text-xs text-slate-400">Current tally</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Medals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Medals Won
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mt-2">
              <span title="Gold">🥇 {club?.goldCount || 0}</span>
              <span title="Silver">🥈 {club?.silverCount || 0}</span>
              <span title="Bronze">🥉 {club?.bronzeCount || 0}</span>
            </div>
            <span className="text-[11px] text-slate-400">Podium finishes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Medal className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Athletes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Athletes
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {data?.participantsCount || 0}
            </div>
            <span className="text-xs text-slate-400">In club squad</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Event Entries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Event Entries
            </span>
            <div className="text-3xl font-black text-indigo-600 mt-1">
              {data?.registrationsCount || 0}
            </div>
            <span className="text-xs text-slate-400">Athletes placed in events</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Manage Athletes / Squad
            </h2>
            <Link
              href="/club/participants"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Squad Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add team participants, allocate chest numbers, and assign them to eligible age categories
            (Sub-Junior, Junior, Senior, General).
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Event Registration
            </h2>
            <Link
              href="/club/events"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Enroll Athletes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enroll your club's registered athletes into specific track and field competitions according to
            category eligibility and participant quota rules.
          </p>
        </div>
      </div>
    </div>
  );
}
