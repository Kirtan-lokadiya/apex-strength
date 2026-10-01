import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1RM formulas
import { calculateBrzycki, calculateEpley, estimateOneRepMax } from '../src/lib/engine/oneRepMax.ts';

test('1RM Calculations', async (t) => {
  await t.test('Brzycki formula calculation', () => {
    assert.equal(calculateBrzycki(100, 1), 100);
    const val = calculateBrzycki(100, 10);
    assert.equal(val, 133.3);
  });

  await t.test('Epley formula calculation', () => {
    assert.equal(calculateEpley(100, 1), 100);
    const val = calculateEpley(100, 10);
    assert.equal(val, 133.3);
  });

  await t.test('Estimate One Rep Max composite', () => {
    const val = estimateOneRepMax(100, 10);
    assert.equal(val, 133.3);
  });
});

// Test Plate Calculator
import { calculatePlates } from '../src/lib/engine/plateCalculator.ts';

test('Plate Calculator', async (t) => {
  await t.test('Standard Barbell 62.5 kg breakdown', () => {
    const res = calculatePlates(62.5, 'kg', 20);
    assert.equal(res.targetWeight, 62.5);
    assert.equal(res.barWeight, 20);
    assert.equal(res.weightPerSide, 21.25);
    // 21.25kg per side = 1x 20kg plate + 1x 1.25kg plate
    assert.deepEqual(res.platesPerSide, [
      { weight: 20, count: 1 },
      { weight: 1.25, count: 1 }
    ]);
    assert.equal(res.remainder, 0);
    assert.equal(res.exactMatch, true);
  });

  await t.test('Target equal to bar weight', () => {
    const res = calculatePlates(20, 'kg', 20);
    assert.equal(res.platesPerSide.length, 0);
    assert.equal(res.exactMatch, true);
  });
});

// Test Progression Engine
import { calculateDeterministicRecommendation } from '../src/lib/engine/progression.ts';

test('Progression Engine', async (t) => {
  await t.test('Top of rep range reached with high RIR -> Increase weight', () => {
    const rec = calculateDeterministicRecommendation({
      exerciseId: 'bench-press',
      exerciseName: 'Barbell Bench Press',
      equipment: 'Barbell',
      unit: 'kg',
      targetSets: 3,
      repMin: 8,
      repMax: 10,
      targetRir: 2,
      currentWeight: 60,
      recentSessions: [
        {
          date: '2026-09-20',
          sets: [
            { id: '1', setNumber: 1, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
            { id: '2', setNumber: 2, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
            { id: '3', setNumber: 3, setType: 'normal', weight: 60, reps: 10, rir: 2, completed: true },
          ],
        },
      ],
    });

    assert.equal(rec.action, 'increase');
    assert.equal(rec.recommendedWeight, 62.5); // +2.5kg for barbell
    assert.equal(rec.confidence, 'high');
  });

  await t.test('In-progress double progression -> Maintain weight', () => {
    const rec = calculateDeterministicRecommendation({
      exerciseId: 'bench-press',
      exerciseName: 'Barbell Bench Press',
      equipment: 'Barbell',
      unit: 'kg',
      targetSets: 3,
      repMin: 8,
      repMax: 10,
      targetRir: 2,
      currentWeight: 60,
      recentSessions: [
        {
          date: '2026-09-20',
          sets: [
            { id: '1', setNumber: 1, setType: 'normal', weight: 60, reps: 9, rir: 2, completed: true },
            { id: '2', setNumber: 2, setType: 'normal', weight: 60, reps: 9, rir: 2, completed: true },
            { id: '3', setNumber: 3, setType: 'normal', weight: 60, reps: 8, rir: 2, completed: true },
          ],
        },
      ],
    });

    assert.equal(rec.action, 'maintain');
    assert.equal(rec.recommendedWeight, 60);
  });

  await t.test('Repeated multi-session failure -> Deload weight by 10%', () => {
    const rec = calculateDeterministicRecommendation({
      exerciseId: 'bench-press',
      exerciseName: 'Barbell Bench Press',
      equipment: 'Barbell',
      unit: 'kg',
      targetSets: 3,
      repMin: 8,
      repMax: 10,
      targetRir: 2,
      currentWeight: 80,
      recentSessions: [
        {
          date: '2026-09-20',
          sets: [
            { id: '1', setNumber: 1, setType: 'normal', weight: 80, reps: 6, rir: 0, completed: true },
            { id: '2', setNumber: 2, setType: 'normal', weight: 80, reps: 5, rir: 0, completed: true },
          ],
        },
        {
          date: '2026-09-15',
          sets: [
            { id: '3', setNumber: 1, setType: 'normal', weight: 80, reps: 7, rir: 0, completed: true },
            { id: '4', setNumber: 2, setType: 'normal', weight: 80, reps: 5, rir: 0, completed: true },
          ],
        },
      ],
    });

    assert.equal(rec.action, 'decrease');
    assert.equal(rec.recommendedWeight, 72.5); // 80 * 0.9 = 72, rounded to 72.5kg
  });
});

// Test Missed Workout Detector
import { detectAndMarkMissedWorkouts } from '../src/lib/engine/missedWorkoutDetector.ts';

test('Missed Workout Detector', async (t) => {
  await t.test('Flags past uncompleted workouts as missed with audit event', () => {
    const workouts = [
      {
        id: 'w-1',
        userId: 'u-1',
        programDayName: 'Push Workout',
        scheduledDate: '2026-09-25',
        scheduledTime: '18:00',
        status: 'scheduled',
        muscleGroups: ['Chest'],
        estimatedDurationMinutes: 50,
        plannedExercises: [],
        history: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: 'w-2',
        userId: 'u-1',
        programDayName: 'Legs Workout',
        scheduledDate: '2026-10-15',
        scheduledTime: '18:00',
        status: 'scheduled',
        muscleGroups: ['Quads'],
        estimatedDurationMinutes: 60,
        plannedExercises: [],
        history: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const result = detectAndMarkMissedWorkouts(workouts, '2026-10-01', '12:00');
    assert.equal(result.hasMissed, true);
    assert.equal(result.missedWorkouts.length, 1);
    assert.equal(result.missedWorkouts[0].id, 'w-1');
    assert.equal(result.updatedList[0].status, 'missed');
    assert.equal(result.updatedList[1].status, 'scheduled');
    assert.equal(result.updatedList[0].history.length, 1);
  });
});
