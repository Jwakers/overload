import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  CheckIcon,
  Delete,
  Filter as FilterIcon,
  Plus,
  PlusCircle,
  Save,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function WorkoutDrawer() {
  const [open, setOpen] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] =
    useState<Id<"workoutSessions"> | null>(null);
  const createWorkoutSession = useMutation(api.workoutSessions.create);
  const deleteWorkoutSession = useMutation(
    api.workoutSessions.deleteWorkoutSession
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

  console.log("workoutSessionId", workoutSessionId);

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
          <DrawerHeader>
            <DrawerTitle>New Workout</DrawerTitle>
            <DrawerDescription>Description goes here</DrawerDescription>
          </DrawerHeader>
          <div className="container">
            <p className="my-2 text-sm text-destructive-foreground bg-destructive p-2 px-4 rounded-md">
              TODO: There needs to be an way to add a split to this without
              slowing down the flow.
            </p>
          </div>
          <div className="container flex flex-col gap-2 h-full justify-end">
            <button
              className="flex justify-between gap-2 rounded border border-dashed p-4"
              onClick={() => setSelectExerciseDialogOpen(true)}
            >
              <p className="font-semibold">Add first exercise</p>
              <PlusCircle className="text-brand" size={24} />
            </button>
          </div>

          <SelectExerciseDrawer
            open={selectExerciseDialogOpen}
            onChange={setSelectExerciseDialogOpen}
          />

          <DrawerFooter className="flex flex-row gap-2 max-w-xl mx-auto w-full">
            <DrawerClose asChild>
              <Button variant="outline">
                <Delete />
                Cancel
              </Button>
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
      <DrawerContent className="max-h-[94%]">
        <DrawerHeader>
          <DrawerTitle>Select Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your workout.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex-1">
          <Command>
            <CommandList className="max-h-[calc(100dvh-260px)]">
              <CommandEmpty>No exercises found.</CommandEmpty>
              <CommandGroup>
                {refinedExercises?.map((exercise) => {
                  return (
                    <CommandItem key={exercise._id}>
                      <div className="p-4 w-full rounded border flex justify-between items-center gap-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {exercise.name}
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
                        <PlusCircle className="text-brand min-w-6" size={24} />
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

export function ExerciseFilter(props: {
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
