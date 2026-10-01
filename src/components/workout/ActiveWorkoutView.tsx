'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  X, 
  Plus, 
  Layers, 
  Clock, 
  Dumbbell 
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { WorkoutSession } from '@/lib/types';
import { SetRow } from './SetRow';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { RestTimerBar } from './RestTimerBar';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';

interface ActiveWorkoutViewProps {
  onFinish: () => void;
}

export function ActiveWorkoutView({ onFinish }: ActiveWorkoutViewProps) {
  const {
    activeSession,
    updateActiveSet,
    addSetToExercise,
    removeSetFromExercise,
    toggleSetDone,
    cancelActiveWorkout,
    finishActiveWorkout,
    exercises,
    user,
  } = useWorkoutStore();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [plateCalcWeight, setPlateCalcWeight] = useState<number | null>(null);
  const [celebrationSession, setCelebrationSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - activeSession.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const durationMinutes = Math.floor(elapsedSeconds / 60);
  const durationRemainderSeconds = elapsedSeconds % 60;
  const timeFormatted = `${durationMinutes}:${String(durationRemainderSeconds).padStart(2, '0')}`;

  const totalSets = activeSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 
    0
  );

  const handleFinish = () => {
    const finished = finishActiveWorkout();
    if (finished) {
      setCelebrationSession(finished);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto animate-fade-in">
      {/* Active Workout Header */}
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sticky top-16 z-20 backdrop-blur-md shadow-sm flex items-center justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg sm:text-xl tracking-tight">
              {activeSession.name}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium mt-1">
            <span className="flex items-center gap-1 font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {timeFormatted}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-400" />
              {completedSets}/{totalSets} sets done
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Discard this active workout session? Changes will not be saved to history.')) {
                cancelActiveWorkout();
              }
            }}
            className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Discard Workout"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            Finish
          </button>
        </div>
      </div>

      {/* Exercises Cards WITH PHOTOGRAPH THUMBNAILS */}
      <div className="space-y-4">
        {activeSession.exercises.map((exerciseSession) => {
          const exerciseMeta = exercises.find(e => e.id === exerciseSession.exerciseId);
          const isBarbell = exerciseMeta?.equipment === 'Barbell';
          const photo = exerciseMeta?.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={exerciseSession.exerciseId}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 transition-colors"
            >
              {/* Exercise Header with Actual Photo Thumbnail */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={exerciseSession.exerciseName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
                      {exerciseSession.exerciseName}
                    </h3>
                    {exerciseMeta && (
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {exerciseMeta.primaryMuscle} • {exerciseMeta.equipment}
                      </span>
                    )}
                  </div>
                </div>

                {isBarbell && (
                  <button
                    onClick={() => {
                      const firstWeight = exerciseSession.sets[0]?.weight || 60;
                      setPlateCalcWeight(firstWeight);
                    }}
                    className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl font-bold transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    Plates
                  </button>
                )}
              </div>

              {/* Set Table Header */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[10px] uppercase font-bold text-zinc-400 px-2.5">
                <span className="col-span-2">Set</span>
                <span className="col-span-3">Prev</span>
                <span className="col-span-2 text-center">{user.preferences.unit}</span>
                <span className="col-span-2 text-center">Reps</span>
                <span className="col-span-1 text-center">RIR</span>
                <span className="col-span-2 text-right">Done</span>
              </div>

              {/* Set Rows */}
              <div className="space-y-1.5">
                {exerciseSession.sets.map((set, setIdx) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    index={setIdx}
                    unit={user.preferences.unit}
                    onUpdate={(updates) => updateActiveSet(exerciseSession.exerciseId, setIdx, updates)}
                    onToggleDone={() => toggleSetDone(exerciseSession.exerciseId, setIdx)}
                    onDelete={() => removeSetFromExercise(exerciseSession.exerciseId, setIdx)}
                  />
                ))}
              </div>

              {/* Exercise Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => addSetToExercise(exerciseSession.exerciseId, 'normal')}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Working Set
                </button>
                <button
                  type="button"
                  onClick={() => addSetToExercise(exerciseSession.exerciseId, 'warmup')}
                  className="px-3.5 py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
                >
                  + Warmup
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Rest Timer */}
      <RestTimerBar />

      {/* Barbell Plate Calculator Modal */}
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          isOpen={true}
          onClose={() => setPlateCalcWeight(null)}
          initialWeight={plateCalcWeight}
          unit={user.preferences.unit}
        />
      )}

      {/* Post-Workout Celebration Modal */}
      {celebrationSession && (
        <WorkoutSummaryModal
          session={celebrationSession}
          onClose={() => {
            setCelebrationSession(null);
            onFinish();
          }}
        />
      )}
    </div>
  );
}
