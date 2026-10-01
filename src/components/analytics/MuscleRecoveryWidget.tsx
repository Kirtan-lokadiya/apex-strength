'use client';

import React from 'react';
import { Activity, Zap, CheckCircle2, Clock } from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { MuscleGroup } from '@/lib/types';

interface MuscleRecoveryItem {
  muscle: MuscleGroup;
  percentage: number;
  hoursElapsed: number | null;
  status: 'recovered' | 'recovering' | 'fatigued';
  statusText: string;
}

const PRIMARY_MUSCLES: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings',
  'Biceps',
  'Triceps',
  'Abs',
];

export function MuscleRecoveryWidget() {
  const { completedSessions, exercises } = useWorkoutStore();

  const now = Date.now();

  const recoveryItems: MuscleRecoveryItem[] = PRIMARY_MUSCLES.map((muscle) => {
    // Find the latest completed session that trained this muscle
    let latestTime: number | null = null;

    for (const session of completedSessions) {
      const sessionTrainedMuscle = session.exercises.some((ex) => {
        const meta = exercises.find((e) => e.id === ex.exerciseId);
        return meta?.primaryMuscle === muscle || meta?.secondaryMuscles?.includes(muscle);
      });

      if (sessionTrainedMuscle) {
        const sessionTime = session.completedAt || session.startedAt;
        if (!latestTime || sessionTime > latestTime) {
          latestTime = sessionTime;
        }
      }
    }

    if (!latestTime) {
      return {
        muscle,
        percentage: 100,
        hoursElapsed: null,
        status: 'recovered',
        statusText: '100% Ready (Fresh)',
      };
    }

    const hoursElapsed = Math.max(0, (now - latestTime) / (1000 * 60 * 60));

    if (hoursElapsed >= 48) {
      return {
        muscle,
        percentage: 100,
        hoursElapsed,
        status: 'recovered',
        statusText: '100% Ready',
      };
    }

    if (hoursElapsed >= 24) {
      const progress = 50 + ((hoursElapsed - 24) / 24) * 45;
      const hoursRemaining = Math.max(1, Math.round(48 - hoursElapsed));
      return {
        muscle,
        percentage: Math.round(progress),
        hoursElapsed,
        status: 'recovering',
        statusText: `${hoursRemaining}h to full recovery`,
      };
    }

    const progress = Math.max(15, Math.round((hoursElapsed / 24) * 50));
    return {
      muscle,
      percentage: progress,
      hoursElapsed,
      status: 'fatigued',
      statusText: 'Active recovery (Trained today)',
    };
  });

  const fullyRecoveredCount = recoveryItems.filter((i) => i.status === 'recovered').length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
            Muscle Recovery & Readiness
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {fullyRecoveredCount}/{PRIMARY_MUSCLES.length} Primed
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        48-hour biological supercompensation recovery curves based on your completed sessions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {recoveryItems.map((item) => {
          const barColor =
            item.status === 'recovered'
              ? 'bg-emerald-500'
              : item.status === 'recovering'
              ? 'bg-amber-500'
              : 'bg-zinc-400 dark:bg-zinc-600';

          const textColor =
            item.status === 'recovered'
              ? 'text-emerald-700 dark:text-emerald-400'
              : item.status === 'recovering'
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-zinc-500';

          return (
            <div
              key={item.muscle}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{item.muscle}</span>
                <span className={`font-mono font-bold text-[11px] ${textColor}`}>
                  {item.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>{item.statusText}</span>
                {item.status === 'recovered' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-3 h-3 text-zinc-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
