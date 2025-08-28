import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

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

    if (!exercise) throw new Error("Exercise not found");

    if (exercise?.isCustom) {
      const user = await getCurrentUserOrThrow(ctx);

      if (exercise.userId !== user._id) {
        throw new Error("You are not authorised to access this exercise");
      }
    }

    return exercise;
  },
});
