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

    const matches = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .collect();

    const owned = matches.find((s) => s.userId === user._id);

    if (owned) {
      await ctx.db.patch(owned._id, {
        ...args,
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
        isActive: true,
      });

      // Deactivate any stale duplicates.
      await Promise.all(
        matches
          .filter((s) => s._id !== owned._id)
          .map((s) =>
            ctx.db.patch(s._id, { isActive: false, updatedAt: Date.now() })
          )
      );
      return owned._id;
    }

    // Endpoint exists but is associated with other user(s) — deactivate stale ones.
    if (matches.length) {
      await Promise.all(
        matches.map((s) =>
          ctx.db.patch(s._id, { isActive: false, updatedAt: Date.now() })
        )
      );
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
      .withIndex("by_user_id_and_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();
  },
});

export const deleteSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const matches = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .collect();

    await Promise.all(
      matches
        .filter((s) => s.userId === user._id)
        .map((s) => ctx.db.delete(s._id))
    );
  },
});
