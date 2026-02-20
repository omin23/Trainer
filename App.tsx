import React, { Suspense } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/services/database/init';
import { DATABASE_NAME } from './src/constants/config';
import { lightTheme } from './src/constants/theme';
import { UserProvider } from './src/context/UserContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingScreen } from './src/components/common/LoadingScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
            <UserProvider>
              <WorkoutProvider>
                <AppNavigator />
              </WorkoutProvider>
            </UserProvider>
          </SQLiteProvider>
        </Suspense>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
