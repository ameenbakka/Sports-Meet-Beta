'use client';

import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';

interface ClubStanding {
  _id: string;
  name: string;
  code: string;
  color?: string;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

interface LeaderboardProps {
  clubs: ClubStanding[];
  loading?: boolean;
}

export default function Leaderboard({ clubs, loading }: LeaderboardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-slate-100 rounded-xl"></div>
          <div className="h-44 bg-slate-100 rounded-xl"></div>
          <div className="h-36 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const top3 = clubs.slice(0, 3);
  const remaining = clubs.slice(3);

  return (
    <div id="leaderboard" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Club Standings & Points Table
          </h2>
          <p className="text-sm text-slate-500">
            Real-time club ranks based on verified event results
          </p>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
          Updated Live
        </div>
      </div>

      {clubs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No Approved Clubs Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Clubs will appear on the leaderboard once registered and approved by the Sports Admin.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Display */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition text-center relative">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-inner">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg truncate">{top3[1].name}</h3>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full mb-3">
                    {top3[1].code}
                  </span>
                  <div className="text-3xl font-black text-slate-800 mb-2">
                    {top3[1].totalPoints}{' '}
                    <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <div className="flex justify-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="text-amber-500 font-medium">🥇 {top3[1].goldCount}</span>
                    <span className="text-slate-400 font-medium">🥈 {top3[1].silverCount}</span>
                    <span className="text-amber-700 font-medium">🥉 {top3[1].bronzeCount}</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white rounded-2xl p-7 border-2 border-amber-300 shadow-md hover:shadow-lg transition text-center relative -mt-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Leader
                  </div>
                  <div className="w-14 h-14 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
                    1
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xl truncate">{top3[0].name}</h3>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full mb-3">
                    {top3[0].code}
                  </span>
                  <div className="text-4xl font-black text-amber-600 mb-2">
                    {top3[0].totalPoints}{' '}
                    <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <div className="flex justify-center gap-3 text-xs text-slate-600 pt-2 border-t border-amber-100">
                    <span className="text-amber-600 font-bold">🥇 {top3[0].goldCount}</span>
                    <span className="text-slate-500 font-bold">🥈 {top3[0].silverCount}</span>
                    <span className="text-amber-800 font-bold">🥉 {top3[0].bronzeCount}</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="order-3 bg-gradient-to-b from-amber-900/5 to-white rounded-2xl p-6 border-2 border-amber-700/20 shadow-sm hover:shadow-md transition text-center relative">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-inner">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg truncate">{top3[2].name}</h3>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full mb-3">
                    {top3[2].code}
                  </span>
                  <div className="text-3xl font-black text-slate-800 mb-2">
                    {top3[2].totalPoints}{' '}
                    <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <div className="flex justify-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="text-amber-500 font-medium">🥇 {top3[2].goldCount}</span>
                    <span className="text-slate-400 font-medium">🥈 {top3[2].silverCount}</span>
                    <span className="text-amber-700 font-medium">🥉 {top3[2].bronzeCount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Club Name</th>
                    <th className="py-3.5 px-4 text-center">Gold (1st)</th>
                    <th className="py-3.5 px-4 text-center">Silver (2nd)</th>
                    <th className="py-3.5 px-4 text-center">Bronze (3rd)</th>
                    <th className="py-3.5 px-4 text-right font-bold">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clubs.map((club, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={club._id}
                        className={`hover:bg-slate-50/80 transition ${
                          rank === 1 ? 'bg-amber-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-xs shadow-sm">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">#{rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{club.name}</span>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                              {club.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-600 font-semibold">
                          {club.goldCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                          {club.silverCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-800 font-semibold">
                          {club.bronzeCount}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-base font-extrabold text-blue-600">
                            {club.totalPoints}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
