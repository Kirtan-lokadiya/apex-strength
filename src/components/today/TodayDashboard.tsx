'use client';

import React, { useState } from 'react';
import { 
  Dumbbell, 
  Play, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Calendar as CalendarIcon,
  ChevronRight,
  BatteryCharging
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { MissedWorkoutBanner } from '@/components/calendar/MissedWorkoutBanner';
import Link from 'next/link';

export function TodayDashboard() {
  const { 
    scheduledWorkouts, 
    startWorkout, 
    user, 
    activeSession 
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

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* 1. OVERDUE / MISSED WORKOUTS BANNER (Crucial Section 4 & 6) */}
      {missedWorkouts.length > 0 && (
        <div className="space-y-3">
          {missedWorkouts.map(mw => (
            <MissedWorkoutBanner key={mw.id} missedWorkout={mw} />
          ))}
        </div>
      )}

      {/* 2. ACTIVE WORKOUT CALLOUT IF LIVE */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Session In Progress
              </span>
              <h3 className="font-extrabold text-slate-100 text-base">
                {activeSession.name}
              </h3>
            </div>
          </div>
          <Link
            href="/workout"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/30"
          >
            Resume Workout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. TODAY'S MAIN WORKOUT CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sky-400 tracking-wider uppercase font-mono">
                TODAY&apos;S WORKOUT
              </span>
              {todayWorkout?.status === 'completed' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Completed ✓
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
              {todayWorkout ? todayWorkout.programDayName : 'Rest & Recovery Day'}
            </h2>
          </div>

          <button
            onClick={() => setShowReadiness(!showReadiness)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/60 transition-colors"
          >
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Daily Check-in</span>
          </button>
        </div>

        {/* Readiness Dropdown Panel (Section 21) */}
        {showReadiness && (
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 animate-fade-in text-xs">
            <span className="font-bold text-slate-300 block">Pre-Workout Readiness</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-slate-500 block mb-1">Sleep</label>
                <select
                  value={readiness.sleep}
                  onChange={(e) => setReadiness({ ...readiness, sleep: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                >
                  <option value="poor">Poor</option>
                  <option value="average">Average</option>
                  <option value="good">Good</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Energy (1–5)</label>
                <select
                  value={readiness.energy}
                  onChange={(e) => setReadiness({ ...readiness, energy: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                >
                  {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Soreness (1–5)</label>
                <select
                  value={readiness.soreness}
                  onChange={(e) => setReadiness({ ...readiness, soreness: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                >
                  {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Time Available</label>
                <select
                  value={readiness.timeAvailable}
                  onChange={(e) => setReadiness({ ...readiness, timeAvailable: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Readiness is logged with your session to tailor volume and track recovery trends.
            </p>
          </div>
        )}

        {todayWorkout ? (
          <>
            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {todayWorkout.scheduledTime || '18:30'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                ~{todayWorkout.estimatedDurationMinutes} mins
              </span>
              <span className="bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50 text-slate-300">
                {todayWorkout.muscleGroups.join(', ')}
              </span>
            </div>

            {/* Planned Exercises List (Section 2) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">
                Planned Exercises & Next Recommendations
              </span>

              <div className="space-y-2">
                {todayWorkout.plannedExercises.map((pe, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-100">
                          {pe.exerciseName}
                        </h4>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {pe.sets} × {pe.repMin}{pe.repMin !== pe.repMax ? `–${pe.repMax}` : ''} reps
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-sky-400">
                          {pe.recommendedWeight} {pe.unit}
                        </span>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Target Load
                        </span>
                      </div>
                    </div>

                    {pe.previousPerformance && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <span className="text-slate-500">Previous:</span>
                        <span className="font-mono text-slate-300">{pe.previousPerformance}</span>
                      </div>
                    )}

                    {pe.progressionReason && (
                      <div className="text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-900/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{pe.progressionReason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Big Start Workout Button */}
            <button
              onClick={() => startWorkout(todayWorkout)}
              className="w-full py-4 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Workout Now
            </button>
          </>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              No workout scheduled for today. Rest and let your central nervous system and muscles rebuild.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/calendar"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                View Weekly Schedule
              </Link>
              <button
                onClick={() => startWorkout()}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Start Freestyle Workout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. UPCOMING SESSIONS */}
      {upcomingWorkouts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
              Upcoming This Week
            </span>
            <Link href="/calendar" className="text-xs text-sky-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {upcomingWorkouts.map((uw) => (
              <div
                key={uw.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase block">
                  {uw.scheduledDate} • {uw.scheduledTime || '18:30'}
                </span>
                <h5 className="font-extrabold text-slate-200 text-sm">
                  {uw.programDayName}
                </h5>
                <p className="text-xs text-slate-500">
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
