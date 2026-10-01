'use client';

import React from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { RecordedSet, SetType, WeightUnit } from '@/lib/types';

interface SetRowProps {
  set: RecordedSet;
  index: number;
  unit: WeightUnit;
  onUpdate: (updates: Partial<RecordedSet>) => void;
  onToggleDone: () => void;
  onDelete: () => void;
}

export function SetRow({
  set,
  index,
  unit,
  onUpdate,
  onToggleDone,
  onDelete,
}: SetRowProps) {
  const getBadgeColor = (type: SetType) => {
    switch (type) {
      case 'warmup':
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800/60';
      case 'drop':
        return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800/60';
      case 'failure':
      case 'amrap':
        return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800/60';
      default:
        return 'text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
    }
  };

  const cycleSetType = () => {
    const types: SetType[] = ['normal', 'warmup', 'drop', 'amrap', 'failure'];
    const currentIdx = types.indexOf(set.setType);
    const nextType = types[(currentIdx + 1) % types.length];
    onUpdate({ setType: nextType });
  };

  const stepWeight = (delta: number) => {
    const current = set.weight || 0;
    const next = Math.max(0, parseFloat((current + delta).toFixed(1)));
    onUpdate({ weight: next });
  };

  const stepReps = (delta: number) => {
    const current = set.reps || 0;
    const next = Math.max(0, current + delta);
    onUpdate({ reps: next });
  };

  // Derive ghost placeholder target from previous performance
  const ghostWeight = set.previousPerformance ? set.previousPerformance.split('×')[0]?.trim() : '';

  return (
    <div
      className={`rounded-2xl transition-all duration-150 border p-2.5 ${
        set.completed
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 text-zinc-900 dark:text-zinc-100'
          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
        {/* Set Number & Type Pill */}
        <div className="col-span-2 flex items-center gap-1">
          <button
            type="button"
            onClick={cycleSetType}
            title="Tap to change set type (Normal, Warmup, Drop, AMRAP, Failure)"
            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border transition-all active:scale-95 ${getBadgeColor(
              set.setType
            )}`}
          >
            {set.setType === 'warmup' ? 'W' : set.setType === 'drop' ? 'D' : set.setType === 'failure' ? 'F' : set.setType === 'amrap' ? 'A' : index + 1}
          </button>
        </div>

        {/* Previous Performance Reference */}
        <div className="col-span-3 text-[11px] text-zinc-500 font-mono truncate">
          {set.previousPerformance || '—'}
        </div>

        {/* Weight Input */}
        <div className="col-span-2">
          <input
            type="number"
            step="0.5"
            value={set.weight || ''}
            placeholder={ghostWeight || '0'}
            inputMode="decimal"
            onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
            className={`w-full text-center font-bold text-sm py-1.5 rounded-lg border focus:outline-none transition-colors ${
              set.completed
                ? 'bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100'
            }`}
          />
        </div>

        {/* Reps Input */}
        <div className="col-span-2">
          <input
            type="number"
            step="1"
            value={set.reps || ''}
            placeholder="0"
            inputMode="numeric"
            onChange={(e) => onUpdate({ reps: parseInt(e.target.value, 10) || 0 })}
            className={`w-full text-center font-bold text-sm py-1.5 rounded-lg border focus:outline-none transition-colors ${
              set.completed
                ? 'bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100'
            }`}
          />
        </div>

        {/* RIR Input */}
        <div className="col-span-1">
          <input
            type="number"
            step="1"
            min="0"
            max="5"
            value={set.rir !== undefined ? set.rir : 2}
            title="Reps in Reserve (RIR)"
            inputMode="numeric"
            onChange={(e) => onUpdate({ rir: parseInt(e.target.value, 10) || 0 })}
            className="w-full text-center text-xs py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-zinc-900 dark:focus:border-zinc-100"
          />
        </div>

        {/* Completed Checkbox & Delete */}
        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onToggleDone}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all active:scale-90 ${
              set.completed
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <Check className={`w-4 h-4 stroke-[3] ${set.completed ? 'scale-110' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Delete Set"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lyfta-Grade Quick-Stepper Bar (Thumb Ergonomics) */}
      {!set.completed && (
        <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-400 uppercase text-[9px] mr-0.5">Weight:</span>
            <button
              type="button"
              onClick={() => stepWeight(-2.5)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              -2.5
            </button>
            <button
              type="button"
              onClick={() => stepWeight(2.5)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              +2.5
            </button>
            <button
              type="button"
              onClick={() => stepWeight(5)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              +5
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-400 uppercase text-[9px] mr-0.5">Reps:</span>
            <button
              type="button"
              onClick={() => stepReps(-1)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => stepReps(1)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              +1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
