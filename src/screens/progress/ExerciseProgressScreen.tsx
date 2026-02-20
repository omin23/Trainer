import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseProgressScreenProps } from '../../types/navigation';
import { ExerciseSet } from '../../types/workout';
import { getExerciseHistory } from '../../services/database/workoutDb';
import { WeightProgressChart } from '../../components/charts/WeightProgressChart';
import { useUser } from '../../context/UserContext';
import { formatDate, formatWeight } from '../../utils/formatting';
import { findMaxWeight } from '../../utils/calculations';
import { COLORS, SPACING } from '../../constants/theme';

type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all';

export function ExerciseProgressScreen({ route }: ExerciseProgressScreenProps) {
  const { exerciseTypeId } = route.params;
  const db = useSQLiteContext();
  const { user } = useUser();
  const [history, setHistory] = useState<{ date: string; sets: ExerciseSet[] }[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');

  useEffect(() => {
    (async () => {
      const data = await getExerciseHistory(db, exerciseTypeId, 100);
      setHistory(data);
    })();
  }, [db, exerciseTypeId]);

  const weightUnit = user?.preferences.weightUnit ?? 'lbs';

  const filterByTimeRange = (data: typeof history) => {
    if (timeRange === 'all') return data;
    const now = new Date();
    const months = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[timeRange];
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    return data.filter((d) => new Date(d.date) >= cutoff);
  };

  const filteredHistory = filterByTimeRange(history);

  const chartData = filteredHistory
    .map((h) => {
      const max = findMaxWeight(h.sets);
      return max ? { date: h.date, maxWeight: max } : null;
    })
    .filter((d): d is { date: string; maxWeight: number } => d !== null)
    .reverse();

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View>
          <SegmentedButtons
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as TimeRange)}
            buttons={[
              { value: '1m', label: '1M' },
              { value: '3m', label: '3M' },
              { value: '6m', label: '6M' },
              { value: '1y', label: '1Y' },
              { value: 'all', label: 'All' },
            ]}
            style={styles.timeRange}
          />

          <WeightProgressChart data={chartData} weightUnit={weightUnit} />

          <Text variant="titleMedium" style={styles.historyTitle}>
            Session History
          </Text>
        </View>
      }
      data={filteredHistory}
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item }) => {
        const maxW = findMaxWeight(item.sets);
        return (
          <Card style={styles.sessionCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.sessionDate}>
                {formatDate(item.date)}
              </Text>
              {item.sets
                .filter((s) => s.completed)
                .map((s) => (
                  <Text key={s.id} variant="bodySmall" style={styles.setText}>
                    Set {s.setNumber}: {s.weight ? formatWeight(s.weight, weightUnit) : '-'} x {s.reps ?? '-'}
                  </Text>
                ))}
              {maxW && (
                <Text variant="bodySmall" style={styles.bestText}>
                  Best: {formatWeight(maxW, weightUnit)}
                </Text>
              )}
            </Card.Content>
          </Card>
        );
      }}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timeRange: {
    margin: SPACING.md,
  },
  historyTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sessionCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  sessionDate: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  setText: {
    color: COLORS.textSecondary,
  },
  bestText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
