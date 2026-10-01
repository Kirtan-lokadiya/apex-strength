'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Dumbbell, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ScheduledWorkout, PlannedExercise, MuscleGroup, Exercise } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { ExercisePickerModal } from './ExercisePickerModal';

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  existingWorkout?: ScheduledWorkout | null;
}

export function WorkoutBuilderModal({
  isOpen,
  onClose,
  initialDate,
  existingWorkout,
}: WorkoutBuilderModalProps) {
  const { 
    createScheduledWorkout, 
    updateScheduledWorkout, 
    deleteScheduledWorkout, 
    exercises: allExercises, 
    user 
  } = useWorkoutStore();

  const [sessionName, setSessionName] = useState(existingWorkout?.programDayName || 'Custom Workout');
  const [scheduledDate, setScheduledDate] = useState(
    existingWorkout?.scheduledDate || initialDate || new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState(existingWorkout?.scheduledTime || '18:30');
  const [estimatedDuration, setEstimatedDuration] = useState(existingWorkout?.estimatedDurationMinutes || 50);

  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>(
    existingWorkout?.plannedExercises || []
  );

  const [showPicker, setShowPicker] = useState(false);

  if (!isOpen) return null;

  const handleExercisesPicked = (selected: Exercise[]) => {
    const newItems: PlannedExercise[] = selected.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: 3,
      repMin: 8,
      repMax: 10,
      targetRir: 2,
      recommendedWeight: ex.equipment === 'Barbell' ? 60 : ex.equipment === 'Dumbbell' ? 20 : 30,
      unit: user.preferences.unit,
      progressionReason: 'Custom scheduled from Exercise Library.',
    }));

    setPlannedExercises(prev => [...prev, ...newItems]);
  };

  const removeExercise = (index: number) => {
    setPlannedExercises(prev => prev.filter((_, idx) => idx !== index));
  };

  const updatePlannedExercise = (index: number, updates: Partial<PlannedExercise>) => {
    setPlannedExercises(prev => prev.map((item, idx) => idx === index ? { ...item, ...updates } : item));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    // Deduce muscle groups from exercises
    const muscleSet = new Set<MuscleGroup>();
    plannedExercises.forEach(pe => {
      const meta = allExercises.find(e => e.id === pe.exerciseId);
      if (meta) {
        muscleSet.add(meta.primaryMuscle);
      }
    });

    const muscleGroups = Array.from(muscleSet);

    if (existingWorkout) {
      updateScheduledWorkout({
        ...existingWorkout,
        programDayName: sessionName.trim(),
        scheduledDate,
        scheduledTime,
        estimatedDurationMinutes: Number(estimatedDuration),
        plannedExercises,
        muscleGroups: muscleGroups.length > 0 ? muscleGroups : ['Chest'],
      });
    } else {
      createScheduledWorkout({
        programDayName: sessionName.trim(),
        scheduledDate,
        scheduledTime,
        estimatedDurationMinutes: Number(estimatedDuration),
        plannedExercises,
        muscleGroups: muscleGroups.length > 0 ? muscleGroups : ['Chest'],
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!existingWorkout) return;
    if (confirm(`Delete ${existingWorkout.programDayName} from your schedule?`)) {
      deleteScheduledWorkout(existingWorkout.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
              {existingWorkout ? 'Edit Scheduled Workout' : 'Schedule New Workout'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Workout Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Workout Title *
            </label>
            <input
              type="text"
              required
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Chest & Triceps, Leg Day Power..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>

          {/* Date, Time & Estimated Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Est. Duration (mins)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Planned Exercises Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Exercises in this Workout ({plannedExercises.length})
                </span>
                <span className="text-[11px] text-zinc-400">
                  Select movements from the library and configure targets
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Add from Library
              </button>
            </div>

            {plannedExercises.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-2">
                <Dumbbell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">
                  No exercises added yet. Tap &quot;Add from Library&quot; to pick your movements!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {plannedExercises.map((pe, idx) => {
                  const meta = allExercises.find(e => e.id === pe.exerciseId);
                  const photo = meta?.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt={pe.exerciseName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {pe.exerciseName}
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {meta?.primaryMuscle} • {meta?.equipment}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExercise(idx)}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                          title="Remove exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sets, Reps & Weight Configuration */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Sets</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={pe.sets}
                            onChange={(e) => updatePlannedExercise(idx, { sets: Number(e.target.value) || 1 })}
                            className="w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 font-bold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Min Reps</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={pe.repMin}
                            onChange={(e) => updatePlannedExercise(idx, { repMin: Number(e.target.value) || 1 })}
                            className="w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 font-bold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Max Reps</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={pe.repMax}
                            onChange={(e) => updatePlannedExercise(idx, { repMax: Number(e.target.value) || 1 })}
                            className="w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 font-bold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Target {user.preferences.unit}</label>
                          <input
                            type="number"
                            step="0.5"
                            value={pe.recommendedWeight}
                            onChange={(e) => updatePlannedExercise(idx, { recommendedWeight: parseFloat(e.target.value) || 0 })}
                            className="w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 font-bold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          {existingWorkout && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={plannedExercises.length === 0}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 disabled:opacity-40 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {existingWorkout ? 'Save Changes' : 'Schedule Workout'}
            </button>
          </div>
        </div>
      </form>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <ExercisePickerModal
          isOpen={true}
          onClose={() => setShowPicker(false)}
          onSelectExercises={handleExercisesPicked}
          alreadySelectedIds={plannedExercises.map(p => p.exerciseId)}
        />
      )}
    </div>
  );
}
