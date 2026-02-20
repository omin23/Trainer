import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgressStackParamList } from '../types/navigation';
import { ProgressDashboardScreen } from '../screens/progress/ProgressDashboardScreen';
import { ExerciseProgressScreen } from '../screens/progress/ExerciseProgressScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
      }}
    >
      <Stack.Screen
        name="ProgressDashboard"
        component={ProgressDashboardScreen}
        options={{ title: 'Progress' }}
      />
      <Stack.Screen
        name="ExerciseProgress"
        component={ExerciseProgressScreen}
        options={({ route }) => ({ title: route.params.exerciseName })}
      />
    </Stack.Navigator>
  );
}
