import { PlusCircle, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
  DrawerClose,
} from "../ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { ExerciseFilter } from "./exercise-filter";

interface SelectExerciseDrawerProps {
  open: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
  onSelect: (exerciseId: Id<"exercises">) => void;
}

export function SelectExerciseDrawer({
  open,
  onChange,
  onSelect,
}: SelectExerciseDrawerProps) {
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
    <DrawerNested open={open} onOpenChange={onChange}>
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
                      onSelect={() => onSelect(exercise._id)}
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