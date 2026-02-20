import { ExerciseSet, ExerciseWithSets } from '../types/workout';

export function calculateSetVolume(set: ExerciseSet): number {
  if (!set.completed || !set.weight || !set.reps) return 0;
  return set.weight * set.reps;
}

export function calculateExerciseVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => total + calculateSetVolume(set), 0);
}

export function calculateWorkoutVolume(exercises: ExerciseWithSets[]): number {
  return exercises.reduce(
    (total, ex) => total + calculateExerciseVolume(ex.sets),
    0
  );
}

export function findMaxWeight(sets: ExerciseSet[]): number | null {
  const completedSets = sets.filter((s) => s.completed && s.weight);
  if (completedSets.length === 0) return null;
  return Math.max(...completedSets.map((s) => s.weight!));
}

export function countCompletedSets(sets: ExerciseSet[]): number {
  return sets.filter((s) => s.completed).length;
}
