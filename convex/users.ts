import { UserJSON } from "@clerk/backend";
import { WithoutSystemFields } from "convex/server";
import { v, Validator } from "convex/values";
import { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const user = await userByExternalId(ctx, data.id);
    const userAttributes: WithoutSystemFields<Doc<"users">> = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      preferences: {
        defaultWeightUnit: "lbs",
        defaultRestTime: 60,
        weightTrackingFrequency: "manual",
        ...(user?.preferences ?? {}),
      },
    };
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();
}

export const update = mutation({
  args: {
    bodyWeight: v.optional(v.number()),
    bodyWeightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kg"))),
    lastBodyWeightUpdate: v.optional(v.number()),
    preferences: v.optional(
      v.object({
        defaultWeightUnit: v.union(v.literal("lbs"), v.literal("kg")),
        defaultRestTime: v.optional(v.number()),
        weightTrackingFrequency: v.optional(
          v.union(
            v.literal("weekly"),
            v.literal("monthly"),
            v.literal("manual")
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, {
      ...(args.bodyWeight !== undefined && { bodyWeight: args.bodyWeight }),
      ...(args.bodyWeightUnit !== undefined && {
        bodyWeightUnit: args.bodyWeightUnit,
      }),
      ...(args.lastBodyWeightUpdate !== undefined && {
        lastBodyWeightUpdate: args.lastBodyWeightUpdate,
      }),
      ...(args.preferences && {
        preferences: {
          ...user.preferences,
          ...args.preferences,
        },
      }),
    });
  },
});

export const updatePreferences = mutation({
  args: {
    preferences: v.object({
      defaultWeightUnit: v.union(v.literal("lbs"), v.literal("kg")),
      defaultRestTime: v.optional(v.number()),
      weightTrackingFrequency: v.optional(
        v.union(v.literal("weekly"), v.literal("monthly"), v.literal("manual"))
      ),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, {
      preferences: {
        ...user.preferences,
        ...args.preferences,
      },
    });
  },
});
