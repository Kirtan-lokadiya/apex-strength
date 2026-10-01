'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export default function HistoryPage() {
  const { completedSessions, deleteCompletedSession, user } = useWorkoutStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          Workout History
        </h2>
        <p className="text-xs text-zinc-500">
          Permanent log of every completed set, weight, and personal record
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 text-sm">
          No completed workouts logged yet. Start a session from the Today tab!
        </div>
      ) : (
        <div className="space-y-3">
          {completedSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const dateStr = new Intl.DateTimeFormat('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date(session.startedAt));

            const durationMinutes = Math.floor(session.durationSeconds / 60);

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs transition-colors"
              >
                {/* Session Card Header */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 sm:p-5 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                        {dateStr}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {durationMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-mono">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                        {session.totalVolume} {user.preferences.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete workout record "${session.name}" from ${dateStr}? This cannot be undone.`)) {
                          deleteCompletedSession(session.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete workout from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Set Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/40 animate-fade-in">
                    {session.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        &quot;{session.notes}&quot;
                      </p>
                    )}

                    {session.personalRecords && session.personalRecords.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-2xl flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          PR Achieved: {session.personalRecords.map(pr => `${pr.exerciseName} (${pr.value} ${user.preferences.unit})`).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Exercises Breakdown */}
                    <div className="space-y-3">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-200">
                            {ex.exerciseName}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div
                                key={sIdx}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-center text-xs font-mono shadow-2xs"
                              >
                                <span className="text-[10px] text-zinc-400 uppercase block font-sans">
                                  Set {set.setNumber} {set.setType !== 'normal' ? `(${set.setType})` : ''}
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {set.weight} {user.preferences.unit} × {set.reps}
                                </span>
                                {set.rir !== undefined && (
                                  <span className="text-[10px] text-zinc-500 block font-sans">
                                    @{set.rir} RIR
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
