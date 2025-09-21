import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, Weight } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { DeleteDialog } from "../delete-dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";

// TODO: Split this file up a bit into separate components

// Exercise set form schema
const exerciseSetSchema = z.object({
  weight: z.string(),
  reps: z.string(),
  notes: z
    .string()
    .max(255, "Notes must be no more than 255 characters")
    .optional(),
});

type ExerciseSetFormData = z.infer<typeof exerciseSetSchema>;
const DEFAULT_WEIGHT = "lbs";

interface ExerciseSetFormProps {
  exerciseSetId: Id<"exerciseSets">;
}

export function ExerciseSetForm({ exerciseSetId }: ExerciseSetFormProps) {
  // TODO: When weight unit changes, convert the current weight value to the new unit
  const user = useQuery(api.users.current);
  const exerciseSet = useQuery(api.exerciseSets.get, {
    exerciseSetId,
  });
  const exercisePerformance = useQuery(
    api.exercisePerformance.get,
    exerciseSet?.exerciseId
      ? {
          exerciseId: exerciseSet?.exerciseId,
        }
      : "skip"
  );

  const addSetMutation = useMutation(
    api.exerciseSets.addSet
  ).withOptimisticUpdate((localStore, args) => {
    if (!exerciseSet) return;
    const newSet: Doc<"exerciseSets">["sets"][number] = {
      id: crypto.randomUUID(),
      ...args.set,
      weightUnit: args.weightUnit,
      isBodyWeight: args.isBodyWeight || false,
    };

    localStore.setQuery(
      api.exerciseSets.get,
      { exerciseSetId: exerciseSet._id },
      {
        ...exerciseSet,
        sets: [...exerciseSet.sets, newSet],
      }
    );
  });

  const setActiveMutation = useMutation(api.exerciseSets.setActive);
  const deleteSetMutation = useMutation(api.exerciseSets.deleteSet);

  const [isPending, startTransition] = useTransition();
  const [showNotes, setShowNotes] = useState(false);
  const [isBodyWeight, setIsBodyWeight] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Store the initial PB when component mounts to compare against throughout the workout
  const [initialPersonalBest, setInitialPersonalBest] = useState<{
    weight: number;
    reps: number;
  } | null>(null);

  const form = useForm<ExerciseSetFormData>({
    resolver: zodResolver(exerciseSetSchema),
    defaultValues: {
      weight: "",
      reps: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof exerciseSetSchema>) {
    // Body weight validation
    if (isBodyWeight) {
      if (!user?.bodyWeight) {
        toast.error(
          "Please set your body weight in settings before using body weight exercises"
        );
        return;
      }

      // Check if body weight is older than 7 days
      if (user.lastBodyWeightUpdate) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (user.lastBodyWeightUpdate < sevenDaysAgo) {
          toast.warning(
            "Your body weight hasn't been updated in over 7 days. Consider updating it in settings for accuracy."
          );
          return;
        }
      }
    }

    const weight = isBodyWeight ? user?.bodyWeight || 0 : Number(values.weight);
    const reps = Number(values.reps);
    const notes = values.notes;

    if (weight <= 0) {
      form.setError("weight", { message: "Weight must be positive" });
      return;
    }

    if (reps < 1) {
      form.setError("reps", { message: "Reps must be at least 1" });
      return;
    }

    if (!isBodyWeight && (isNaN(weight) || isNaN(reps))) {
      form.setError("weight", { message: "Weight must be a number" });
      form.setError("reps", { message: "Reps must be a number" });
      return;
    }

    startTransition(() => {
      const cleanedNotes = notes?.trim();
      const weightUnit = isBodyWeight
        ? user?.bodyWeightUnit
        : user?.preferences?.defaultWeightUnit;

      if (!weightUnit) {
        toast.error("Please set your default weight unit");
        return;
      }

      toast.promise(
        addSetMutation({
          exerciseSetId,
          weightUnit,
          set: { weight, reps, notes: cleanedNotes || undefined },
          isBodyWeight,
        }),
        {
          loading: "Saving set…",
          success: () => {
            form.resetField("reps");
            form.resetField("notes");
            setShowNotes(false);
            return "Set saved";
          },
          error: "Failed to add set. Please try again.",
        }
      );
    });
  }

  const handleDeleteSet = async (setId: string) => {
    startTransition(async () => {
      toast.promise(deleteSetMutation({ exerciseSetId, setId }), {
        loading: "Deleting set…",
        success: () => "Set removed",
        error: "Failed to remove set. Please try again.",
      });
    });
  };

  useEffect(() => {
    if (showNotes) notesTextareaRef.current?.focus();
  }, [showNotes]);

  // Capture the initial personal best when performance data loads
  useEffect(() => {
    if (exercisePerformance?.personalBest && !initialPersonalBest) {
      setInitialPersonalBest({
        weight: exercisePerformance.personalBest.weight,
        reps: exercisePerformance.personalBest.reps,
      });
    }
  }, [exercisePerformance?.personalBest, initialPersonalBest]);

  // Helper function to check if a set is a personal best achievement
  const getPersonalBestStatus = (set: Doc<"exerciseSets">["sets"][number]) => {
    // Use initial PB if available, otherwise fall back to current PB
    const pbToCompare =
      initialPersonalBest || exercisePerformance?.personalBest;
    if (!pbToCompare) return null;

    const { weight, reps } = set;
    const { weight: pbWeight, reps: pbReps } = pbToCompare;

    // Check if this set exceeds the initial PB
    const exceedsWeight = weight > pbWeight;
    const exceedsReps = weight === pbWeight && reps > pbReps;
    const matchesPB = weight === pbWeight && reps === pbReps;

    if (
      (set.isBodyWeight && exceedsReps) ||
      exceedsWeight ||
      (weight === pbWeight && reps > pbReps)
    ) {
      return "new-pb";
    } else if (matchesPB) {
      return "matches-pb";
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {exerciseSet ? (
        <div>
          {/* Personal Best Info */}
          {exercisePerformance && (
            <div className="bg-muted/50 flex flex-wrap gap-4 justify-between rounded-lg p-3 mb-4 text-xs">
              <p className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">PB:</span>
                <span className="font-semibold">
                  {exercisePerformance.personalBest?.isBodyWeight
                    ? "BW"
                    : exercisePerformance.personalBest?.weight}
                  {exercisePerformance.personalBest?.isBodyWeight
                    ? ""
                    : exercisePerformance.personalBest?.weightUnit || ""}{" "}
                  &times; {exercisePerformance.personalBest?.reps}
                </span>
              </p>
              {exercisePerformance.lastWeight ? (
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">
                    Last Time:
                  </span>
                  <span className="font-semibold">
                    {exercisePerformance.lastIsBodyWeight
                      ? "BW"
                      : exercisePerformance.lastWeight}
                    {exercisePerformance.lastIsBodyWeight
                      ? ""
                      : exercisePerformance.lastWeightUnit || ""}{" "}
                    &times; {exercisePerformance.lastReps}
                  </span>{" "}
                  {exercisePerformance.lastSets ? (
                    <span className="font-semibold">
                      | {exercisePerformance.lastSets}{" "}
                      {exercisePerformance.lastSets > 1 ? "sets" : "set"}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Set</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseSet.sets.map((set, i) => {
                const pbStatus = getPersonalBestStatus(set);
                const isNewPB = pbStatus === "new-pb";
                const isMatchesPB = pbStatus === "matches-pb";

                return (
                  <TableRow
                    key={set.id}
                    className={
                      isNewPB
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200"
                        : isMatchesPB
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {i + 1}
                      {isNewPB && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          NEW PB
                        </span>
                      )}
                      {isMatchesPB && (
                        <span className="ml-2 text-xs text-blue-600 font-semibold">
                          CURRENT PB
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn({
                        "font-semibold text-blue-700": isMatchesPB,
                        "font-semibold text-green-700": isNewPB,
                      })}
                    >
                      {set.isBodyWeight
                        ? "BW"
                        : `${set.weight}${set.weightUnit}`}
                    </TableCell>
                    <TableCell
                      className={cn({
                        "font-semibold text-blue-700": isMatchesPB,
                        "font-semibold text-green-700": isNewPB,
                      })}
                    >
                      {set.reps}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteDialog
                        disabled={isPending}
                        onConfirm={() => handleDeleteSet(set.id)}
                        title="Delete Set"
                        description="Are you sure you want to delete this set? This action cannot be undone."
                        confirmButtonText="Delete Set"
                        triggerTitle="Delete set"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
      {exerciseSet?.isActive ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-[auto_1fr_1fr_auto] gap-4"
          >
            <div className="text-lg  grow flex items-center">
              {exerciseSet?.sets.length ? exerciseSet.sets.length + 1 : 1}
            </div>

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="weight"
                disabled={isPending || isBodyWeight}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Weight</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {!isBodyWeight ? (
                          <span className="absolute right-4 border-l pl-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {user?.preferences?.defaultWeightUnit?.toLowerCase() ||
                              DEFAULT_WEIGHT}
                          </span>
                        ) : null}
                        <Input
                          min={isBodyWeight ? undefined : 1}
                          placeholder={isBodyWeight ? "Body Weight" : "0"}
                          type="number"
                          inputMode="numeric"
                          {...field}
                          value={isBodyWeight ? "" : field.value}
                          onChange={isBodyWeight ? () => {} : field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="reps"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Reps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="0"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center">
              <Button
                type="submit"
                size="icon"
                variant="primary"
                disabled={isPending}
                className="size-8 rounded-full"
                title="Save set"
                aria-label="Save set"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>

            <div className="row-start-2 col-span-4 flex justify-between">
              {/* Body Weight Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isBodyWeight ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsBodyWeight(!isBodyWeight);
                    if (!isBodyWeight) {
                      // When enabling body weight, clear the weight field
                      form.setValue("weight", "");
                    }
                  }}
                  className="h-8 px-2 text-xs"
                  disabled={isPending}
                >
                  <Weight className="h-3 w-3 mr-1" />
                  Body Weight
                </Button>
                {isBodyWeight && user?.bodyWeight && (
                  <span className="text-xs text-muted-foreground">
                    ({user.bodyWeight}
                    {user.bodyWeightUnit || user.preferences?.defaultWeightUnit}
                    )
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {!showNotes ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotes(true)}
                    className="self-end"
                  >
                    Add notes to this set
                    <Plus />
                  </Button>
                ) : (
                  <FormField
                    control={form.control}
                    name="notes"
                    disabled={isPending}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes (optional)"
                            maxLength={255}
                            {...field}
                            ref={(e) => {
                              field.ref(e);
                              notesTextareaRef.current = e;
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-muted-foreground text-right">
                          {field.value?.length || 0}/255
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 col-start-1 col-span-4 justify-end">
              <Button
                disabled={isPending || !exerciseSet?.sets.length}
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    toast.promise(
                      setActiveMutation({
                        exerciseSetId,
                        isActive: false,
                      }),
                      {
                        loading: "Finishing exercise…",
                        success: () => "Exercise finished",
                        error: "Failed to finish exercise. Please try again.",
                      }
                    );
                  });
                }}
              >
                Finish exercise
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
