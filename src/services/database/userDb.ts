import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { User, UserPreferences } from '../../types/user';
import { DEFAULT_REST_TIME } from '../../constants/config';

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  weight_unit: string;
  default_rest_time: number;
  theme: string;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at,
    preferences: {
      weightUnit: row.weight_unit as 'kg' | 'lbs',
      defaultRestTime: row.default_rest_time,
      theme: row.theme as 'light' | 'dark' | 'auto',
    },
  };
}

export async function getUser(
  db: SQLiteDatabase,
  userId: string
): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  return row ? rowToUser(row) : null;
}

export async function createUser(
  db: SQLiteDatabase,
  username: string,
  displayName: string
): Promise<User> {
  const id = uuidv4();
  await db.runAsync(
    `INSERT INTO users (id, username, display_name, weight_unit, default_rest_time, theme)
     VALUES (?, ?, ?, 'lbs', ?, 'auto')`,
    [id, username, displayName, DEFAULT_REST_TIME]
  );
  const user = await getUser(db, id);
  return user!;
}

export async function updateUserPreferences(
  db: SQLiteDatabase,
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<void> {
  if (prefs.weightUnit !== undefined) {
    await db.runAsync('UPDATE users SET weight_unit = ? WHERE id = ?', [
      prefs.weightUnit,
      userId,
    ]);
  }
  if (prefs.defaultRestTime !== undefined) {
    await db.runAsync('UPDATE users SET default_rest_time = ? WHERE id = ?', [
      prefs.defaultRestTime,
      userId,
    ]);
  }
  if (prefs.theme !== undefined) {
    await db.runAsync('UPDATE users SET theme = ? WHERE id = ?', [
      prefs.theme,
      userId,
    ]);
  }
}

export async function updateUserProfile(
  db: SQLiteDatabase,
  userId: string,
  data: { username?: string; displayName?: string }
): Promise<void> {
  if (data.username !== undefined) {
    await db.runAsync('UPDATE users SET username = ? WHERE id = ?', [
      data.username,
      userId,
    ]);
  }
  if (data.displayName !== undefined) {
    await db.runAsync('UPDATE users SET display_name = ? WHERE id = ?', [
      data.displayName,
      userId,
    ]);
  }
}

export async function getOrCreateDefaultUser(
  db: SQLiteDatabase
): Promise<User> {
  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users ORDER BY created_at ASC LIMIT 1'
  );
  if (row) return rowToUser(row);
  return createUser(db, 'athlete', 'Athlete');
}
