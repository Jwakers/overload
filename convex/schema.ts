import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { getAllMuscleGroups } from "./lib/muscle_groups";

const ALL_MUSCLE_GROUPS = getAllMuscleGroups().map((group) => v.literal(group));

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
  }).index("by_external_id", ["externalId"]),

  bodyWeightHistory: defineTable({
    userId: v.id("users"),
    weight: v.number(),
    weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
    recordedAt: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_date", ["userId", "recordedAt"]),

  splits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(v.id("exercises")),
    isActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  exercises: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    muscleGroups: v.array(v.union(...ALL_MUSCLE_GROUPS)),
    equipment: v.optional(
      v.union(
        v.literal("cable"),
        v.literal("machine"),
        v.literal("barbell"),
        v.literal("kettlebell"),
        v.literal("bodyweight"),
        v.literal("dumbbell"),
        v.literal("plate"),
        v.literal("medicine ball"),
        v.literal("jump rope"),
        v.literal("resistance band"),
        v.literal("trx"),
        v.literal("other")
      )
    ),
    isCustom: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_muscle_groups", ["muscleGroups"])
    .index("by_equipment", ["equipment"]),

  workoutSessions: defineTable({
    userId: v.id("users"),
    splitId: v.optional(v.id("splits")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_active", ["userId", "isActive"]),

  exerciseSets: defineTable({
    userId: v.id("users"),
    workoutSessionId: v.id("workoutSessions"),
    exerciseId: v.id("exercises"),
    order: v.number(),
    isActive: v.boolean(),
    sets: v.array(
      v.object({
        id: v.string(),
        reps: v.number(),
        weight: v.number(),
        weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
        isBodyWeight: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
  })
    .index("by_workout_session_id", ["workoutSessionId"])
    .index("by_exercise_id", ["exerciseId"])
    .index("by_exercise_id_and_user_id", ["exerciseId", "userId"]),

  exercisePerformance: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    lastWeight: v.optional(v.number()),
    lastWeightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kg"))),
    lastReps: v.optional(v.number()),
    lastSets: v.optional(v.number()),
    lastWorkoutDate: v.optional(v.number()),
    personalBest: v.optional(
      v.object({
        weight: v.number(),
        weightUnit: v.union(v.literal("lbs"), v.literal("kg")),
        reps: v.number(),
        date: v.number(),
      })
    ),
    totalWorkouts: v.number(),
  })
    .index("by_user_id_and_exercise", ["userId", "exerciseId"])
    .index("by_user_id", ["userId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
    isActive: v.boolean(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_endpoint", ["endpoint"])
    .index("by_user_id_and_active", ["userId", "isActive"]),
});
