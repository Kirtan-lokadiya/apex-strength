import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './config';
import { 
  UserProfile, 
  Exercise, 
  ScheduledWorkout, 
  WorkoutSession, 
  PersonalRecord, 
  WorkoutProgram 
} from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { DEFAULT_PROGRAMS } from '../data/defaultPrograms';

// Helper for local storage fallback when offline or in demo mode
const LOCAL_PREFIX = 'apex_strength_';

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// USER PROFILE REPO
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch {
    // Fall back to local
  }
  return getLocalData<UserProfile | null>(`user_${userId}`, null);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  setLocalData(`user_${profile.id}`, profile);
  try {
    const docRef = doc(db, 'users', profile.id);
    await setDoc(docRef, profile, { merge: true });
  } catch {
    // Offline / Demo saved to local
  }
}

// EXERCISES REPO
export async function getExercises(userId?: string): Promise<Exercise[]> {
  const localCustom = getLocalData<Exercise[]>('custom_exercises', []);
  let firestoreCustom: Exercise[] = [];

  if (userId) {
    try {
      const q = query(collection(db, 'exercises'), where('userId', '==', userId));
      const snap = await getDocs(q);
      firestoreCustom = snap.docs.map(d => d.data() as Exercise);
    } catch {
      // Offline
    }
  }

  // Merge default exercises with custom / modified exercises
  const allCustom = [...localCustom, ...firestoreCustom.filter(fc => !localCustom.some(lc => lc.id === fc.id))];
  const customMap = new Map(allCustom.map(e => [e.id, e]));
  const mergedDefaults = DEFAULT_EXERCISES.map(e => customMap.get(e.id) || e);
  const brandNewCustom = allCustom.filter(e => !DEFAULT_EXERCISES.some(d => d.id === e.id));
  return [...mergedDefaults, ...brandNewCustom];
}

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  const local = getLocalData<Exercise[]>('custom_exercises', []);
  const updated = [...local.filter(e => e.id !== exercise.id), exercise];
  setLocalData('custom_exercises', updated);

  try {
    const docRef = doc(db, 'exercises', exercise.id);
    await setDoc(docRef, exercise);
  } catch {
    // Saved locally
  }
}

// SCHEDULED WORKOUTS REPO
export async function getScheduledWorkouts(userId: string): Promise<ScheduledWorkout[]> {
  const local = getLocalData<ScheduledWorkout[]>(`scheduled_${userId}`, []);
  try {
    const q = query(
      collection(db, 'scheduled_workouts'),
      where('userId', '==', userId),
      orderBy('scheduledDate', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remote = snap.docs.map(d => d.data() as ScheduledWorkout);
      // Merge by ID
      const mergedMap = new Map<string, ScheduledWorkout>();
      local.forEach(w => mergedMap.set(w.id, w));
      remote.forEach(w => mergedMap.set(w.id, w));
      const merged = Array.from(mergedMap.values()).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      setLocalData(`scheduled_${userId}`, merged);
      return merged;
    }
  } catch {
    // Offline
  }
  return local;
}

export async function saveScheduledWorkout(workout: ScheduledWorkout): Promise<void> {
  const local = getLocalData<ScheduledWorkout[]>(`scheduled_${workout.userId}`, []);
  const updated = [...local.filter(w => w.id !== workout.id), workout];
  setLocalData(`scheduled_${workout.userId}`, updated);

  try {
    const docRef = doc(db, 'scheduled_workouts', workout.id);
    await setDoc(docRef, workout, { merge: true });
  } catch {
    // Offline
  }
}

export async function batchSaveScheduledWorkouts(userId: string, workouts: ScheduledWorkout[]): Promise<void> {
  const local = getLocalData<ScheduledWorkout[]>(`scheduled_${userId}`, []);
  const map = new Map<string, ScheduledWorkout>();
  local.forEach(w => map.set(w.id, w));
  workouts.forEach(w => map.set(w.id, w));
  const merged = Array.from(map.values()).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  setLocalData(`scheduled_${userId}`, merged);

  for (const w of workouts) {
    try {
      const docRef = doc(db, 'scheduled_workouts', w.id);
      await setDoc(docRef, w, { merge: true });
    } catch {
      // Ignored offline
    }
  }
}

// WORKOUT SESSIONS (ACTUAL COMPLETED PERFORMANCE)
export async function getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  const local = getLocalData<WorkoutSession[]>(`sessions_${userId}`, []);
  try {
    const q = query(
      collection(db, 'workout_sessions'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remote = snap.docs.map(d => d.data() as WorkoutSession);
      const map = new Map<string, WorkoutSession>();
      local.forEach(s => map.set(s.id, s));
      remote.forEach(s => map.set(s.id, s));
      const merged = Array.from(map.values()).sort((a, b) => b.startedAt - a.startedAt);
      setLocalData(`sessions_${userId}`, merged);
      return merged;
    }
  } catch {
    // Offline
  }
  return local.sort((a, b) => b.startedAt - a.startedAt);
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  const local = getLocalData<WorkoutSession[]>(`sessions_${session.userId}`, []);
  const updated = [...local.filter(s => s.id !== session.id), session];
  setLocalData(`sessions_${session.userId}`, updated);

  try {
    const docRef = doc(db, 'workout_sessions', session.id);
    await setDoc(docRef, session, { merge: true });
  } catch {
    // Offline
  }
}

// PERSONAL RECORDS REPO
export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const local = getLocalData<PersonalRecord[]>(`prs_${userId}`, []);
  try {
    const q = query(collection(db, 'personal_records'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remote = snap.docs.map(d => d.data() as PersonalRecord);
      setLocalData(`prs_${userId}`, remote);
      return remote;
    }
  } catch {
    // Offline
  }
  return local;
}

export async function savePersonalRecord(record: PersonalRecord): Promise<void> {
  const local = getLocalData<PersonalRecord[]>(`prs_${record.userId}`, []);
  const updated = [...local.filter(r => r.id !== record.id), record];
  setLocalData(`prs_${record.userId}`, updated);

  try {
    const docRef = doc(db, 'personal_records', record.id);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Offline
  }
}

// PROGRAMS REPO
export async function getPrograms(userId?: string): Promise<WorkoutProgram[]> {
  const localCustom = getLocalData<WorkoutProgram[]>('custom_programs', []);
  return [...DEFAULT_PROGRAMS, ...localCustom];
}

export async function saveCustomProgram(program: WorkoutProgram): Promise<void> {
  const local = getLocalData<WorkoutProgram[]>('custom_programs', []);
  const updated = [...local.filter(p => p.id !== program.id), program];
  setLocalData('custom_programs', updated);

  try {
    const docRef = doc(db, 'programs', program.id);
    await setDoc(docRef, program, { merge: true });
  } catch {
    // Offline
  }
}
