'use client';

import React, { useState, useEffect } from 'react';
import { Search, Medal, Calendar, CheckCircle2, Filter } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  code: string;
}

interface ResultsViewerProps {
  categories: CategoryItem[];
}

export default function ResultsViewer({ categories }: ResultsViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'ALL') params.set('categoryId', selectedCategory);
    if (searchQuery) params.set('query', searchQuery);

    fetch(`/api/public/results?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <div id="results" className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            Event Results & Winners
          </h2>
          <p className="text-sm text-slate-500">
            Browse verified sports meet event scores and individual medalists
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, athlete, chest..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat._id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Medal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Results Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            As soon as events are completed and verified by officials, scores and winners will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {results.map((res) => {
            const event = res.eventId;
            const category = event?.categoryId;

            return (
              <div
                key={res._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Event Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {category?.name || 'General'}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {event?.gender} • {event?.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{event?.name}</h3>
                    </div>
                    {event?.venue && (
                      <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {event.venue}
                      </span>
                    )}
                  </div>

                  {/* Placements */}
                  <div className="space-y-2 mt-4">
                    {/* 1st Place */}
                    {res.firstPlace && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🥇</span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {res.firstPlace.participantName}
                              {res.firstPlace.chestNumber && (
                                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/60 px-1.5 py-0.2 rounded">
                                  #{res.firstPlace.chestNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">
                              {res.firstPlace.clubName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-amber-700">
                            +{res.firstPlace.pointsAwarded || 5} pts
                          </div>
                          {res.firstPlace.scoreOrTime && (
                            <div className="text-xs text-slate-500 font-mono">
                              {res.firstPlace.scoreOrTime}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2nd Place */}
                    {res.secondPlace && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🥈</span>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              {res.secondPlace.participantName}
                              {res.secondPlace.chestNumber && (
                                <span className="text-xs font-mono text-slate-600 bg-slate-200/70 px-1.5 py-0.2 rounded">
                                  #{res.secondPlace.chestNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{res.secondPlace.clubName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-600">
                            +{res.secondPlace.pointsAwarded || 3} pts
                          </div>
                          {res.secondPlace.scoreOrTime && (
                            <div className="text-xs text-slate-500 font-mono">
                              {res.secondPlace.scoreOrTime}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {res.thirdPlace && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/5 border border-amber-900/10">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🥉</span>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              {res.thirdPlace.participantName}
                              {res.thirdPlace.chestNumber && (
                                <span className="text-xs font-mono text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                                  #{res.thirdPlace.chestNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{res.thirdPlace.clubName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-800">
                            +{res.thirdPlace.pointsAwarded || 1} pt
                          </div>
                          {res.thirdPlace.scoreOrTime && (
                            <div className="text-xs text-slate-500 font-mono">
                              {res.thirdPlace.scoreOrTime}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {res.publishedAt && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Official Result</span>
                    <span>{new Date(res.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
