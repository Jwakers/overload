import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exercises").collect();
    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getExerciseById = query({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const exercise = await ctx.db.get(args.exerciseId);

    if (exercise?.isCustom) {
      const user = await ctx.auth.getUserIdentity();

      if (!user || exercise.userId !== user._id) {
        throw new Error("Unauthorized");
      }
    }

    return exercise;
  },
});
