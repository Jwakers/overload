"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectExerciseDrawer } from "@/components/workout-drawer/select-exercise-drawer";
import { ROUTES } from "@/constants";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function SplitEditPage({
  params,
}: {
  params: Promise<{ splitId: Id<"splits"> }>;
}) {
  const { splitId } = use(params);
  const router = useRouter();
  const split = useQuery(api.splits.getSplitById, { id: splitId });
  const updateSplitMutation = useMutation(api.splits.updateSplit);
  const removeExerciseMutation = useMutation(
    api.splits.removeExerciseFromSplit
  );
  const reorderExercisesMutation = useMutation(
    api.splits.reorderSplitExercises
  );
  const addExercisesMutation = useMutation(api.splits.addExercisesToSplit);
  const deleteSplitMutation = useMutation(api.splits.deleteSplit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [selectExerciseOpen, setSelectExerciseOpen] = useState(false);

  // Initialize form values when split data loads
  useEffect(() => {
    if (split) {
      setName(split.name);
      setDescription(split.description || "");
    }
  }, [split]);

  // Track changes
  useEffect(() => {
    if (!split) return;
    const nameChanged = name !== split.name;
    const descriptionChanged = description !== (split.description || "");
    setHasChanges(nameChanged || descriptionChanged);
  }, [name, description, split]);

  const handleSaveMetadata = async () => {
    if (!split) return;

    const updates: {
      name?: string;
      description?: string;
    } = {};

    if (name !== split.name) {
      updates.name = name;
    }

    if (description !== (split.description || "")) {
      updates.description = description;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    toast.promise(
      updateSplitMutation({
        splitId: splitId,
        ...updates,
      }),
      {
        loading: "Saving changes...",
        success: () => {
          setHasChanges(false);
          return "Split updated successfully!";
        },
        error: (err) => `Failed to update split: ${err.message}`,
      }
    );
  };

  const handleRemoveExercise = async (exerciseId: Id<"exercises">) => {
    toast.promise(
      removeExerciseMutation({
        splitId: splitId,
        exerciseId,
      }),
      {
        loading: "Removing exercise...",
        success: "Exercise removed successfully!",
        error: (err) => `Failed to remove exercise: ${err.message}`,
      }
    );
  };

  const handleAddExercise = async (exerciseId: Id<"exercises">) => {
    toast.promise(
      addExercisesMutation({
        splitId: splitId,
        exerciseIds: [exerciseId],
      }),
      {
        loading: "Adding exercise...",
        success: () => {
          setSelectExerciseOpen(false);
          return "Exercise added successfully!";
        },
        error: (err) => `Failed to add exercise: ${err.message}`,
      }
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !split) return;

    // Calculate new order
    const items = Array.from(split.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Save the new order to the backend - Convex will reactively update the UI
    const exerciseIds = items.map((ex) => ex._id);
    toast.promise(
      reorderExercisesMutation({
        splitId: splitId,
        exerciseIds,
      }),
      {
        loading: "Reordering exercises...",
        success: "Order updated successfully!",
        error: (err) => `Failed to reorder: ${err.message}`,
      }
    );
  };

  const handleDeleteSplit = async () => {
    toast.promise(
      deleteSplitMutation({
        splitId: splitId,
      }),
      {
        loading: "Deleting split...",
        success: () => {
          router.push(ROUTES.SPLITS);
          return "Split deleted successfully!";
        },
        error: (err) => `Failed to delete split: ${err.message}`,
      }
    );
  };

  if (split === undefined) {
    return (
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-64"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Split not found or access denied
  if (split === null) {
    notFound();
  }

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href={ROUTES.SPLITS}>
            <ArrowLeft size={16} />
            Back to Splits
          </Link>
        </Button>
      </div>

      {/* Split Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Split Details</CardTitle>
          <CardDescription>
            Update your split name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your split, training focus, or any notes..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {hasChanges && (
            <Button
              onClick={handleSaveMetadata}
              className="w-full sm:w-auto gap-2"
            >
              <Save size={16} />
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Exercises Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Drag to reorder, click X to remove
              </CardDescription>
            </div>
            <Button
              onClick={() => setSelectExerciseOpen(true)}
              className="gap-2"
              size="sm"
            >
              <Plus size={16} />
              Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!split.exercises.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No exercises in this split yet
              </p>
              <Button
                onClick={() => setSelectExerciseOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus size={16} />
                Add Your First Exercise
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="exercises">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {split.exercises.map((exercise, index) => (
                      <Draggable
                        key={exercise._id}
                        draggableId={exercise._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-4 rounded-lg border bg-card transition-shadow ${
                              snapshot.isDragging
                                ? "shadow-lg ring-2 ring-brand"
                                : "hover:shadow-md"
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                {exercise.name}
                                {exercise.equipment ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {exercise.equipment}
                                  </Badge>
                                ) : null}
                              </h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {exercise.muscleGroups
                                  .slice(0, 3)
                                  .map((group) => (
                                    <Badge
                                      key={group}
                                      variant="secondary"
                                      className="text-xs capitalize"
                                    >
                                      {group.replace(/_/g, " ")}
                                    </Badge>
                                  ))}
                                {exercise.muscleGroups.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{exercise.muscleGroups.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExercise(exercise._id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X size={18} />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Split */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this split. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteDialog
            title="Delete Split"
            description={`Are you sure you want to delete "${split.name}"? This action cannot be undone.`}
            onConfirm={handleDeleteSplit}
            confirmButtonText="Delete Split"
          >
            <Button variant="destructive" className="gap-2">
              <Trash2 size={16} />
              Delete Split
            </Button>
          </DeleteDialog>
        </CardContent>
      </Card>

      {/* Exercise Selection Drawer */}
      <SelectExerciseDrawer
        open={selectExerciseOpen}
        onChange={setSelectExerciseOpen}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
