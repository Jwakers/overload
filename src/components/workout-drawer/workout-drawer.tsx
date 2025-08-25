import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Edit, Plus, PlusCircle, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { DeleteDialog } from "../ui/delete-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";
import { ExerciseSetForm } from "./exercise-set-form";
import { SelectExerciseDrawer } from "./select-exercise-drawer";
import { WeightUnitToggle } from "./weight-unit-toggle";

// TODO: Saving a workout should trigger a confirmation dialog
//       - This confirmation should also ask if the user has any notes about the workout, which save onBlur to the session
// NOTE: This is now in a new branch called feature/save-dialog

export function WorkoutDrawer() {
  const [open, setOpen] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] =
    useState<Id<"workoutSessions"> | null>(null);

  const createWorkoutSession = useMutation(api.workoutSessions.getOrCreate);
  const deleteWorkoutSession = useMutation(
    api.workoutSessions.deleteWorkoutSession
  );
  const completeMutation = useMutation(api.workoutSessions.complete);
  const createExerciseSet = useMutation(api.exerciseSets.create);
  const deleteExerciseSet = useMutation(api.exerciseSets.deleteExerciseSet);

  const exerciseSets = useQuery(
    api.exerciseSets.getSets,
    workoutSessionId
      ? {
          workoutSessionId,
        }
      : "skip"
  );
  const [selectExerciseDialogOpen, setSelectExerciseDialogOpen] =
    useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (workoutSessionId || !open) return;

    const createSession = async () => {
      toast.promise(createWorkoutSession(), {
        loading: "Creating workout session…",
        success: (id) => {
          setWorkoutSessionId(id);
          return `Workout session created: ${id}`;
        },
        error: "Failed to create workout session. Please try again.",
      });
    };

    createSession();
  }, [open, createWorkoutSession, workoutSessionId]);

  const handleSelectExercise = async (exerciseId: Id<"exercises">) => {
    if (!workoutSessionId) return;

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

  const handleCompleteWorkout = async () => {
    if (!workoutSessionId || !exerciseSets?.length) return;
    startTransition(async () => {
      toast.promise(completeMutation({ workoutSessionId }), {
        loading: "Saving workout…",
        success: () => {
          setOpen(false);
          setWorkoutSessionId(null);
          return "Workout saved";
        },
        error: "Failed to save workout. Please try again.",
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
        <DrawerContent className="">
          <DrawerHeader className="space-y-2">
            <DrawerTitle className="sr-only">New Workout</DrawerTitle>
            <WeightUnitToggle />
          </DrawerHeader>
          <ScrollArea className="h-[calc(100dvh-200px)]">
            <div className="container">
              <p className="my-2 text-sm text-destructive-foreground bg-destructive p-2 px-4 rounded-md">
                TODO: There needs to be an way to add a split to this without
                slowing down the flow.
              </p>
            </div>
            <div className="container flex flex-col gap-2 h-full justify-end">
              {exerciseSets?.map((exerciseSet) => {
                return (
                  <div
                    className={cn(
                      "border p-4 space-y-4 rounded",
                      !exerciseSet.isActive && "bg-muted text-muted-foreground"
                    )}
                    key={exerciseSet._id}
                  >
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
            </div>

            <SelectExerciseDrawer
              open={selectExerciseDialogOpen}
              onChange={setSelectExerciseDialogOpen}
              onSelect={handleSelectExercise}
            />

            <DrawerFooter className="flex flex-row gap-2 max-w-xl mx-auto w-full">
              <DeleteDialog
                onConfirm={handleDeleteWorkout}
                title="Delete Workout"
                description="Are you sure you want to delete this workout? This action cannot be undone."
                confirmButtonText="Delete"
              >
                <Button variant="outline">Delete Workout</Button>
              </DeleteDialog>

              <Button
                className="grow"
                variant="primary"
                disabled={isPending || !exerciseSets?.length}
                onClick={handleCompleteWorkout}
              >
                <Save />
                <span>Save Workout</span>
              </Button>
            </DrawerFooter>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}
