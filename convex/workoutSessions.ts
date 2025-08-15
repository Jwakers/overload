import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSessionId = await ctx.db.insert("workoutSessions", {
      userId: user._id,
      isActive: true,
      startedAt: Date.now(),
    });

    return workoutSessionId;
  },
});

export const deleteWorkoutSession = mutation({
  args: {
    id: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSession = await ctx.db.get(args.id);

    if (workoutSession?.userId !== user._id) {
      throw new Error("You are not allowed to delete this workout session");
    }

    await ctx.db.delete(workoutSession._id);
  },
});
