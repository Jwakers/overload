import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Edit, Plus, PlusCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
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

// TODO: Handle deleting and editing an exercise set
// TODO: Add toast and handle errors throughout all workout drawer components
// TODO: Saving a workout should trigger a confirmation dialog
//       - This confirmation should also ask if the user has any notes about the workout, which save onBlur to the session

export function WorkoutDrawer() {
  const [open, setOpen] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] =
    useState<Id<"workoutSessions"> | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const createWorkoutSession = useMutation(api.workoutSessions.getOrCreate);
  const deleteWorkoutSession = useMutation(
    api.workoutSessions.deleteWorkoutSession
  );
  const completeMutation = useMutation(api.workoutSessions.complete);
  const createExerciseSet = useMutation(api.exerciseSets.create);
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
    createWorkoutSession().then((id) => setWorkoutSessionId(id));
  }, [open, createWorkoutSession, workoutSessionId]);

  useEffect(() => {
    // If there are no exercises when the component unmounts, delete the workout session.
    // This ensures that accidentally started sessions are not resumed on different days,
    // which could lead to data confusion and inaccuracies.
    return () => {
      if (!workoutSessionId || exerciseSets?.length) return;
      deleteWorkoutSession({ id: workoutSessionId });
    };
  }, [workoutSessionId, deleteWorkoutSession, exerciseSets]);

  const handleSelectExercise = async (exerciseId: Id<"exercises">) => {
    if (!workoutSessionId) return;

    await createExerciseSet({
      workoutSessionId,
      exerciseId,
    });
    setSelectExerciseDialogOpen(false);
  };

  const handleDeleteWorkout = async () => {
    if (!workoutSessionId) return;
    startTransition(async () => {
      await deleteWorkoutSession({ id: workoutSessionId });
      setOpen(false);
      setDeleteAlertOpen(false);
      setWorkoutSessionId(null);
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
                        <button title="Delete exercise">
                          <Trash2 className="text-destructive " />
                        </button>
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
              <AlertDialog
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Delete Workout</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this workout? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" asChild>
                      <AlertDialogAction onClick={handleDeleteWorkout}>
                        Delete
                      </AlertDialogAction>
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                className="grow"
                variant="primary"
                disabled={isPending || !exerciseSets?.length}
                onClick={async () => {
                  if (!workoutSessionId || !exerciseSets?.length) return;
                  startTransition(async () => {
                    try {
                      await completeMutation({ workoutSessionId });
                      setOpen(false);
                      setWorkoutSessionId(null);
                    } catch (err) {
                      console.error("Failed to complete workout", err);
                      // TODO: Replace with toast/notification
                    }
                  });
                }}
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
