import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { WorkoutSession } from '../../types/workout';
import { formatRelativeDate, formatDuration } from '../../utils/formatting';
import { COLORS, SPACING } from '../../constants/theme';

interface WorkoutSummaryCardProps {
  workout: WorkoutSession & { exerciseCount?: number; totalVolume?: number };
  onPress: () => void;
}

export function WorkoutSummaryCard({ workout, onPress }: WorkoutSummaryCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.name}>
          {workout.name}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          {formatRelativeDate(workout.date)}
        </Text>
        <Card.Content style={styles.chips}>
          <Chip icon="clock-outline" compact style={styles.chip}>
            {formatDuration(workout.durationSeconds)}
          </Chip>
        </Card.Content>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingVertical: SPACING.sm,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  date: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  chips: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingHorizontal: 0,
  },
  chip: {
    marginRight: SPACING.sm,
  },
});
