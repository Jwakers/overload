import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { updatePersonalBest } from "./lib/exercise_performance";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    workoutSessionId: v.id("workoutSessions"),
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSession = await ctx.db.get(args.workoutSessionId);
    if (!workoutSession || workoutSession.userId !== user._id) {
      throw new Error(
        "You are not allowed to add exercise sets to this workout session"
      );
    }

    const exercise = await ctx.db.get(args.exerciseId);
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    const previousSets = await ctx.db
      .query("exerciseSets")
      .withIndex("by_workout_session_id", (q) =>
        q.eq("workoutSessionId", args.workoutSessionId)
      )
      .collect();

    const nextOrder =
      Math.max(...(previousSets ?? []).map((s) => s.order ?? 0), 0) + 1;
    const exerciseSetId = await ctx.db.insert("exerciseSets", {
      workoutSessionId: args.workoutSessionId,
      exerciseId: args.exerciseId,
      isActive: true,
      order: nextOrder,
      sets: [],
    });

    return exerciseSetId;
  },
});

export const get = query({
  args: {
    exerciseSetId: v.id("exerciseSets"),
  },
  handler: async (ctx, args) => {
    const exerciseSet = await ctx.db.get(args.exerciseSetId);

    return exerciseSet;
  },
});

export const setActive = mutation({
  args: {
    exerciseSetId: v.id("exerciseSets"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.exerciseSetId, { isActive: args.isActive });
  },
});

export const getSets = query({
  args: {
    workoutSessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const exerciseSets = await ctx.db
      .query("exerciseSets")
      .withIndex("by_workout_session_id", (q) =>
        q.eq("workoutSessionId", args.workoutSessionId)
      )
      .collect();

    // Ensure deterministic order in the UI
    exerciseSets.sort((a, b) => a.order - b.order);

    const enrichedSets = await Promise.all(
      exerciseSets?.map(async (set) => {
        const exercise = await ctx.db.get(set.exerciseId);
        return {
          ...set,
          exercise,
        };
      })
    );

    return enrichedSets;
  },
});

export const addSet = mutation({
  args: {
    exerciseSetId: v.id("exerciseSets"),
    weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
    set: v.object({
      weight: v.number(),
      reps: v.number(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { exerciseSet, workoutSession } = await assertAccess(
      ctx,
      args.exerciseSetId
    );

    // Basic validation
    if (!Number.isFinite(args.set.weight) || args.set.weight < 0) {
      throw new Error("Weight must be a non-negative number");
    }
    if (!Number.isFinite(args.set.reps) || args.set.reps < 1) {
      throw new Error("Reps must be at least 1");
    }
    if (args.set.notes && args.set.notes.length > 255) {
      throw new Error("Notes must be no more than 255 characters");
    }

    const set: Doc<"exerciseSets">["sets"][number] = {
      id: crypto.randomUUID(),
      weight: args.set.weight,
      reps: args.set.reps,
      notes: args.set.notes,
      weightUnit: args.weightUnit,
      isBodyWeight: false,
    };

    await ctx.db.patch(args.exerciseSetId, {
      sets: [...exerciseSet.sets, set],
    });

    // Update personal best if this set is a new PB
    await updatePersonalBest(
      ctx,
      workoutSession.userId,
      exerciseSet.exerciseId,
      exerciseSet.workoutSessionId
    );
  },
});

export const deleteExerciseSet = mutation({
  args: {
    exerciseSetId: v.id("exerciseSets"),
  },
  handler: async (ctx, args) => {
    const { exerciseSet, workoutSession } = await assertAccess(
      ctx,
      args.exerciseSetId
    );

    await ctx.db.delete(args.exerciseSetId);

    await updatePersonalBest(
      ctx,
      workoutSession.userId,
      exerciseSet.exerciseId,
      exerciseSet.workoutSessionId
    );
  },
});

export const deleteSet = mutation({
  args: {
    exerciseSetId: v.id("exerciseSets"),
    setId: v.string(),
  },
  handler: async (ctx, args) => {
    const { exerciseSet, workoutSession } = await assertAccess(
      ctx,
      args.exerciseSetId
    );

    await ctx.db.patch(args.exerciseSetId, {
      sets: exerciseSet.sets.filter((set) => set.id !== args.setId),
    });

    await updatePersonalBest(
      ctx,
      workoutSession.userId,
      exerciseSet.exerciseId,
      exerciseSet.workoutSessionId
    );
  },
});

async function assertAccess(
  ctx: MutationCtx,
  exerciseSetId: Id<"exerciseSets">
) {
  const user = await getCurrentUserOrThrow(ctx);
  const exerciseSet = await ctx.db.get(exerciseSetId);
  if (!exerciseSet) {
    throw new Error("Exercise set not found");
  }
  const workoutSession = await ctx.db.get(exerciseSet.workoutSessionId);
  if (!workoutSession || workoutSession.userId !== user._id) {
    throw new Error("You are not authorised to edit this data");
  }

  return {
    exerciseSet,
    workoutSession,
  };
}
