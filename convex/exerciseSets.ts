import { v } from "convex/values";
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
