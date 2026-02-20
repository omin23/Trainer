import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';
import { ExerciseSet } from '../../types/workout';
import { COLORS, SPACING } from '../../constants/theme';

interface SetRowProps {
  set: ExerciseSet;
  onUpdateWeight: (weight: number) => void;
  onUpdateReps: (reps: number) => void;
  onToggleCompleted: () => void;
  onDelete: () => void;
}

export function SetRow({
  set,
  onUpdateWeight,
  onUpdateReps,
  onToggleCompleted,
  onDelete,
}: SetRowProps) {
  const [weightText, setWeightText] = useState(
    set.weight != null ? String(set.weight) : ''
  );
  const [repsText, setRepsText] = useState(
    set.reps != null ? String(set.reps) : ''
  );

  useEffect(() => {
    setWeightText(set.weight != null ? String(set.weight) : '');
    setRepsText(set.reps != null ? String(set.reps) : '');
  }, [set.weight, set.reps]);

  const handleWeightBlur = () => {
    const val = parseFloat(weightText);
    if (!isNaN(val) && val >= 0) onUpdateWeight(val);
  };

  const handleRepsBlur = () => {
    const val = parseInt(repsText, 10);
    if (!isNaN(val) && val >= 0) onUpdateReps(val);
  };

  return (
    <View style={[styles.container, set.completed && styles.completed]}>
      <Text variant="bodyMedium" style={styles.setNumber}>
        {set.setNumber}
      </Text>
      <TextInput
        value={weightText}
        onChangeText={setWeightText}
        onBlur={handleWeightBlur}
        keyboardType="decimal-pad"
        mode="outlined"
        placeholder="0"
        dense
        style={styles.input}
        contentStyle={styles.inputContent}
      />
      <Text style={styles.separator}>x</Text>
      <TextInput
        value={repsText}
        onChangeText={setRepsText}
        onBlur={handleRepsBlur}
        keyboardType="number-pad"
        mode="outlined"
        placeholder="0"
        dense
        style={styles.input}
        contentStyle={styles.inputContent}
      />
      <IconButton
        icon={set.completed ? 'check-circle' : 'check-circle-outline'}
        iconColor={set.completed ? COLORS.secondary : COLORS.textSecondary}
        size={24}
        onPress={onToggleCompleted}
      />
      <IconButton
        icon="delete-outline"
        iconColor={COLORS.textSecondary}
        size={20}
        onPress={onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  completed: {
    backgroundColor: '#F0FDF4',
  },
  setNumber: {
    width: 24,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    height: 36,
    backgroundColor: COLORS.surface,
  },
  inputContent: {
    textAlign: 'center',
    fontSize: 14,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
