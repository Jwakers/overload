"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { DeleteDialog } from "../delete-dialog";
import { CreateSplitDialog } from "./create-split-dialog";
import { SplitSelectionModal } from "./split-selection-modal";

type WorkoutActionsMenuProps = {
  workoutSessionId: Id<"workoutSessions">;
  selectedSplitId: Id<"splits"> | undefined;
  onDeleteWorkout: () => void;
  isPending: boolean;
};

export function WorkoutActionsMenu({
  workoutSessionId,
  selectedSplitId,
  onDeleteWorkout,
  isPending,
}: WorkoutActionsMenuProps) {
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
            return "Split updated successfully";
          },
          error: "Failed to update split",
        }
      );
    },
    [setSplitMutation, workoutSessionId]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="h-8 px-3"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workout Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Split Selection Section */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Current Split
            </span>
            <CreateSplitDialog
              onCreate={handleSplitSelect}
              trigger={
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  New
                </Button>
              }
            />
          </div>

          {selectedSplit ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedSplit.name}
                </span>
                <Badge
                  variant={selectedSplit.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {selectedSplit.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {selectedSplit.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selectedSplit.description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No split selected</p>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Available Splits */}
        {splits && splits.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs">
              Switch Split
            </DropdownMenuLabel>
            {splits
              .filter((split) => split._id !== selectedSplitId)
              .slice(0, 3)
              .map((split) => (
                <DropdownMenuItem
                  key={split._id}
                  onClick={() => handleSplitSelect(split._id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{split.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {split.exercises.length} exercises
                    </span>
                  </div>
                  <Badge
                    variant={split.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {split.isActive ? "Active" : "Inactive"}
                  </Badge>
                </DropdownMenuItem>
              ))}
            {splits.filter((split) => split._id !== selectedSplitId).length >
              3 && (
              <DropdownMenuItem
                disabled
                className="text-xs text-muted-foreground"
              >
                +
                {splits.filter((split) => split._id !== selectedSplitId)
                  .length - 3}{" "}
                more splits
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* View All Splits */}
        <SplitSelectionModal
          workoutSessionId={workoutSessionId}
          selectedSplitId={selectedSplitId}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              {selectedSplit ? "Change Split" : "Select Split"} (view all)
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        {/* Delete Workout */}
        <DeleteDialog
          onConfirm={onDeleteWorkout}
          title="Delete Workout"
          description="Are you sure you want to delete this workout? This action cannot be undone."
          confirmButtonText="Delete"
        >
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isPending}
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workout
          </DropdownMenuItem>
        </DeleteDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
