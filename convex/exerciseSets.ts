import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    workoutSessionId: v.id("workoutSessions"),
    exerciseId: v.id("exercises"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    const exerciseSetId = await ctx.db.insert("exerciseSets", {
      workoutSessionId: args.workoutSessionId,
      exerciseId: args.exerciseId,
      order: args.order,
      sets: [],
    });

    return exerciseSetId;
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
    const exerciseSet = await ctx.db.get(args.exerciseSetId);
    if (!exerciseSet) {
      throw new Error("Exercise set not found");
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
