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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-base">Barbell Plate Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input weight */}
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">Target Total Weight ({unit})</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeight(w => Math.max(unit === 'kg' ? 20 : 45, w - (unit === 'kg' ? 2.5 : 5)))}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl active:scale-95"
            >
              -
            </button>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1 text-center text-2xl font-black bg-slate-950 border border-slate-700 rounded-xl py-2 text-sky-400 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => setWeight(w => w + (unit === 'kg' ? 2.5 : 5))}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Bar info */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex justify-between text-slate-400">
          <span>Olympic Barbell:</span>
          <span className="font-semibold text-slate-200">{result.barWeight} {unit}</span>
        </div>

        {/* Each Side Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Plates Per Side:</span>
            <span className="text-sky-400">{result.weightPerSide} {unit} / side</span>
          </div>

          {result.platesPerSide.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              Just the empty bar ({result.barWeight} {unit})!
            </div>
          ) : (
            <div className="space-y-1.5">
              {result.platesPerSide.map((plate, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-xl text-sm border border-slate-700/50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center font-black text-xs">
                      {plate.count}×
                    </span>
                    <span className="font-bold text-slate-200">{plate.weight} {unit} plate</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    = {plate.count * plate.weight} {unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.remainder > 0 && (
            <div className="text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/40 p-2 rounded-lg">
              Remainder: {result.remainder} {unit} cannot be loaded with standard plate increments.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-colors active:scale-98"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
