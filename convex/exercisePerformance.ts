import { v } from "convex/values";
import { query } from "./_generated/server";
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
