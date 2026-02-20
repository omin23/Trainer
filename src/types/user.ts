export interface User {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  defaultRestTime: number;
  theme: 'light' | 'dark' | 'auto';
}
