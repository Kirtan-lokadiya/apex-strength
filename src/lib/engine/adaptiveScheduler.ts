import { ScheduledWorkout, MuscleGroup, ScheduleChangeItem } from '../types';

export interface ShortenedWorkoutOption {
  originalDurationMinutes: number;
  shortenedDurationMinutes: number;
  retainedExerciseCount: number;
  totalExerciseCount: number;
  shortenedWorkout: ScheduledWorkout;
}

export interface AdaptiveReorganizeProposal {
  summary: string;
  changes: ScheduleChangeItem[];
  warnings: string[];
  proposedWorkouts: ScheduledWorkout[];
}

// Check if two workouts have muscle group overlap that would cause fatigue interference
export function hasMuscleConflict(musclesA: MuscleGroup[], musclesB: MuscleGroup[]): boolean {
  return musclesA.some(m => musclesB.includes(m));
}

// Generate a shortened 35-minute express version of a workout
export function createShortenedWorkout(workout: ScheduledWorkout): ShortenedWorkoutOption {
  // Retain only the first 2-3 primary compound exercises
  const originalCount = workout.plannedExercises.length;
  const retainedExercises = workout.plannedExercises
    .slice(0, Math.min(3, Math.max(2, Math.floor(originalCount / 2))))
    .map(ex => ({
      ...ex,
      sets: Math.min(ex.sets, 3), // Cap at 3 sets max
    }));

  const shortened: ScheduledWorkout = {
    ...workout,
    estimatedDurationMinutes: 35,
    plannedExercises: retainedExercises,
    notes: `${workout.notes ? workout.notes + ' • ' : ''}Shortened 35-min express session to recover missed volume safely.`,
  };

  return {
    originalDurationMinutes: workout.estimatedDurationMinutes,
    shortenedDurationMinutes: 35,
    retainedExerciseCount: retainedExercises.length,
    totalExerciseCount: originalCount,
    shortenedWorkout: shortened,
  };
}

// Calculate adaptive reorganization across the week
export function generateAdaptiveWeekProposal(
  missedWorkout: ScheduledWorkout,
  currentWeekWorkouts: ScheduledWorkout[],
  todayStr: string
): AdaptiveReorganizeProposal {
  const changes: ScheduleChangeItem[] = [];
  const warnings: string[] = [];

  // Sort upcoming workouts chronologically
  const activeWorkouts = [...currentWeekWorkouts].sort((a, b) => 
    a.scheduledDate.localeCompare(b.scheduledDate)
  );

  // Find remaining days in the week from todayStr
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday ...
  
  // Strategy: Shift missed workout to today if today has no workout, or swap with upcoming rest day
  const workoutToday = activeWorkouts.find(w => w.scheduledDate === todayStr && w.status !== 'cancelled' && w.status !== 'skipped');
  
  const proposedWorkouts = activeWorkouts.map(w => ({ ...w }));
  const missedInProposed = proposedWorkouts.find(w => w.id === missedWorkout.id);

  if (!workoutToday) {
    // Today is free! Move missed workout directly to today
    if (missedInProposed) {
      const oldDate = missedInProposed.scheduledDate;
      missedInProposed.scheduledDate = todayStr;
      missedInProposed.status = 'scheduled';
      changes.push({
        workout_id: missedWorkout.id,
        old_date: oldDate,
        new_date: todayStr,
        reason: `Moved ${missedWorkout.programDayName} to today since no workout was scheduled for today.`,
      });
    }

    // Check if tomorrow has muscle conflict
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const workoutTomorrow = proposedWorkouts.find(w => w.scheduledDate === tomorrowStr);

    if (workoutTomorrow && hasMuscleConflict(missedWorkout.muscleGroups, workoutTomorrow.muscleGroups)) {
      // Shift tomorrow's workout by 1 day to allow 48h recovery
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

      const oldTomorrowDate = workoutTomorrow.scheduledDate;
      workoutTomorrow.scheduledDate = dayAfterTomorrowStr;
      changes.push({
        workout_id: workoutTomorrow.id,
        old_date: oldTomorrowDate,
        new_date: dayAfterTomorrowStr,
        reason: `Shifted ${workoutTomorrow.programDayName} by +1 day to prevent overlapping ${missedWorkout.muscleGroups.join('/')} fatigue and ensure adequate recovery.`,
      });
      warnings.push(`Shifted ${workoutTomorrow.programDayName} to prevent back-to-back muscle fatigue.`);
    }
  } else {
    // Today already has a workout scheduled!
    // Option: Swap or cascade
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Find next available rest day in the week
    let candidateDate = new Date(today);
    let targetSlotStr = '';
    for (let i = 1; i <= 6; i++) {
      candidateDate.setDate(candidateDate.getDate() + 1);
      const testStr = candidateDate.toISOString().split('T')[0];
      const hasSlot = proposedWorkouts.some(w => w.scheduledDate === testStr && w.status !== 'cancelled' && w.status !== 'skipped');
      if (!hasSlot) {
        targetSlotStr = testStr;
        break;
      }
    }

    if (targetSlotStr && missedInProposed) {
      const oldDate = missedInProposed.scheduledDate;
      missedInProposed.scheduledDate = targetSlotStr;
      missedInProposed.status = 'scheduled';
      changes.push({
        workout_id: missedWorkout.id,
        old_date: oldDate,
        new_date: targetSlotStr,
        reason: `Moved ${missedWorkout.programDayName} to next available training slot on ${targetSlotStr} without disrupting today's scheduled ${workoutToday.programDayName}.`,
      });
    } else {
      warnings.push('No open rest days available this week. Consider a 35-minute shortened session or skipping this session.');
    }
  }

  const summary = changes.length > 0
    ? `Reorganized ${changes.length} workout(s) to preserve training volume while maintaining minimum 48-hour recovery between identical muscle groups.`
    : 'No schedule changes could be automatically accommodated without exceeding consecutive training caps.';

  return {
    summary,
    changes,
    warnings,
    proposedWorkouts,
  };
}
