'use client';

import React from 'react';
import { Trophy, CheckCircle2, TrendingUp, Clock, Dumbbell, Award, Share2 } from 'lucide-react';
import { WorkoutSession } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

interface WorkoutSummaryModalProps {
  session: WorkoutSession;
  onClose: () => void;
}

export function WorkoutSummaryModal({ session, onClose }: WorkoutSummaryModalProps) {
  const { completedSessions, user } = useWorkoutStore();

  const durationMinutes = Math.max(1, Math.floor(session.durationSeconds / 60));

  // Find previous session of the same workout to calculate volume delta
  const previousSession = completedSessions.find(
    (s) => s.id !== session.id && (s.name === session.name || s.name.includes(session.name) || session.name.includes(s.name))
  );

  let volumeDelta = 0;
  let volumePercentChange = 0;
  if (previousSession && previousSession.totalVolume > 0) {
    volumeDelta = session.totalVolume - previousSession.totalVolume;
    volumePercentChange = Math.round((volumeDelta / previousSession.totalVolume) * 100);
  }

  const completedSetsCount = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Workout Complete! 🔥
          </h2>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            {session.name} • {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(session.startedAt))}
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Volume</span>
            </div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {session.totalVolume.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">{user.preferences.unit}</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Duration</span>
            </div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {durationMinutes}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">minutes</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Sets Done</span>
            </div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {completedSetsCount}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">working sets</span>
          </div>
        </div>

        {/* Volume Delta Comparison Card */}
        {previousSession && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              volumeDelta >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {volumeDelta >= 0 ? (
                  <>
                    <strong className="font-extrabold">+{volumeDelta} {user.preferences.unit} ({volumePercentChange > 0 ? `+${volumePercentChange}%` : '0%'})</strong> volume overload vs last session!
                  </>
                ) : (
                  <>
                    <strong className="font-extrabold">{volumeDelta} {user.preferences.unit} ({volumePercentChange}%)</strong> lighter volume (recovery session).
                  </>
                )}
              </span>
            </div>
            <span className="text-[10px] font-mono opacity-70">
              Prev: {previousSession.totalVolume} {user.preferences.unit}
            </span>
          </div>
        )}

        {/* Personal Records Showcase */}
        {session.personalRecords && session.personalRecords.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm uppercase tracking-wider">
                New Personal Records Achieved!
              </h4>
            </div>

            <div className="space-y-1.5 pt-1">
              {session.personalRecords.map((pr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-200/80 dark:border-amber-800/40 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{pr.exerciseName}</span>
                  </div>
                  <span className="font-mono font-black text-amber-800 dark:text-amber-300">
                    {pr.value} {user.preferences.unit} ({pr.type.toUpperCase()})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercises Summary List */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider block">
            Movement Breakdown ({session.exercises.length})
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {session.exercises.map((ex, idx) => {
              const doneSets = ex.sets.filter((s) => s.completed);
              const topWeight = Math.max(0, ...doneSets.map((s) => s.weight));
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <span className="font-bold text-zinc-900 dark:text-zinc-200 truncate">{ex.exerciseName}</span>
                  <span className="font-mono text-zinc-500 shrink-0">
                    {doneSets.length} sets • Top: {topWeight} {user.preferences.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-black rounded-2xl text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          Save & Return to Dashboard
        </button>
      </div>
    </div>
  );
}
