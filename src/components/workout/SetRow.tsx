'use client';

import React from 'react';
import { Check, Trash2 } from 'lucide-react';
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
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'drop':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      case 'failure':
      case 'amrap':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const cycleSetType = () => {
    const types: SetType[] = ['normal', 'warmup', 'drop', 'amrap', 'failure'];
    const currentIdx = types.indexOf(set.setType);
    const nextType = types[(currentIdx + 1) % types.length];
    onUpdate({ setType: nextType });
  };

  return (
    <div
      className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center py-2 px-2.5 rounded-xl transition-all duration-150 border ${
        set.completed
          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Set Number & Type Pill */}
      <div className="col-span-2 flex items-center gap-1">
        <button
          type="button"
          onClick={cycleSetType}
          title="Tap to change set type (Normal, Warmup, Drop, AMRAP)"
          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border transition-all active:scale-95 ${getBadgeColor(
            set.setType
          )}`}
        >
          {set.setType === 'warmup' ? 'W' : set.setType === 'drop' ? 'D' : set.setType === 'amrap' ? 'A' : index + 1}
        </button>
      </div>

      {/* Previous Performance Reference */}
      <div className="col-span-3 text-[11px] text-slate-400 truncate font-mono">
        {set.previousPerformance || '—'}
      </div>

      {/* Weight Input */}
      <div className="col-span-2">
        <input
          type="number"
          step="0.5"
          value={set.weight || ''}
          placeholder="0"
          inputMode="decimal"
          onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
          className={`w-full text-center font-bold text-sm py-1.5 rounded-lg border focus:outline-none transition-colors ${
            set.completed
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-slate-950 border-slate-700/80 text-slate-100 focus:border-sky-500'
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
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-slate-950 border-slate-700/80 text-slate-100 focus:border-sky-500'
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
          className="w-full text-center text-xs py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:border-sky-500"
        />
      </div>

      {/* Completed Checkbox & Delete */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onToggleDone}
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all active:scale-90 ${
            set.completed
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${set.completed ? 'scale-110' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Delete Set"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
