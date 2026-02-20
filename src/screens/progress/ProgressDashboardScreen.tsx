import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { ProgressDashboardScreenProps } from '../../types/navigation';
import { useUser } from '../../context/UserContext';
import { getLoggedExerciseTypes } from '../../services/database/workoutDb';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING } from '../../constants/theme';

export function ProgressDashboardScreen({ navigation }: ProgressDashboardScreenProps) {
  const db = useSQLiteContext();
  const { user } = useUser();
  const [exercises, setExercises] = useState<
    { exerciseTypeId: string; exerciseName: string; sessionCount: number }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        const data = await getLoggedExerciseTypes(db, user.id);
        setExercises(data);
      })();
    }, [db, user])
  );

  return (
    <FlatList
      style={styles.container}
      data={exercises}
      keyExtractor={(item) => item.exerciseTypeId}
      renderItem={({ item }) => (
        <List.Item
          title={item.exerciseName}
          description={`${item.sessionCount} session${item.sessionCount !== 1 ? 's' : ''}`}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            navigation.navigate('ExerciseProgress', {
              exerciseTypeId: item.exerciseTypeId,
              exerciseName: item.exerciseName,
            })
          }
          style={styles.item}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          icon="chart-line"
          title="No progress data yet"
          subtitle="Complete a workout to start tracking your progress."
        />
      }
      contentContainerStyle={exercises.length === 0 ? styles.emptyList : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  item: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
  },
  emptyList: {
    flex: 1,
  },
});
