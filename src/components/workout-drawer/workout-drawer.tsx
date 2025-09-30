import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import {
  Check,
  Dumbbell,
  DumbbellIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { DeleteDialog } from "../delete-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { ExerciseSetForm } from "./exercise-set-form";
import { SelectExerciseDrawer } from "./select-exercise-drawer";
import { SplitSelectionGrid } from "./split-selection-grid";
import { WeightUnitToggle } from "./weight-unit-toggle";
import { WorkoutActionsMenu } from "./workout-actions-menu";

// Inactive Exercise Set Card Component
type InactiveExerciseSetCardProps = {
  exerciseSet: Doc<"exerciseSets">;
  handleEdit: () => void;
  handleDelete: () => void;
  isPending: boolean;
};

function InactiveExerciseSetCard({
  exerciseSet,
  handleEdit,
  handleDelete,
  isPending,
}: InactiveExerciseSetCardProps) {
  const totalSets = exerciseSet.sets.length;
  const totalReps = exerciseSet.sets.reduce((sum, set) => sum + set.reps, 0);
  const avgWeight =
    totalSets > 0
      ? exerciseSet.sets.reduce((sum, set) => sum + set.weight, 0) / totalSets
      : 0;
  const isBodyWeight = exerciseSet.sets.some((set) => set.isBodyWeight);

  return (
    <div className="bg-muted/30 rounded-lg p-3 border">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {totalSets === 0 ? (
              <span className="font-medium text-muted-foreground">
                No sets completed
              </span>
            ) : (
              <>
                <span className="font-medium text-muted-foreground">
                  {totalSets} {totalSets === 1 ? "set" : "sets"}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-muted-foreground">
                  {totalReps} reps
                </span>
                {!isBodyWeight && totalSets > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-muted-foreground">
                      {avgWeight.toFixed(1)}
                      {exerciseSet.sets[0]?.weightUnit || "lbs"} avg
                    </span>
                  </>
                )}
                {isBodyWeight && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-muted-foreground">
                      Body Weight
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit} disabled={isPending}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DeleteDialog
              disabled={isPending}
              onConfirm={handleDelete}
              title="Delete Exercise Set"
              description="Are you sure you want to delete this exercise set? This will permanently remove all sets and cannot be undone."
              confirmButtonText="Delete Exercise Set"
            >
              <DropdownMenuItem
                disabled={isPending}
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Active Exercise Set Actions Component
type ActiveExerciseSetActionsProps = {
  isSaved: boolean;
  onConcludeEditing: () => void;
  onDelete: () => void;
  isPending: boolean;
};

function ActiveExerciseSetActions({
  isSaved,
  onConcludeEditing,
  onDelete,
  isPending,
}: ActiveExerciseSetActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isSaved && (
          <DropdownMenuItem onClick={onConcludeEditing} disabled={isPending}>
            <Check className="mr-2 h-4 w-4" />
            Finished editing
          </DropdownMenuItem>
        )}
        <DeleteDialog
          disabled={isPending}
          onConfirm={onDelete}
          title="Delete Exercise"
          description="Are you sure you want to delete this exercise? All sets will be permanently removed. This action cannot be undone."
          confirmButtonText="Delete Exercise"
        >
          <DropdownMenuItem
            disabled={isPending}
            className="text-destructive focus:text-destructive"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DeleteDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WorkoutDrawer() {
  const [open, setOpen] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] =
    useState<Id<"workoutSessions"> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const getOrCreateSessionMutation = useMutation(
    api.workoutSessions.getOrCreate
  );
  const deleteWorkoutSession = useMutation(
    api.workoutSessions.deleteWorkoutSession
  );
  const createExerciseSet = useMutation(api.exerciseSets.create);
  const deleteExerciseSet = useMutation(api.exerciseSets.deleteExerciseSet);
  const setActiveMutation = useMutation(api.exerciseSets.setActive);
  const addExercisesToSplit = useMutation(api.splits.addExercisesToSplit);

  const exerciseSets = useQuery(
    api.exerciseSets.getSets,
    workoutSessionId
      ? {
          workoutSessionId,
        }
      : "skip"
  );
  const workoutSession = useQuery(
    api.workoutSessions.getById,
    workoutSessionId
      ? {
          id: workoutSessionId,
        }
      : "skip"
  );
  const split = useQuery(
    api.splits.getSplitById,
    workoutSession?.splitId
      ? {
          id: workoutSession.splitId,
        }
      : "skip"
  );

  const [selectExerciseDialogOpen, setSelectExerciseDialogOpen] =
    useState(false);
  const [isPending, setIsPending] = useState(false);
  const [savedExerciseSets, setSavedExerciseSets] = useState<
    Set<Id<"exerciseSets">>
  >(new Set());

  useEffect(() => {
    if (workoutSessionId || !open) return;

    const createSession = async () => {
      toast.promise(getOrCreateSessionMutation(), {
        loading: "Getting workout session…",
        success: ({ workoutSessionId, resume }) => {
          setWorkoutSessionId(workoutSessionId);
          if (resume) {
            return `Resuming workout session`;
          }
          return `Workout session created: ${new Date().toLocaleDateString()}`;
        },
        error: "Failed to create workout session. Please try again.",
      });
    };

    createSession();
  }, [open, getOrCreateSessionMutation, workoutSessionId]);

  useEffect(() => {
    if (!open || !scrollAreaRef.current) return;
    // Scroll on open and whenever a new set appears
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [open, exerciseSets?.length]);

  // Track which exercise sets have been saved previously
  useEffect(() => {
    if (!exerciseSets) return;

    const allInactiveIds = exerciseSets
      .filter((es) => !es.isActive)
      .map((es) => es._id);

    setSavedExerciseSets(
      (previous) => new Set([...allInactiveIds, ...previous])
    );
  }, [exerciseSets]);

  const handleAddExerciseToSplit = (
    exerciseId: Id<"exercises"> | undefined
  ) => {
    if (!split || !exerciseId) return;
    setIsPending(true);
    toast.promise(
      addExercisesToSplit({
        splitId: split._id,
        exerciseIds: [exerciseId],
      }),
      {
        loading: "Adding exercise to split…",
        success: () => `Exercise added to ${split.name}`,
        error: "Failed to add exercise to split. Please try again.",
        finally: () => setIsPending(false),
      }
    );
  };

  const handleSelectExercise = async (exerciseId: Id<"exercises">) => {
    if (!workoutSessionId) return;
    setIsPending(true);
    toast.promise(
      createExerciseSet({
        workoutSessionId,
        exerciseId,
      }),
      {
        loading: "Adding exercise…",
        success: () => {
          setSelectExerciseDialogOpen(false);
          return "Exercise added";
        },
        error: "Failed to add exercise. Please try again.",
        finally: () => setIsPending(false),
      }
    );
  };

  const handleDeleteWorkout = async () => {
    if (!workoutSessionId) return;
    setIsPending(true);
    toast.promise(deleteWorkoutSession({ id: workoutSessionId }), {
      loading: "Deleting workout…",
      success: () => {
        setOpen(false);
        setWorkoutSessionId(null);
        return "Workout deleted";
      },
      error: "Failed to delete workout. Please try again.",
      finally: () => setIsPending(false),
    });
  };

  const handleDeleteExercise = async (exerciseSetId: Id<"exerciseSets">) => {
    setIsPending(true);
    toast.promise(deleteExerciseSet({ exerciseSetId }), {
      loading: "Deleting exercise…",
      success: () => "Exercise removed from workout",
      error: "Failed to remove exercise. Please try again.",
      finally: () => setIsPending(false),
    });
  };

  const handleEditExerciseSet = async (exerciseSetId: Id<"exerciseSets">) => {
    setIsPending(true);
    toast.promise(setActiveMutation({ exerciseSetId, isActive: true }), {
      loading: "Activating exercise set…",
      success: () => "Exercise set activated for editing",
      error: "Failed to activate exercise set. Please try again.",
      finally: () => setIsPending(false),
    });
  };

  const handleConcludeEditing = async (exerciseSetId: Id<"exerciseSets">) => {
    setIsPending(true);
    toast.promise(setActiveMutation({ exerciseSetId, isActive: false }), {
      loading: "Concluding editing…",
      success: () => "Exercise set concluded",
      error: "Failed to conclude editing. Please try again.",
      finally: () => setIsPending(false),
    });
  };

  const handleDeleteExerciseSet = async (exerciseSetId: Id<"exerciseSets">) => {
    setIsPending(true);
    toast.promise(deleteExerciseSet({ exerciseSetId }), {
      loading: "Deleting exercise set…",
      success: () => "Exercise set deleted",
      error: "Failed to delete exercise set. Please try again.",
      finally: () => setIsPending(false),
    });
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            title="Log workout"
            type="button"
          >
            <div className="p-4 rounded-full bg-brand text-brand-foreground shadow-lg">
              <Plus size={24} className={"text-brand-foreground"} />
            </div>
          </button>
        </DrawerTrigger>
        <DrawerContent className="grid grid-rows-[auto_auto_1fr] max-h-[98dvh] h-full">
          <DrawerHeader className="space-y-2">
            <DrawerTitle className="sr-only">New Workout</DrawerTitle>
            <div className="flex justify-between items-center gap-2">
              {workoutSessionId && (
                <WorkoutActionsMenu
                  workoutSessionId={workoutSessionId}
                  selectedSplitId={workoutSession?.splitId}
                  onDeleteWorkout={handleDeleteWorkout}
                  isPending={isPending}
                />
              )}
              <WeightUnitToggle />
            </div>
          </DrawerHeader>
          <div
            ref={scrollAreaRef}
            className="container relative overflow-y-auto space-y-4"
          >
            <ActiveSplit split={split} />
            <div className="flex flex-col gap-2 h-full">
              {/* Show split selection grid when no exercises are added */}
              {workoutSessionId &&
                (!exerciseSets || exerciseSets.length === 0) &&
                !split && (
                  <SplitSelectionGrid
                    workoutSessionId={workoutSessionId}
                    onSplitSelected={() => {
                      // The split will be updated via the mutation, no need to do anything here
                    }}
                  />
                )}

              {exerciseSets?.map((exerciseSet) => {
                const renderSplitPrompt =
                  split &&
                  !split?.exercises.some(
                    (ex) => ex._id === exerciseSet.exercise?._id
                  );

                return (
                  <div
                    className={cn(
                      "border p-4 space-y-4 rounded",
                      !exerciseSet.isActive && "bg-muted text-muted-foreground"
                    )}
                    key={exerciseSet._id}
                  >
                    {/* Banner to add this exercise to a split */}
                    {renderSplitPrompt ? (
                      <div className="relative bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/30 text-sm p-3 rounded-lg flex gap-3 justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                          <p className="text-foreground">
                            Add this exercise to split:{" "}
                            <span className="font-semibold text-brand">
                              {split?.name}
                            </span>
                            ?
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isPending}
                          className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
                          onClick={() =>
                            handleAddExerciseToSplit(exerciseSet.exercise?._id)
                          }
                        >
                          {isPending ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    ) : null}
                    <div className="gap-2 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold">
                          {exerciseSet.exercise?.name}
                        </p>
                        {exerciseSet.exercise?.equipment ? (
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {exerciseSet.exercise?.equipment}
                          </Badge>
                        ) : null}
                      </div>
                      {exerciseSet.isActive ? (
                        <ActiveExerciseSetActions
                          isSaved={savedExerciseSets.has(exerciseSet._id)}
                          onConcludeEditing={() =>
                            handleConcludeEditing(exerciseSet._id)
                          }
                          onDelete={() => handleDeleteExercise(exerciseSet._id)}
                          isPending={isPending}
                        />
                      ) : null}
                    </div>
                    {exerciseSet.isActive ? (
                      <ExerciseSetForm exerciseSetId={exerciseSet._id} />
                    ) : (
                      <InactiveExerciseSetCard
                        exerciseSet={exerciseSet}
                        handleEdit={() =>
                          handleEditExerciseSet(exerciseSet._id)
                        }
                        handleDelete={() =>
                          handleDeleteExerciseSet(exerciseSet._id)
                        }
                        isPending={isPending}
                      />
                    )}
                  </div>
                );
              })}

              <RecommendedExercises
                split={split}
                currentExerciseIds={
                  exerciseSets
                    ?.map((set) => set.exercise?._id)
                    .filter((id): id is Id<"exercises"> => Boolean(id)) || []
                }
                onSelectExercise={handleSelectExercise}
                disabled={!workoutSessionId}
              />

              <DrawerFooter className="safe-area-inset-bottom sticky bottom-2 inset-x-0 w-full px-0">
                <div className="flex items-center justify-between gap-2">
                  <SaveWorkoutDialog
                    isPending={isPending}
                    disabled={!exerciseSets?.length}
                    workoutSessionId={workoutSessionId}
                    onComplete={() => {
                      setOpen(false);
                      setWorkoutSessionId(null);
                    }}
                  />

                  <button
                    type="button"
                    className={cn(
                      "bg-brand text-brand-foreground flex items-center gap-2 px-4 py-3 rounded-full shadow-lg flex-1 max-w-50 justify-center",
                      !workoutSessionId && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => setSelectExerciseDialogOpen(true)}
                    disabled={!workoutSessionId}
                  >
                    <DumbbellIcon size={18} />
                    <p className="text-sm font-semibold">Add exercise</p>
                  </button>
                </div>
              </DrawerFooter>
            </div>
          </div>
          <SelectExerciseDrawer
            open={selectExerciseDialogOpen}
            onChange={setSelectExerciseDialogOpen}
            onSelect={handleSelectExercise}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}

const notesSchema = z.object({
  notes: z
    .string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
});

type NotesFormData = z.infer<typeof notesSchema>;

function SaveWorkoutDialog(props: {
  isPending: boolean;
  disabled: boolean;
  workoutSessionId: Id<"workoutSessions"> | null;
  onComplete: () => void;
}) {
  const { isPending, disabled, workoutSessionId, onComplete } = props;
  const completeMutation = useMutation(api.workoutSessions.complete);
  const [open, setOpen] = useState(false);

  const form = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
    },
  });

  const handleSaveWorkout = useCallback(
    async (data: NotesFormData) => {
      if (!workoutSessionId || disabled) return;

      toast.promise(
        completeMutation({
          workoutSessionId,
          notes: data.notes,
        }),
        {
          loading: "Saving workout…",
          success: () => {
            onComplete();
            setOpen(false);
            return "Workout saved";
          },
          error: "Failed to save workout. Please try again.",
        }
      );
    },
    [completeMutation, disabled, onComplete, workoutSessionId]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isPending || disabled}
          title="Save Workout"
          variant="secondary"
          size="lg"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save workout</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </DialogTrigger>
      <DialogContent autoFocus={false}>
        <DialogHeader>
          <DialogTitle>Save workout</DialogTitle>
          <DialogDescription>
            Save your workout and add any notes about it. Notes can help you
            inform decisions about your next workout.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveWorkout)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="notes">Workout Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="How did you feel during this workout?"
                      maxLength={1000}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="primary"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save workout"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ActiveSplit({
  split,
}: {
  split: FunctionReturnType<typeof api.splits.getSplitById> | undefined;
}) {
  if (!split) return null;

  const exercisesToShow = split.exercises.slice(0, MAX_EXERCISES_TO_SHOW);

  return (
    <div className="rounded border bg-muted p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-brand" />
        <span className="font-medium">{split.name}</span>
      </div>
      {exercisesToShow.length > 0 ? (
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
      ) : null}
    </div>
  );
}

function RecommendedExercises({
  split,
  currentExerciseIds,
  onSelectExercise,
  disabled,
}: {
  split: FunctionReturnType<typeof api.splits.getSplitById> | undefined;
  currentExerciseIds: Id<"exercises">[];
  onSelectExercise: (exerciseId: Id<"exercises">) => void;
  disabled: boolean;
}) {
  const [showIndex, setShowIndex] = useState(3);
  if (!split || split.exercises.length === 0) return null;

  // Filter out exercises that are already in the current workout
  const recommendedExercises = split.exercises.filter(
    (exercise) => !currentExerciseIds.includes(exercise._id)
  );

  const excessExercises = recommendedExercises.length - showIndex;

  if (recommendedExercises.length === 0) {
    return (
      <div className="rounded border-2 border-dashed bg-muted p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Split Completed
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Great job! You&apos;ve completed all exercises from this split. You
          can still add more exercises to this session, or update your split.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border-2 border-dashed border-brand/30 bg-brand/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-brand" />
        <span className="font-medium text-brand">Quick start</span>
        <div className="ml-auto">
          <Badge variant="outline">From split</Badge>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          {recommendedExercises.slice(0, showIndex).map((exercise) => (
            <button
              key={exercise._id}
              onClick={() => onSelectExercise(exercise._id)}
              disabled={disabled}
              aria-label={`Add ${exercise.name} to workout`}
              type="button"
              className="text-left p-3 rounded border border-brand/20 bg-background cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{exercise.name}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {exercise.equipment}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Add</span>
                  <Plus
                    size={16}
                    className="text-brand group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
        {recommendedExercises.length > showIndex && (
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="text-sm text-muted-foreground text-center pt-2">
              +{excessExercises} more{" "}
              {excessExercises > 1 ? "exercises" : "exercise"}
            </p>
            <Button
              variant="outline"
              size="sm"
              aria-label="Show more exercises"
              onClick={() => setShowIndex((i) => i + 3)}
            >
              Show more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
