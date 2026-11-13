'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Medal,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  PlusCircle,
  Check,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/clubs').then((r) => (r.ok ? r.json() : { clubs: [] })),
      fetch('/api/admin/events').then((r) => (r.ok ? r.json() : { events: [] })),
      fetch('/api/admin/appeals').then((r) => (r.ok ? r.json() : { appeals: [] })),
    ])
      .then(([cData, eData, aData]) => {
        setClubs(cData.clubs || []);
        setEvents(eData.events || []);
        setAppeals(aData.appeals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pendingClubs = clubs.filter((c) => c.status === 'PENDING');
  const approvedClubs = clubs.filter((c) => c.status === 'APPROVED');
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');
  const pendingAppeals = appeals.filter((a) => a.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-slate-500">
          Overview of sports meet operations, registrations, and results
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Clubs
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{approvedClubs.length}</div>
            <span className="text-xs text-amber-600 font-medium">
              {pendingClubs.length} pending review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Events
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{events.length}</div>
            <span className="text-xs text-emerald-600 font-medium">
              {completedEvents.length} completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Decided Results
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{completedEvents.length}</div>
            <span className="text-xs text-slate-400">
              {events.length - completedEvents.length} remaining
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Medal className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Appeals
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{pendingAppeals.length}</div>
            <span className="text-xs text-rose-500 font-medium">Require action</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Pending Club Applications Alert Banner */}
      {pendingClubs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {pendingClubs.length} Club Registration Request(s) Awaiting Approval
              </h3>
              <p className="text-xs text-slate-600">
                Review club submissions and generate login credentials for team managers.
              </p>
            </div>
          </div>
          <Link
            href="/admin/clubs"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 shrink-0"
          >
            <span>Review Clubs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Score & Results Entry */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" />
              Score & Result Entry
            </h2>
            <Link
              href="/admin/results"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Enter Scores <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Publish 1st, 2nd, and 3rd place winners for track and field events. The automated points
            engine instantly recalculates team rankings on the public leaderboard.
          </p>
        </div>

        {/* Card 2: Event Schedule & Category Management */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Events & Categories
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Manage Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create and edit competition events (100m sprint, relays, high jump, shot put), set age
            categories, assign gender divisions, and configure custom point values.
          </p>
        </div>
      </div>
    </div>
  );
}
