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
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateSplitDialog } from "./create-split-dialog";
import { SplitListItem } from "./split-list-item";

type SplitSelectorProps = {
  workoutSessionId: Id<"workoutSessions">;
  selectedSplitId: Id<"splits"> | undefined;
};

export function SplitSelector({
  workoutSessionId,
  selectedSplitId,
}: SplitSelectorProps) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-8 px-3"
        >
          {selectedSplitId ? (
            <Edit size={24} className={"text-brand"} />
          ) : (
            <Plus size={24} className={"text-brand"} />
          )}
          {selectedSplitId ? "Change Split" : "Select Split"}
        </Button>
      </DialogTrigger>
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
