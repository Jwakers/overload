"use client";

import { api } from "@/convex/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";

function DashboardContent() {
  const workoutSessions = useQuery(api.workoutSessions.getListWithExercises);

  if (!workoutSessions) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  const completedWorkouts = workoutSessions.filter(
    (session) => !session.isActive
  );

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>

      {completedWorkouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600">
            No completed workouts yet. Start your fitness journey!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Previous Workouts
          </h2>
          {completedWorkouts.map((workout) => (
            <div key={workout._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {workout.split?.name || "Workout"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {workout.completedAt &&
                      formatDistanceToNow(workout.completedAt, {
                        addSuffix: true,
                      })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {workout.exerciseSets.length} exercises
                  </p>
                  <p className="text-xs text-slate-400">
                    {workout.startedAt &&
                      workout.completedAt &&
                      `${Math.round(
                        (workout.completedAt - workout.startedAt) / 60000
                      )} min`}
                  </p>
                </div>
              </div>

              {workout.exerciseSets.length > 0 && (
                <div className="space-y-3">
                  {workout.exerciseSets.map((exerciseSet) => (
                    <div
                      key={exerciseSet._id}
                      className="border-l-2 border-slate-200 pl-4"
                    >
                      <h4 className="font-medium text-slate-800">
                        {exerciseSet.exercise?.name || "Unknown Exercise"}
                      </h4>
                      <div className="mt-2 space-y-1">
                        {exerciseSet.sets.map((set, index) => (
                          <div
                            key={set.id}
                            className="flex items-center text-sm text-slate-600"
                          >
                            <span className="w-8 text-slate-400">
                              Set {index + 1}:
                            </span>
                            <span>
                              {set.weight} {set.weightUnit}
                              {!set.isBodyWeight && " × "}
                              {set.reps} reps
                            </span>
                            {set.notes && (
                              <span className="ml-2 text-slate-500">
                                ({set.notes})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {workout.notes && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 italic">
                    &ldquo;{workout.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="container px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600">
              Please sign in to view your dashboard.
            </p>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
