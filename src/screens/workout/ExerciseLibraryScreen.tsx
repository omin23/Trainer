import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Text, Chip } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseLibraryScreenProps } from '../../types/navigation';
import { ExerciseType } from '../../types/workout';
import {
  getAllExerciseTypes,
  searchExerciseTypes,
  getExerciseTypesByMuscleGroup,
} from '../../services/database/exerciseDb';
import { useWorkout } from '../../context/WorkoutContext';
import { MUSCLE_GROUPS } from '../../constants/muscleGroups';
import { COLORS, SPACING } from '../../constants/theme';

export function ExerciseLibraryScreen({ route, navigation }: ExerciseLibraryScreenProps) {
  const selectMode = route.params?.selectMode ?? false;
  const db = useSQLiteContext();
  const { addExercise } = useWorkout();
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    let results: ExerciseType[];
    if (search.trim()) {
      results = await searchExerciseTypes(db, search.trim());
    } else if (selectedMuscle) {
      results = await getExerciseTypesByMuscleGroup(db, selectedMuscle);
    } else {
      results = await getAllExerciseTypes(db);
    }
    setExercises(results);
  }, [db, search, selectedMuscle]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleSelect = async (exercise: ExerciseType) => {
    if (selectMode) {
      await addExercise(exercise.id);
      navigation.goBack();
    } else {
      navigation.navigate('ExerciseDetail', { exerciseTypeId: exercise.id });
    }
  };

  const toggleMuscle = (muscleId: string) => {
    setSelectedMuscle((prev) => (prev === muscleId ? null : muscleId));
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search exercises..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setSelectedMuscle(null);
        }}
        style={styles.searchbar}
      />

      <FlatList
        horizontal
        data={MUSCLE_GROUPS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={styles.chipContent}
        renderItem={({ item }) => (
          <Chip
            selected={selectedMuscle === item.id}
            onPress={() => toggleMuscle(item.id)}
            style={styles.chip}
            compact
          >
            {item.displayName}
          </Chip>
        )}
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.exerciseCard}
            onPress={() => handleSelect(item)}
            mode="elevated"
          >
            <Card.Content>
              <Text variant="titleSmall" style={styles.exerciseName}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.exerciseDesc} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.tags}>
                {item.primaryMuscleGroups.map((mg) => (
                  <Chip key={mg} compact style={styles.tagChip} textStyle={styles.tagText}>
                    {mg}
                  </Chip>
                ))}
                {item.equipment.map((eq) => (
                  <Chip key={eq} compact style={styles.equipChip} textStyle={styles.tagText}>
                    {eq}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchbar: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  chipList: {
    maxHeight: 44,
  },
  chipContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  chip: {
    marginRight: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  exerciseCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  exerciseDesc: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  tagChip: {
    height: 24,
  },
  equipChip: {
    height: 24,
    backgroundColor: COLORS.border,
  },
  tagText: {
    fontSize: 10,
  },
});
