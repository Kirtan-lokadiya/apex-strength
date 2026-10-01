'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Calendar as CalendarIcon,
  ChevronRight,
  BatteryCharging,
  Layers,
  Trash2
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { MissedWorkoutBanner } from '@/components/calendar/MissedWorkoutBanner';
import { MuscleRecoveryWidget } from '@/components/analytics/MuscleRecoveryWidget';
import Link from 'next/link';

export function TodayDashboard() {
  const { 
    scheduledWorkouts, 
    startWorkout, 
    deleteScheduledWorkout,
    user, 
    activeSession,
    exercises 
  } = useWorkoutStore();

  const [showReadiness, setShowReadiness] = useState<boolean>(false);
  const [readiness, setReadiness] = useState({
    sleep: 'good' as 'poor' | 'average' | 'good',
    energy: 4,
    soreness: 2,
    stress: 2,
    timeAvailable: 60,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Find today's workout
  const todayWorkout = scheduledWorkouts.find(w => w.scheduledDate === todayStr);

  // Find any missed workouts
  const missedWorkouts = scheduledWorkouts.filter(w => w.status === 'missed');

  // Find upcoming workouts
  const upcomingWorkouts = scheduledWorkouts
    .filter(w => w.scheduledDate > todayStr && w.status !== 'cancelled' && w.status !== 'skipped')
    .slice(0, 3);

  // Cover image for today's session
  const workoutCoverImage = todayWorkout?.programDayName.toLowerCase().includes('push')
    ? 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'
    : todayWorkout?.programDayName.toLowerCase().includes('pull')
    ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    : todayWorkout?.programDayName.toLowerCase().includes('leg')
    ? 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* 1. OVERDUE / MISSED WORKOUTS BANNER */}
      {missedWorkouts.length > 0 && (
        <div className="space-y-3">
          {missedWorkouts.map(mw => (
            <MissedWorkoutBanner key={mw.id} missedWorkout={mw} />
          ))}
        </div>
      )}

      {/* 2. ACTIVE WORKOUT CALLOUT IF LIVE */}
      {activeSession && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-4 shadow-sm flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Session In Progress
              </span>
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
                {activeSession.name}
              </h3>
            </div>
          </div>
          <Link
            href="/workout"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm"
          >
            Resume Workout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. TODAY'S MAIN WORKOUT CARD WITH ACTUAL COVER PHOTO */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {todayWorkout && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workoutCoverImage}
              alt={todayWorkout.programDayName}
              className="w-full h-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black tracking-widest text-zinc-300 uppercase font-mono">
                  TODAY&apos;S SCHEDULE
                </span>
                {todayWorkout.status === 'completed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    Completed ✓
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {todayWorkout.programDayName}
              </h2>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 font-semibold text-zinc-800 dark:text-zinc-200">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {todayWorkout?.scheduledTime || '18:30'}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 font-semibold text-zinc-800 dark:text-zinc-200">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                ~{todayWorkout?.estimatedDurationMinutes || 50} mins
              </span>
              <span className="bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-semibold">
                {todayWorkout?.muscleGroups.join(', ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReadiness(!showReadiness)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Daily Check-in</span>
              </button>

              {todayWorkout && (
                <button
                  onClick={() => {
                    if (confirm(`Delete today's workout "${todayWorkout.programDayName}"?`)) {
                      deleteScheduledWorkout(todayWorkout.id);
                    }
                  }}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40 transition-colors"
                  title="Delete today's workout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Readiness Dropdown Panel */}
          {showReadiness && (
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl space-y-3 border border-zinc-200 dark:border-zinc-800 text-xs animate-fade-in">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Pre-Workout Readiness</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-zinc-500 block mb-1">Sleep</label>
                  <select
                    value={readiness.sleep}
                    onChange={(e) => setReadiness({ ...readiness, sleep: e.target.value as any })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="poor">Poor</option>
                    <option value="average">Average</option>
                    <option value="good">Good</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Energy (1–5)</label>
                  <select
                    value={readiness.energy}
                    onChange={(e) => setReadiness({ ...readiness, energy: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-zinc-800 dark:text-zinc-200"
                  >
                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Soreness (1–5)</label>
                  <select
                    value={readiness.soreness}
                    onChange={(e) => setReadiness({ ...readiness, soreness: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-zinc-800 dark:text-zinc-200"
                  >
                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Time Available</label>
                  <select
                    value={readiness.timeAvailable}
                    onChange={(e) => setReadiness({ ...readiness, timeAvailable: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1.5 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {todayWorkout ? (
            <>
              {/* Planned Exercises List WITH ACTUAL IMAGES */}
              <div className="space-y-3 pt-1">
                <span className="text-xs uppercase font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider block">
                  Planned Exercises & Recommendations
                </span>

                <div className="space-y-2.5">
                  {todayWorkout.plannedExercises.map((pe, idx) => {
                    const exerciseMeta = exercises.find(e => e.id === pe.exerciseId);
                    const photo = exerciseMeta?.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                      >
                        {/* Actual Exercise Thumbnail Photo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 relative border border-zinc-200 dark:border-zinc-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={pe.exerciseName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Exercise Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {pe.exerciseName}
                            </h4>
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono shrink-0">
                              {pe.recommendedWeight} {pe.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            <span>{pe.sets} sets × {pe.repMin}{pe.repMin !== pe.repMax ? `–${pe.repMax}` : ''} reps</span>
                            {pe.previousPerformance && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-zinc-600 dark:text-zinc-400 truncate">Prev: {pe.previousPerformance}</span>
                              </>
                            )}
                          </div>

                          {pe.progressionReason && (
                            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5 mt-1.5">
                              <Sparkles className="w-3 h-3 shrink-0" />
                              <span className="truncate">{pe.progressionReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* High-Contrast Professional Action Button */}
              <button
                onClick={() => startWorkout(todayWorkout)}
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-black rounded-2xl text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Workout Now
              </button>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                No workout scheduled for today. Rest and recover for tomorrow.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/calendar"
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors"
                >
                  View Weekly Schedule
                </Link>
                <button
                  onClick={() => startWorkout()}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition-colors"
                >
                  Start Freestyle Workout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BIOLOGICAL MUSCLE RECOVERY & READINESS */}
      <MuscleRecoveryWidget />

      {/* 5. UPCOMING SESSIONS WITH THUMBNAILS */}
      {upcomingWorkouts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              Upcoming This Week
            </span>
            <Link href="/calendar" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingWorkouts.map((uw) => (
              <div
                key={uw.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
              >
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
                  {uw.scheduledDate} • {uw.scheduledTime || '18:30'}
                </span>
                <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
                  {uw.programDayName}
                </h5>
                <p className="text-xs text-zinc-500">
                  {uw.muscleGroups.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
