// convex/pushSubscriptions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const createSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    // Check if subscription already exists
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing && existing.userId === user._id) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
        isActive: true,
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
      isActive: true,
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
    });

    return subscriptionId;
  },
});

export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const deleteSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Find subscription by endpoint
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing && existing.userId === user._id) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { success: false, error: "Subscription not found" };
  },
});

// updateLastUsed mutation removed - not needed for server actions approach
