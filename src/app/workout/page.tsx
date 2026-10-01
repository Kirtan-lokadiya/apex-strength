'use client';

import React, { useState } from 'react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { ActiveWorkoutView } from '@/components/workout/ActiveWorkoutView';
import { Play, Plus, Dumbbell, Calendar, CheckCircle2, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPage() {
  const { 
    activeSession, 
    scheduledWorkouts, 
    startWorkout, 
    completedSessions,
    user 
  } = useWorkoutStore();

  const [lastFinishedSession, setLastFinishedSession] = useState<any | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkout = scheduledWorkouts.find(w => w.scheduledDate === todayStr && w.status !== 'completed');

  if (activeSession) {
    return (
      <ActiveWorkoutView
        onFinish={() => {
          // Open celebration summary
          if (completedSessions.length > 0) {
            setLastFinishedSession(completedSessions[0]);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Finished celebration modal */}
      {lastFinishedSession && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Workout Complete!</span>
              <h3 className="text-xl font-extrabold text-slate-100">{lastFinishedSession.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Duration</span>
              <span className="text-base font-extrabold text-slate-100 font-mono">
                {Math.floor(lastFinishedSession.durationSeconds / 60)} min
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Volume</span>
              <span className="text-base font-extrabold text-sky-400 font-mono">
                {lastFinishedSession.totalVolume} {user.preferences.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Exercises</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {lastFinishedSession.exercises.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => setLastFinishedSession(null)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Hero Start Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-black text-sky-400 uppercase tracking-wider font-mono">
            TRAINING ARENA
          </span>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Ready to Train?
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            Distraction-free gym mode with automatic rest timers, numeric keypad entries, plate calculator, and offline synchronization.
          </p>
        </div>

        <div className="pt-2 sm:pt-0">
          {todayWorkout ? (
            <button
              onClick={() => startWorkout(todayWorkout)}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Start {todayWorkout.programDayName}
            </button>
          ) : (
            <button
              onClick={() => startWorkout()}
              className="w-full sm:w-auto px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Start Freestyle Session
            </button>
          )}
        </div>
      </div>

      {/* Available Scheduled Sessions */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-100 text-base px-1">
          Select From Program Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scheduledWorkouts.slice(0, 4).map((sw) => (
            <div
              key={sw.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors gap-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono">{sw.scheduledDate}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {sw.muscleGroups.join(', ')}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-slate-100">
                  {sw.programDayName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sw.plannedExercises.length} planned exercises • ~{sw.estimatedDurationMinutes} mins
                </p>
              </div>

              <button
                onClick={() => startWorkout(sw)}
                className="w-full py-2 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
