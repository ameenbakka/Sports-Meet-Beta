'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldAlert,
  Search,
  Key,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [credentialsModal, setCredentialsModal] = useState<{
    isOpen: boolean;
    clubName: string;
    username: string;
    password?: string;
  }>({ isOpen: false, clubName: '', username: '' });
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClubs = () => {
    setLoading(true);
    fetch('/api/admin/clubs')
      .then((r) => (r.ok ? r.json() : { clubs: [] }))
      .then((data) => {
        setClubs(data.clubs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleApprove = async (clubId: string, clubName: string) => {
    setActionLoading(clubId);
    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', clubId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCredentialsModal({
          isOpen: true,
          clubName,
          username: data.credentials.username,
          password: data.credentials.password,
        });
        fetchClubs();
      } else {
        alert(data.error || 'Failed to approve club');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (clubId: string) => {
    if (!confirm('Are you sure you want to reject this club application?')) return;
    setActionLoading(clubId);
    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', clubId }),
      });
      if (res.ok) fetchClubs();
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdjustPoints = async (clubId: string, delta: number) => {
    try {
      await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADJUST_POINTS', clubId, pointsAdjustment: delta }),
      });
      fetchClubs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyCredentials = () => {
    const text = `Sports Meet Portal Login:\nUsername: ${credentialsModal.username}\nPassword: ${credentialsModal.password}\nPortal Link: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pendingList = clubs.filter((c) => c.status === 'PENDING');
  const approvedList = clubs.filter((c) => c.status === 'APPROVED');
  const displayList =
    activeTab === 'PENDING'
      ? pendingList
      : activeTab === 'APPROVED'
      ? approvedList
      : clubs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Club Management & Approvals
          </h1>
          <p className="text-sm text-slate-500">
            Accept pending club registrations, issue login credentials, and manage team scores
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'APPROVED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Clubs ({approvedList.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({clubs.length})
          </button>
        </div>
      </div>

      {/* Clubs List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-40 bg-slate-100 rounded-xl"></div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Clubs in this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {activeTab === 'PENDING'
              ? 'There are no pending club registrations waiting for approval.'
              : 'No clubs found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayList.map((club) => {
            const isPending = club.status === 'PENDING';
            const isApproved = club.status === 'APPROVED';

            return (
              <div
                key={club._id}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition ${
                  isPending
                    ? 'border-amber-200 bg-gradient-to-b from-amber-50/20 to-white'
                    : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {club.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{club.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {club.status}
                    </span>
                  </div>

                  {/* Convener Details */}
                  <div className="space-y-1 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-medium text-slate-400">Convener:</span>{' '}
                      <span className="font-semibold text-slate-800">{club.convenerName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-400">Phone:</span>{' '}
                      <span className="text-slate-700 font-mono">{club.phone}</span>
                    </div>
                    {club.place && (
                      <div>
                        <span className="font-medium text-slate-400">Place:</span>{' '}
                        <span className="text-slate-700">{club.place}</span>
                      </div>
                    )}
                  </div>

                  {/* Score & Medals (If Approved) */}
                  {isApproved && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100 mb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-600">Total Points</div>
                        <div className="text-2xl font-black text-blue-700">{club.totalPoints}</div>
                      </div>
                      <div className="flex gap-2 text-xs font-semibold text-slate-600">
                        <span title="Gold Medals">🥇 {club.goldCount}</span>
                        <span title="Silver Medals">🥈 {club.silverCount}</span>
                        <span title="Bronze Medals">🥉 {club.bronzeCount}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(club._id, club.name)}
                        disabled={actionLoading === club._id}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{actionLoading === club._id ? 'Generating...' : 'Approve & Issue Key'}</span>
                      </button>
                      <button
                        onClick={() => handleReject(club._id)}
                        disabled={actionLoading === club._id}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : isApproved ? (
                    <div className="space-y-2">
                      {/* Credentials button if exists */}
                      {club.generatedCredentials?.username && (
                        <button
                          onClick={() =>
                            setCredentialsModal({
                              isOpen: true,
                              clubName: club.name,
                              username: club.generatedCredentials.username,
                              password: club.generatedCredentials.initialPassword,
                            })
                          }
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                        >
                          <Key className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Login Credentials</span>
                        </button>
                      )}

                      {/* Points quick adjuster */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Adjust Points:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAdjustPoints(club._id, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-700 font-bold text-xs"
                            title="Add 1 point"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustPoints(club._id, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-bold text-xs"
                            title="Deduct 1 point"
                          >
                            -1
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-rose-600 font-medium">Application Rejected</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generated Credentials Modal */}
      {credentialsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Club Approved Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Login credentials have been created for <strong>{credentialsModal.clubName}</strong>.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans text-xs">Username:</span>
                <span className="font-bold text-slate-900">{credentialsModal.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans text-xs">Password:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {credentialsModal.password || '••••••••'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Share these credentials with the club convener so they can login and manage their participants.
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => setCredentialsModal({ ...credentialsModal, isOpen: false })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
