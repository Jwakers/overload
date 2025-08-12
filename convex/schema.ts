import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(),
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
  }).index("byExternalId", ["externalId"]),

  bodyWeightHistory: defineTable({
    userId: v.id("users"),
    weight: v.number(),
    weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
    recordedAt: v.number(),
    note: v.optional(v.string()),
    source: v.optional(
      v.union(v.literal("manual"), v.literal("prompted"), v.literal("workout"))
    ),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndDate", ["userId", "recordedAt"]),

  splits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    exercises: v.array(v.id("exercises")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byUserId", ["userId"]),

  exercises: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    muscleGroups: v.array(v.string()),
    isCustom: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byMuscleGroups", ["muscleGroups"]),

  workoutSessions: defineTable({
    userId: v.id("users"),
    splitId: v.optional(v.id("splits")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndActive", ["userId", "isActive"]),

  exerciseSets: defineTable({
    workoutSessionId: v.id("workoutSessions"),
    exerciseId: v.id("exercises"),
    order: v.number(),
    weight: v.number(),
    weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
    isBodyWeight: v.boolean(),
    sets: v.array(
      v.object({
        reps: v.number(),
        weight: v.number(),
        weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
        isBodyWeight: v.boolean(),
        restTime: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  })
    .index("byWorkoutSessionId", ["workoutSessionId"])
    .index("byExerciseId", ["exerciseId"]),

  exercisePerformance: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    lastWeight: v.number(),
    lastWeightUnit: v.union(v.literal("lbs"), v.literal("kg")),
    lastReps: v.number(),
    lastSets: v.number(),
    lastWorkoutDate: v.number(),
    personalBest: v.optional(
      v.object({
        weight: v.number(),
        reps: v.number(),
        date: v.number(),
      })
    ),
    totalWorkouts: v.number(),
  })
    .index("byUserIdAndExercise", ["userId", "exerciseId"])
    .index("byUserId", ["userId"]),
});
