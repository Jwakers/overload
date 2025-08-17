import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  CheckIcon,
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

// TODO: Handle deleting an exercise set

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
      order: 0,
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
            <div className="container flex flex-col gap-2 h-full justify-end">
              {exerciseSets?.map((exerciseSet) => (
                <div className="border p-4 space-y-4" key={exerciseSet._id}>
                  <div className="gap-2 flex justify-between items-center">
                    <p className="font-semibold">
                      {exerciseSet.exercise?.name}
                    </p>
                    <button title="Delete exercise">
                      <Trash2 className="text-destructive" />
                    </button>
                  </div>
                  <ExerciseSetForm />
                  <Separator />
                  <div className="flex gap-2 justify-between">
                    <Button variant="outline">Finish exercise</Button>
                    <Button variant="default">Save and start next set</Button>
                  </div>
                </div>
              ))}
              <button
                className={cn(
                  "flex justify-between gap-2 rounded border border-dashed p-4",
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
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button className="grow" variant="primary">
              <Save />
              <span>Save Workout</span>
              {/* Timer starts when first exercise is added */}
              <span>{"(0 min)"}</span>
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

function ExerciseSetForm() {
  // TODO: Submit the form to the exercise set when all fields are filled. Use zod for validation and error handling.
  // TODO: Pre-populate weight default value with the last exercise set weight. Or the last set weight of the same exercise.
  const user = useQuery(api.users.current);
  return (
    <form>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Set</p>
          <p className=" text-lg font-semibold grow flex items-center">1</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="weight">
            Weight
          </Label>
          <div className="relative">
            <span className="absolute right-4 border-l pl-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {user?.preferences?.defaultWeightUnit.toLowerCase()}
            </span>
            <Input type="number" min={0} id="weight" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="reps">
            Reps
          </Label>
          <Input type="number" min={0} id="reps" />
        </div>
        <div className="flex flex-col gap-2 col-start-2 col-span-2">
          <Label className="sr-only" htmlFor="notes">
            Notes
          </Label>
          <Textarea
            placeholder="Notes"
            maxLength={255}
            id="notes"
            className="resize-none"
          />
        </div>
      </div>
    </form>
  );
}
