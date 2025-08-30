import { useQuery } from "convex/react";
import { PlusCircle, X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
} from "../ui/drawer";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const refinedExercises = useMemo(() => {
    if (!exercises) return exercises;
    const fv = filterValue?.toLowerCase();

    return exercises.filter((exercise) => {
      if (!fv) return true;
      return exercise.muscleGroups.some((group) => group.toLowerCase() === fv);
    });
  }, [exercises, filterValue]);

  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    (refinedExercises ?? []).forEach((e) =>
      counts.set(e.name, (counts.get(e.name) ?? 0) + 1)
    );
    return new Set(
      [...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n)
    );
  }, [refinedExercises]);

  useEffect(() => {
    // Scroll to top when filter or search value changes
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = 0;
  }, [filterValue, searchValue]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [open]);

  return (
    <DrawerNested open={open} onOpenChange={onChange}>
      <DrawerContent className="grid grid-rows-[auto_auto_1fr]">
        <DrawerHeader>
          <DrawerTitle>Select Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your workout.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 relative overflow-y-auto">
          <Command>
            <CommandList className="max-h-full" ref={scrollContainerRef}>
              <CommandEmpty>No exercises found.</CommandEmpty>
              <CommandGroup>
                {refinedExercises?.map((exercise) => {
                  const hasDuplicate = duplicateNames.has(exercise.name);

                  return (
                    <CommandItem
                      key={exercise._id}
                      onSelect={() => onSelect(exercise._id)}
                    >
                      <div className="p-4 w-full rounded border flex justify-between items-center gap-2">
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{exercise.name}</p>
                            {hasDuplicate && exercise.equipment ? (
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
            <DrawerFooter className="space-y-2 sticky bottom-0">
              <CommandInput
                ref={inputRef}
                onChangeCapture={(e) =>
                  setSearchValue((e.target as HTMLInputElement).value)
                }
                wrapperClassName="h-14 border-t"
                placeholder="Search exercises..."
              />
              <div className="flex flex-row gap-2 justify-between">
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
                <div className="flex items-center gap-2">
                  {filterValue && (
                    <Button
                      asChild
                      onClick={() => setFilterValue("")}
                      size="sm"
                    >
                      <Badge className="capitalize">
                        {filterValue.split("_").join(" ")} <X size={12} />
                      </Badge>
                    </Button>
                  )}
                  <ExerciseFilter
                    value={filterValue}
                    setValue={setFilterValue}
                  />
                </div>
              </div>
            </DrawerFooter>
          </Command>
        </div>
      </DrawerContent>
    </DrawerNested>
  );
}
