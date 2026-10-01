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
  Play, 
  RotateCw,
  Edit3,
  Trash2
} from 'lucide-react';
import { ScheduledWorkout, WorkoutStatus } from '@/lib/types';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { RescheduleModal } from './RescheduleModal';
import { AdaptiveProposalModal } from './AdaptiveProposalModal';
import { WorkoutBuilderModal } from './WorkoutBuilderModal';

export function WeeklyCalendarView() {
  const { 
    scheduledWorkouts, 
    startWorkout, 
    skipWorkout,
    createScheduledWorkout,
    deleteScheduledWorkout,
    user
  } = useWorkoutStore();

  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [selectedWorkoutForReschedule, setSelectedWorkoutForReschedule] = useState<ScheduledWorkout | null>(null);
  const [adaptiveProposalWorkout, setAdaptiveProposalWorkout] = useState<ScheduledWorkout | null>(null);
  const [builderModalOpen, setBuilderModalOpen] = useState<boolean>(false);
  const [builderInitialDate, setBuilderInitialDate] = useState<string | undefined>(undefined);
  const [selectedWorkoutForBuilder, setSelectedWorkoutForBuilder] = useState<ScheduledWorkout | null>(null);

  const today = new Date();
  const currentDayOfWeek = today.getDay();
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
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> Completed
          </span>
        );
      case 'missed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 stroke-[2.5]" /> Missed
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full animate-pulse">
            <Play className="w-3 h-3" /> Live
          </span>
        );
      case 'skipped':
        return (
          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
            Skipped
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h2 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
            {weekDays[0].dayMonth} – {weekDays[6].dayMonth}
          </h2>
          {currentWeekOffset !== 0 && (
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Current Week
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
            className={`rounded-3xl border transition-all duration-150 p-4 ${
              day.isToday
                ? 'bg-zinc-50/90 dark:bg-zinc-900/90 border-zinc-900 dark:border-zinc-100 shadow-sm'
                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider ${day.isToday ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {day.dayMonth}
                </span>
                {day.isToday && (
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono">
                    TODAY
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setBuilderInitialDate(day.dateStr);
                  setSelectedWorkoutForBuilder(null);
                  setBuilderModalOpen(true);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                title="Add workout to this day"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Day Content */}
            {day.workouts.length === 0 ? (
              <div className="py-4 text-center">
                <span className="text-xs font-semibold text-zinc-400">Rest & Recovery Day</span>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {day.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {workout.programDayName}
                        </span>
                        {getStatusBadge(workout.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                        <span>{workout.scheduledTime || '18:30'}</span>
                        <span>•</span>
                        <span>{workout.estimatedDurationMinutes} mins</span>
                        <span>•</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                          {workout.muscleGroups.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Actions for this workout */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {workout.status === 'scheduled' && (
                        <button
                          onClick={() => startWorkout(workout)}
                          className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start
                        </button>
                      )}

                      {workout.status === 'missed' && (
                        <button
                          onClick={() => setAdaptiveProposalWorkout(workout)}
                          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedWorkoutForBuilder(workout);
                          setBuilderModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Workout / Exercises"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedWorkoutForReschedule(workout)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Reschedule / Move"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${workout.programDayName}" from your schedule?`)) {
                            deleteScheduledWorkout(workout.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete workout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {workout.status === 'scheduled' && (
                        <button
                          onClick={() => {
                            if (confirm(`Skip ${workout.programDayName}?`)) {
                              skipWorkout(workout.id);
                            }
                          }}
                          className="text-[11px] text-zinc-400 hover:text-rose-500 px-2 py-1 rounded-lg transition-colors"
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

      {selectedWorkoutForReschedule && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setSelectedWorkoutForReschedule(null)}
          workout={selectedWorkoutForReschedule}
        />
      )}

      {adaptiveProposalWorkout && (
        <AdaptiveProposalModal
          isOpen={true}
          onClose={() => setAdaptiveProposalWorkout(null)}
          missedWorkout={adaptiveProposalWorkout}
        />
      )}

      {builderModalOpen && (
        <WorkoutBuilderModal
          isOpen={true}
          onClose={() => setBuilderModalOpen(false)}
          initialDate={builderInitialDate}
          existingWorkout={selectedWorkoutForBuilder}
        />
      )}
    </div>
  );
}
