'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function ClubEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [myParticipants, setMyParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [enrollModal, setEnrollModal] = useState<{ isOpen: boolean; event: any }>({
    isOpen: false,
    event: null,
  });
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/club/events')
      .then((r) => (r.ok ? r.json() : { events: [], registrations: [], myParticipants: [] }))
      .then((data) => {
        setEvents(data.events || []);
        setRegistrations(data.registrations || []);
        setMyParticipants(data.myParticipants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEnrollModal = (event: any) => {
    setEnrollError('');
    setSelectedParticipantId('');
    setEnrollModal({ isOpen: true, event });
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollModal.event || !selectedParticipantId) return;

    setActionLoading(true);
    setEnrollError('');

    try {
      const res = await fetch('/api/club/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: enrollModal.event._id,
          participantId: selectedParticipantId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll');

      setEnrollModal({ isOpen: false, event: null });
      fetchData();
    } catch (err: any) {
      setEnrollError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async (regId: string) => {
    if (!confirm('Un-enroll athlete from this event?')) return;
    try {
      const res = await fetch(`/api/club/events?id=${regId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Event Enrollment
        </h1>
        <p className="text-sm text-slate-500">
          Enroll registered club athletes into track and field events
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-44 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Events Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Events published by the Sports Admin will show up here for club athlete enrollment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((event) => {
            const enrolledInThisEvent = registrations.filter(
              (r) => (r.eventId?._id || r.eventId) === event._id
            );
            const isFull = enrolledInThisEvent.length >= event.maxParticipantsPerClub;

            return (
              <div
                key={event._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {event.categoryId?.name}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{event.name}</h3>
                      <div className="text-xs text-slate-500">
                        {event.gender} • {event.type}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enrolledInThisEvent.length} / {event.maxParticipantsPerClub} Enrolled
                    </span>
                  </div>

                  {/* Enrolled Athletes list */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Enrolled Athletes:
                    </span>
                    {enrolledInThisEvent.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No athlete enrolled yet</p>
                    ) : (
                      enrolledInThisEvent.map((reg) => (
                        <div
                          key={reg._id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                              #{reg.participantId?.chestNumber}
                            </span>
                            <span className="font-bold text-slate-800">
                              {reg.participantId?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnenroll(reg._id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove from event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEnrollModal(event)}
                    disabled={isFull || event.status === 'COMPLETED'}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      isFull || event.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {event.status === 'COMPLETED'
                        ? 'Event Completed'
                        : isFull
                        ? 'Quota Full'
                        : 'Enroll Athlete'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setEnrollModal({ isOpen: false, event: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">Enroll Athlete in Event</h2>
            <p className="text-xs text-blue-600 font-semibold mb-4">
              {enrollModal.event?.name} ({enrollModal.event?.categoryId?.name})
            </p>

            {enrollError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{enrollError}</span>
              </div>
            )}

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Select Athlete *</label>
                <select
                  required
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Choose from Club Squad --</option>
                  {myParticipants.map((p) => (
                    <option key={p._id} value={p._id}>
                      #{p.chestNumber} — {p.name} ({p.gender}, {p.categoryId?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEnrollModal({ isOpen: false, event: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedParticipantId}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                >
                  {actionLoading ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
