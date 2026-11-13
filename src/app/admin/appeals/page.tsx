'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Search,
} from 'lucide-react';

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [remarksInput, setRemarksInput] = useState<{ [id: string]: string }>({});

  const fetchAppeals = () => {
    setLoading(true);
    fetch('/api/admin/appeals')
      .then((r) => (r.ok ? r.json() : { appeals: [] }))
      .then((data) => {
        setAppeals(data.appeals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleResolve = async (appealId: string, status: 'RESOLVED_ACCEPTED' | 'RESOLVED_REJECTED') => {
    setActionLoading(appealId);
    try {
      const res = await fetch('/api/admin/appeals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appealId,
          status,
          adminRemarks: remarksInput[appealId] || '',
        }),
      });

      if (res.ok) {
        fetchAppeals();
      } else {
        alert('Failed to resolve appeal');
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          Appeals & Disputes Resolution Desk
        </h1>
        <p className="text-sm text-slate-500">
          Review grievances and official complaints submitted by participating clubs
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : appeals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Appeals Filed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Any grievances filed by club managers regarding event scores or fouls will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const isPending = appeal.status === 'PENDING';
            const isAccepted = appeal.status === 'RESOLVED_ACCEPTED';
            const isRejected = appeal.status === 'RESOLVED_REJECTED';

            return (
              <div
                key={appeal._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-100 text-amber-800'
                          : isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {appeal.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Club: {appeal.clubId?.name} ({appeal.clubId?.code})
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(appeal.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{appeal.subject}</h3>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    Event: {appeal.eventId?.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {appeal.description}
                  </p>
                </div>

                {/* Admin Remarks Section */}
                {isPending ? (
                  <div className="pt-2 space-y-3">
                    <input
                      type="text"
                      placeholder="Add official resolution remark..."
                      value={remarksInput[appeal._id] || ''}
                      onChange={(e) =>
                        setRemarksInput({ ...remarksInput, [appeal._id]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleResolve(appeal._id, 'RESOLVED_REJECTED')}
                        disabled={actionLoading === appeal._id}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition"
                      >
                        Reject Appeal
                      </button>
                      <button
                        onClick={() => handleResolve(appeal._id, 'RESOLVED_ACCEPTED')}
                        disabled={actionLoading === appeal._id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
                      >
                        Accept Appeal & Review Score
                      </button>
                    </div>
                  </div>
                ) : (
                  appeal.adminRemarks && (
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Admin Remarks:</span>{' '}
                      {appeal.adminRemarks}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
