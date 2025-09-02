import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

const _createWorkoutSession = async (ctx: MutationCtx, userId: Id<"users">) => {
  const workoutSessionId = await ctx.db.insert("workoutSessions", {
    userId,
    isActive: true,
    startedAt: Date.now(),
  });

  return workoutSessionId;
};

const _assertAccess = async (
  ctx: QueryCtx,
  workoutSessionId: Id<"workoutSessions">
) => {
  const user = await getCurrentUserOrThrow(ctx);
  const workoutSession = await ctx.db.get(workoutSessionId);
  if (!workoutSession) throw new Error("Workout session not found");
  if (workoutSession.userId !== user._id)
    throw new Error("You are not allowed to access this workout session");

  return workoutSession;
};

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSessionId = await _createWorkoutSession(ctx, user._id);

    return workoutSessionId;
  },
});

export const getById = query({
  args: {
    id: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const workoutSession = await _assertAccess(ctx, args.id);

    return workoutSession;
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
      .withIndex("by_user_id_and_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .first();

    if (workoutSession)
      return { workoutSessionId: workoutSession._id, resume: true };

    const workoutSessionId = await _createWorkoutSession(ctx, user._id);

    return { workoutSessionId, resume: false };
  },
});

export const getList = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    return workoutSessions;
  },
});

export const getListWithExercises = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const workoutSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const enrichedSessions = await Promise.all(
      workoutSessions.map(async (session) => {
        // Get exercise sets for this workout session
        const exerciseSets = await ctx.db
          .query("exerciseSets")
          .withIndex("by_workout_session_id", (q) =>
            q.eq("workoutSessionId", session._id)
          )
          .collect();

        // Ensure deterministic order in the UI
        exerciseSets.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Get exercise details for each set
        const enrichedSets = await Promise.all(
          exerciseSets.map(async (set) => {
            const exercise = await ctx.db.get(set.exerciseId);
            return {
              ...set,
              exercise,
            };
          })
        );

        // Get split details if available
        let split = null;
        if (session.splitId) {
          split = await ctx.db.get(session.splitId);
        }

        return {
          ...session,
          exerciseSets: enrichedSets,
          split,
        };
      })
    );

    return enrichedSessions;
  },
});

export const setActive = mutation({
  args: {
    workoutSessionId: v.id("workoutSessions"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const workoutSession = await _assertAccess(ctx, args.workoutSessionId);

    await ctx.db.patch(workoutSession._id, { isActive: args.isActive });
  },
});

export const complete = mutation({
  args: {
    workoutSessionId: v.id("workoutSessions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workoutSession = await _assertAccess(ctx, args.workoutSessionId);

    if (args.notes && args.notes.length > 1000) {
      throw new Error("Notes must be less than 1000 characters");
    }

    await ctx.db.patch(workoutSession._id, {
      isActive: false,
      completedAt: Date.now(),
      notes: args.notes,
    });
  },
});

export const deleteWorkoutSession = mutation({
  args: {
    id: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const workoutSession = await _assertAccess(ctx, args.id);

    // Delete all related exercise sets
    const exerciseSets = await ctx.db
      .query("exerciseSets")
      .withIndex("by_workout_session_id", (q) =>
        q.eq("workoutSessionId", args.id)
      )
      .collect();

    await Promise.all(
      exerciseSets.map((exerciseSet) => ctx.db.delete(exerciseSet._id))
    );

    await ctx.db.delete(workoutSession._id);
  },
});

export const updateSplit = mutation({
  args: {
    splitId: v.id("splits"),
    workoutSessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const workoutSession = await _assertAccess(ctx, args.workoutSessionId);
    const split = await ctx.db.get(args.splitId);

    if (!split) throw new Error("Split not found");
    if (split.userId !== workoutSession.userId)
      throw new Error("You are not allowed to update this workout session");

    await ctx.db.patch(workoutSession._id, { splitId: args.splitId });
  },
});
