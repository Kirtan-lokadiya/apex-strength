'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Calendar, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import { ScheduledWorkout, ScheduleChangeItem } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { generateAdaptiveWeekProposal } from '@/lib/engine/adaptiveScheduler';

interface AdaptiveProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  missedWorkout: ScheduledWorkout;
}

export function AdaptiveProposalModal({ isOpen, onClose, missedWorkout }: AdaptiveProposalModalProps) {
  const { scheduledWorkouts, applyScheduleChanges } = useWorkoutStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [proposal, setProposal] = useState<{
    summary: string;
    changes: ScheduleChangeItem[];
    warnings: string[];
    fromAI?: boolean;
  }>({
    summary: '',
    changes: [],
    warnings: [],
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    // Call server route with fallback to local adaptive scheduler
    const fetchProposal = async () => {
      try {
        const res = await fetch('/api/ai/reorganize-week', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            missedWorkout,
            currentWeekWorkouts: scheduledWorkouts,
            todayStr,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProposal({
              summary: json.data.summary,
              changes: json.data.changes,
              warnings: json.data.warnings || [],
              fromAI: json.fromAI,
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // Local fallback calculation
      const localProp = generateAdaptiveWeekProposal(missedWorkout, scheduledWorkouts, todayStr);
      setProposal({
        summary: localProp.summary,
        changes: localProp.changes,
        warnings: localProp.warnings,
        fromAI: false,
      });
      setLoading(false);
    };

    fetchProposal();
  }, [isOpen, missedWorkout, scheduledWorkouts, todayStr]);

  if (!isOpen) return null;

  const handleApply = () => {
    applyScheduleChanges(proposal.changes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                Adaptive Week Reorganization
              </h3>
              <p className="text-[11px] text-slate-400">
                {proposal.fromAI ? 'AI Adaptive Recovery Analysis' : 'Deterministic Recovery Algorithm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <p className="text-xs font-medium">Analyzing muscle fatigue & recovery intervals...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Box */}
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {proposal.summary}
              </p>
            </div>

            {/* Proposed Day Changes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
                Proposed Calendar Adjustments:
              </span>

              {proposal.changes.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center">
                  No adjustments required or no open days remaining this week. Consider doing a shortened 35-min workout.
                </div>
              ) : (
                <div className="space-y-2">
                  {proposal.changes.map((change, idx) => {
                    const workoutItem = scheduledWorkouts.find(w => w.id === change.workout_id);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-100">
                            {workoutItem?.programDayName || 'Workout'}
                          </span>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-rose-400 line-through">{change.old_date}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-emerald-400 font-bold">{change.new_date}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          {change.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Warnings if any */}
            {proposal.warnings.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-800/30 p-3 rounded-2xl text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {proposal.warnings.map((w, idx) => (
                    <p key={idx}>{w}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Keep Current Schedule
              </button>
              <button
                type="button"
                disabled={proposal.changes.length === 0}
                onClick={handleApply}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
