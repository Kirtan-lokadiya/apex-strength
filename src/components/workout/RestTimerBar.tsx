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
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 bg-slate-900/95 border border-sky-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Rest Timer
            </span>
            <span className="text-xl font-black text-slate-100 font-mono tracking-tight">
              {timeFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addRestTimerSeconds(30)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
            title="Add 30 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            30s
          </button>

          <button
            onClick={() => isRestTimerActive ? pauseRestTimer() : startRestTimer(restTimerRemaining)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors active:scale-95"
            title={isRestTimerActive ? 'Pause' : 'Resume'}
          >
            {isRestTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={resetRestTimer}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors active:scale-95"
            title="Skip Rest"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
