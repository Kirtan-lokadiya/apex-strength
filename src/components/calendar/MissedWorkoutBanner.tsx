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
  const { skipWorkout, startWorkout } = useWorkoutStore();
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showAIProposalModal, setShowAIProposalModal] = useState<boolean>(false);

  const handleDoShortened = () => {
    const { shortenedWorkout } = createShortenedWorkout(missedWorkout);
    startWorkout(shortenedWorkout);
  };

  const handleSkip = () => {
    if (confirm(`Skip ${missedWorkout.programDayName} and continue with the weekly schedule?`)) {
      skipWorkout(missedWorkout.id, 'User chose to skip missed session.');
    }
  };

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-3xl p-5 shadow-xs space-y-3.5 animate-fade-in transition-colors">
      {/* Alert Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Missed Workout
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {missedWorkout.scheduledDate} • {missedWorkout.scheduledTime}
              </span>
            </div>
            <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base mt-0.5">
              {missedWorkout.programDayName}
            </h4>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
        This scheduled workout passed without being completed. What would you like to do?
      </p>

      {/* 4 Interactive Resolution Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Option 1: AI Reorganize Week */}
        <button
          onClick={() => setShowAIProposalModal(true)}
          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">AI Reorganize Week</span>
              <span className="text-[10px] text-zinc-500 block">Optimizes muscle recovery</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Option 2: Do Shortened Express Workout */}
        <button
          onClick={handleDoShortened}
          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Do 35-min Express</span>
              <span className="text-[10px] text-zinc-500 block">Main compounds only</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Option 3: Reschedule to specific day */}
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Reschedule Workout</span>
              <span className="text-[10px] text-zinc-500 block">Pick a new day or time</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Option 4: Skip Workout */}
        <button
          onClick={handleSkip}
          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <FastForward className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Skip & Continue</span>
              <span className="text-[10px] text-zinc-400 block">Proceed with normal split</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {showRescheduleModal && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setShowRescheduleModal(false)}
          workout={missedWorkout}
        />
      )}

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
