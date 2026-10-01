'use client';

import React, { useState } from 'react';
import { Search, X, Check, Dumbbell } from 'lucide-react';
import { Exercise } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercises: (selected: Exercise[]) => void;
  alreadySelectedIds?: string[];
}

export function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercises,
  alreadySelectedIds = [],
}: ExercisePickerModalProps) {
  const { exercises } = useWorkoutStore();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const muscles = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Biceps', 'Triceps', 'Abs', 'Calves'];

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.primaryMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const toggleSelect = (exId: string) => {
    setSelectedMap(prev => ({
      ...prev,
      [exId]: !prev[exId],
    }));
  };

  const handleConfirm = () => {
    const chosen = exercises.filter(e => selectedMap[e.id]);
    onSelectExercises(chosen);
    onClose();
  };

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
              Select Exercises from Library
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Muscle Filters */}
        <div className="space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  selectedMuscle === m
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Exercise List with Photos */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((exercise) => {
            const isChecked = !!selectedMap[exercise.id];
            const isAlreadyIn = alreadySelectedIds.includes(exercise.id);
            const photo = exercise.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80';

            return (
              <div
                key={exercise.id}
                onClick={() => toggleSelect(exercise.id)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 shadow-xs'
                    : 'bg-zinc-50/60 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {exercise.name}
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {exercise.primaryMuscle} • {exercise.equipment}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                      : 'border-zinc-300 dark:border-zinc-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 disabled:opacity-40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Add {selectedCount > 0 ? `(${selectedCount})` : ''} Selected
          </button>
        </div>
      </div>
    </div>
  );
}
