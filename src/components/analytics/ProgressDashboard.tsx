'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import Link from 'next/link';

export function ProgressDashboard() {
  const { completedSessions, personalRecords, exercises, user } = useWorkoutStore();
  const [timeRange, setTimeRange] = useState<'4w' | '3m' | '6m' | '1y' | 'all'>('4w');

  // Filter sessions by range
  const now = Date.now();
  const daysMap = { '4w': 28, '3m': 90, '6m': 180, '1y': 365, 'all': 99999 };
  const maxDays = daysMap[timeRange];
  const filteredSessions = completedSessions.filter(
    s => (now - s.startedAt) <= maxDays * 24 * 60 * 60 * 1000
  );

  // Metrics
  const totalVolume = filteredSessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
  const totalWorkouts = filteredSessions.length;
  const avgDurationMinutes = totalWorkouts > 0 
    ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / totalWorkouts / 60)
    : 0;

  // Muscle Volume Distribution
  const muscleSetsCount: Record<string, number> = {};
  filteredSessions.forEach(sess => {
    sess.exercises.forEach(ex => {
      const exMeta = exercises.find(e => e.id === ex.exerciseId);
      const muscle = exMeta?.primaryMuscle || 'Other';
      const setsCount = ex.sets.filter(s => s.completed).length;
      muscleSetsCount[muscle] = (muscleSetsCount[muscle] || 0) + setsCount;
    });
  });

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        {(['4w', '3m', '6m', '1y', 'all'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              timeRange === r
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {r === '4w' ? '4 Weeks' : r === '3m' ? '3 Mos' : r === '6m' ? '6 Mos' : r === '1y' ? '1 Year' : 'All'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Dumbbell className="w-4 h-4 text-sky-400" />
            <span>Workouts</span>
          </div>
          <span className="text-2xl font-black text-slate-100 font-mono block">
            {totalWorkouts}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Logged in period</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Streak</span>
          </div>
          <span className="text-2xl font-black text-slate-100 font-mono block">
            3 wks
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">Consistent</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Total Volume</span>
          </div>
          <span className="text-2xl font-black text-slate-100 font-mono block">
            {Math.round(totalVolume / 1000)}k
          </span>
          <span className="text-[11px] text-slate-500 font-medium">{user.preferences.unit} lifted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Avg Session</span>
          </div>
          <span className="text-2xl font-black text-slate-100 font-mono block">
            {avgDurationMinutes}m
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Duration</span>
        </div>
      </div>

      {/* Muscle Group Volume Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-extrabold text-slate-100 text-base">
          Volume by Muscle Group
        </h3>

        <div className="space-y-2.5">
          {Object.entries(muscleSetsCount).map(([muscle, count]) => {
            const maxSets = Math.max(...Object.values(muscleSetsCount), 1);
            const pct = Math.round((count / maxSets) * 100);

            return (
              <div key={muscle} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{muscle}</span>
                  <span className="text-sky-400 font-mono">{count} sets</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-slate-100 text-base">
              Personal Records (PRs)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {personalRecords.length} records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => {
            const exMeta = exercises.find(e => e.id === pr.exerciseId);
            return (
              <div
                key={pr.id}
                className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-200">
                    {exMeta?.name || pr.exerciseId}
                  </h4>
                  <span className="text-xs text-slate-500 capitalize">
                    {pr.type === '1rm' ? 'Estimated 1RM' : pr.type === 'weight' ? 'Max Weight' : 'Max Reps'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400 font-mono">
                    {pr.value} {user.preferences.unit}
                  </span>
                  <Award className="w-3.5 h-3.5 text-amber-400 ml-auto mt-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
