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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Calendar, Edit, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type SplitSelectorProps = {
  workoutSessionId: Id<"workoutSessions">;
  selectedSplitId: Id<"splits"> | undefined;
};

// Form schema for creating splits
const createSplitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type CreateSplitFormData = z.infer<typeof createSplitSchema>;

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
              <div className="space-y-2 pr-4">{splits.map(renderSplit)}</div>
            </ScrollArea>
          ) : (
            <p>No splits found. Create a new split to get started.</p>
          )}

          <div className="border-t pt-4">
            <CreateSplitDialog />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateSplitDialog() {
  const [open, setOpen] = useState(false);
  const createSplitMutation = useMutation(api.splits.createSplit);

  const form = useForm<CreateSplitFormData>({
    resolver: zodResolver(createSplitSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateSplitFormData) => {
    toast.promise(
      createSplitMutation({
        name: data.name,
        description: data.description?.trim() || undefined,
        exercises: [],
      }),
      {
        loading: "Creating split...",
        success: () => {
          form.reset();
          setOpen(false);
          return "Split created successfully!";
        },
        error: "Failed to create split",
      }
    );
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          <Plus size={24} className="text-brand" />
          Create New Split
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Split</DialogTitle>
          <DialogDescription>
            Create a new workout split. You can add exercises to it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Split Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Push Day, Pull Day, Leg Day"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your split a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your split, training focus, or any notes..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add details about your training approach or goals
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Split
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
