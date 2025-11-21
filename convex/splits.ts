import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

const _assertAccess = async (ctx: QueryCtx, splitId: Id<"splits">) => {
  const user = await getCurrentUserOrThrow(ctx);
  const split = await ctx.db.get(splitId);
  if (!split) throw new Error("Split not found");
  if (split.userId !== user._id)
    throw new Error("You are not allowed to access this split");

  return split;
};

export const getSplits = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const splits = await ctx.db
      .query("splits")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    // Deterministic order (most recent first)
    splits.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    const enrichedSplits = await Promise.all(
      splits.map(async (split) => {
        const exercises = await Promise.all(
          split.exercises?.map((exerciseId) => ctx.db.get(exerciseId))
        );
        return { ...split, exercises: exercises.filter((e) => e !== null) };
      })
    );
    return enrichedSplits;
  },
});

export const getSplitById = query({
  args: {
    id: v.id("splits"),
  },
  handler: async (ctx, args) => {
    const split = await _assertAccess(ctx, args.id);

    const exercises = await Promise.all(
      split.exercises?.map((exerciseId) => {
        return ctx.db.get(exerciseId);
      })
    );

    return { ...split, exercises: exercises.filter((e) => e !== null) };
  },
});

export const createSplit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(v.id("exercises")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (args.name.length < 3 || args.name.length > 50) {
      throw new Error("Name must be between 3 and 50 characters");
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description must be less than 500 characters");
    }

    const splitId = await ctx.db.insert("splits", {
      userId: user._id,
      name: args.name,
      description: args.description,
      exercises: args.exercises,
      updatedAt: Date.now(),
    });

    return splitId;
  },
});

export const addExercisesToSplit = mutation({
  args: {
    splitId: v.id("splits"),
    exerciseIds: v.array(v.id("exercises")),
  },
  handler: async (ctx, args) => {
    const split = await _assertAccess(ctx, args.splitId);

    const exerciseIds = [...new Set([...split.exercises, ...args.exerciseIds])];

    await ctx.db.patch(split._id, {
      exercises: exerciseIds,
      updatedAt: Date.now(),
    });

    return split._id;
  },
});

/**
 * Migration: Remove deprecated isActive field from all splits
 * This is an internal mutation that can be called once to clean up existing data
 */
export const migrateRemoveIsActive = internalMutation({
  args: {},
  handler: async (ctx) => {
    const splits = await ctx.db.query("splits").collect();
    let updated = 0;

    for (const split of splits) {
      if ("isActive" in split) {
        await ctx.db.patch(split._id, {
          isActive: undefined,
        });
        updated++;
      }
    }

    return { total: splits.length, updated };
  },
});
