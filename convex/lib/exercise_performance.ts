import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export async function updatePersonalBest(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">,
  workoutSessionId: Id<"workoutSessions">
) {
  // Get all exercise sets for this exercise in this workout session
  const exerciseSets = await ctx.db
    .query("exerciseSets")
    .withIndex("by_workout_session_id", (q) =>
      q.eq("workoutSessionId", workoutSessionId)
    )
    .filter((q) => q.eq(q.field("exerciseId"), exerciseId))
    .collect();

  // Calculate performance metrics from all sets
  const allSets = exerciseSets.flatMap((set) => set.sets);
  if (allSets.length === 0) return;

  // Get the workout session to get the date
  const workoutSession = await ctx.db.get(workoutSessionId);
  if (!workoutSession) return;

  const workoutDate = workoutSession.startedAt;

  // Find the best set (highest weight, then highest reps if weights are equal)
  const bestSet = allSets.reduce((best, current) => {
    if (current.weight > best.weight) return current;
    if (current.weight === best.weight && current.reps > best.reps)
      return current;
    return best;
  });

  // Check if this is a new personal best
  const existingPerformance = await ctx.db
    .query("exercisePerformance")
    .withIndex("by_user_id_and_exercise", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId)
    )
    .first();

  let personalBest = existingPerformance?.personalBest;
  const bestWeight = bestSet.weight;
  const bestReps = bestSet.reps;
  const existingBestWeight = personalBest?.weight ?? 0;
  const existingBestReps = personalBest?.reps ?? 0;

  // Update personal best if weight is higher, or if weight is equal and reps are higher
  if (
    bestWeight > existingBestWeight ||
    (bestWeight === existingBestWeight && bestReps > existingBestReps)
  ) {
    personalBest = {
      weight: bestSet.weight,
      reps: bestSet.reps,
      date: workoutDate,
    };

    // Update the performance record with the new personal best
    const performanceData = {
      ...existingPerformance,
      personalBest,
    };

    if (existingPerformance) {
      await ctx.db.patch(existingPerformance._id, performanceData);
    } else {
      // Create new performance record if it doesn't exist
      await ctx.db.insert("exercisePerformance", {
        userId,
        exerciseId,
        personalBest,
        totalWorkouts: 1,
      });
    }
  }
}

// Update last workout data when a workout session is completed
export async function updateLastWorkoutData(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">,
  workoutSessionId: Id<"workoutSessions">
) {
  // Get all exercise sets for this exercise in this workout session
  const exerciseSets = await ctx.db
    .query("exerciseSets")
    .withIndex("by_workout_session_id", (q) =>
      q.eq("workoutSessionId", workoutSessionId)
    )
    .filter((q) => q.eq(q.field("exerciseId"), exerciseId))
    .collect();

  // Calculate performance metrics from all sets
  const allSets = exerciseSets.flatMap((set) => set.sets);
  if (allSets.length === 0) return;

  // Get the workout session to get the date
  const workoutSession = await ctx.db.get(workoutSessionId);
  if (!workoutSession) return;

  const workoutDate = workoutSession.startedAt;

  // Find the best set (highest weight, then highest reps if weights are equal)
  const bestSet = allSets.reduce((best, current) => {
    if (current.weight > best.weight) return current;
    if (current.weight === best.weight && current.reps > best.reps)
      return current;
    return best;
  });

  // Get existing performance record
  const existingPerformance = await ctx.db
    .query("exercisePerformance")
    .withIndex("by_user_id_and_exercise", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId)
    )
    .first();

  // Count total workouts for this exercise
  const allWorkoutSessionsForCount = await ctx.db
    .query("workoutSessions")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .collect();

  const exerciseWorkoutCount = await Promise.all(
    allWorkoutSessionsForCount.map(async (session) => {
      const hasExercise = await ctx.db
        .query("exerciseSets")
        .withIndex("by_workout_session_id", (q) =>
          q.eq("workoutSessionId", session._id)
        )
        .filter((q) => q.eq(q.field("exerciseId"), exerciseId))
        .first();
      return hasExercise ? 1 : 0;
    })
  );

  const totalWorkouts = exerciseWorkoutCount.reduce(
    (sum, count) => sum + count,
    0 as number
  );

  // Update the performance record with the current workout's data as "last workout data"
  const performanceData = {
    userId,
    exerciseId,
    lastWeight: bestSet.weight,
    lastWeightUnit: bestSet.weightUnit,
    lastReps: bestSet.reps,
    lastSets: allSets.length,
    lastWorkoutDate: workoutDate,
    personalBest: existingPerformance?.personalBest, // Keep existing personal best
    totalWorkouts,
  };

  if (existingPerformance) {
    await ctx.db.patch(existingPerformance._id, performanceData);
    return;
  }

  await ctx.db.insert("exercisePerformance", performanceData);
}
