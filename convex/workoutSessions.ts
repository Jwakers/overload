import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

const createWorkoutSession = async (ctx: MutationCtx, userId: Id<"users">) => {
  const workoutSessionId = await ctx.db.insert("workoutSessions", {
    userId,
    isActive: true,
    startedAt: Date.now(),
  });
  return workoutSessionId;
};

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSessionId = await createWorkoutSession(ctx, user._id);

    return workoutSessionId;
  },
});

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    // Get currently latest active workout session
    // This helps to avoid creating multiple unfinished sessions by accident
    const workoutSession = await ctx.db
      .query("workoutSessions")
      .withIndex("byUserIdAndActive", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .first();

    if (workoutSession) return workoutSession._id;

    const workoutSessionId = await createWorkoutSession(ctx, user._id);

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
