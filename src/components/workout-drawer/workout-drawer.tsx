import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import {
  CheckIcon,
  Edit,
  Filter as FilterIcon,
  Plus,
  PlusCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  getAllMuscleGroups,
  MUSCLE_GROUPS,
} from "../../../convex/lib/muscle_groups";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNested,
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
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";

// TODO: Handle deleting and editing an exercise set
// TODO: Handle deleting a workout session
// TODO: Saving a workout should trigger a confirmation dialog

function WeightUnitToggle() {
  const user = useQuery(api.users.current);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const [updating, startUpdating] = useTransition();

  const handleWeightUnitChange = async (unit: "lbs" | "kg") => {
    startUpdating(async () => {
      await updatePreferences({
        preferences: {
          defaultWeightUnit: unit,
        },
      });
    });
  };

  if (!user) return null;

  return (
    <div className="grid bg-muted grid-cols-2 rounded overflow-hidden">
      <button
        className={cn(
          "p-2 z-10 rounded",
          updating && "bg-brand/50 cursor-not-allowed",
          user.preferences?.defaultWeightUnit === "lbs" &&
            "bg-brand text-brand-foreground"
        )}
        onClick={() => handleWeightUnitChange("lbs")}
        disabled={updating}
        title="Change weight unit to lbs"
      >
        LBS
      </button>
      <button
        className={cn(
          "p-2 z-10 rounded transition-colors",
          updating && "bg-brand/50 cursor-not-allowed",
          user.preferences?.defaultWeightUnit === "kg" &&
            "bg-brand text-brand-foreground"
        )}
        onClick={() => handleWeightUnitChange("kg")}
        disabled={updating}
        title="Change weight unit to kg"
      >
        KG
      </button>
    </div>
  );
}

export function WorkoutDrawer() {
  const [open, setOpen] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] =
    useState<Id<"workoutSessions"> | null>(null);
  const createWorkoutSession = useMutation(api.workoutSessions.getOrCreate);
  const deleteWorkoutSession = useMutation(
    api.workoutSessions.deleteWorkoutSession
  );
  const setActiveMutation = useMutation(api.workoutSessions.setActive);
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

  useEffect(() => {
    if (workoutSessionId || !open) return;
    createWorkoutSession().then((id) => setWorkoutSessionId(id));
  }, [open, createWorkoutSession, workoutSessionId]);

  useEffect(() => {
    // If there are no exercises on unmounting then delete the workout session
    return () => {
      console.log("unmounting", workoutSessionId);
      if (!workoutSessionId) return;
      // TODO: Check if there are any exercises on the workout session
      // deleteWorkoutSession({ id: workoutSessionId });
    };
  }, [workoutSessionId, deleteWorkoutSession]);

  const handleSelectExercise = async (exerciseId: Id<"exercises">) => {
    if (!workoutSessionId) return;

    await createExerciseSet({
      workoutSessionId,
      exerciseId,
      order: (exerciseSets?.length ?? 0) + 1,
    });
    setSelectExerciseDialogOpen(false);
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
        <DrawerContent className="h-full">
          <DrawerHeader className="space-y-2">
            <DrawerTitle>New Workout</DrawerTitle>
            <WeightUnitToggle />
          </DrawerHeader>
          <ScrollArea className="h-full overflow-y-auto">
            <div className="container">
              <p className="my-2 text-sm text-destructive-foreground bg-destructive p-2 px-4 rounded-md">
                TODO: There needs to be an way to add a split to this without
                slowing down the flow.
              </p>
            </div>
            <div className="container flex flex-col gap-2 h-full justify-end relative">
              {exerciseSets?.map((exerciseSet, i) => {
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
                  "flex justify-between sticky bottom-0 gap-2 rounded border border-dashed p-4 bg-background",
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
          </ScrollArea>

          <DrawerFooter className="flex flex-row gap-2 max-w-xl mx-auto w-full">
            <DrawerClose asChild>
              <Button variant="outline">Delete Workout</Button>
            </DrawerClose>
            <Button
              className="grow"
              variant="primary"
              onClick={() => {
                if (!workoutSessionId) return;
                setActiveMutation({ workoutSessionId, isActive: false });
                setOpen(false);
              }}
            >
              <Save />
              <span>Save Workout</span>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function SelectExerciseDrawer(props: {
  open: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
  onSelect: (exerciseId: Id<"exercises">) => void;
}) {
  const exercises = useQuery(api.exercises.getAll);
  const [filterValue, setFilterValue] = useState<string>("");
  const [refinedExercises, setRefinedExercises] =
    useState<typeof exercises>(exercises);

  useEffect(() => {
    if (!exercises) return;
    const filterRefined = exercises.filter((exercise) => {
      if (!filterValue) return true;
      return exercise.muscleGroups.some((group) => group.includes(filterValue));
    });

    setRefinedExercises(filterRefined);
  }, [exercises, filterValue]);

  return (
    <DrawerNested open={props.open} onOpenChange={props.onChange}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[94dvh]">
        <DrawerHeader>
          <DrawerTitle>Select Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your workout.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex-1">
          <Command>
            <CommandList className="max-h-[calc(100dvh-280px)]">
              <CommandEmpty>No exercises found.</CommandEmpty>
              <CommandGroup>
                {refinedExercises?.map((exercise) => {
                  const hasDuplicate = refinedExercises.some(
                    (e) => e.name === exercise.name && e._id !== exercise._id
                  );
                  return (
                    <CommandItem
                      key={exercise._id}
                      onSelect={() => props.onSelect(exercise._id)}
                    >
                      <div className="p-4 w-full rounded border flex justify-between items-center gap-2">
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{exercise.name}</p>
                            {hasDuplicate ? (
                              <p className="text-xs capitalize text-muted-foreground">
                                ({exercise.equipment})
                              </p>
                            ) : null}
                          </div>
                          <ul className="flex flex-wrap gap-1 text-xs text-muted-foreground max-h-14 overflow-hidden">
                            {exercise.muscleGroups.map((group) => {
                              const name = group.split("_").join(" ");
                              return (
                                <li
                                  className="rounded-full bg-muted px-2 py-1"
                                  key={group}
                                >
                                  {name}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <PlusCircle className="text-brand size-6" />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <CommandInput
              wrapperClassName="h-14"
              placeholder="Search exercises..."
            />
          </Command>
        </div>

        <DrawerFooter className="flex flex-row gap-2 justify-between">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          <div className="flex items-center gap-2">
            {filterValue && (
              <Button asChild onClick={() => setFilterValue("")} size="sm">
                <Badge>
                  {filterValue} <X size={12} />
                </Badge>
              </Button>
            )}
            <ExerciseFilter value={filterValue} setValue={setFilterValue} />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </DrawerNested>
  );
}

function ExerciseFilter(props: {
  value: string;
  setValue: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const mainGroups = Object.keys(MUSCLE_GROUPS);
  const allItems = new Set([...mainGroups, ...getAllMuscleGroups()]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          title="Filter exercises"
        >
          <FilterIcon />
          <span>Filter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput placeholder="Search muscle groups..." />
          <CommandList>
            <CommandEmpty>No muscle groups found.</CommandEmpty>
            <CommandGroup>
              {Array.from(allItems).map((group) => (
                <CommandItem
                  key={group}
                  value={group}
                  onSelect={(currentValue) => {
                    props.setValue(
                      currentValue === props.value ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  {group.split("_").join(" ")}
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      props.value === group ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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

function ExerciseSetForm(props: { exerciseSetId: Id<"exerciseSets"> }) {
  // TODO: Show saved sets above the form
  // TODO: reset values when the form is submitted
  // TODO: add an is body weight option
  // TODO: When weight unit changes, convert the current weight value to the new unit
  const user = useQuery(api.users.current);
  const exerciseSet = useQuery(api.exerciseSets.get, {
    exerciseSetId: props.exerciseSetId,
  });
  const addSetMutation = useMutation(api.exerciseSets.addSet);
  const setActiveMutation = useMutation(api.exerciseSets.setActive);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExerciseSetFormData>({
    resolver: zodResolver(exerciseSetSchema),
    defaultValues: {
      weight: "", // TODO: Pre-populate weight default value with the last exercise set weight
      reps: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof exerciseSetSchema>) {
    const weight = Number(values.weight);
    const reps = Number(values.reps);
    const notes = values.notes;

    if (weight < 0) {
      form.setError("weight", { message: "Weight must be positive" });
      return;
    }

    if (reps < 1) {
      form.setError("reps", { message: "Reps must be at least 1" });
    }

    if (isNaN(weight) || isNaN(reps)) {
      form.setError("weight", { message: "Weight must be a number" });
      form.setError("reps", { message: "Reps must be a number" });
      return;
    }

    startTransition(async () => {
      await addSetMutation({
        exerciseSetId: props.exerciseSetId,
        weightUnit: user?.preferences?.defaultWeightUnit || DEFAULT_WEIGHT,
        set: {
          weight,
          reps,
          notes,
        },
      });
    });
  }

  return (
    <div className="space-y-3">
      {exerciseSet ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Set</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Reps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseSet.sets.map((set, i) => (
                <TableRow key={exerciseSet._id + i}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    {set.weight}
                    {set.weightUnit}
                  </TableCell>
                  <TableCell>{set.reps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
      {exerciseSet?.isActive ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-[auto_1fr_1fr] gap-4"
          >
            <div className="text-lg  grow flex items-center">
              {exerciseSet?.sets.length ? exerciseSet.sets.length + 1 : 1}
            </div>

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="weight"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Weight</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute right-4 border-l pl-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {user?.preferences?.defaultWeightUnit?.toLowerCase() ||
                            DEFAULT_WEIGHT}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
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
                      <Input type="number" min={1} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 col-start-2 col-span-2">
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
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground text-right">
                      {field.value?.length || 0}/255
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2 col-start-1 col-span-3 justify-end">
              <Button
                variant="outline"
                disabled={isPending}
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await setActiveMutation({
                      exerciseSetId: props.exerciseSetId,
                      isActive: false,
                    });
                  });
                }}
              >
                Finish exercise
              </Button>

              <Button type="submit" disabled={isPending}>
                Save set
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
