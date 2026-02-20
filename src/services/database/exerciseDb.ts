import { type SQLiteDatabase } from 'expo-sqlite';
import { ExerciseType } from '../../types/workout';

interface ExerciseTypeRow {
  id: string;
  name: string;
  description: string;
  primary_muscle_groups: string;
  secondary_muscle_groups: string;
  category: string;
  equipment: string;
  is_custom: number;
}

function rowToExerciseType(row: ExerciseTypeRow): ExerciseType {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    primaryMuscleGroups: JSON.parse(row.primary_muscle_groups),
    secondaryMuscleGroups: JSON.parse(row.secondary_muscle_groups),
    category: row.category as ExerciseType['category'],
    equipment: JSON.parse(row.equipment),
    isCustom: row.is_custom === 1,
  };
}

export async function getAllExerciseTypes(
  db: SQLiteDatabase
): Promise<ExerciseType[]> {
  const rows = await db.getAllAsync<ExerciseTypeRow>(
    'SELECT * FROM exercise_types ORDER BY name'
  );
  return rows.map(rowToExerciseType);
}

export async function getExerciseTypeById(
  db: SQLiteDatabase,
  id: string
): Promise<ExerciseType | null> {
  const row = await db.getFirstAsync<ExerciseTypeRow>(
    'SELECT * FROM exercise_types WHERE id = ?',
    [id]
  );
  return row ? rowToExerciseType(row) : null;
}

export async function getExerciseTypesByCategory(
  db: SQLiteDatabase,
  category: string
): Promise<ExerciseType[]> {
  const rows = await db.getAllAsync<ExerciseTypeRow>(
    'SELECT * FROM exercise_types WHERE category = ? ORDER BY name',
    [category]
  );
  return rows.map(rowToExerciseType);
}

export async function getExerciseTypesByMuscleGroup(
  db: SQLiteDatabase,
  muscleGroupId: string
): Promise<ExerciseType[]> {
  const rows = await db.getAllAsync<ExerciseTypeRow>(
    `SELECT * FROM exercise_types
     WHERE primary_muscle_groups LIKE ?
     ORDER BY name`,
    [`%"${muscleGroupId}"%`]
  );
  return rows.map(rowToExerciseType);
}

export async function searchExerciseTypes(
  db: SQLiteDatabase,
  query: string
): Promise<ExerciseType[]> {
  const rows = await db.getAllAsync<ExerciseTypeRow>(
    'SELECT * FROM exercise_types WHERE name LIKE ? ORDER BY name',
    [`%${query}%`]
  );
  return rows.map(rowToExerciseType);
}
