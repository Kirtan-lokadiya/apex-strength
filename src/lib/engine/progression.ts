import type { 
  DeterministicRecommendation, 
  EquipmentType, 
  RecordedSet, 
  WeightUnit 
} from '../types/index.ts';

export interface ExerciseSessionHistory {
  date: string;
  sets: RecordedSet[];
}

export interface ProgressionContext {
  exerciseId: string;
  exerciseName: string;
  equipment: EquipmentType;
  unit: WeightUnit;
  targetSets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  currentWeight: number;
  recentSessions: ExerciseSessionHistory[];
  availableIncrements?: number[];
}

export function getEquipmentIncrement(equipment: EquipmentType, unit: WeightUnit): number {
  if (unit === 'kg') {
    switch (equipment) {
      case 'Barbell':
        return 2.5; // Standard 1.25kg plate on each side
      case 'Dumbbell':
        return 2.0; // Standard dumbbell jumps (e.g. 20 -> 22kg)
      case 'Cable':
      case 'Machine':
        return 2.5;
      default:
        return 2.5;
    }
  } else {
    // Pounds
    switch (equipment) {
      case 'Barbell':
        return 5.0; // Standard 2.5lb plate on each side
      case 'Dumbbell':
        return 5.0; // Standard 5lb dumbbell jumps
      case 'Cable':
      case 'Machine':
        return 5.0;
      default:
        return 5.0;
    }
  }
}

export function roundToNearestIncrement(weight: number, increment: number): number {
  if (increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
}

export function calculateDeterministicRecommendation(context: ProgressionContext): DeterministicRecommendation {
  const {
    exerciseId,
    equipment,
    unit,
    targetSets,
    repMin,
    repMax,
    targetRir,
    currentWeight,
    recentSessions,
  } = context;

  const increment = getEquipmentIncrement(equipment, unit);

  // If no history exists, use starting current weight
  if (!recentSessions || recentSessions.length === 0) {
    return {
      exerciseId,
      recommendedWeight: currentWeight,
      targetSets,
      targetReps: Array(targetSets).fill(repMin),
      targetRir,
      action: 'initial',
      reason: `First recorded session for this exercise. Starting with baseline target of ${currentWeight} ${unit} for ${targetSets} sets of ${repMin}–${repMax} reps.`,
      unit,
      confidence: 'medium',
    };
  }

  const latestSession = recentSessions[0];
  const completedWorkingSets = latestSession.sets.filter(s => s.completed && s.setType !== 'warmup');

  if (completedWorkingSets.length === 0) {
    return {
      exerciseId,
      recommendedWeight: currentWeight,
      targetSets,
      targetReps: Array(targetSets).fill(repMin),
      targetRir,
      action: 'maintain',
      reason: `No completed working sets recorded in previous session. Maintaining ${currentWeight} ${unit}.`,
      unit,
      confidence: 'low',
    };
  }

  // Check rep performance on completed working sets
  const allSetsMetMaxReps = completedWorkingSets.every(s => s.reps >= repMax);
  const allSetsMetMinReps = completedWorkingSets.every(s => s.reps >= repMin);
  const avgRir = completedWorkingSets.reduce((sum, s) => sum + (s.rir ?? targetRir), 0) / completedWorkingSets.length;
  const anySetMissedMinReps = completedWorkingSets.some(s => s.reps < repMin);

  // Check multi-session failure trend (consecutive missed targets)
  let consecutiveMisses = 0;
  for (const session of recentSessions.slice(0, 3)) {
    const workingSets = session.sets.filter(s => s.completed && s.setType !== 'warmup');
    if (workingSets.length > 0 && workingSets.some(s => s.reps < repMin)) {
      consecutiveMisses++;
    }
  }

  // Rule 1: Progressive Overload - User hit top of rep range across all sets with comfortable RIR
  if (allSetsMetMaxReps && avgRir >= (targetRir - 0.5)) {
    const newWeight = roundToNearestIncrement(currentWeight + increment, increment);
    return {
      exerciseId,
      recommendedWeight: newWeight,
      targetSets,
      targetReps: Array(targetSets).fill(repMin), // Reset to bottom of rep range at heavier weight
      targetRir,
      action: 'increase',
      reason: `You hit the top of your target rep range (${repMax} reps) on all sets with solid reserve (~${avgRir.toFixed(1)} RIR). Increasing weight by +${increment} ${unit} to ${newWeight} ${unit}.`,
      unit,
      confidence: 'high',
    };
  }

  // Rule 2: Repeated failure (2+ sessions missing minimum reps) -> Deload / Reset
  if (consecutiveMisses >= 2) {
    const deloadWeight = roundToNearestIncrement(Math.max(currentWeight * 0.9, increment), increment);
    return {
      exerciseId,
      recommendedWeight: deloadWeight,
      targetSets,
      targetReps: Array(targetSets).fill(repMin),
      targetRir: targetRir + 1,
      action: 'decrease',
      reason: `Target of ${repMin} reps was missed across ${consecutiveMisses} consecutive sessions. Reducing weight by ~10% to ${deloadWeight} ${unit} to reset fatigue and reinforce technique.`,
      unit,
      confidence: 'high',
    };
  }

  // Rule 3: Single session missed bottom of rep range -> Maintain and consolidate
  if (anySetMissedMinReps) {
    const actualRepsSummary = completedWorkingSets.map(s => s.reps).join('/');
    return {
      exerciseId,
      recommendedWeight: currentWeight,
      targetSets,
      targetReps: completedWorkingSets.map(s => Math.min(s.reps + 1, repMax)),
      targetRir,
      action: 'maintain',
      reason: `Completed ${actualRepsSummary} reps last session. Maintain ${currentWeight} ${unit} and aim to hit at least ${repMin} reps on every set.`,
      unit,
      confidence: 'medium',
    };
  }

  // Rule 4: Normal double progression progression in progress (e.g. 8/8/9 reps achieved)
  const actualRepsSummary = completedWorkingSets.map(s => s.reps).join('/');
  return {
    exerciseId,
    recommendedWeight: currentWeight,
    targetSets,
    targetReps: completedWorkingSets.map(s => Math.min(s.reps + 1, repMax)),
    targetRir,
    action: 'maintain',
    reason: `Great progress (${actualRepsSummary} reps achieved). Maintain ${currentWeight} ${unit} and push for extra reps towards your ${repMax}-rep ceiling.`,
    unit,
    confidence: 'high',
  };
}
