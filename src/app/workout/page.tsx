'use client';

import React, { useState } from 'react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { ActiveWorkoutView } from '@/components/workout/ActiveWorkoutView';
import { Play, Plus, Dumbbell, Trophy } from 'lucide-react';

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
        <div className="bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Workout Complete!</span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{lastFinishedSession.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
            <div>
              <span className="text-[11px] text-zinc-500 block">Duration</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {Math.floor(lastFinishedSession.durationSeconds / 60)} min
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Total Volume</span>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {lastFinishedSession.totalVolume} {user.preferences.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Exercises</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {lastFinishedSession.exercises.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => setLastFinishedSession(null)}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-sm transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Hero Start Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between transition-colors">
        <div className="space-y-1">
          <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
            TRAINING ARENA
          </span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Ready to Train?
          </h2>
          <p className="text-xs text-zinc-500 max-w-md">
            Distraction-free gym mode with automatic rest timers, numeric keypad entries, barbell plate calculator, and offline synchronization.
          </p>
        </div>

        <div className="pt-2 sm:pt-0">
          {todayWorkout ? (
            <button
              onClick={() => startWorkout(todayWorkout)}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Start {todayWorkout.programDayName}
            </button>
          ) : (
            <button
              onClick={() => startWorkout()}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Start Freestyle Session
            </button>
          )}
        </div>
      </div>

      {/* Available Scheduled Sessions */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base px-1">
          Select From Program Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scheduledWorkouts.slice(0, 4).map((sw) => (
            <div
              key={sw.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors gap-3.5 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span className="font-mono">{sw.scheduledDate}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                    {sw.muscleGroups.join(', ')}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  {sw.programDayName}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {sw.plannedExercises.length} planned exercises • ~{sw.estimatedDurationMinutes} mins
                </p>
              </div>

              <button
                onClick={() => startWorkout(sw)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
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
