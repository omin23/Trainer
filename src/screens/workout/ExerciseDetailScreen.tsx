import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Chip, Card, Button, Divider } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseDetailScreenProps } from '../../types/navigation';
import { ExerciseType, ExerciseSet } from '../../types/workout';
import { getExerciseTypeById } from '../../services/database/exerciseDb';
import { getExerciseHistory } from '../../services/database/workoutDb';
import { formatDate, formatWeight } from '../../utils/formatting';
import { useUser } from '../../context/UserContext';
import { findMaxWeight } from '../../utils/calculations';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { COLORS, SPACING } from '../../constants/theme';

export function ExerciseDetailScreen({ route, navigation }: ExerciseDetailScreenProps) {
  const { exerciseTypeId } = route.params;
  const db = useSQLiteContext();
  const { user } = useUser();
  const [exercise, setExercise] = useState<ExerciseType | null>(null);
  const [history, setHistory] = useState<{ date: string; sets: ExerciseSet[] }[]>([]);

  useEffect(() => {
    (async () => {
      const ex = await getExerciseTypeById(db, exerciseTypeId);
      setExercise(ex);
      const hist = await getExerciseHistory(db, exerciseTypeId, 10);
      setHistory(hist);
    })();
  }, [db, exerciseTypeId]);

  if (!exercise) return <LoadingScreen />;

  const weightUnit = user?.preferences.weightUnit ?? 'lbs';

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.name}>
              {exercise.name}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {exercise.description}
            </Text>

            <Text variant="labelLarge" style={styles.sectionLabel}>
              Muscle Groups
            </Text>
            <View style={styles.chips}>
              {exercise.primaryMuscleGroups.map((mg) => (
                <Chip key={mg} style={styles.primaryChip} compact>{mg}</Chip>
              ))}
              {exercise.secondaryMuscleGroups.map((mg) => (
                <Chip key={mg} style={styles.secondaryChip} compact>{mg}</Chip>
              ))}
            </View>

            <Text variant="labelLarge" style={styles.sectionLabel}>
              Equipment
            </Text>
            <View style={styles.chips}>
              {exercise.equipment.length > 0
                ? exercise.equipment.map((eq) => (
                    <Chip key={eq} compact>{eq}</Chip>
                  ))
                : <Text style={styles.muted}>No equipment needed</Text>
              }
            </View>

            {history.length > 0 && (
              <Button
                mode="contained"
                onPress={() =>
                  navigation.getParent()?.navigate('ProgressTab', {
                    screen: 'ExerciseProgress',
                    params: { exerciseTypeId, exerciseName: exercise.name },
                  })
                }
                style={styles.progressButton}
                icon="chart-line"
              >
                View Progress
              </Button>
            )}

            <Divider style={styles.divider} />
            <Text variant="titleMedium" style={styles.historyTitle}>
              Recent History
            </Text>
          </View>
        </View>
      }
      data={history}
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item }) => {
        const maxWeight = findMaxWeight(item.sets);
        return (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.historyDate}>
                {formatDate(item.date)}
              </Text>
              {item.sets
                .filter((s) => s.completed)
                .map((s) => (
                  <Text key={s.id} variant="bodySmall" style={styles.historySet}>
                    Set {s.setNumber}: {s.weight ? formatWeight(s.weight, weightUnit) : '-'} x {s.reps ?? '-'} reps
                  </Text>
                ))}
              {maxWeight && (
                <Text variant="bodySmall" style={styles.maxWeight}>
                  Best: {formatWeight(maxWeight, weightUnit)}
                </Text>
              )}
            </Card.Content>
          </Card>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.emptyHistory}>
          No history yet. Start a workout to track this exercise!
        </Text>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  description: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  primaryChip: {
    backgroundColor: '#EEF2FF',
  },
  secondaryChip: {
    backgroundColor: COLORS.border,
  },
  muted: {
    color: COLORS.textSecondary,
  },
  progressButton: {
    marginTop: SPACING.lg,
  },
  divider: {
    marginTop: SPACING.lg,
  },
  historyTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: SPACING.md,
  },
  historyCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  historyDate: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  historySet: {
    color: COLORS.textSecondary,
  },
  maxWeight: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  emptyHistory: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: SPACING.xl,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
