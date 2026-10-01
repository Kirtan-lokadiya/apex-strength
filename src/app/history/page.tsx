'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export default function HistoryPage() {
  const { completedSessions, user } = useWorkoutStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Workout History
        </h2>
        <p className="text-xs text-slate-400">
          Permanent log of every completed set, weight, and personal record
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
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
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Session Card Header */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {dateStr}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-100">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {durationMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                        {session.totalVolume} {user.preferences.unit}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Set Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40 animate-fade-in">
                    {session.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        &quot;{session.notes}&quot;
                      </p>
                    )}

                    {/* PRs achieved in this workout */}
                    {session.personalRecords && session.personalRecords.length > 0 && (
                      <div className="bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-xl flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-300">
                          PR Achieved: {session.personalRecords.map(pr => `${pr.exerciseName} (${pr.value} ${user.preferences.unit})`).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Exercises Breakdown */}
                    <div className="space-y-3">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="font-bold text-xs text-slate-200">
                            {ex.exerciseName}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {ex.sets.map((set, sIdx) => (
                              <div
                                key={sIdx}
                                className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-center text-xs font-mono"
                              >
                                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                                  Set {set.setNumber} {set.setType !== 'normal' ? `(${set.setType})` : ''}
                                </span>
                                <span className="font-bold text-slate-100">
                                  {set.weight} {user.preferences.unit} × {set.reps}
                                </span>
                                {set.rir !== undefined && (
                                  <span className="text-[10px] text-sky-400 block font-sans">
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
