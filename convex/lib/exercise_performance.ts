import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export async function updatePersonalBest(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">
) {
  // Recompute PB across ALL sessions for this user/exercise
  const exerciseSets = await ctx.db
    .query("exerciseSets")
    .withIndex("by_exercise_id_and_user_id", (q) =>
      q.eq("exerciseId", exerciseId).eq("userId", userId)
    )
    .collect();

  // Calculate performance metrics from all sets, keeping session linkage
  const allSets = exerciseSets.flatMap((es) =>
    es.sets.map((s) => ({ ...s, _sessionId: es.workoutSessionId }))
  );

  const totalWorkouts = new Set(exerciseSets.map((es) => es.workoutSessionId))
    .size;

  // No sets at all: clear PB if it exists and keep counts coherent
  if (allSets.length === 0) {
    const existingPerformance = await ctx.db
      .query("exercisePerformance")
      .withIndex("by_user_id_and_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", exerciseId)
      )
      .first();

    if (existingPerformance) {
      await ctx.db.patch(existingPerformance._id, {
        personalBest: undefined,
        totalWorkouts,
      });
    }
    return;
  }

  const bestSet = getBestSet(allSets) as (typeof allSets)[number];

  // Resolve workout date from the session that contains the PB set
  const bestSession = await ctx.db.get(bestSet._sessionId);
  if (!bestSession) return;
  const workoutDate = bestSession.startedAt;

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
  let isNewPersonalBest =
    bestWeight > existingBestWeight ||
    (bestWeight === existingBestWeight && bestReps > existingBestReps);

  if (bestSet.isBodyWeight) {
    isNewPersonalBest = bestReps > existingBestReps;
  }

  if (isNewPersonalBest) {
    personalBest = {
      weight: bestSet.weight,
      weightUnit: bestSet.weightUnit,
      isBodyWeight: bestSet.isBodyWeight,
      reps: bestSet.reps,
      date: workoutDate,
    };

    if (existingPerformance) {
      await ctx.db.patch(existingPerformance._id, {
        personalBest,
        totalWorkouts,
      });
    } else {
      // Create new performance record if it doesn't exist
      await ctx.db.insert("exercisePerformance", {
        userId,
        exerciseId,
        personalBest,
        totalWorkouts,
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
    .withIndex("by_workout_session_id_and_exercise_id", (q) =>
      q.eq("workoutSessionId", workoutSessionId).eq("exerciseId", exerciseId)
    )
    .collect();

  // Calculate performance metrics from all sets
  const allSets = exerciseSets.flatMap((set) => set.sets);
  if (allSets.length === 0) return;

  // Get the workout session to get the date
  const workoutSession = await ctx.db.get(workoutSessionId);
  if (!workoutSession) return;

  const workoutDate = workoutSession.startedAt;
  const bestSet = getBestSet(allSets);

  // Get existing performance record
  const existingPerformance = await ctx.db
    .query("exercisePerformance")
    .withIndex("by_user_id_and_exercise", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId)
    )
    .first();

  // Count total workouts for this exercise by getting all exercise sets for this exercise
  // and extracting unique workout session IDs
  const allExerciseSetsForExercise = await ctx.db
    .query("exerciseSets")
    .withIndex("by_exercise_id_and_user_id", (q) =>
      q.eq("exerciseId", exerciseId).eq("userId", userId)
    )
    .collect();

  const totalWorkouts = new Set(allExerciseSetsForExercise.filter(Boolean))
    .size;

  // Update the performance record with the current workout's data as "last workout data"
  const performanceData = {
    userId,
    exerciseId,
    lastWeight: bestSet.weight,
    lastWeightUnit: bestSet.weightUnit,
    lastReps: bestSet.reps,
    lastSets: allSets.length,
    lastWorkoutDate: workoutDate,
    lastIsBodyWeight: bestSet.isBodyWeight,
    totalWorkouts,
  };

  if (existingPerformance) {
    await ctx.db.patch(existingPerformance._id, performanceData);
    return;
  }

  await ctx.db.insert("exercisePerformance", performanceData);
}

function getBestSet(
  sets: (Doc<"exerciseSets">["sets"][number] & {
    _sessionId?: Id<"workoutSessions">;
  })[]
) {
  const cmp = (a: (typeof sets)[number], b: (typeof sets)[number]) => {
    if (a.isBodyWeight || b.isBodyWeight) {
      if (a.reps !== b.reps) return a.reps - b.reps;
      return a.weight - b.weight;
    }
    if (a.weight !== b.weight) return a.weight - b.weight;
    return a.reps - b.reps;
  };
  const bestSet = sets.reduce(
    (best, cur) => (cmp(cur, best) > 0 ? cur : best),
    sets[0]
  );
  return bestSet;
}
