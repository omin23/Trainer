import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, IconButton, Chip } from 'react-native-paper';
import { ExerciseWithSets } from '../../types/workout';
import { SetRow } from './SetRow';
import { COLORS, SPACING } from '../../constants/theme';

interface ExerciseCardProps {
  exercise: ExerciseWithSets;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onUpdateWeight: (setId: string, weight: number) => void;
  onUpdateReps: (setId: string, reps: number) => void;
  onToggleSetCompleted: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
}

export function ExerciseCard({
  exercise,
  onAddSet,
  onRemoveExercise,
  onUpdateWeight,
  onUpdateReps,
  onToggleSetCompleted,
  onDeleteSet,
}: ExerciseCardProps) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.exerciseName}>
              {exercise.exerciseType.name}
            </Text>
            <View style={styles.muscleChips}>
              {exercise.exerciseType.primaryMuscleGroups.map((mg) => (
                <Chip key={mg} compact style={styles.muscleChip} textStyle={styles.muscleChipText}>
                  {mg}
                </Chip>
              ))}
            </View>
          </View>
          <IconButton
            icon="close"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={onRemoveExercise}
          />
        </View>

        <View style={styles.setHeader}>
          <Text style={[styles.setHeaderText, { width: 24 }]}>Set</Text>
          <Text style={[styles.setHeaderText, { flex: 1 }]}>Weight</Text>
          <Text style={[styles.setHeaderText, { width: 20 }]}>{' '}</Text>
          <Text style={[styles.setHeaderText, { flex: 1 }]}>Reps</Text>
          <Text style={[styles.setHeaderText, { width: 80 }]}>{' '}</Text>
        </View>

        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onUpdateWeight={(w) => onUpdateWeight(set.id, w)}
            onUpdateReps={(r) => onUpdateReps(set.id, r)}
            onToggleCompleted={() => onToggleSetCompleted(set.id)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}

        <Button
          mode="text"
          onPress={onAddSet}
          icon="plus"
          compact
          style={styles.addSetButton}
        >
          Add Set
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  muscleChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 24,
  },
  muscleChipText: {
    fontSize: 10,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  setHeaderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addSetButton: {
    marginTop: SPACING.xs,
  },
});
