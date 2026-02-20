import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkoutSession,
  WorkoutWithExercises,
  ExerciseWithSets,
  ExerciseSet,
} from '../../types/workout';
import { getExerciseTypeById } from './exerciseDb';

interface WorkoutRow {
  id: string;
  user_id: string;
  date: string;
  name: string;
  notes: string | null;
  duration_seconds: number;
  completed_at: string | null;
}

interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_type_id: string;
  notes: string | null;
  exercise_order: number;
}

interface ExerciseSetRow {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  duration: number | null;
  distance: number | null;
  completed: number;
}

function rowToWorkout(row: WorkoutRow): WorkoutSession {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    name: row.name,
    notes: row.notes ?? undefined,
    durationSeconds: row.duration_seconds,
    completedAt: row.completed_at ?? undefined,
  };
}

function rowToSet(row: ExerciseSetRow): ExerciseSet {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: row.weight ?? undefined,
    reps: row.reps ?? undefined,
    duration: row.duration ?? undefined,
    distance: row.distance ?? undefined,
    completed: row.completed === 1,
  };
}

export async function createWorkout(
  db: SQLiteDatabase,
  userId: string,
  name: string
): Promise<string> {
  const id = uuidv4();
  const date = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workouts (id, user_id, date, name, duration_seconds)
     VALUES (?, ?, ?, ?, 0)`,
    [id, userId, date, name]
  );
  return id;
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  workoutId: string
): Promise<WorkoutWithExercises | null> {
  const workoutRow = await db.getFirstAsync<WorkoutRow>(
    'SELECT * FROM workouts WHERE id = ?',
    [workoutId]
  );
  if (!workoutRow) return null;

  const exerciseRows = await db.getAllAsync<WorkoutExerciseRow>(
    'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY exercise_order',
    [workoutId]
  );

  const exercises: ExerciseWithSets[] = [];
  for (const exRow of exerciseRows) {
    const exerciseType = await getExerciseTypeById(db, exRow.exercise_type_id);
    if (!exerciseType) continue;

    const setRows = await db.getAllAsync<ExerciseSetRow>(
      'SELECT * FROM exercise_sets WHERE exercise_id = ? ORDER BY set_number',
      [exRow.id]
    );

    exercises.push({
      id: exRow.id,
      workoutId: exRow.workout_id,
      exerciseTypeId: exRow.exercise_type_id,
      notes: exRow.notes ?? undefined,
      order: exRow.exercise_order,
      exerciseType,
      sets: setRows.map(rowToSet),
    });
  }

  return {
    ...rowToWorkout(workoutRow),
    exercises,
  };
}

export async function getWorkoutHistory(
  db: SQLiteDatabase,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutSession[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    `SELECT * FROM workouts
     WHERE user_id = ? AND completed_at IS NOT NULL
     ORDER BY date DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows.map(rowToWorkout);
}

export async function getActiveWorkout(
  db: SQLiteDatabase,
  userId: string
): Promise<WorkoutWithExercises | null> {
  const row = await db.getFirstAsync<WorkoutRow>(
    `SELECT * FROM workouts
     WHERE user_id = ? AND completed_at IS NULL
     ORDER BY date DESC LIMIT 1`,
    [userId]
  );
  if (!row) return null;
  return getWorkoutById(db, row.id);
}

export async function completeWorkout(
  db: SQLiteDatabase,
  workoutId: string,
  durationSeconds: number
): Promise<void> {
  await db.runAsync(
    `UPDATE workouts SET completed_at = ?, duration_seconds = ? WHERE id = ?`,
    [new Date().toISOString(), durationSeconds, workoutId]
  );
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  workoutId: string
): Promise<void> {
  await db.runAsync('DELETE FROM workouts WHERE id = ?', [workoutId]);
}

export async function addExerciseToWorkout(
  db: SQLiteDatabase,
  workoutId: string,
  exerciseTypeId: string,
  order: number
): Promise<string> {
  const id = uuidv4();
  await db.runAsync(
    `INSERT INTO workout_exercises (id, workout_id, exercise_type_id, exercise_order)
     VALUES (?, ?, ?, ?)`,
    [id, workoutId, exerciseTypeId, order]
  );
  // Add one empty set by default
  await addSet(db, id, { setNumber: 1 });
  return id;
}

export async function removeExerciseFromWorkout(
  db: SQLiteDatabase,
  exerciseId: string
): Promise<void> {
  await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', [exerciseId]);
}

export async function addSet(
  db: SQLiteDatabase,
  exerciseId: string,
  data: { setNumber: number; weight?: number; reps?: number }
): Promise<string> {
  const id = uuidv4();
  await db.runAsync(
    `INSERT INTO exercise_sets (id, exercise_id, set_number, weight, reps, completed)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, exerciseId, data.setNumber, data.weight ?? null, data.reps ?? null]
  );
  return id;
}

export async function updateSet(
  db: SQLiteDatabase,
  setId: string,
  data: { weight?: number; reps?: number }
): Promise<void> {
  if (data.weight !== undefined) {
    await db.runAsync('UPDATE exercise_sets SET weight = ? WHERE id = ?', [
      data.weight,
      setId,
    ]);
  }
  if (data.reps !== undefined) {
    await db.runAsync('UPDATE exercise_sets SET reps = ? WHERE id = ?', [
      data.reps,
      setId,
    ]);
  }
}

export async function deleteSet(
  db: SQLiteDatabase,
  setId: string
): Promise<void> {
  await db.runAsync('DELETE FROM exercise_sets WHERE id = ?', [setId]);
}

export async function toggleSetCompleted(
  db: SQLiteDatabase,
  setId: string
): Promise<boolean> {
  const row = await db.getFirstAsync<{ completed: number }>(
    'SELECT completed FROM exercise_sets WHERE id = ?',
    [setId]
  );
  const newValue = row?.completed === 1 ? 0 : 1;
  await db.runAsync('UPDATE exercise_sets SET completed = ? WHERE id = ?', [
    newValue,
    setId,
  ]);
  return newValue === 1;
}

export async function getExerciseHistory(
  db: SQLiteDatabase,
  exerciseTypeId: string,
  limit: number = 30
): Promise<{ date: string; sets: ExerciseSet[] }[]> {
  const rows = await db.getAllAsync<WorkoutExerciseRow & { workout_date: string }>(
    `SELECT we.*, w.date as workout_date
     FROM workout_exercises we
     JOIN workouts w ON w.id = we.workout_id
     WHERE we.exercise_type_id = ? AND w.completed_at IS NOT NULL
     ORDER BY w.date DESC
     LIMIT ?`,
    [exerciseTypeId, limit]
  );

  const history: { date: string; sets: ExerciseSet[] }[] = [];
  for (const row of rows) {
    const setRows = await db.getAllAsync<ExerciseSetRow>(
      'SELECT * FROM exercise_sets WHERE exercise_id = ? ORDER BY set_number',
      [row.id]
    );
    history.push({
      date: row.workout_date,
      sets: setRows.map(rowToSet),
    });
  }

  return history;
}

export async function getRecentWorkoutCount(
  db: SQLiteDatabase,
  userId: string,
  days: number = 7
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM workouts
     WHERE user_id = ? AND completed_at IS NOT NULL AND date >= ?`,
    [userId, since.toISOString()]
  );
  return row?.count ?? 0;
}

export async function getLoggedExerciseTypes(
  db: SQLiteDatabase,
  userId: string
): Promise<{ exerciseTypeId: string; exerciseName: string; sessionCount: number }[]> {
  const rows = await db.getAllAsync<{
    exercise_type_id: string;
    name: string;
    session_count: number;
  }>(
    `SELECT we.exercise_type_id, et.name, COUNT(DISTINCT w.id) as session_count
     FROM workout_exercises we
     JOIN workouts w ON w.id = we.workout_id
     JOIN exercise_types et ON et.id = we.exercise_type_id
     WHERE w.user_id = ? AND w.completed_at IS NOT NULL
     GROUP BY we.exercise_type_id
     ORDER BY session_count DESC`,
    [userId]
  );
  return rows.map((r) => ({
    exerciseTypeId: r.exercise_type_id,
    exerciseName: r.name,
    sessionCount: r.session_count,
  }));
}
