import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { WorkoutWithExercises } from '../types/workout';
import { useUser } from './UserContext';
import {
  createWorkout,
  getWorkoutById,
  getActiveWorkout,
  completeWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet as dbAddSet,
  updateSet as dbUpdateSet,
  deleteSet as dbDeleteSet,
  toggleSetCompleted as dbToggleSetCompleted,
} from '../services/database/workoutDb';

interface WorkoutContextType {
  activeWorkout: WorkoutWithExercises | null;
  isWorkoutActive: boolean;
  elapsedTime: number;
  startWorkout: (name: string) => Promise<void>;
  addExercise: (exerciseTypeId: string) => Promise<void>;
  removeExercise: (exerciseId: string) => Promise<void>;
  addNewSet: (exerciseId: string) => Promise<void>;
  updateSetData: (setId: string, data: { weight?: number; reps?: number }) => Promise<void>;
  deleteSetById: (setId: string) => Promise<void>;
  toggleSetComplete: (setId: string) => Promise<boolean>;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  refreshWorkout: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType>({
  activeWorkout: null,
  isWorkoutActive: false,
  elapsedTime: 0,
  startWorkout: async () => {},
  addExercise: async () => {},
  removeExercise: async () => {},
  addNewSet: async () => {},
  updateSetData: async () => {},
  deleteSetById: async () => {},
  toggleSetComplete: async () => false,
  finishWorkout: async () => {},
  cancelWorkout: async () => {},
  refreshWorkout: async () => {},
});

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const { user } = useUser();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutWithExercises | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check for an existing active workout on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const existing = await getActiveWorkout(db, user.id);
      if (existing) {
        setActiveWorkout(existing);
        const startedAt = new Date(existing.date).getTime();
        startTimeRef.current = startedAt;
      }
    })();
  }, [db, user]);

  // Elapsed time ticker
  useEffect(() => {
    if (activeWorkout && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTimeRef.current!) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeWorkout]);

  const refresh = useCallback(async () => {
    if (!activeWorkout) return;
    const updated = await getWorkoutById(db, activeWorkout.id);
    if (updated) setActiveWorkout(updated);
  }, [db, activeWorkout]);

  const startWorkout = useCallback(
    async (name: string) => {
      if (!user) return;
      const workoutId = await createWorkout(db, user.id, name);
      const workout = await getWorkoutById(db, workoutId);
      startTimeRef.current = Date.now();
      setActiveWorkout(workout);
    },
    [db, user]
  );

  const addExercise = useCallback(
    async (exerciseTypeId: string) => {
      if (!activeWorkout) return;
      const order = activeWorkout.exercises.length;
      await addExerciseToWorkout(db, activeWorkout.id, exerciseTypeId, order);
      await refresh();
    },
    [db, activeWorkout, refresh]
  );

  const removeExercise = useCallback(
    async (exerciseId: string) => {
      await removeExerciseFromWorkout(db, exerciseId);
      await refresh();
    },
    [db, refresh]
  );

  const addNewSet = useCallback(
    async (exerciseId: string) => {
      if (!activeWorkout) return;
      const exercise = activeWorkout.exercises.find((e) => e.id === exerciseId);
      const nextSetNumber = exercise ? exercise.sets.length + 1 : 1;
      await dbAddSet(db, exerciseId, { setNumber: nextSetNumber });
      await refresh();
    },
    [db, activeWorkout, refresh]
  );

  const updateSetData = useCallback(
    async (setId: string, data: { weight?: number; reps?: number }) => {
      await dbUpdateSet(db, setId, data);
      await refresh();
    },
    [db, refresh]
  );

  const deleteSetById = useCallback(
    async (setId: string) => {
      await dbDeleteSet(db, setId);
      await refresh();
    },
    [db, refresh]
  );

  const toggleSetComplete = useCallback(
    async (setId: string) => {
      const completed = await dbToggleSetCompleted(db, setId);
      await refresh();
      return completed;
    },
    [db, refresh]
  );

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    await completeWorkout(db, activeWorkout.id, elapsedTime);
    setActiveWorkout(null);
    startTimeRef.current = null;
  }, [db, activeWorkout, elapsedTime]);

  const cancelWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    await deleteWorkout(db, activeWorkout.id);
    setActiveWorkout(null);
    startTimeRef.current = null;
  }, [db, activeWorkout]);

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        isWorkoutActive: activeWorkout !== null,
        elapsedTime,
        startWorkout,
        addExercise,
        removeExercise,
        addNewSet,
        updateSetData,
        deleteSetById,
        toggleSetComplete,
        finishWorkout,
        cancelWorkout,
        refreshWorkout: refresh,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  return useContext(WorkoutContext);
}
