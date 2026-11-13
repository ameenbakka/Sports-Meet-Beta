'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function ClubAppealsPage() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    eventId: '',
    subject: '',
    description: '',
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/club/appeals')
      .then((r) => (r.ok ? r.json() : { appeals: [], completedEvents: [] }))
      .then((data) => {
        setAppeals(data.appeals || []);
        setCompletedEvents(data.completedEvents || []);
        if (data.completedEvents?.length > 0 && !formData.eventId) {
          setFormData((prev) => ({ ...prev, eventId: data.completedEvents[0]._id }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/club/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit appeal');

      setModalOpen(false);
      setFormData({ eventId: completedEvents[0]?._id || '', subject: '', description: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Official Grievance & Appeals Desk
          </h1>
          <p className="text-sm text-slate-500">
            Submit formal disputes regarding event results, timing discrepancies, or foul decisions
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File New Appeal</span>
        </button>
      </div>

      {/* Appeals List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : appeals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Appeals Filed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            If there are any score disputes or referee objections, you can submit an official appeal here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const isPending = appeal.status === 'PENDING';
            const isAccepted = appeal.status === 'RESOLVED_ACCEPTED';

            return (
              <div
                key={appeal._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
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
                    <span className="text-xs font-bold text-blue-600">
                      Event: {appeal.eventId?.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(appeal.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{appeal.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {appeal.description}
                  </p>
                </div>

                {appeal.adminRemarks && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-800">Admin Response: </span>
                    <span className="text-slate-600">{appeal.adminRemarks}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File Appeal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">File Official Grievance</h2>
            <p className="text-xs text-slate-500 mb-4">
              Your objection will be reviewed by the Sports Council Jury of Appeal.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Select Event *</label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="">-- Choose Completed Event --</option>
                  {completedEvents.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject / Objection Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disputed timing in heat 2 / Lane violation foul"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed facts, athlete names, timings, or video references..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Submit Appeal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
