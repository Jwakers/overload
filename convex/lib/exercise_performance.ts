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

// Recalculate all exercise performance data
export async function recalculateExercisePerformance(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">
) {
  // Get all exercise sets for this user and exercise
  const exerciseSets = await ctx.db
    .query("exerciseSets")
    .withIndex("by_exercise_id_and_user_id", (q) =>
      q.eq("exerciseId", exerciseId).eq("userId", userId)
    )
    .collect();

  // Get existing performance record
  const existingPerformance = await ctx.db
    .query("exercisePerformance")
    .withIndex("by_user_id_and_exercise", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId)
    )
    .first();

  // If no exercise sets remain, clear the performance data
  if (exerciseSets.length === 0) {
    if (existingPerformance) await ctx.db.delete(existingPerformance._id);

    return;
  }

  // Recalculate personal best (handles all sets across all sessions)
  await updatePersonalBest(ctx, userId, exerciseId);

  // Get unique workout session IDs and their completion dates
  const sessionIds = [
    ...new Set(exerciseSets.map((es) => es.workoutSessionId)),
  ];
  const sessions = await Promise.all(
    sessionIds.map((sessionId) => ctx.db.get(sessionId))
  );

  // Find the most recent completed workout session
  const completedSessions = sessions
    .filter((s) => s && s.completedAt !== undefined)
    .sort((a, b) => (b!.completedAt || 0) - (a!.completedAt || 0));

  if (completedSessions.length === 0) {
    // No completed sessions, clear last workout data but keep PB
    if (existingPerformance) {
      await ctx.db.patch(existingPerformance._id, {
        lastWeight: undefined,
        lastWeightUnit: undefined,
        lastReps: undefined,
        lastSets: undefined,
        lastWorkoutDate: undefined,
        lastIsBodyWeight: undefined,
        totalWorkouts: sessionIds.length,
      });
    }
    return;
  }

  // Get the most recent completed session
  const lastSession = completedSessions[0]!;

  // Get exercise sets from the last completed workout
  const lastWorkoutSets = exerciseSets.filter(
    (es) => es.workoutSessionId === lastSession._id
  );

  const allSetsFromLastWorkout = lastWorkoutSets.flatMap((set) => set.sets);
  if (allSetsFromLastWorkout.length === 0) return;

  const bestSetFromLastWorkout = getBestSet(allSetsFromLastWorkout);

  // Update last workout data
  const performanceData = {
    lastWeight: bestSetFromLastWorkout.weight,
    lastWeightUnit: bestSetFromLastWorkout.weightUnit,
    lastReps: bestSetFromLastWorkout.reps,
    lastSets: allSetsFromLastWorkout.length,
    lastWorkoutDate: lastSession.startedAt,
    lastIsBodyWeight: bestSetFromLastWorkout.isBodyWeight,
    totalWorkouts: sessionIds.length,
  };

  if (existingPerformance) {
    await ctx.db.patch(existingPerformance._id, performanceData);
  } else {
    await ctx.db.insert("exercisePerformance", {
      userId,
      exerciseId,
      ...performanceData,
    });
  }
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
