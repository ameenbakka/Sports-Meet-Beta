'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Filter,
} from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [filterCat, setFilterCat] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    type: 'INDIVIDUAL',
    gender: 'MALE',
    maxParticipantsPerClub: 2,
    pointsFirst: 5,
    pointsSecond: 3,
    pointsThird: 1,
    venue: '',
    scheduleTime: '',
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/events')
      .then((r) => (r.ok ? r.json() : { events: [], categories: [] }))
      .then((data) => {
        setEvents(data.events || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: data.categories[0]._id }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      type: 'INDIVIDUAL',
      gender: 'MALE',
      maxParticipantsPerClub: 2,
      pointsFirst: 5,
      pointsSecond: 3,
      pointsThird: 1,
      venue: '',
      scheduleTime: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      categoryId: event.categoryId?._id || event.categoryId,
      type: event.type,
      gender: event.gender,
      maxParticipantsPerClub: event.maxParticipantsPerClub || 2,
      pointsFirst: event.pointsScheme?.first || 5,
      pointsSecond: event.pointsScheme?.second || 3,
      pointsThird: event.pointsScheme?.third || 1,
      venue: event.venue || '',
      scheduleTime: event.scheduleTime
        ? new Date(event.scheduleTime).toISOString().slice(0, 16)
        : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        id: editingEvent?._id,
        name: formData.name,
        categoryId: formData.categoryId,
        type: formData.type,
        gender: formData.gender,
        maxParticipantsPerClub: Number(formData.maxParticipantsPerClub),
        pointsScheme: {
          first: Number(formData.pointsFirst),
          second: Number(formData.pointsSecond),
          third: Number(formData.pointsThird),
        },
        venue: formData.venue,
        scheduleTime: formData.scheduleTime ? new Date(formData.scheduleTime) : undefined,
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save event');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredEvents =
    filterCat === 'ALL'
      ? events
      : events.filter((e) => (e.categoryId?._id || e.categoryId) === filterCat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Events & Categories
          </h1>
          <p className="text-sm text-slate-500">
            Configure track, field, and team events with points and categories
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCat('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            filterCat === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Events ({events.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setFilterCat(cat._id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCat === cat._id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Events Table / Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-48 bg-slate-100 rounded-xl"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Events Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Click 'Add New Event' to create track and field competition items.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type / Gender</th>
                  <th className="py-3 px-4 text-center">Max / Club</th>
                  <th className="py-3 px-4 text-center">Points (1st/2nd/3rd)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{event.name}</div>
                      {event.venue && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {event.venue}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {event.categoryId?.name || 'Category'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{event.type}</div>
                      <div className="text-[11px] text-slate-400">{event.gender}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      {event.maxParticipantsPerClub}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="text-amber-600 font-bold">{event.pointsScheme?.first || 5}</span> /{' '}
                      <span className="text-slate-500 font-bold">{event.pointsScheme?.second || 3}</span> /{' '}
                      <span className="text-amber-800 font-bold">{event.pointsScheme?.third || 1}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          event.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Create New Sports Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100m Sprint / High Jump / 4x100m Relay"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="MALE">Boys / Male</option>
                    <option value="FEMALE">Girls / Female</option>
                    <option value="MIXED">Mixed / Open</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="GROUP">Group / Relay</option>
                    <option value="TEAM">Team Match</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Max Athletes / Club</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.maxParticipantsPerClub}
                    onChange={(e) => setFormData({ ...formData, maxParticipantsPerClub: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Custom Points */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700">Points Distribution</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">1st Place</span>
                    <input
                      type="number"
                      value={formData.pointsFirst}
                      onChange={(e) => setFormData({ ...formData, pointsFirst: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-amber-600"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">2nd Place</span>
                    <input
                      type="number"
                      value={formData.pointsSecond}
                      onChange={(e) => setFormData({ ...formData, pointsSecond: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">3rd Place</span>
                    <input
                      type="number"
                      value={formData.pointsThird}
                      onChange={(e) => setFormData({ ...formData, pointsThird: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-amber-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Venue / Ground</label>
                <input
                  type="text"
                  placeholder="e.g. Main Track Lane 1-8 / Field Ground"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
