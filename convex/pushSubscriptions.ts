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
    if (!args.endpoint.startsWith("https://") || args.endpoint.length > 2048) {
      throw new Error("Invalid subscription endpoint.");
    }
    if (args.p256dh.length > 256 || args.auth.length > 64) {
      throw new Error("Invalid subscription keys.");
    }

    const user = await getCurrentUserOrThrow(ctx);

    const matches = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .collect();

    const owned = matches.find((s) => s.userId === user._id);
    const now = Date.now();

    if (owned) {
      await ctx.db.patch(owned._id, {
        ...args,
        updatedAt: now,
        lastUsedAt: now,
        isActive: true,
      });

      // Deactivate any stale duplicates.
      await Promise.all(
        matches
          .filter((s) => s._id !== owned._id)
          .map((s) => ctx.db.patch(s._id, { isActive: false, updatedAt: now }))
      );
      return owned._id;
    }

    // If the endpoint exists for another user, only reassign if keys match.
    if (matches.length) {
      const sameKeys = matches.find(
        (s) => s.p256dh === args.p256dh && s.auth === args.auth
      );
      if (sameKeys && sameKeys.userId !== user._id) {
        await ctx.db.patch(sameKeys._id, {
          userId: user._id,
          isActive: true,
          updatedAt: now,
          lastUsedAt: now,
          userAgent: args.userAgent,
        });
        // Deactivate other duplicates for this endpoint.
        await Promise.all(
          matches
            .filter((s) => s._id !== sameKeys._id)
            .map((s) =>
              ctx.db.patch(s._id, { isActive: false, updatedAt: now })
            )
        );
        return sameKeys._id;
      }
      // If keys don't match, do not touch other users' subscriptions.
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
      isActive: true,
      updatedAt: now,
      lastUsedAt: now,
    });

    return subscriptionId;
  },
});

export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_id_and_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .collect();
    return subscriptions.map(({ p256dh, auth, ...rest }) => {
      return rest;
    });
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
