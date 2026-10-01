'use client';

import React from 'react';
import { Timer, Plus, SkipForward, Play, Pause } from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

export function RestTimerBar() {
  const { 
    restTimerRemaining, 
    isRestTimerActive, 
    pauseRestTimer, 
    startRestTimer, 
    resetRestTimer, 
    addRestTimerSeconds 
  } = useWorkoutStore();

  if (restTimerRemaining <= 0) return null;

  const minutes = Math.floor(restTimerRemaining / 60);
  const seconds = restTimerRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 bg-white/95 dark:bg-zinc-900/95 border border-zinc-300 dark:border-zinc-700 rounded-3xl p-3.5 shadow-xl backdrop-blur-md animate-slide-up transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider block">
              Rest Timer
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {timeFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addRestTimerSeconds(30)}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors active:scale-95 border border-zinc-200 dark:border-zinc-700"
            title="Add 30 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            30s
          </button>

          <button
            onClick={() => isRestTimerActive ? pauseRestTimer() : startRestTimer(restTimerRemaining)}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition-colors active:scale-95 border border-zinc-200 dark:border-zinc-700"
            title={isRestTimerActive ? 'Pause' : 'Resume'}
          >
            {isRestTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={resetRestTimer}
            className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            title="Skip Rest"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
