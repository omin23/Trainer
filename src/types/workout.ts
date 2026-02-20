export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  name: string;
  notes?: string;
  durationSeconds: number;
  completedAt?: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseTypeId: string;
  notes?: string;
  order: number;
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
}

export interface ExerciseType {
  id: string;
  name: string;
  description: string;
  primaryMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  category: 'strength' | 'cardio' | 'flexibility';
  equipment: string[];
  isCustom: boolean;
}

export interface MuscleGroup {
  id: string;
  name: string;
  displayName: string;
}

export interface WorkoutWithExercises extends WorkoutSession {
  exercises: ExerciseWithSets[];
}

export interface ExerciseWithSets extends WorkoutExercise {
  exerciseType: ExerciseType;
  sets: ExerciseSet[];
}
