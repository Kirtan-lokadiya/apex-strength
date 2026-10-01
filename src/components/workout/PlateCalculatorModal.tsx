'use client';

import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { calculatePlates } from '@/lib/engine/plateCalculator';
import { WeightUnit } from '@/lib/types';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight: number;
  unit: WeightUnit;
}

export function PlateCalculatorModal({ isOpen, onClose, initialWeight, unit }: PlateCalculatorModalProps) {
  const [weight, setWeight] = useState<number>(initialWeight);

  if (!isOpen) return null;

  const result = calculatePlates(weight, unit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">Barbell Plate Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input weight */}
        <div>
          <label className="text-xs text-zinc-500 font-semibold block mb-1">Target Total Weight ({unit})</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeight(w => Math.max(unit === 'kg' ? 20 : 45, w - (unit === 'kg' ? 2.5 : 5)))}
              className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl active:scale-95 border border-zinc-200 dark:border-zinc-700"
            >
              -
            </button>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1 text-center text-2xl font-black bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
            <button
              onClick={() => setWeight(w => w + (unit === 'kg' ? 2.5 : 5))}
              className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl active:scale-95 border border-zinc-200 dark:border-zinc-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Bar info */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Olympic Barbell:</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.barWeight} {unit}</span>
        </div>

        {/* Each Side Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-bold px-1">
            <span>Plates Per Side:</span>
            <span className="text-zinc-900 dark:text-zinc-100">{result.weightPerSide} {unit} / side</span>
          </div>

          {result.platesPerSide.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-400">
              Empty bar ({result.barWeight} {unit})!
            </div>
          ) : (
            <div className="space-y-1.5">
              {result.platesPerSide.map((plate, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 rounded-2xl text-sm border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-xs">
                      {plate.count}×
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{plate.weight} {unit} plate</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    = {plate.count * plate.weight} {unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.remainder > 0 && (
            <div className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 p-2.5 rounded-xl">
              Remainder: {result.remainder} {unit} cannot be loaded with standard plate increments.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-sm transition-colors active:scale-98"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
