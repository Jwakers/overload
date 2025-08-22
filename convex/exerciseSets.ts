import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
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
      .withIndex("byWorkoutSessionId", (q) =>
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
      .withIndex("byWorkoutSessionId", (q) =>
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
    const user = await getCurrentUserOrThrow(ctx);
    const exerciseSet = await ctx.db.get(args.exerciseSetId);
    if (!exerciseSet) {
      throw new Error("Exercise set not found");
    }
    const workoutSession = await ctx.db.get(exerciseSet.workoutSessionId);
    if (!workoutSession || workoutSession.userId !== user._id) {
      throw new Error("You are not allowed to modify this exercise set");
    }
    // Basic validation
    if (!Number.isFinite(args.set.weight) || args.set.weight < 0) {
      throw new Error("Weight must be a non-negative number");
    }
    if (!Number.isFinite(args.set.reps) || args.set.reps < 1) {
      throw new Error("Reps must be at least 1");
    }

    const set: Doc<"exerciseSets">["sets"][number] = {
      weight: args.set.weight,
      reps: args.set.reps,
      notes: args.set.notes,
      weightUnit: args.weightUnit,
      isBodyWeight: false,
    };

    await ctx.db.patch(args.exerciseSetId, {
      sets: [...exerciseSet.sets, set],
    });
  },
});
