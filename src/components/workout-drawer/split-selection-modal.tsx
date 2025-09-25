"use client";

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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateSplitDialog } from "./create-split-dialog";
import { SplitListItem } from "./split-list-item";

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

  const handleSplitSelect = (splitId: Id<"splits">) => {
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
  };

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
              <div className="space-y-2 pr-4">
                {splits.map((split) => (
                  <SplitListItem
                    key={split._id}
                    split={split}
                    onSelect={() => handleSplitSelect(split._id)}
                    isSelected={selectedSplit?._id === split._id}
                  />
                ))}
              </div>
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
