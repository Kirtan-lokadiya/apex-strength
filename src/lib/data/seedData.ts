import { 
  UserProfile, 
  ScheduledWorkout, 
  WorkoutSession, 
  PersonalRecord 
} from '../types';

export const DEMO_USER: UserProfile = {
  id: 'demo-lifter-1',
  email: 'lifter@apexstrength.app',
  displayName: 'Alex Mercer',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  updatedAt: Date.now(),
  onboardingCompleted: true,
  activeProgramId: 'push-pull-legs-classic',
  preferences: {
    unit: 'kg',
    weekStartsOn: 'monday',
    timeFormat: '12h',
    notificationsEnabled: true,
    defaultRestDurationSeconds: 120,
    availablePlateIncrementsKg: [25, 20, 15, 10, 5, 2.5, 1.25],
    availablePlateIncrementsLb: [45, 35, 25, 10, 5, 2.5],
    availableDumbbellIncrementsKg: [12, 14, 16, 18, 20, 22.5, 25, 27.5, 30, 32.5, 35],
    availableDumbbellIncrementsLb: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    aiRecommendationsEnabled: true,
    autoAdaptSchedule: false,
    autoDetectMissedWorkouts: true,
    barbellWeightKg: 20,
    barbellWeightLb: 45,
  },
};

export function generateSeedData(): {
  user: UserProfile;
  scheduledWorkouts: ScheduledWorkout[];
  completedSessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
} {
  const now = new Date();
  
  const getDateStr = (offsetDays: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(-1);
  const twoDaysAgoStr = getDateStr(-2);
  const fourDaysAgoStr = getDateStr(-4);
  const sixDaysAgoStr = getDateStr(-6);
  const tomorrowStr = getDateStr(1);
  const inThreeDaysStr = getDateStr(3);
  const inFiveDaysStr = getDateStr(5);

  const scheduledWorkouts: ScheduledWorkout[] = [
    // Past completed Push workout
    {
      id: 'sched-push-prev',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Push Workout',
      scheduledDate: sixDaysAgoStr,
      scheduledTime: '18:30',
      status: 'completed',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      estimatedDurationMinutes: 55,
      completedSessionId: 'sess-push-prev',
      plannedExercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          sets: 3,
          repMin: 8,
          repMax: 10,
          targetRir: 2,
          recommendedWeight: 60,
          unit: 'kg',
          previousPerformance: '60 kg × 9, 9, 8',
          progressionReason: 'Maintain weight and push for 10 reps.',
        },
        {
          exerciseId: 'incline-dumbbell-press',
          exerciseName: 'Incline Dumbbell Press',
          sets: 3,
          repMin: 8,
          repMax: 12,
          targetRir: 2,
          recommendedWeight: 22.5,
          unit: 'kg',
          previousPerformance: '22.5 kg × 10, 10, 9',
        },
        {
          exerciseId: 'cable-fly',
          exerciseName: 'Cable Fly',
          sets: 3,
          repMin: 10,
          repMax: 15,
          targetRir: 1,
          recommendedWeight: 20,
          unit: 'kg',
          previousPerformance: '20 kg × 12, 12, 12',
        },
        {
          exerciseId: 'triceps-pushdown',
          exerciseName: 'Triceps Cable Pushdown',
          sets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 2,
          recommendedWeight: 25,
          unit: 'kg',
          previousPerformance: '25 kg × 12, 12, 12',
        },
      ],
      history: [
        { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6, fromStatus: 'scheduled', toStatus: 'completed', reason: 'Finished session on time.' }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    },

    // Past completed Legs workout
    {
      id: 'sched-legs-prev',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Legs & Abs Workout',
      scheduledDate: fourDaysAgoStr,
      scheduledTime: '19:00',
      status: 'completed',
      muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
      estimatedDurationMinutes: 60,
      completedSessionId: 'sess-legs-prev',
      plannedExercises: [
        {
          exerciseId: 'barbell-back-squat',
          exerciseName: 'Barbell Back Squat',
          sets: 3,
          repMin: 6,
          repMax: 8,
          targetRir: 2,
          recommendedWeight: 80,
          unit: 'kg',
          previousPerformance: '80 kg × 8, 8, 8',
        },
        {
          exerciseId: 'romanian-deadlift',
          exerciseName: 'Romanian Deadlift (RDL)',
          sets: 3,
          repMin: 8,
          repMax: 10,
          targetRir: 2,
          recommendedWeight: 75,
          unit: 'kg',
        },
      ],
      history: [
        { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, toStatus: 'completed', reason: 'Workout logged.' }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },

    // A RESCHEDULED WORKOUT (Upper Body moved from 3 days ago to 2 days ago)
    {
      id: 'sched-upper-prev',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Upper Body Workout',
      scheduledDate: twoDaysAgoStr,
      scheduledTime: '18:00',
      status: 'completed',
      muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
      estimatedDurationMinutes: 50,
      completedSessionId: 'sess-upper-prev',
      rescheduledFromDate: getDateStr(-3),
      plannedExercises: [
        {
          exerciseId: 'overhead-press',
          exerciseName: 'Standing Overhead Press',
          sets: 3,
          repMin: 6,
          repMax: 8,
          targetRir: 2,
          recommendedWeight: 45,
          unit: 'kg',
        },
      ],
      history: [
        { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, fromStatus: 'scheduled', toStatus: 'rescheduled', reason: 'User requested reschedule due to late work shift.' },
        { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, fromStatus: 'rescheduled', toStatus: 'completed', reason: 'Completed rescheduled session.' }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },

    // ONE MISSED WORKOUT (Pull Day scheduled yesterday that was not completed!)
    {
      id: 'sched-pull-missed',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Pull Workout',
      scheduledDate: yesterdayStr,
      scheduledTime: '18:30',
      status: 'missed',
      muscleGroups: ['Back', 'Biceps'],
      estimatedDurationMinutes: 55,
      plannedExercises: [
        {
          exerciseId: 'barbell-deadlift',
          exerciseName: 'Conventional Deadlift',
          sets: 3,
          repMin: 5,
          repMax: 6,
          targetRir: 2,
          recommendedWeight: 105,
          unit: 'kg',
          previousPerformance: '100 kg × 6, 6, 6',
          progressionReason: 'Previous session achieved all 6 reps with 2 RIR. Weight increased +5 kg.',
        },
        {
          exerciseId: 'lat-pulldown',
          exerciseName: 'Lat Pulldown',
          sets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 1,
          recommendedWeight: 60,
          unit: 'kg',
        },
        {
          exerciseId: 'biceps-curl',
          exerciseName: 'Dumbbell Biceps Curl',
          sets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 1,
          recommendedWeight: 14,
          unit: 'kg',
        },
      ],
      history: [
        { timestamp: Date.now() - 1000 * 60 * 60 * 20, fromStatus: 'scheduled', toStatus: 'missed', reason: 'Scheduled time 18:30 passed without check-in.' }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      updatedAt: Date.now() - 1000 * 60 * 60 * 18,
    },

    // TODAY'S SCHEDULED WORKOUT: Push Day with clear progression & recommendations
    {
      id: 'sched-push-today',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Push Workout',
      scheduledDate: todayStr,
      scheduledTime: '18:30',
      status: 'scheduled',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      estimatedDurationMinutes: 50,
      plannedExercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          sets: 3,
          repMin: 8,
          repMax: 10,
          targetRir: 2,
          recommendedWeight: 62.5,
          unit: 'kg',
          previousPerformance: '60 kg × 10, 10, 10 (2 RIR)',
          progressionReason: 'Top of rep range (10 reps) completed on all sets! Increased +2.5 kg to 62.5 kg.',
        },
        {
          exerciseId: 'incline-dumbbell-press',
          exerciseName: 'Incline Dumbbell Press',
          sets: 3,
          repMin: 8,
          repMax: 12,
          targetRir: 2,
          recommendedWeight: 22.5,
          unit: 'kg',
          previousPerformance: '22.5 kg × 11, 10, 9',
          progressionReason: 'Maintain 22.5 kg and aim for 12 reps on first two sets.',
        },
        {
          exerciseId: 'cable-fly',
          exerciseName: 'Cable Fly',
          sets: 3,
          repMin: 10,
          repMax: 15,
          targetRir: 1,
          recommendedWeight: 20,
          unit: 'kg',
          previousPerformance: '20 kg × 13, 12, 12',
          progressionReason: 'Maintain 20 kg and target 14+ reps.',
        },
        {
          exerciseId: 'triceps-pushdown',
          exerciseName: 'Triceps Cable Pushdown',
          sets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 2,
          recommendedWeight: 25,
          unit: 'kg',
          previousPerformance: '25 kg × 12, 12, 11',
          progressionReason: 'Maintain 25 kg to lock in full 12 reps on all sets.',
        },
      ],
      history: [
        { timestamp: Date.now() - 1000 * 60 * 60 * 48, toStatus: 'scheduled', reason: 'Scheduled from PPL weekly cycle.' }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },

    // UPCOMING WORKOUT 1 (Tomorrow: Legs)
    {
      id: 'sched-legs-upcoming',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Legs & Abs Workout',
      scheduledDate: tomorrowStr,
      scheduledTime: '19:00',
      status: 'upcoming',
      muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Abs'],
      estimatedDurationMinutes: 60,
      plannedExercises: [
        {
          exerciseId: 'barbell-back-squat',
          exerciseName: 'Barbell Back Squat',
          sets: 3,
          repMin: 6,
          repMax: 8,
          targetRir: 2,
          recommendedWeight: 82.5,
          unit: 'kg',
          previousPerformance: '80 kg × 8, 8, 8',
          progressionReason: 'Hit 8 reps on all sets. Progressive overload increase to 82.5 kg.',
        },
        {
          exerciseId: 'leg-press',
          exerciseName: 'Leg Press',
          sets: 3,
          repMin: 10,
          repMax: 12,
          targetRir: 2,
          recommendedWeight: 125,
          unit: 'kg',
        },
      ],
      history: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },

    // UPCOMING WORKOUT 2 (in 3 days: Upper)
    {
      id: 'sched-upper-upcoming',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Upper Body Workout',
      scheduledDate: inThreeDaysStr,
      scheduledTime: '18:30',
      status: 'upcoming',
      muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
      estimatedDurationMinutes: 50,
      plannedExercises: [
        {
          exerciseId: 'overhead-press',
          exerciseName: 'Standing Overhead Press',
          sets: 3,
          repMin: 6,
          repMax: 8,
          targetRir: 2,
          recommendedWeight: 45,
          unit: 'kg',
        },
      ],
      history: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },

    // UPCOMING WORKOUT 3 (in 5 days: Pull)
    {
      id: 'sched-pull-upcoming',
      userId: DEMO_USER.id,
      programId: 'push-pull-legs-classic',
      programDayName: 'Pull Workout',
      scheduledDate: inFiveDaysStr,
      scheduledTime: '10:00',
      status: 'upcoming',
      muscleGroups: ['Back', 'Biceps'],
      estimatedDurationMinutes: 55,
      plannedExercises: [
        {
          exerciseId: 'barbell-deadlift',
          exerciseName: 'Conventional Deadlift',
          sets: 3,
          repMin: 5,
          repMax: 6,
          targetRir: 2,
          recommendedWeight: 105,
          unit: 'kg',
        },
      ],
      history: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },
  ];

  const completedSessions: WorkoutSession[] = [
    {
      id: 'sess-push-prev',
      userId: DEMO_USER.id,
      scheduledWorkoutId: 'sched-push-prev',
      name: 'Push Workout',
      startedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 54,
      durationSeconds: 54 * 60,
      totalVolume: 7420,
      unit: 'kg',
      readiness: {
        sleep: 'good',
        energy: 4,
        soreness: 2,
        stress: 2,
        timeAvailableMinutes: 60,
      },
      notes: 'Strong bench press session. Reached 10 reps on final set!',
      personalRecords: [
        { exerciseId: 'bench-press', exerciseName: 'Barbell Bench Press', type: 'reps', value: 10, previousValue: 9 },
      ],
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          restTimerSeconds: 180,
          sets: [
            { id: 'bp-1', setNumber: 1, setType: 'warmup', weight: 40, reps: 10, completed: true },
            { id: 'bp-2', setNumber: 2, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
            { id: 'bp-3', setNumber: 3, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
            { id: 'bp-4', setNumber: 4, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
          ],
        },
        {
          exerciseId: 'incline-dumbbell-press',
          exerciseName: 'Incline Dumbbell Press',
          restTimerSeconds: 120,
          sets: [
            { id: 'idp-1', setNumber: 1, setType: 'normal', weight: 22.5, reps: 11, rir: 2, completed: true },
            { id: 'idp-2', setNumber: 2, setType: 'normal', weight: 22.5, reps: 10, rir: 1, completed: true },
            { id: 'idp-3', setNumber: 3, setType: 'normal', weight: 22.5, reps: 9, rir: 1, completed: true },
          ],
        },
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    },
    {
      id: 'sess-legs-prev',
      userId: DEMO_USER.id,
      scheduledWorkoutId: 'sched-legs-prev',
      name: 'Legs & Abs Workout',
      startedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 58,
      durationSeconds: 58 * 60,
      totalVolume: 8900,
      unit: 'kg',
      exercises: [
        {
          exerciseId: 'barbell-back-squat',
          exerciseName: 'Barbell Back Squat',
          restTimerSeconds: 180,
          sets: [
            { id: 'sq-1', setNumber: 1, setType: 'normal', weight: 80, reps: 8, rir: 2, completed: true },
            { id: 'sq-2', setNumber: 2, setType: 'normal', weight: 80, reps: 8, rir: 2, completed: true },
            { id: 'sq-3', setNumber: 3, setType: 'normal', weight: 80, reps: 8, rir: 2, completed: true },
          ],
        },
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },
  ];

  const personalRecords: PersonalRecord[] = [
    {
      id: 'pr-bp-1rm',
      userId: DEMO_USER.id,
      exerciseId: 'bench-press',
      type: '1rm',
      value: 79,
      achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      sessionId: 'sess-push-prev',
    },
    {
      id: 'pr-bp-weight',
      userId: DEMO_USER.id,
      exerciseId: 'bench-press',
      type: 'weight',
      value: 70,
      reps: 4,
      achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
      sessionId: 'sess-push-old',
    },
    {
      id: 'pr-sq-1rm',
      userId: DEMO_USER.id,
      exerciseId: 'barbell-back-squat',
      type: '1rm',
      value: 103,
      achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      sessionId: 'sess-legs-prev',
    },
    {
      id: 'pr-dl-weight',
      userId: DEMO_USER.id,
      exerciseId: 'barbell-deadlift',
      type: 'weight',
      value: 120,
      reps: 3,
      achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
      sessionId: 'sess-pull-old',
    },
  ];

  return {
    user: DEMO_USER,
    scheduledWorkouts,
    completedSessions,
    personalRecords,
  };
}
