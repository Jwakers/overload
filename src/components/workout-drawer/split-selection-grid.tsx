"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Dumbbell, Plus } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { CreateSplitDialog } from "./create-split-dialog";

type SplitSelectionGridProps = {
  workoutSessionId: Id<"workoutSessions">;
  onSplitSelected?: () => void;
};

export function SplitSelectionGrid({
  workoutSessionId,
  onSplitSelected,
}: SplitSelectionGridProps) {
  const recentlyAccessedSplits = useQuery(api.splits.getSplits);
  const setSplitMutation = useMutation(
    api.workoutSessions.updateSplit
  ).withOptimisticUpdate((localStore, args) => {
    const workoutSession = localStore.getQuery(api.workoutSessions.getById, {
      id: workoutSessionId,
    });
    if (!workoutSession) return;
    localStore.setQuery(
      api.workoutSessions.getById,
      {
        id: workoutSessionId,
      },
      {
        ...workoutSession,
        splitId: args.splitId,
      }
    );
  });

  const handleSplitSelect = useCallback(
    (splitId: Id<"splits">) => {
      toast.promise(
        setSplitMutation({
          splitId,
          workoutSessionId,
        }),
        {
          loading: "Selecting split...",
          success: () => {
            onSplitSelected?.();
            return "Split selected successfully";
          },
          error: "Failed to select split",
        }
      );
    },
    [setSplitMutation, workoutSessionId, onSplitSelected]
  );

  if (recentlyAccessedSplits === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-brand" />
          <h3 className="text-lg font-semibold">Select a Split</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyAccessedSplits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-brand" />
          <h3 className="text-lg font-semibold">Select a Split</h3>
        </div>

        <div className="bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                <strong>Pro tip:</strong> Create a split to supercharge your
                workouts! You can skip this and just click &quot;Add
                exercise&quot; to start, but splits help you stay organized and
                track progress.
              </p>
              <p className="text-xs text-muted-foreground">
                Splits make it easier to follow structured routines and see your
                improvements over time.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="relative mb-6 inline-block">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand/20 to-brand/10 rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="h-10 w-10 text-brand" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-brand-foreground" />
            </div>
          </div>

          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first split to organize exercises, track progress, and
            build consistent routines that work for you.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-brand rounded-full"></div>
              <span>Organize exercises by muscle groups</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-brand rounded-full"></div>
              <span>Track performance over time</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-brand rounded-full"></div>
              <span>Build consistent workout habits</span>
            </div>
          </div>

          <div className="mt-6">
            <CreateSplitDialog
              onCreate={handleSplitSelect}
              className="w-full max-w-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-brand" />
        <h3 className="text-lg font-semibold">Select a Split</h3>
        <Badge variant="outline" className="text-xs">
          Recently Used
        </Badge>
      </div>

      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">
          Choose a split to get started, or just add exercises to begin your
          workout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recentlyAccessedSplits?.map((split) => (
          <SplitCard
            key={split._id}
            split={split}
            onSelect={() => handleSplitSelect(split._id)}
          />
        ))}
      </div>

      <div className="text-center pt-4">
        <CreateSplitDialog onCreate={handleSplitSelect} />
      </div>
    </div>
  );
}

type SplitCardProps = {
  split: FunctionReturnType<typeof api.splits.getSplits>[number];
  onSelect: () => void;
};

function SplitCard({ split, onSelect }: SplitCardProps) {
  const exercisesToShow = split.exercises.slice(0, MAX_EXERCISES_TO_SHOW);

  return (
    <Card onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{split.name}</CardTitle>
          <Badge
            variant={split.isActive ? "default" : "secondary"}
            className="text-xs shrink-0"
          >
            {split.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {split.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {split.description}
          </p>
        )}

        {exercisesToShow.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercisesToShow.map((exercise) => (
              <Badge key={exercise._id} variant="outline" className="text-xs">
                {exercise.name}
              </Badge>
            ))}
            {exercisesToShow.length < split.exercises.length && (
              <Badge variant="outline" className="text-xs">
                +{split.exercises.length - exercisesToShow.length} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="ml-auto">
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-2 text-brand text-sm font-medium group-hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
            <span>Select Split</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
