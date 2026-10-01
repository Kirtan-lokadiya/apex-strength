'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  FastForward, 
  Clock, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { ScheduledWorkout } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { createShortenedWorkout } from '@/lib/engine/adaptiveScheduler';
import { AdaptiveProposalModal } from './AdaptiveProposalModal';
import { RescheduleModal } from './RescheduleModal';

interface MissedWorkoutBannerProps {
  missedWorkout: ScheduledWorkout;
}

export function MissedWorkoutBanner({ missedWorkout }: MissedWorkoutBannerProps) {
  const { skipWorkout, startWorkout, createScheduledWorkout } = useWorkoutStore();
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showAIProposalModal, setShowAIProposalModal] = useState<boolean>(false);

  const handleDoShortened = () => {
    const { shortenedWorkout } = createShortenedWorkout(missedWorkout);
    // Start shortened session immediately
    startWorkout(shortenedWorkout);
  };

  const handleSkip = () => {
    if (confirm(`Skip ${missedWorkout.programDayName} and continue with the weekly schedule?`)) {
      skipWorkout(missedWorkout.id, 'User chose to skip missed session.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-600/40 rounded-2xl p-4 shadow-xl space-y-3 animate-fade-in">
      {/* Alert Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Missed Workout
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {missedWorkout.scheduledDate} • {missedWorkout.scheduledTime}
              </span>
            </div>
            <h4 className="font-extrabold text-slate-100 text-sm sm:text-base mt-0.5">
              {missedWorkout.programDayName}
            </h4>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        This scheduled workout passed without being completed. What would you like to do?
      </p>

      {/* 4 Interactive Resolution Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {/* Option 1: AI Reorganize Week */}
        <button
          onClick={() => setShowAIProposalModal(true)}
          className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 text-left transition-all group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-sky-300 block">AI Reorganize Week</span>
              <span className="text-[10px] text-slate-400 block">Optimizes muscle recovery</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-400" />
        </button>

        {/* Option 2: Do Shortened Express Workout */}
        <button
          onClick={handleDoShortened}
          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 text-left transition-all group"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-amber-300 block">Do 35-min Express</span>
              <span className="text-[10px] text-slate-400 block">Main compounds only</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>

        {/* Option 3: Reschedule to specific day */}
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-left transition-all"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-300 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">Reschedule Workout</span>
              <span className="text-[10px] text-slate-400 block">Pick a new day or time</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Option 4: Skip Workout */}
        <button
          onClick={handleSkip}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 text-left transition-all"
        >
          <div className="flex items-center gap-2">
            <FastForward className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Skip & Continue</span>
              <span className="text-[10px] text-slate-500 block">Proceed with normal split</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setShowRescheduleModal(false)}
          workout={missedWorkout}
        />
      )}

      {/* AI Proposal Modal */}
      {showAIProposalModal && (
        <AdaptiveProposalModal
          isOpen={true}
          onClose={() => setShowAIProposalModal(false)}
          missedWorkout={missedWorkout}
        />
      )}
    </div>
  );
}
