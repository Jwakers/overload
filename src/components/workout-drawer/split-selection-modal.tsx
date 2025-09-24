"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Calendar, Edit } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CreateSplitDialog } from "./create-split-dialog";

type SplitSelectionModalProps = {
  workoutSessionId: Id<"workoutSessions">;
  selectedSplitId: Id<"splits"> | undefined;
  trigger?: React.ReactNode;
};

export function SplitSelectionModal({
  workoutSessionId,
  selectedSplitId,
  trigger,
}: SplitSelectionModalProps) {
  const [open, setOpen] = useState(false);
  const splits = useQuery(api.splits.getSplits);
  const setSplitMutation = useMutation(api.workoutSessions.updateSplit);
  const selectedSplit = selectedSplitId
    ? splits?.find((split) => split._id === selectedSplitId)
    : null;

  const handleSplitSelect = useCallback(
    (splitId: Id<"splits">) => {
      toast.promise(
        setSplitMutation({
          splitId,
          workoutSessionId,
        }),
        {
          loading: "Updating split...",
          success: () => {
            setOpen(false);
            return "Split updated successfully";
          },
          error: "Failed to update split",
        }
      );
    },
    [setSplitMutation, workoutSessionId]
  );

  const renderSplit = useCallback(
    (split: FunctionReturnType<typeof api.splits.getSplits>[number]) => {
      return (
        <button
          type="button"
          key={split._id}
          className={cn(
            "w-full group cursor-pointer rounded border p-3 transition-colors hover:border-brand/80 hover:bg-brand/10",
            selectedSplit?._id === split._id &&
              "border-muted-foreground bg-muted"
          )}
          onClick={() => handleSplitSelect(split._id)}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium">{split.name}</h4>
              <Badge
                variant={split.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {split.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {split.exercises
                .slice(0, MAX_EXERCISES_TO_SHOW)
                .map((exercise) => (
                  <Badge
                    key={exercise._id}
                    variant="outline"
                    className="text-xs"
                  >
                    {exercise.name}
                  </Badge>
                ))}
              {split.exercises.length > MAX_EXERCISES_TO_SHOW && (
                <Badge variant="outline" className="text-xs">
                  +{split.exercises.length - MAX_EXERCISES_TO_SHOW} more
                </Badge>
              )}
            </div>
            {split.description && (
              <p className="text-sm text-muted-foreground text-left">
                {split.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Updated {new Date(split.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </button>
      );
    },
    [handleSplitSelect, selectedSplit]
  );

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="h-8 px-3">
      <Edit size={16} className="mr-2" />
      All Splits
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Workout Split</DialogTitle>
          <DialogDescription>
            Choose a split for your workout session or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {splits === undefined ? (
            <p>Loading splits…</p>
          ) : splits.length ? (
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">{splits.map(renderSplit)}</div>
            </ScrollArea>
          ) : (
            <p>No splits found. Create a new split to get started.</p>
          )}

          <div className="border-t pt-4">
            <CreateSplitDialog onCreate={handleSplitSelect} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
