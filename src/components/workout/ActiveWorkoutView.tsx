'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  X, 
  Plus, 
  Layers, 
  Clock, 
  Flame, 
  Dumbbell,
  AlertCircle
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { SetRow } from './SetRow';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { RestTimerBar } from './RestTimerBar';
import { Exercise, WeightUnit } from '@/lib/types';

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
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);

  // Live workout duration clock
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
      onFinish();
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto animate-fade-in">
      {/* Active Workout Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-16 z-20 backdrop-blur-md shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-extrabold text-slate-100 text-lg sm:text-xl tracking-tight">
              {activeSession.name}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
            <span className="flex items-center gap-1 font-mono text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              {timeFormatted}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
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
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Discard Workout"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            Finish
          </button>
        </div>
      </div>

      {/* Exercises Cards */}
      <div className="space-y-4">
        {activeSession.exercises.map((exerciseSession) => {
          const exerciseMeta = exercises.find(e => e.id === exerciseSession.exerciseId);
          const isBarbell = exerciseMeta?.equipment === 'Barbell';

          return (
            <div
              key={exerciseSession.exerciseId}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                    {exerciseSession.exerciseName}
                    {exerciseMeta && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                        {exerciseMeta.primaryMuscle}
                      </span>
                    )}
                  </h3>
                </div>

                {isBarbell && (
                  <button
                    onClick={() => {
                      const firstWeight = exerciseSession.sets[0]?.weight || 60;
                      setPlateCalcWeight(firstWeight);
                    }}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Plates
                  </button>
                )}
              </div>

              {/* Set Table Header */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[10px] uppercase font-bold text-slate-500 px-2.5">
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
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => addSetToExercise(exerciseSession.exerciseId, 'normal')}
                  className="flex-1 py-2 bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Working Set
                </button>
                <button
                  type="button"
                  onClick={() => addSetToExercise(exerciseSession.exerciseId, 'warmup')}
                  className="px-3 py-2 bg-slate-800/40 hover:bg-slate-800 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
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
    </div>
  );
}
