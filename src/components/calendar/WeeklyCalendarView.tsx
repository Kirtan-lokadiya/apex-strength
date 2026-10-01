'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Sparkles, 
  MoreVertical,
  Play,
  RotateCw
} from 'lucide-react';
import { ScheduledWorkout, WorkoutStatus } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { RescheduleModal } from './RescheduleModal';
import { AdaptiveProposalModal } from './AdaptiveProposalModal';

export function WeeklyCalendarView() {
  const { 
    scheduledWorkouts, 
    startWorkout, 
    skipWorkout,
    createScheduledWorkout,
    user
  } = useWorkoutStore();

  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [selectedWorkoutForReschedule, setSelectedWorkoutForReschedule] = useState<ScheduledWorkout | null>(null);
  const [adaptiveProposalWorkout, setAdaptiveProposalWorkout] = useState<ScheduledWorkout | null>(null);

  // Compute 7 days for the current displayed week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  // Adjust based on user's preference (monday vs sunday start)
  const startDayOffset = user.preferences.weekStartsOn === 'monday' 
    ? (currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek)
    : -currentDayOfWeek;

  const weekStartDate = new Date(today);
  weekStartDate.setDate(today.getDate() + startDayOffset + currentWeekOffset * 7);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === today.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
    const dayMonth = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
    
    // Find workouts on this date
    const dayWorkouts = scheduledWorkouts.filter(w => w.scheduledDate === dateStr);

    return {
      date: d,
      dateStr,
      dayName,
      dayMonth,
      isToday,
      workouts: dayWorkouts,
    };
  });

  const getStatusBadge = (status: WorkoutStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> Completed
          </span>
        );
      case 'missed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 stroke-[2.5]" /> Missed
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-950/50 border border-sky-800/40 px-2 py-0.5 rounded-full animate-pulse">
            <Play className="w-3 h-3" /> Live
          </span>
        );
      case 'skipped':
        return (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
            Skipped
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sky-400" />
          <h2 className="font-extrabold text-slate-100 text-base sm:text-lg">
            {weekDays[0].dayMonth} – {weekDays[6].dayMonth}
          </h2>
          {currentWeekOffset !== 0 && (
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 hover:bg-slate-700 transition-colors"
            >
              Current Week
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 7 Days List */}
      <div className="space-y-3">
        {weekDays.map((day) => (
          <div
            key={day.dateStr}
            className={`rounded-2xl border transition-all duration-150 p-4 ${
              day.isToday
                ? 'bg-gradient-to-r from-sky-950/30 to-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider ${day.isToday ? 'text-sky-400' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {day.dayMonth}
                </span>
                {day.isToday && (
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-mono">
                    TODAY
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  createScheduledWorkout({
                    scheduledDate: day.dateStr,
                    programDayName: 'Custom Session',
                    scheduledTime: '18:00',
                  });
                }}
                className="text-xs text-slate-500 hover:text-sky-400 p-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Add workout to this day"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Day Content */}
            {day.workouts.length === 0 ? (
              <div className="py-4 text-center">
                <span className="text-xs font-semibold text-slate-600">Rest & Recovery Day</span>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {day.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-100">
                          {workout.programDayName}
                        </span>
                        {getStatusBadge(workout.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{workout.scheduledTime || '18:30'}</span>
                        <span>•</span>
                        <span>{workout.estimatedDurationMinutes} mins</span>
                        <span>•</span>
                        <span className="text-sky-400 font-medium">
                          {workout.muscleGroups.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Actions for this workout */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {workout.status === 'scheduled' && (
                        <button
                          onClick={() => startWorkout(workout)}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-sky-500/20"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start
                        </button>
                      )}

                      {workout.status === 'missed' && (
                        <button
                          onClick={() => setAdaptiveProposalWorkout(workout)}
                          className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedWorkoutForReschedule(workout)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Reschedule / Move"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {workout.status === 'scheduled' && (
                        <button
                          onClick={() => {
                            if (confirm(`Skip ${workout.programDayName}?`)) {
                              skipWorkout(workout.id);
                            }
                          }}
                          className="text-[11px] text-slate-500 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {selectedWorkoutForReschedule && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setSelectedWorkoutForReschedule(null)}
          workout={selectedWorkoutForReschedule}
        />
      )}

      {/* Adaptive Proposal Modal */}
      {adaptiveProposalWorkout && (
        <AdaptiveProposalModal
          isOpen={true}
          onClose={() => setAdaptiveProposalWorkout(null)}
          missedWorkout={adaptiveProposalWorkout}
        />
      )}
    </div>
  );
}
