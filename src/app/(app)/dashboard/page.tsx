"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const workoutSessions = useQuery(api.workoutSessions.getListWithExercises);

  // Helper function to calculate workout duration safely
  const calculateDuration = (startedAt: number, completedAt: number) => {
    if (!startedAt || !completedAt || completedAt <= startedAt) {
      return null;
    }
    const durationMs = completedAt - startedAt;
    const durationMinutes = Math.round(durationMs / 60000);
    return durationMinutes > 0 ? `${durationMinutes} min` : null;
  };

  if (!workoutSessions) {
    return (
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedWorkouts = workoutSessions.filter(
    (session) => !session.isActive
  );

  const activeWorkout = workoutSessions.find((session) => session.isActive);

  // Calculate stats
  const totalWorkouts = completedWorkouts.length;
  const totalExercises = completedWorkouts.reduce(
    (sum, workout) => sum + workout.exerciseSets.length,
    0
  );
  const totalSets = completedWorkouts.reduce(
    (sum, workout) =>
      sum +
      workout.exerciseSets.reduce(
        (exerciseSum, exerciseSet) => exerciseSum + exerciseSet.sets.length,
        0
      ),
    0
  );

  const thisWeekWorkouts = completedWorkouts.filter((workout) => {
    if (!workout.completedAt) return false;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return workout.completedAt > weekAgo;
  }).length;

  const recentWorkouts = completedWorkouts.slice(0, 5);

  // Debug: Log workout data to understand the issue
  if (completedWorkouts.length > 0) {
    console.log("Debug - Sample workout data:", {
      workout: completedWorkouts[0],
      startedAt: completedWorkouts[0].startedAt,
      completedAt: completedWorkouts[0].completedAt,
      duration:
        completedWorkouts[0].completedAt && completedWorkouts[0].startedAt
          ? completedWorkouts[0].completedAt - completedWorkouts[0].startedAt
          : "N/A",
    });
  }

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to crush your next workout?
          </p>
        </div>

        {activeWorkout ? (
          <Link href="/workout">
            <Button size="lg" variant="primary">
              <Activity className="w-5 h-5 mr-2" />
              Continue Workout
            </Button>
          </Link>
        ) : (
          <Link href="/workout">
            <Button size="lg" variant="primary">
              <Dumbbell className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-success/20 bg-success-muted/10">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">This Week</p>
                <p className="text-2xl font-bold text-success">
                  {thisWeekWorkouts}
                </p>
                <p className="text-xs text-success-muted-foreground">
                  workouts completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand/20 bg-brand-muted/10">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand">Total Workouts</p>
                <p className="text-2xl font-bold text-brand">{totalWorkouts}</p>
                <p className="text-xs text-brand-muted-foreground">all time</p>
              </div>
              <Target className="h-8 w-8 text-brand" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-energy/20 bg-energy-muted/10">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-energy">Exercises</p>
                <p className="text-2xl font-bold text-energy">
                  {totalExercises}
                </p>
                <p className="text-xs text-energy-muted-foreground">
                  unique exercises
                </p>
              </div>
              <Dumbbell className="h-8 w-8 text-energy" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-muted">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sets
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalSets}
                </p>
                <p className="text-xs text-muted-foreground">sets completed</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Recent Workouts
          </h2>
          {completedWorkouts.length > 5 && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>

        {completedWorkouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No workouts yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start your fitness journey by completing your first workout.
                Track your progress and see your improvements over time.
              </p>
              <Link href="/workout">
                <Button
                  size="lg"
                  className="bg-brand hover:bg-brand/90 text-brand-foreground"
                >
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Start Your First Workout
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {recentWorkouts.map((workout) => (
              <Card
                key={workout._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {workout.split?.name || "Workout"}
                        {workout.split && (
                          <Badge variant="secondary" className="text-xs">
                            {workout.split.name}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {workout.completedAt &&
                            format(workout.completedAt, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {calculateDuration(
                            workout.startedAt,
                            workout.completedAt!
                          ) || "Duration unavailable"}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {workout.exerciseSets.length} exercises
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {workout.exerciseSets.reduce(
                          (sum, exerciseSet) => sum + exerciseSet.sets.length,
                          0
                        )}{" "}
                        total sets
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {workout.exerciseSets.length > 0 && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="grid gap-4">
                        {workout.exerciseSets.slice(0, 3).map((exerciseSet) => (
                          <div
                            key={exerciseSet._id}
                            className="flex items-start gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {exerciseSet.exercise?.name ||
                                  "Unknown Exercise"}
                              </h4>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {exerciseSet.sets.slice(0, 3).map((set) => (
                                  <Badge
                                    key={set.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {set.weight} {set.weightUnit}
                                    {!set.isBodyWeight && " × "}
                                    {set.reps}
                                  </Badge>
                                ))}
                                {exerciseSet.sets.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{exerciseSet.sets.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {workout.exerciseSets.length > 3 && (
                          <div className="text-sm text-muted-foreground text-center pt-2">
                            +{workout.exerciseSets.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {workout.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
                        &ldquo;{workout.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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
