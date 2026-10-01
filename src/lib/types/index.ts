export type WeightUnit = 'kg' | 'lb';

export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Arms'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs'
  | 'Cardio'
  | 'Other';

export type EquipmentType = 
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Smith Machine'
  | 'Bodyweight'
  | 'Bands'
  | 'Kettlebell'
  | 'Other';

export type MovementPattern = 
  | 'Horizontal Push'
  | 'Horizontal Pull'
  | 'Vertical Push'
  | 'Vertical Pull'
  | 'Squat'
  | 'Hinge'
  | 'Lunge'
  | 'Isolation'
  | 'Carry'
  | 'Cardio';

export type ProgressionType = 
  | 'double_progression'
  | 'linear_progression'
  | 'percentage_progression'
  | 'rpe_progression';

export type WorkoutStatus = 
  | 'scheduled'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'missed'
  | 'skipped'
  | 'rescheduled'
  | 'cancelled';

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure' | 'amrap';

export interface UserPreferences {
  unit: WeightUnit;
  weekStartsOn: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  notificationsEnabled: boolean;
  defaultRestDurationSeconds: number;
  availablePlateIncrementsKg: number[];
  availablePlateIncrementsLb: number[];
  availableDumbbellIncrementsKg: number[];
  availableDumbbellIncrementsLb: number[];
  aiRecommendationsEnabled: boolean;
  autoAdaptSchedule: boolean;
  autoDetectMissedWorkouts: boolean;
  barbellWeightKg: number;
  barbellWeightLb: number;
  notifyExerciseComplete?: boolean;
  notifyRestTimerComplete?: boolean;
  notifyRestTimerWarning?: boolean;
  notifyHydration?: boolean;
  hydrationIntervalMinutes?: number;
  notifyPR?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  preferences: UserPreferences;
  activeProgramId?: string;
  onboardingCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  movementPattern: MovementPattern;
  supportedProgression: ProgressionType;
  defaultRestSeconds: number;
  instructions?: string;
  imageUrl?: string;
  isCustom?: boolean;
  userId?: string; // null for global library
  createdAt: number;
  updatedAt: number;
}

export interface TargetRepScheme {
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  startingWeight?: number;
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  recommendedWeight: number;
  previousPerformance?: string;
  progressionReason?: string;
  unit: WeightUnit;
}

export interface ScheduledWorkout {
  id: string;
  userId: string;
  programId?: string;
  programDayName: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  status: WorkoutStatus;
  muscleGroups: MuscleGroup[];
  estimatedDurationMinutes: number;
  plannedExercises: PlannedExercise[];
  notes?: string;
  completedSessionId?: string;
  rescheduledFromDate?: string;
  history: Array<{
    timestamp: number;
    fromStatus?: WorkoutStatus;
    toStatus: WorkoutStatus;
    reason: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface RecordedSet {
  id: string;
  setNumber: number;
  setType: SetType;
  weight: number;
  reps: number;
  rir?: number;
  rpe?: number;
  completed: boolean;
  completedAt?: number;
  previousPerformance?: string;
}

export interface RecordedExerciseSession {
  exerciseId: string;
  exerciseName: string;
  sets: RecordedSet[];
  notes?: string;
  restTimerSeconds: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  scheduledWorkoutId?: string;
  name: string;
  startedAt: number;
  completedAt?: number;
  durationSeconds: number;
  totalVolume: number;
  unit: WeightUnit;
  exercises: RecordedExerciseSession[];
  readiness?: {
    sleep: 'poor' | 'average' | 'good';
    energy: number; // 1-5
    soreness: number; // 1-5
    stress: number; // 1-5
    timeAvailableMinutes: number;
  };
  notes?: string;
  personalRecords?: Array<{
    exerciseId: string;
    exerciseName: string;
    type: '1rm' | 'weight' | 'reps' | 'volume';
    value: number;
    previousValue?: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface ProgramDay {
  dayIndex: number; // 0 to 6
  name: string;
  muscleFocus: MuscleGroup[];
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repMin: number;
    repMax: number;
    targetRir: number;
    startingWeight?: number;
  }>;
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  daysPerWeek: number;
  durationWeeks: number;
  days: ProgramDay[];
  isTemplate?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  type: '1rm' | 'weight' | 'reps' | 'volume';
  value: number;
  reps?: number;
  weight?: number;
  achievedAt: number;
  sessionId: string;
}

export interface DeterministicRecommendation {
  exerciseId: string;
  recommendedWeight: number;
  targetSets: number;
  targetReps: number[];
  targetRir: number;
  action: 'increase' | 'maintain' | 'decrease' | 'initial';
  reason: string;
  unit: WeightUnit;
  confidence: 'high' | 'medium' | 'low';
}

export interface AIWeightRecommendation {
  recommended_weight: number;
  target_sets: number;
  target_reps: number[];
  target_rir: number;
  confidence: 'high' | 'medium' | 'low';
  action: 'increase' | 'maintain' | 'decrease';
  reason: string;
  warnings: string[];
}

export interface ScheduleChangeItem {
  workout_id: string;
  old_date: string;
  new_date: string;
  reason: string;
}

export interface AIWeeklyReorganizeOutput {
  summary: string;
  changes: ScheduleChangeItem[];
  warnings: string[];
}

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  proposedChanges?: ScheduleChangeItem[];
}
