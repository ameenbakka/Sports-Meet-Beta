'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  ExternalLink,
  ShieldCheck,
  Users,
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  LogOut,
  RefreshCw,
  Search
} from 'lucide-react';

interface ITenantItem {
  _id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  clubCount: number;
  eventCount: number;
  participantCount: number;
  subdomainUrl: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<ITenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Tenant Form
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    contactPhone: '',
    adminPassword: 'Admin@123',
    venue: '',
    meetDates: '',
  });

  const [createdTenantData, setCreatedTenantData] = useState<{
    tenant: any;
    adminCredentials: any;
  } | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/super-admin/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate a clean slug from name if user hasn't manually edited slug
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
    }));
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.contactEmail) return;

    try {
      setCreating(true);
      const res = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create institution');
        return;
      }

      setCreatedTenantData(data);
      fetchTenants();
      setFormData({
        name: '',
        slug: '',
        contactEmail: '',
        contactPhone: '',
        adminPassword: 'Admin@123',
        venue: '',
        meetDates: '',
      });
    } catch (err: any) {
      alert(err.message || 'Error creating institution');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, status: newStatus }),
      });
      if (res.ok) {
        fetchTenants();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalClubs = tenants.reduce((acc, t) => acc + (t.clubCount || 0), 0);
  const totalEvents = tenants.reduce((acc, t) => acc + (t.eventCount || 0), 0);
  const totalParticipants = tenants.reduce((acc, t) => acc + (t.participantCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">Kalolsavam.online</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Tenant SaaS Management Console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Institution</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Registered Institutions</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{tenants.length}</p>
            <p className="text-xs text-emerald-400 mt-1">
              {tenants.filter((t) => t.status === 'ACTIVE').length} Active Meets
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Total Clubs / Houses</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{totalClubs}</p>
            <p className="text-xs text-slate-400 mt-1">Across all institutions</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Scheduled Events</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{totalEvents}</p>
            <p className="text-xs text-slate-400 mt-1">Track & Field competitions</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Total Athletes / Participants</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{totalParticipants}</p>
            <p className="text-xs text-slate-400 mt-1">Enrolled competitors</p>
          </div>
        </div>

        {/* Institutions Section */}
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 overflow-hidden">
          <div className="p-5 border-b border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Institutions & School Sports Meets</h2>
              <p className="text-xs text-slate-400">
                Each institution runs on its own isolated subdomain at <code className="text-amber-400 font-mono">[slug].kalolsavam.online</code>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search institution..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={fetchTenants}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-6 py-4">Institution / Meet</th>
                  <th className="px-6 py-4">Subdomain URL</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading && tenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Loading institutions...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No institutions found. Click <strong>&quot;New Institution&quot;</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{tenant.name}</div>
                        <div className="text-xs text-slate-400">{tenant.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono px-2 py-1 bg-slate-900 rounded text-blue-400 border border-slate-700">
                            {tenant.slug}.kalolsavam.online
                          </code>
                          <button
                            onClick={() => handleCopy(`https://${tenant.slug}.kalolsavam.online`, tenant._id)}
                            className="text-slate-400 hover:text-white"
                            title="Copy Link"
                          >
                            {copiedId === tenant._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5 text-slate-400">
                          <div>
                            <span className="text-white font-medium">{tenant.clubCount}</span> Clubs
                          </div>
                          <div>
                            <span className="text-white font-medium">{tenant.eventCount}</span> Events
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(tenant._id, tenant.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            tenant.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {tenant.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Suspended
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <a
                          href={`https://${tenant.slug}.kalolsavam.online`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>Public Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://${tenant.slug}.kalolsavam.online/login`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>Admin Login</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Institution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Create New Institution Meet</h3>
                  <p className="text-xs text-slate-400">Assign dedicated subdomain & generate admin access</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution / Meet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farook College Sports Meet 2026"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subdomain Slug *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="farook"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-sm text-amber-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <div className="w-1/2 px-3 py-2 bg-slate-950 border border-l-0 border-slate-700 rounded-r-lg text-xs font-mono text-slate-400">
                    .kalolsavam.online
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  School portal will be accessible at{' '}
                  <span className="text-amber-400">
                    https://{formData.slug || 'slug'}.kalolsavam.online
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sports@school.edu"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meet Dates
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 - 18 Nov 2026"
                    value={formData.meetDates}
                    onChange={(e) => setFormData({ ...formData, meetDates: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. College Main Ground"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Admin Password
                </label>
                <input
                  type="text"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default username will be <code className="text-white">admin</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Credentials Modal */}
      {createdTenantData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Institution Created Successfully!</h3>
                <p className="text-xs text-slate-400">{createdTenantData.tenant.name}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 block">Public Portal:</span>
                <a
                  href={`https://${createdTenantData.tenant.slug}.kalolsavam.online`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  https://{createdTenantData.tenant.slug}.kalolsavam.online
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Admin Login:</span>
                <a
                  href={`https://${createdTenantData.tenant.slug}.kalolsavam.online/login`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline break-all"
                >
                  https://{createdTenantData.tenant.slug}.kalolsavam.online/login
                </a>
              </div>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Username:</span>
                  <span className="text-white font-bold">{createdTenantData.adminCredentials.username}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Password:</span>
                  <span className="text-white font-bold">{createdTenantData.adminCredentials.password}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setCreatedTenantData(null);
                setShowCreateModal(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
