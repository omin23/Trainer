import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Banner } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutHistoryScreenProps } from '../../types/navigation';
import { WorkoutSession } from '../../types/workout';
import { getWorkoutHistory } from '../../services/database/workoutDb';
import { useUser } from '../../context/UserContext';
import { useWorkout } from '../../context/WorkoutContext';
import { WorkoutSummaryCard } from '../../components/workout/WorkoutSummaryCard';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING } from '../../constants/theme';

export function WorkoutHistoryScreen({ navigation }: WorkoutHistoryScreenProps) {
  const db = useSQLiteContext();
  const { user } = useUser();
  const { isWorkoutActive, activeWorkout } = useWorkout();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const { startWorkout } = useWorkout();

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const history = await getWorkoutHistory(db, user.id);
    setWorkouts(history);
  }, [db, user]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleStartWorkout = async () => {
    if (isWorkoutActive) {
      navigation.navigate('ActiveWorkout', { workoutId: activeWorkout?.id });
      return;
    }
    const date = new Date();
    const name = `Workout - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    await startWorkout(name);
    navigation.navigate('ActiveWorkout');
  };

  return (
    <View style={styles.container}>
      {isWorkoutActive && (
        <Banner
          visible
          actions={[
            {
              label: 'Resume',
              onPress: () => navigation.navigate('ActiveWorkout', { workoutId: activeWorkout?.id }),
            },
          ]}
          icon="dumbbell"
        >
          You have an active workout in progress.
        </Banner>
      )}

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutSummaryCard
            workout={item}
            onPress={() =>
              navigation.navigate('ActiveWorkout', { workoutId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="dumbbell"
            title="No workouts yet"
            subtitle="Start your first workout to begin tracking your progress!"
          />
        }
        contentContainerStyle={workouts.length === 0 ? styles.emptyList : styles.list}
      />

      <FAB
        icon="plus"
        label={isWorkoutActive ? 'Resume' : 'Start Workout'}
        onPress={handleStartWorkout}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingTop: SPACING.sm,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});
