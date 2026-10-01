'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  Exercise, 
  ScheduledWorkout, 
  WorkoutSession, 
  PersonalRecord, 
  RecordedSet, 
  ScheduleChangeItem,
  WorkoutProgram
} from '@/lib/types';
import { generateSeedData } from '@/lib/data/seedData';
import { detectAndMarkMissedWorkouts } from '@/lib/engine/missedWorkoutDetector';
import { estimateOneRepMax } from '@/lib/engine/oneRepMax';
import { getExercises, saveCustomExercise } from '@/lib/firebase/firestore';

interface WorkoutStoreContextType {
  user: UserProfile;
  exercises: Exercise[];
  scheduledWorkouts: ScheduledWorkout[];
  completedSessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  activeSession: WorkoutSession | null;
  restTimerRemaining: number;
  isRestTimerActive: boolean;
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
  addRestTimerSeconds: (seconds: number) => void;
  
  // Actions
  startWorkout: (scheduledWorkout?: ScheduledWorkout) => void;
  updateActiveSet: (exerciseId: string, setIndex: number, updates: Partial<RecordedSet>) => void;
  addSetToExercise: (exerciseId: string, setType?: RecordedSet['setType']) => void;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => void;
  toggleSetDone: (exerciseId: string, setIndex: number) => void;
  finishActiveWorkout: () => WorkoutSession | null;
  cancelActiveWorkout: () => void;
  
  // Scheduling Actions
  rescheduleWorkout: (workoutId: string, newDate: string, newTime?: string, reason?: string) => void;
  skipWorkout: (workoutId: string, reason?: string) => void;
  applyScheduleChanges: (changes: ScheduleChangeItem[]) => void;
  createScheduledWorkout: (workout: Partial<ScheduledWorkout>) => void;
  updateScheduledWorkout: (workout: ScheduledWorkout) => void;
  deleteScheduledWorkout: (workoutId: string) => void;
  
  // History & Exercise Deletion
  deleteCompletedSession: (sessionId: string) => void;
  deleteCustomExercise: (exerciseId: string) => void;
  clearAllData: () => void;
  
  // Custom Exercises & Settings
  addCustomExercise: (exercise: Exercise) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  resetToDemoSeed: () => void;
  exportUserData: (format: 'json' | 'csv') => void;
}

const WorkoutStoreContext = createContext<WorkoutStoreContextType | null>(null);

const STORAGE_KEY = 'apex_strength_full_state_v1';

export function WorkoutStoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(generateSeedData().user);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [completedSessions, setCompletedSessions] = useState<WorkoutSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // Rest Timer State
  const [restTimerRemaining, setRestTimerRemaining] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  // Load Initial State
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || generateSeedData().user);
        setScheduledWorkouts(parsed.scheduledWorkouts || []);
        setCompletedSessions(parsed.completedSessions || []);
        setPersonalRecords(parsed.personalRecords || []);
        setActiveSession(parsed.activeSession || null);
      } else {
        // First launch: initialize with realistic seed data
        const seed = generateSeedData();
        setUser(seed.user);
        setScheduledWorkouts(seed.scheduledWorkouts);
        setCompletedSessions(seed.completedSessions);
        setPersonalRecords(seed.personalRecords);
      }
    } catch {
      const seed = generateSeedData();
      setUser(seed.user);
      setScheduledWorkouts(seed.scheduledWorkouts);
      setCompletedSessions(seed.completedSessions);
      setPersonalRecords(seed.personalRecords);
    }

    // Load exercises
    getExercises().then(setExercises);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user,
        scheduledWorkouts,
        completedSessions,
        personalRecords,
        activeSession,
      }));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [user, scheduledWorkouts, completedSessions, personalRecords, activeSession]);

  // Periodic Missed Workout Check
  useEffect(() => {
    if (!user.preferences.autoDetectMissedWorkouts) return;
    const checkMissed = () => {
      setScheduledWorkouts(prev => {
        const { hasMissed, updatedList } = detectAndMarkMissedWorkouts(prev);
        return hasMissed ? updatedList : prev;
      });
    };
    checkMissed();
    const interval = setInterval(checkMissed, 1000 * 60); // every minute
    return () => clearInterval(interval);
  }, [user.preferences.autoDetectMissedWorkouts]);

  // Rest Timer countdown
  useEffect(() => {
    if (!isRestTimerActive || restTimerRemaining <= 0) return;
    const timer = setInterval(() => {
      setRestTimerRemaining(prev => {
        if (prev <= 1) {
          setIsRestTimerActive(false);
          // Play subtle beep vibration if supported
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRestTimerActive, restTimerRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestTimerRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const pauseRestTimer = () => setIsRestTimerActive(false);
  const resetRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimerRemaining(0);
  };
  const addRestTimerSeconds = (sec: number) => setRestTimerRemaining(prev => prev + sec);

  // START WORKOUT
  const startWorkout = useCallback((scheduledWorkout?: ScheduledWorkout) => {
    const startedAt = Date.now();
    let exercisesList = [];

    if (scheduledWorkout && scheduledWorkout.plannedExercises.length > 0) {
      exercisesList = scheduledWorkout.plannedExercises.map(pe => ({
        exerciseId: pe.exerciseId,
        exerciseName: pe.exerciseName,
        restTimerSeconds: 120,
        sets: Array.from({ length: pe.sets }).map((_, i) => ({
          id: `set-${Date.now()}-${i}`,
          setNumber: i + 1,
          setType: 'normal' as const,
          weight: pe.recommendedWeight,
          reps: pe.repMin,
          rir: pe.targetRir,
          completed: false,
          previousPerformance: pe.previousPerformance,
        })),
      }));

      // Update scheduled status to in_progress
      setScheduledWorkouts(prev => prev.map(w => 
        w.id === scheduledWorkout.id 
          ? { ...w, status: 'in_progress', updatedAt: startedAt }
          : w
      ));
    } else {
      // Default blank workout with Bench Press
      exercisesList = [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          restTimerSeconds: 180,
          sets: [
            { id: `set-${Date.now()}-1`, setNumber: 1, setType: 'normal' as const, weight: 60, reps: 8, rir: 2, completed: false },
            { id: `set-${Date.now()}-2`, setNumber: 2, setType: 'normal' as const, weight: 60, reps: 8, rir: 2, completed: false },
            { id: `set-${Date.now()}-3`, setNumber: 3, setType: 'normal' as const, weight: 60, reps: 8, rir: 2, completed: false },
          ],
        },
      ];
    }

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      scheduledWorkoutId: scheduledWorkout?.id,
      name: scheduledWorkout ? scheduledWorkout.programDayName : 'Freestyle Workout',
      startedAt,
      durationSeconds: 0,
      totalVolume: 0,
      unit: user.preferences.unit,
      exercises: exercisesList,
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    setActiveSession(session);
  }, [user.id, user.preferences.unit]);

  // SET EDITING
  const updateActiveSet = useCallback((exerciseId: string, setIndex: number, updates: Partial<RecordedSet>) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const updatedSets = ex.sets.map((s, idx) => idx === setIndex ? { ...s, ...updates } : s);
        return { ...ex, sets: updatedSets };
      });
      return { ...prev, exercises: updatedExercises, updatedAt: Date.now() };
    });
  }, []);

  const addSetToExercise = useCallback((exerciseId: string, setType: RecordedSet['setType'] = 'normal') => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: RecordedSet = {
          id: `set-${Date.now()}-${ex.sets.length + 1}`,
          setNumber: ex.sets.length + 1,
          setType,
          weight: lastSet ? lastSet.weight : 50,
          reps: lastSet ? lastSet.reps : 8,
          rir: lastSet?.rir ?? 2,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      return { ...prev, exercises: updatedExercises, updatedAt: Date.now() };
    });
  }, []);

  const removeSetFromExercise = useCallback((exerciseId: string, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const updatedSets = ex.sets
          .filter((_, idx) => idx !== setIndex)
          .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: updatedSets };
      });
      return { ...prev, exercises: updatedExercises, updatedAt: Date.now() };
    });
  }, []);

  const toggleSetDone = useCallback((exerciseId: string, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      let shouldTriggerTimer = false;
      let restSeconds = 90;

      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        restSeconds = ex.restTimerSeconds || 90;
        const updatedSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s;
          const nextCompleted = !s.completed;
          if (nextCompleted) shouldTriggerTimer = true;
          return {
            ...s,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
          };
        });
        return { ...ex, sets: updatedSets };
      });

      if (shouldTriggerTimer) {
        startRestTimer(restSeconds);
      }

      return { ...prev, exercises: updatedExercises, updatedAt: Date.now() };
    });
  }, []);

  // FINISH WORKOUT
  const finishActiveWorkout = useCallback((): WorkoutSession | null => {
    if (!activeSession) return null;
    const completedAt = Date.now();
    const durationSeconds = Math.max(60, Math.floor((completedAt - activeSession.startedAt) / 1000));

    // Calculate total volume and PRs
    let totalVolume = 0;
    const newPRs: PersonalRecord[] = [];

    activeSession.exercises.forEach(ex => {
      let maxWeight = 0;
      let max1RM = 0;

      ex.sets.forEach(s => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
          if (s.weight > maxWeight) maxWeight = s.weight;
          const est1RM = estimateOneRepMax(s.weight, s.reps);
          if (est1RM > max1RM) max1RM = est1RM;
        }
      });

      // Check against current PRs
      const current1RMPR = personalRecords.find(pr => pr.exerciseId === ex.exerciseId && pr.type === '1rm');
      if (max1RM > (current1RMPR?.value || 0)) {
        newPRs.push({
          id: `pr-${Date.now()}-${ex.exerciseId}-1rm`,
          userId: user.id,
          exerciseId: ex.exerciseId,
          type: '1rm',
          value: max1RM,
          achievedAt: completedAt,
          sessionId: activeSession.id,
        });
      }
    });

    const finishedSession: WorkoutSession = {
      ...activeSession,
      completedAt,
      durationSeconds,
      totalVolume,
      personalRecords: newPRs.map(pr => ({
        exerciseId: pr.exerciseId,
        exerciseName: exercises.find(e => e.id === pr.exerciseId)?.name || pr.exerciseId,
        type: pr.type,
        value: pr.value,
      })),
      updatedAt: completedAt,
    };

    // Save completed session
    setCompletedSessions(prev => [finishedSession, ...prev]);

    // Update scheduled workout if tied to one
    if (activeSession.scheduledWorkoutId) {
      setScheduledWorkouts(prev => prev.map(w => 
        w.id === activeSession.scheduledWorkoutId
          ? {
              ...w,
              status: 'completed',
              completedSessionId: finishedSession.id,
              updatedAt: completedAt,
              history: [
                ...(w.history || []),
                { timestamp: completedAt, fromStatus: 'in_progress', toStatus: 'completed', reason: 'Workout completed successfully.' }
              ]
            }
          : w
      ));
    }

    // Save new PRs
    if (newPRs.length > 0) {
      setPersonalRecords(prev => [...prev.filter(p => !newPRs.some(np => np.exerciseId === p.exerciseId && np.type === p.type)), ...newPRs]);
    }

    setActiveSession(null);
    resetRestTimer();
    return finishedSession;
  }, [activeSession, personalRecords, user.id, exercises]);

  const cancelActiveWorkout = useCallback(() => {
    if (activeSession?.scheduledWorkoutId) {
      setScheduledWorkouts(prev => prev.map(w => 
        w.id === activeSession.scheduledWorkoutId
          ? { ...w, status: 'scheduled' }
          : w
      ));
    }
    setActiveSession(null);
    resetRestTimer();
  }, [activeSession]);

  // RESCHEDULE & REORGANIZE
  const rescheduleWorkout = useCallback((workoutId: string, newDate: string, newTime?: string, reason?: string) => {
    setScheduledWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        scheduledDate: newDate,
        scheduledTime: newTime || w.scheduledTime,
        status: 'scheduled',
        updatedAt: Date.now(),
        history: [
          ...(w.history || []),
          {
            timestamp: Date.now(),
            fromStatus: w.status,
            toStatus: 'rescheduled',
            reason: reason || `Rescheduled to ${newDate}`,
          }
        ]
      };
    }));
  }, []);

  const skipWorkout = useCallback((workoutId: string, reason?: string) => {
    setScheduledWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        status: 'skipped',
        updatedAt: Date.now(),
        history: [
          ...(w.history || []),
          {
            timestamp: Date.now(),
            fromStatus: w.status,
            toStatus: 'skipped',
            reason: reason || 'Workout skipped by user.',
          }
        ]
      };
    }));
  }, []);

  const applyScheduleChanges = useCallback((changes: ScheduleChangeItem[]) => {
    const changeMap = new Map(changes.map(c => [c.workout_id, c]));
    setScheduledWorkouts(prev => prev.map(w => {
      const change = changeMap.get(w.id);
      if (!change) return w;
      return {
        ...w,
        scheduledDate: change.new_date,
        status: 'scheduled',
        updatedAt: Date.now(),
        history: [
          ...(w.history || []),
          {
            timestamp: Date.now(),
            fromStatus: w.status,
            toStatus: 'rescheduled',
            reason: change.reason,
          }
        ]
      };
    }));
  }, []);

  const createScheduledWorkout = useCallback((workout: Partial<ScheduledWorkout>) => {
    const newWorkout: ScheduledWorkout = {
      id: `sched-${Date.now()}`,
      userId: user.id,
      programDayName: workout.programDayName || 'Custom Workout',
      scheduledDate: workout.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: workout.scheduledTime || '18:00',
      status: 'scheduled',
      muscleGroups: workout.muscleGroups || ['Chest'],
      estimatedDurationMinutes: workout.estimatedDurationMinutes || 45,
      plannedExercises: workout.plannedExercises || [],
      history: [{ timestamp: Date.now(), toStatus: 'scheduled', reason: 'Created manually.' }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setScheduledWorkouts(prev => [...prev, newWorkout]);
  }, [user.id]);

  const updateScheduledWorkout = useCallback((workout: ScheduledWorkout) => {
    setScheduledWorkouts(prev => prev.map(w => w.id === workout.id ? { ...workout, updatedAt: Date.now() } : w));
  }, []);

  const deleteScheduledWorkout = useCallback((workoutId: string) => {
    setScheduledWorkouts(prev => prev.filter(w => w.id !== workoutId));
    setActiveSession(prev => prev?.scheduledWorkoutId === workoutId ? null : prev);
  }, []);

  const deleteCompletedSession = useCallback((sessionId: string) => {
    setCompletedSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  const deleteCustomExercise = useCallback((exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId));
    try {
      const raw = localStorage.getItem('apex_strength_custom_exercises');
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem('apex_strength_custom_exercises', JSON.stringify(parsed.filter((e: any) => e.id !== exerciseId)));
      }
    } catch {}
  }, []);

  const clearAllData = useCallback(() => {
    setScheduledWorkouts([]);
    setCompletedSessions([]);
    setPersonalRecords([]);
    setActiveSession(null);
    resetRestTimer();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addCustomExercise = async (exercise: Exercise) => {
    setExercises(prev => [...prev, exercise]);
    await saveCustomExercise(exercise);
  };

  const updateUserPreferences = (prefs: Partial<UserProfile['preferences']>) => {
    setUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
      updatedAt: Date.now(),
    }));
  };

  const resetToDemoSeed = () => {
    const seed = generateSeedData();
    setUser(seed.user);
    setScheduledWorkouts(seed.scheduledWorkouts);
    setCompletedSessions(seed.completedSessions);
    setPersonalRecords(seed.personalRecords);
    setActiveSession(null);
    resetRestTimer();
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportUserData = (format: 'json' | 'csv') => {
    const exportObject = {
      user,
      scheduledWorkouts,
      completedSessions,
      personalRecords,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `apex_strength_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV format
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Date,Workout,Exercise,Set,Type,Weight,Reps,RIR,Completed\n';
      completedSessions.forEach(sess => {
        const dateStr = new Date(sess.startedAt).toISOString().split('T')[0];
        sess.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            csvContent += `"${dateStr}","${sess.name}","${ex.exerciseName}",${s.setNumber},"${s.setType}",${s.weight},${s.reps},${s.rir ?? ''},${s.completed}\n`;
          });
        });
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `apex_strength_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <WorkoutStoreContext.Provider
      value={{
        user,
        exercises,
        scheduledWorkouts,
        completedSessions,
        personalRecords,
        activeSession,
        restTimerRemaining,
        isRestTimerActive,
        startRestTimer,
        pauseRestTimer,
        resetRestTimer,
        addRestTimerSeconds,
        startWorkout,
        updateActiveSet,
        addSetToExercise,
        removeSetFromExercise,
        toggleSetDone,
        finishActiveWorkout,
        cancelActiveWorkout,
        rescheduleWorkout,
        skipWorkout,
        applyScheduleChanges,
        createScheduledWorkout,
        updateScheduledWorkout,
        deleteScheduledWorkout,
        deleteCompletedSession,
        deleteCustomExercise,
        clearAllData,
        addCustomExercise,
        updateUserPreferences,
        resetToDemoSeed,
        exportUserData,
      }}
    >
      {children}
    </WorkoutStoreContext.Provider>
  );
}

export function useWorkoutStore() {
  const context = useContext(WorkoutStoreContext);
  if (!context) {
    throw new Error('useWorkoutStore must be used within a WorkoutStoreProvider');
  }
  return context;
}
