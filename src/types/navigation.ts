import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  HomeTab: undefined;
  WorkoutTab: NavigatorScreenParams<WorkoutStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  ProfileTab: undefined;
};

export type WorkoutStackParamList = {
  WorkoutHistory: undefined;
  ActiveWorkout: { workoutId?: string } | undefined;
  ExerciseLibrary: { selectMode?: boolean } | undefined;
  ExerciseDetail: { exerciseTypeId: string };
};

export type ProgressStackParamList = {
  ProgressDashboard: undefined;
  ExerciseProgress: { exerciseTypeId: string; exerciseName: string };
};

export type WorkoutHistoryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>,
  BottomTabScreenProps<TabParamList>
>;

export type ActiveWorkoutScreenProps = NativeStackScreenProps<WorkoutStackParamList, 'ActiveWorkout'>;
export type ExerciseLibraryScreenProps = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseLibrary'>;
export type ExerciseDetailScreenProps = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseDetail'>;
export type ProgressDashboardScreenProps = NativeStackScreenProps<ProgressStackParamList, 'ProgressDashboard'>;
export type ExerciseProgressScreenProps = NativeStackScreenProps<ProgressStackParamList, 'ExerciseProgress'>;
