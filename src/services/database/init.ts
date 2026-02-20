import { type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_V1 } from './schema';
import { DEFAULT_EXERCISES } from '../../constants/exercises';
import { DATABASE_VERSION } from '../../constants/config';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(SCHEMA_V1);

    const stmt = await db.prepareAsync(
      `INSERT OR IGNORE INTO exercise_types
        (id, name, description, primary_muscle_groups, secondary_muscle_groups, category, equipment, is_custom)
       VALUES ($id, $name, $desc, $primary, $secondary, $cat, $equip, 0)`
    );
    try {
      for (const ex of DEFAULT_EXERCISES) {
        await stmt.executeAsync({
          $id: ex.id,
          $name: ex.name,
          $desc: ex.description,
          $primary: JSON.stringify(ex.primaryMuscleGroups),
          $secondary: JSON.stringify(ex.secondaryMuscleGroups),
          $cat: ex.category,
          $equip: JSON.stringify(ex.equipment),
        });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
