/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as exercisePerformance from "../exercisePerformance.js";
import type * as exerciseSets from "../exerciseSets.js";
import type * as exercises from "../exercises.js";
import type * as http from "../http.js";
import type * as lib_exercise_performance from "../lib/exercise_performance.js";
import type * as lib_muscle_groups from "../lib/muscle_groups.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as splits from "../splits.js";
import type * as users from "../users.js";
import type * as workoutSessions from "../workoutSessions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  exercisePerformance: typeof exercisePerformance;
  exerciseSets: typeof exerciseSets;
  exercises: typeof exercises;
  http: typeof http;
  "lib/exercise_performance": typeof lib_exercise_performance;
  "lib/muscle_groups": typeof lib_muscle_groups;
  pushSubscriptions: typeof pushSubscriptions;
  splits: typeof splits;
  users: typeof users;
  workoutSessions: typeof workoutSessions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
