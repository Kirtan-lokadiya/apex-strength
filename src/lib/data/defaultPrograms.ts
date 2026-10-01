import { WorkoutProgram } from '../types';

export const DEFAULT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'push-pull-legs-classic',
    userId: 'system',
    name: 'Push Pull Legs (PPL) Split',
    description: 'The premier hypertrophy and strength split balancing compound volume and targeted recovery across 3 to 6 days per week.',
    daysPerWeek: 4,
    durationWeeks: 8,
    isTemplate: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    days: [
      {
        dayIndex: 0, // Monday
        name: 'Push Workout',
        muscleFocus: ['Chest', 'Shoulders', 'Triceps'],
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: 3,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            startingWeight: 60,
          },
          {
            exerciseId: 'incline-dumbbell-press',
            sets: 3,
            repMin: 8,
            repMax: 12,
            targetRir: 2,
            startingWeight: 22.5,
          },
          {
            exerciseId: 'cable-fly',
            sets: 3,
            repMin: 10,
            repMax: 15,
            targetRir: 1,
            startingWeight: 20,
          },
          {
            exerciseId: 'lateral-raise',
            sets: 4,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            startingWeight: 10,
          },
          {
            exerciseId: 'triceps-pushdown',
            sets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 2,
            startingWeight: 25,
          },
        ],
      },
      {
        dayIndex: 1, // Tuesday
        name: 'Pull Workout',
        muscleFocus: ['Back', 'Biceps'],
        exercises: [
          {
            exerciseId: 'barbell-deadlift',
            sets: 3,
            repMin: 5,
            repMax: 6,
            targetRir: 2,
            startingWeight: 100,
          },
          {
            exerciseId: 'barbell-bent-over-row',
            sets: 3,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            startingWeight: 60,
          },
          {
            exerciseId: 'lat-pulldown',
            sets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 1,
            startingWeight: 55,
          },
          {
            exerciseId: 'face-pull',
            sets: 3,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            startingWeight: 20,
          },
          {
            exerciseId: 'biceps-curl',
            sets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 1,
            startingWeight: 12.5,
          },
        ],
      },
      {
        dayIndex: 3, // Thursday
        name: 'Legs & Abs Workout',
        muscleFocus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'],
        exercises: [
          {
            exerciseId: 'barbell-back-squat',
            sets: 3,
            repMin: 6,
            repMax: 8,
            targetRir: 2,
            startingWeight: 80,
          },
          {
            exerciseId: 'romanian-deadlift',
            sets: 3,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            startingWeight: 75,
          },
          {
            exerciseId: 'leg-press',
            sets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 2,
            startingWeight: 120,
          },
          {
            exerciseId: 'standing-calf-raise',
            sets: 4,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            startingWeight: 40,
          },
          {
            exerciseId: 'hanging-leg-raise',
            sets: 3,
            repMin: 10,
            repMax: 15,
            targetRir: 1,
            startingWeight: 0,
          },
        ],
      },
      {
        dayIndex: 4, // Friday
        name: 'Upper Body Workout',
        muscleFocus: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
        exercises: [
          {
            exerciseId: 'overhead-press',
            sets: 3,
            repMin: 6,
            repMax: 8,
            targetRir: 2,
            startingWeight: 45,
          },
          {
            exerciseId: 'pull-up',
            sets: 3,
            repMin: 6,
            repMax: 10,
            targetRir: 2,
            startingWeight: 0,
          },
          {
            exerciseId: 'bench-press',
            sets: 3,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            startingWeight: 60,
          },
          {
            exerciseId: 'lateral-raise',
            sets: 3,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            startingWeight: 10,
          },
          {
            exerciseId: 'skull-crusher',
            sets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 1,
            startingWeight: 25,
          },
        ],
      },
    ],
  },
  {
    id: 'full-body-strength',
    userId: 'system',
    name: 'Full Body Foundations (3 Days)',
    description: 'High-frequency compound split engineered for maximum total-body strength and efficient time in the gym.',
    daysPerWeek: 3,
    durationWeeks: 12,
    isTemplate: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    days: [
      {
        dayIndex: 0, // Monday
        name: 'Full Body Day A',
        muscleFocus: ['Quads', 'Chest', 'Back'],
        exercises: [
          { exerciseId: 'barbell-back-squat', sets: 3, repMin: 5, repMax: 5, targetRir: 2, startingWeight: 75 },
          { exerciseId: 'bench-press', sets: 3, repMin: 5, repMax: 5, targetRir: 2, startingWeight: 60 },
          { exerciseId: 'barbell-bent-over-row', sets: 3, repMin: 8, repMax: 8, targetRir: 2, startingWeight: 55 },
        ],
      },
      {
        dayIndex: 2, // Wednesday
        name: 'Full Body Day B',
        muscleFocus: ['Hamstrings', 'Shoulders', 'Back'],
        exercises: [
          { exerciseId: 'barbell-deadlift', sets: 3, repMin: 5, repMax: 5, targetRir: 2, startingWeight: 90 },
          { exerciseId: 'overhead-press', sets: 3, repMin: 5, repMax: 5, targetRir: 2, startingWeight: 40 },
          { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 10, targetRir: 2, startingWeight: 50 },
        ],
      },
      {
        dayIndex: 4, // Friday
        name: 'Full Body Day C',
        muscleFocus: ['Quads', 'Chest', 'Arms'],
        exercises: [
          { exerciseId: 'barbell-back-squat', sets: 3, repMin: 5, repMax: 5, targetRir: 2, startingWeight: 77.5 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, repMin: 8, repMax: 10, targetRir: 2, startingWeight: 22.5 },
          { exerciseId: 'biceps-curl', sets: 3, repMin: 10, repMax: 12, targetRir: 1, startingWeight: 12.5 },
        ],
      },
    ],
  },
];
