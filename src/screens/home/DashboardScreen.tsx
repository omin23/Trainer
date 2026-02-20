import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../types/navigation';
import { WorkoutSession } from '../../types/workout';
import { useUser } from '../../context/UserContext';
import { useWorkout } from '../../context/WorkoutContext';
import {
  getWorkoutHistory,
  getRecentWorkoutCount,
} from '../../services/database/workoutDb';
import { formatRelativeDate, formatDuration } from '../../utils/formatting';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { COLORS, SPACING } from '../../constants/theme';

export function DashboardScreen() {
  const db = useSQLiteContext();
  const { user, loading } = useUser();
  const { isWorkoutActive, startWorkout } = useWorkout();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        const count = await getRecentWorkoutCount(db, user.id, 7);
        setWeeklyCount(count);
        const history = await getWorkoutHistory(db, user.id, 1);
        setLastWorkout(history.length > 0 ? history[0] : null);
      })();
    }, [db, user])
  );

  if (loading || !user) return <LoadingScreen />;

  const handleQuickStart = async () => {
    if (isWorkoutActive) {
      navigation.navigate('WorkoutTab', { screen: 'ActiveWorkout' });
      return;
    }
    const date = new Date();
    const name = `Workout - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    await startWorkout(name);
    navigation.navigate('WorkoutTab', { screen: 'ActiveWorkout' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.greeting}>
        Hey, {user.displayName}!
      </Text>

      {isWorkoutActive && (
        <Card style={styles.activeCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.activeTitle}>
              Workout in Progress
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('WorkoutTab', { screen: 'ActiveWorkout' })}
              style={styles.resumeButton}
            >
              Resume Workout
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleQuickStart}
        icon="dumbbell"
        style={styles.quickStart}
        contentStyle={styles.quickStartContent}
      >
        {isWorkoutActive ? 'Resume Workout' : 'Quick Start Workout'}
      </Button>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            This Week
          </Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {weeklyCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Workouts
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {lastWorkout && (
        <Card
          style={styles.card}
          mode="elevated"
          onPress={() =>
            navigation.navigate('WorkoutTab', {
              screen: 'ActiveWorkout',
              params: { workoutId: lastWorkout.id },
            })
          }
        >
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Last Workout
            </Text>
            <Text variant="bodyLarge" style={styles.lastWorkoutName}>
              {lastWorkout.name}
            </Text>
            <Text variant="bodySmall" style={styles.lastWorkoutDate}>
              {formatRelativeDate(lastWorkout.date)} - {formatDuration(lastWorkout.durationSeconds)}
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  greeting: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  activeCard: {
    backgroundColor: '#EEF2FF',
    marginBottom: SPACING.md,
  },
  activeTitle: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  resumeButton: {
    marginTop: SPACING.sm,
  },
  quickStart: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  quickStartContent: {
    paddingVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
  },
  lastWorkoutName: {
    color: COLORS.textPrimary,
  },
  lastWorkoutDate: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
