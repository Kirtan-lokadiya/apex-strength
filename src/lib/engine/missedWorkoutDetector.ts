import type { ScheduledWorkout, WorkoutStatus } from '../types/index.ts';

export interface MissedDetectionResult {
  hasMissed: boolean;
  missedWorkouts: ScheduledWorkout[];
  updatedList: ScheduledWorkout[];
}

/**
 * Checks scheduled workouts and marks overdue sessions as 'missed'.
 * Never silently deletes or replaces user's scheduled workouts.
 */
export function detectAndMarkMissedWorkouts(
  workouts: ScheduledWorkout[],
  currentDateStr?: string, // YYYY-MM-DD
  currentTimeStr?: string  // HH:MM
): MissedDetectionResult {
  const now = new Date();
  const today = currentDateStr || now.toISOString().split('T')[0];
  const currentTime = currentTimeStr || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nowTimestamp = Date.now();

  const missedWorkouts: ScheduledWorkout[] = [];
  const updatedList: ScheduledWorkout[] = workouts.map(workout => {
    // Only check workouts that are still scheduled or upcoming
    if (workout.status !== 'scheduled' && workout.status !== 'upcoming') {
      return workout;
    }

    const isPastDate = workout.scheduledDate < today;
    const isPastTimeToday = workout.scheduledDate === today && workout.scheduledTime && workout.scheduledTime < currentTime;

    if (isPastDate || isPastTimeToday) {
      const fromStatus = workout.status;
      const toStatus: WorkoutStatus = 'missed';
      const updatedWorkout: ScheduledWorkout = {
        ...workout,
        status: toStatus,
        updatedAt: nowTimestamp,
        history: [
          ...(workout.history || []),
          {
            timestamp: nowTimestamp,
            fromStatus,
            toStatus,
            reason: isPastDate
              ? `Scheduled date ${workout.scheduledDate} has passed.`
              : `Scheduled time ${workout.scheduledTime} on ${workout.scheduledDate} has passed without being completed.`,
          },
        ],
      };
      missedWorkouts.push(updatedWorkout);
      return updatedWorkout;
    }

    return workout;
  });

  return {
    hasMissed: missedWorkouts.length > 0,
    missedWorkouts,
    updatedList,
  };
}
