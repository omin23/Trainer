import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { User, UserPreferences } from '../types/user';
import {
  getOrCreateDefaultUser,
  updateUserPreferences,
  updateUserProfile,
  getUser,
} from '../services/database/userDb';

interface UserContextType {
  user: User | null;
  loading: boolean;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  updateProfile: (data: { username?: string; displayName?: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  updatePreferences: async () => {},
  updateProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getOrCreateDefaultUser(db);
      setUser(u);
      setLoading(false);
    })();
  }, [db]);

  const handleUpdatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!user) return;
      await updateUserPreferences(db, user.id, prefs);
      const updated = await getUser(db, user.id);
      if (updated) setUser(updated);
    },
    [db, user]
  );

  const handleUpdateProfile = useCallback(
    async (data: { username?: string; displayName?: string }) => {
      if (!user) return;
      await updateUserProfile(db, user.id, data);
      const updated = await getUser(db, user.id);
      if (updated) setUser(updated);
    },
    [db, user]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updatePreferences: handleUpdatePreferences,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
