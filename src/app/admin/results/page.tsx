'use client';

import React, { useState, useEffect } from 'react';
import {
  Medal,
  CheckCircle2,
  Trophy,
  Save,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminResultsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [firstPlace, setFirstPlace] = useState({
    clubId: '',
    participantName: '',
    chestNumber: '',
    scoreOrTime: '',
    pointsAwarded: 5,
  });

  const [secondPlace, setSecondPlace] = useState({
    clubId: '',
    participantName: '',
    chestNumber: '',
    scoreOrTime: '',
    pointsAwarded: 3,
  });

  const [thirdPlace, setThirdPlace] = useState({
    clubId: '',
    participantName: '',
    chestNumber: '',
    scoreOrTime: '',
    pointsAwarded: 1,
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/events').then((r) => (r.ok ? r.json() : { events: [] })),
      fetch('/api/admin/clubs').then((r) => (r.ok ? r.json() : { clubs: [] })),
    ])
      .then(([eData, cData]) => {
        setEvents(eData.events || []);
        const approvedOnly = (cData.clubs || []).filter((c: any) => c.status === 'APPROVED');
        setClubs(approvedOnly);
        if (eData.events?.length > 0) {
          setSelectedEventId(eData.events[0]._id);
          loadEventDetails(eData.events[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadEventDetails = (event: any) => {
    if (!event) return;
    setFirstPlace((prev) => ({
      ...prev,
      pointsAwarded: event.pointsScheme?.first || 5,
    }));
    setSecondPlace((prev) => ({
      ...prev,
      pointsAwarded: event.pointsScheme?.second || 3,
    }));
    setThirdPlace((prev) => ({
      ...prev,
      pointsAwarded: event.pointsScheme?.third || 1,
    }));
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e._id === eventId);
    if (ev) loadEventDetails(ev);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    if (!firstPlace.clubId || !firstPlace.participantName) {
      setStatusMessage({ type: 'error', text: '1st place club and athlete name are required.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const getClubName = (cId: string) => clubs.find((c) => c._id === cId)?.name || 'Club';

    const payload = {
      eventId: selectedEventId,
      firstPlace: {
        clubId: firstPlace.clubId,
        clubName: getClubName(firstPlace.clubId),
        participantName: firstPlace.participantName,
        chestNumber: firstPlace.chestNumber,
        scoreOrTime: firstPlace.scoreOrTime,
        pointsAwarded: Number(firstPlace.pointsAwarded),
      },
      secondPlace: secondPlace.clubId
        ? {
            clubId: secondPlace.clubId,
            clubName: getClubName(secondPlace.clubId),
            participantName: secondPlace.participantName,
            chestNumber: secondPlace.chestNumber,
            scoreOrTime: secondPlace.scoreOrTime,
            pointsAwarded: Number(secondPlace.pointsAwarded),
          }
        : undefined,
      thirdPlace: thirdPlace.clubId
        ? {
            clubId: thirdPlace.clubId,
            clubName: getClubName(thirdPlace.clubId),
            participantName: thirdPlace.participantName,
            chestNumber: thirdPlace.chestNumber,
            scoreOrTime: thirdPlace.scoreOrTime,
            pointsAwarded: Number(thirdPlace.pointsAwarded),
          }
        : undefined,
      notes,
    };

    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish results');

      setStatusMessage({
        type: 'success',
        text: 'Result published successfully! Club points updated automatically on the live leaderboard.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Medal className="w-6 h-6 text-amber-500" />
          Score & Result Entry Console
        </h1>
        <p className="text-sm text-slate-500">
          Record winners for competition events. Club points will be recalculated instantly.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-96"></div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Events Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Please add events in the Events tab before entering results.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePublish} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          {/* Step 1: Select Event */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Competition Event *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} — {e.categoryId?.name} ({e.gender})
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-0.5">
                  <div className="font-semibold text-slate-800">{selectedEvent.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Scheme: 1st ({selectedEvent.pointsScheme?.first || 5} pts) • 2nd ({selectedEvent.pointsScheme?.second || 3} pts) • 3rd ({selectedEvent.pointsScheme?.third || 1} pt)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            {/* 1st Place (Gold) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 to-yellow-50/30 border-2 border-amber-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-base">
                  <span className="text-2xl">🥇</span>
                  <span>1st Place Winner (Gold Medalist) *</span>
                </div>
                <div className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-full">
                  +{firstPlace.pointsAwarded} Points
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Club / House *</label>
                  <select
                    required
                    value={firstPlace.clubId}
                    onChange={(e) => setFirstPlace({ ...firstPlace, clubId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Participant / Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Athlete's Full Name"
                    value={firstPlace.participantName}
                    onChange={(e) => setFirstPlace({ ...firstPlace, participantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Chest No / Time</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Chest#"
                      value={firstPlace.chestNumber}
                      onChange={(e) => setFirstPlace({ ...firstPlace, chestNumber: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="10.2s / 6m"
                      value={firstPlace.scoreOrTime}
                      onChange={(e) => setFirstPlace({ ...firstPlace, scoreOrTime: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2nd Place (Silver) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                  <span className="text-2xl">🥈</span>
                  <span>2nd Place (Silver Medalist)</span>
                </div>
                <div className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">
                  +{secondPlace.pointsAwarded} Points
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Club / House</label>
                  <select
                    value={secondPlace.clubId}
                    onChange={(e) => setSecondPlace({ ...secondPlace, clubId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Participant / Team Name</label>
                  <input
                    type="text"
                    placeholder="Athlete's Full Name"
                    value={secondPlace.participantName}
                    onChange={(e) => setSecondPlace({ ...secondPlace, participantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Chest No / Time</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Chest#"
                      value={secondPlace.chestNumber}
                      onChange={(e) => setSecondPlace({ ...secondPlace, chestNumber: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Time/Score"
                      value={secondPlace.scoreOrTime}
                      onChange={(e) => setSecondPlace({ ...secondPlace, scoreOrTime: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="p-5 rounded-2xl bg-amber-950/5 border border-amber-900/15 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
                  <span className="text-2xl">🥉</span>
                  <span>3rd Place (Bronze Medalist)</span>
                </div>
                <div className="text-xs font-bold text-amber-900 bg-amber-200/50 px-2.5 py-1 rounded-full">
                  +{thirdPlace.pointsAwarded} Point
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Club / House</label>
                  <select
                    value={thirdPlace.clubId}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, clubId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-800 bg-white"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Participant / Team Name</label>
                  <input
                    type="text"
                    placeholder="Athlete's Full Name"
                    value={thirdPlace.participantName}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, participantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Chest No / Time</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Chest#"
                      value={thirdPlace.chestNumber}
                      onChange={(e) => setThirdPlace({ ...thirdPlace, chestNumber: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Time/Score"
                      value={thirdPlace.scoreOrTime}
                      onChange={(e) => setThirdPlace({ ...thirdPlace, scoreOrTime: e.target.value })}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing & Recalculating...' : 'Publish Official Result'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
