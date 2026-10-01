'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { ScheduledWorkout } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: ScheduledWorkout;
}

export function RescheduleModal({ isOpen, onClose, workout }: RescheduleModalProps) {
  const { rescheduleWorkout } = useWorkoutStore();
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newTime, setNewTime] = useState<string>(workout.scheduledTime || '18:30');

  if (!isOpen) return null;

  const handleSave = () => {
    rescheduleWorkout(workout.id, newDate, newTime, `Moved to ${newDate} at ${newTime}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-base">Reschedule Workout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block font-medium">Session:</span>
          <span className="font-extrabold text-slate-100 text-sm">{workout.programDayName}</span>
          <span className="text-slate-500 block mt-0.5">Originally scheduled for {workout.scheduledDate}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">New Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Apply Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
