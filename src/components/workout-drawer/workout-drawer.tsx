import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { Dumbbell, Edit, Plus, PlusCircle, Save } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
import { SplitSelector } from "./split-selector";
import { WeightUnitToggle } from "./weight-unit-toggle";

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
  const addExercisesToSplit = useMutation(api.splits.addExercisesToSplit);
  const observer = useRef<MutationObserver | null>(null);

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
  const [isPending, startTransition] = useTransition();

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

  useLayoutEffect(() => {
    // Use MutationObserver to auto-scroll when new exercise sets are added
    if (!open || observer.current) return;

    setTimeout(() => {
      console.log("useEffect", scrollAreaRef.current);
      if (!scrollAreaRef.current) return;

      observer.current = new MutationObserver(() => {
        console.log(scrollAreaRef.current?.scrollTop);
        if (!scrollAreaRef.current) return;
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      });

      observer.current.observe(scrollAreaRef.current, {
        childList: true,
        subtree: true,
      });
    }, 0);

    return () => observer.current?.disconnect();
  }, [open]);

  const handleAddExerciseToSplit = (
    exerciseId: Id<"exercises"> | undefined
  ) => {
    if (!split || !exerciseId) return;
    toast.promise(
      addExercisesToSplit({
        splitId: split._id,
        exerciseIds: [exerciseId],
      }),
      {
        loading: "Adding exercise to split…",
        success: () => `Exercise added to ${split.name}`,
        error: "Failed to add exercise to split. Please try again.",
      }
    );
  };

  const handleSelectExercise = async (exerciseId: Id<"exercises">) => {
    if (!workoutSessionId) return;
    startTransition(async () => {
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
        }
      );
    });
  };

  const handleDeleteWorkout = async () => {
    if (!workoutSessionId) return;
    startTransition(async () => {
      toast.promise(deleteWorkoutSession({ id: workoutSessionId }), {
        loading: "Deleting workout…",
        success: () => {
          setOpen(false);
          setWorkoutSessionId(null);
          return "Workout deleted";
        },
        error: "Failed to delete workout. Please try again.",
      });
    });
  };

  const handleDeleteExercise = async (exerciseSetId: Id<"exerciseSets">) => {
    startTransition(async () => {
      toast.promise(deleteExerciseSet({ exerciseSetId }), {
        loading: "Deleting exercise…",
        success: () => "Exercise removed from workout",
        error: "Failed to remove exercise. Please try again.",
      });
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
        <DrawerContent className="grid grid-rows-[auto_auto_1fr]">
          <DrawerHeader className="space-y-2">
            <DrawerTitle className="sr-only">New Workout</DrawerTitle>
            <div className="flex justify-between items-center gap-2">
              {workoutSessionId && (
                <SplitSelector
                  workoutSessionId={workoutSessionId}
                  selectedSplitId={workoutSession?.splitId}
                />
              )}
              <WeightUnitToggle />
            </div>
            <ActiveSplit split={split} />
          </DrawerHeader>
          <div
            ref={scrollAreaRef}
            className="container relative overflow-y-auto space-y-4"
          >
            <div className="flex flex-col gap-2">
              {exerciseSets?.map((exerciseSet) => {
                const renderSplitPrompt = !split?.exercises.some(
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
                      <div className="bg-muted text-sm p-2 rounded flex gap-2 justify-between items-center">
                        <p>
                          Add this exercise to split:{" "}
                          <span className="font-semibold">{split?.name}</span>?
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            handleAddExerciseToSplit(exerciseSet.exercise?._id)
                          }
                        >
                          {isPending ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    ) : null}
                    <div className="gap-2 flex justify-between items-center">
                      <p className="font-semibold">
                        {exerciseSet.exercise?.name}
                      </p>
                      {exerciseSet.isActive ? (
                        <DeleteDialog
                          disabled={isPending}
                          onConfirm={() =>
                            handleDeleteExercise(exerciseSet._id)
                          }
                          title="Delete Exercise"
                          description="Are you sure you want to delete this exercise? All sets will be permanently removed. This action cannot be undone."
                          confirmButtonText="Delete Exercise"
                          triggerTitle="Delete exercise"
                        />
                      ) : (
                        <button title="Start exercise">
                          <Edit />
                        </button>
                      )}
                    </div>
                    <ExerciseSetForm exerciseSetId={exerciseSet._id} />
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 sticky bottom-0 bg-background">
              <button
                className={cn(
                  "flex justify-between gap-2 rounded border border-dashed p-4 bg-background",
                  !workoutSessionId && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => setSelectExerciseDialogOpen(true)}
                disabled={!workoutSessionId}
              >
                <p className="font-semibold">
                  {exerciseSets?.length ? "Add exercise" : "Add first exercise"}
                </p>
                <PlusCircle className="text-brand" size={24} />
              </button>

              <SelectExerciseDrawer
                open={selectExerciseDialogOpen}
                onChange={setSelectExerciseDialogOpen}
                onSelect={handleSelectExercise}
              />

              <DrawerFooter className="flex justify-between gap-2 w-full px-0">
                <DeleteDialog
                  onConfirm={handleDeleteWorkout}
                  title="Delete Workout"
                  description="Are you sure you want to delete this workout? This action cannot be undone."
                  confirmButtonText="Delete"
                >
                  <Button variant="outline">Delete Workout</Button>
                </DeleteDialog>

                <SaveWorkoutDialog
                  isPending={isPending}
                  disabled={!exerciseSets?.length}
                  workoutSessionId={workoutSessionId}
                  onComplete={() => {
                    setOpen(false);
                    setWorkoutSessionId(null);
                  }}
                />
              </DrawerFooter>
            </div>
          </div>
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
          className="grow"
          variant="primary"
          disabled={isPending || disabled}
        >
          <Save />
          <span>Save Workout</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
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
    <div className="rounded-lg border bg-muted p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-brand" />
        <span className="font-medium">{split.name}</span>
        <Badge
          variant={split.isActive ? "default" : "secondary"}
          className="ml-auto"
        >
          {split.isActive ? "Active" : "Inactive"}
        </Badge>
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
