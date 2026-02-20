import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Appbar } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { ActiveWorkoutScreenProps } from '../../types/navigation';
import { WorkoutWithExercises } from '../../types/workout';
import { getWorkoutById } from '../../services/database/workoutDb';
import { useWorkout } from '../../context/WorkoutContext';
import { useUser } from '../../context/UserContext';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimerSheet } from '../../components/workout/RestTimerSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDuration } from '../../utils/formatting';
import { COLORS, SPACING } from '../../constants/theme';

export function ActiveWorkoutScreen({ route, navigation }: ActiveWorkoutScreenProps) {
  const viewWorkoutId = route.params?.workoutId;
  const db = useSQLiteContext();
  const { user } = useUser();
  const {
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    addNewSet,
    updateSetData,
    deleteSetById,
    toggleSetComplete,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();
  const [showTimer, setShowTimer] = useState(false);
  const [viewOnlyWorkout, setViewOnlyWorkout] = useState<WorkoutWithExercises | null>(null);

  const isViewMode = viewWorkoutId && (!activeWorkout || viewWorkoutId !== activeWorkout.id);

  useEffect(() => {
    if (isViewMode && viewWorkoutId) {
      (async () => {
        const w = await getWorkoutById(db, viewWorkoutId);
        setViewOnlyWorkout(w);
      })();
    }
  }, [db, viewWorkoutId, isViewMode]);

  const workout = isViewMode ? viewOnlyWorkout : activeWorkout;
  const defaultRestTime = user?.preferences.defaultRestTime ?? 90;

  if (!workout) {
    return (
      <EmptyState
        icon="dumbbell"
        title="No active workout"
        subtitle="Start a workout from the workout history screen."
        actionLabel="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const handleFinish = () => {
    Alert.alert(
      'Finish Workout',
      `Complete "${workout.name}" (${formatDuration(elapsedTime)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            await finishWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Workout',
      'This will delete all data for this workout. Are you sure?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: async () => {
            await cancelWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSetCompleted = async (setId: string) => {
    const completed = await toggleSetComplete(setId);
    if (completed) setShowTimer(true);
  };

  return (
    <View style={styles.container}>
      {!isViewMode && (
        <View style={styles.topBar}>
          <Text variant="titleMedium" style={styles.workoutName}>
            {workout.name}
          </Text>
          <Text variant="bodyMedium" style={styles.timer}>
            {formatDuration(elapsedTime)}
          </Text>
        </View>
      )}

      {isViewMode && (
        <View style={styles.topBar}>
          <Text variant="titleMedium" style={styles.workoutName}>
            {workout.name}
          </Text>
          <Text variant="bodySmall" style={styles.timer}>
            Duration: {formatDuration(workout.durationSeconds)}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {workout.exercises.length === 0 ? (
          <EmptyState
            icon="playlist-plus"
            title="No exercises yet"
            subtitle="Add an exercise to get started"
          />
        ) : (
          workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onAddSet={() => addNewSet(exercise.id)}
              onRemoveExercise={() => removeExercise(exercise.id)}
              onUpdateWeight={(setId, weight) =>
                updateSetData(setId, { weight })
              }
              onUpdateReps={(setId, reps) =>
                updateSetData(setId, { reps })
              }
              onToggleSetCompleted={handleSetCompleted}
              onDeleteSet={(setId) => deleteSetById(setId)}
            />
          ))
        )}
      </ScrollView>

      {!isViewMode && (
        <View style={styles.bottomBar}>
          <Button
            mode="outlined"
            onPress={() =>
              navigation.navigate('ExerciseLibrary', { selectMode: true })
            }
            icon="plus"
            style={styles.addButton}
          >
            Add Exercise
          </Button>
          <View style={styles.bottomActions}>
            <Button
              mode="text"
              onPress={() => setShowTimer(true)}
              icon="timer-outline"
              compact
            >
              Timer
            </Button>
            <Button
              mode="text"
              onPress={handleCancel}
              textColor={COLORS.error}
              compact
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleFinish}
              icon="check"
              compact
            >
              Finish
            </Button>
          </View>
        </View>
      )}

      {isViewMode && (
        <View style={styles.bottomBar}>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Back
          </Button>
        </View>
      )}

      <RestTimerSheet
        visible={showTimer}
        defaultTime={defaultRestTime}
        onDismiss={() => setShowTimer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workoutName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    flex: 1,
  },
  timer: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  bottomBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addButton: {
    marginBottom: SPACING.sm,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
