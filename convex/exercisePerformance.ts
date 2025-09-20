import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { updateLastWorkoutData } from "./lib/exercise_performance";
import { getCurrentUserOrThrow } from "./users";

export const get = query({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const performance = await ctx.db
      .query("exercisePerformance")
      .withIndex("by_user_id_and_exercise", (q) =>
        q.eq("userId", user._id).eq("exerciseId", args.exerciseId)
      )
      .first();

    return performance;
  },
});

export const updateLastWorkout = internalMutation({
  args: {
    userId: v.id("users"),
    exerciseIds: v.array(v.id("exercises")),
    workoutSessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.exerciseIds.map((exerciseId) =>
        updateLastWorkoutData(
          ctx,
          args.userId,
          exerciseId,
          args.workoutSessionId
        )
      )
    );
  },
});
