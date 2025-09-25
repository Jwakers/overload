import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FilterIcon, PlusCircle, Search, X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
} from "../ui/drawer";
import { Input } from "../ui/input";
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

    let filtered = exercises;

    // Apply muscle group filter
    if (filterValue) {
      const fv = filterValue.toLowerCase();
      filtered = filtered.filter((exercise) =>
        exercise.muscleGroups.some((group) => group.toLowerCase() === fv)
      );
    }

    // Apply search filter (by exercise name)
    if (searchValue) {
      const sv = searchValue.toLowerCase();
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(sv)
      );
    }

    return filtered;
  }, [exercises, filterValue, searchValue]);

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
      <DrawerContent className="flex flex-col h-full">
        <DrawerHeader className="pb-4">
          <DrawerTitle>Select Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your workout.
          </DrawerDescription>
        </DrawerHeader>

        {/* Search and Filter Section */}
        <div className="px-4 pb-4 space-y-3 border-b">
          {/* Search Input and Filter Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                ref={inputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search exercises"
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchValue("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 size-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <ExerciseFilter value={filterValue} setValue={setFilterValue}>
              <Button
                variant="outline"
                title="Filter exercises"
                className="h-12"
              >
                <FilterIcon />
                <span>Filter</span>
              </Button>
            </ExerciseFilter>
          </div>

          {/* Filter Tags and Results */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {filterValue && (
                <Badge
                  variant="secondary"
                  className="capitalize pr-1"
                  onClick={() => setFilterValue("")}
                >
                  {filterValue.split("_").join(" ")}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterValue("")}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              )}
            </div>

            {/* Results count */}
            {(searchValue || filterValue) && (
              <span className="text-sm text-muted-foreground">
                {refinedExercises?.length || 0} exercise
                {(refinedExercises?.length || 0) !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 px-4 overflow-y-auto" ref={scrollContainerRef}>
          <div className="space-y-2 py-4">
            {refinedExercises?.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto size-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No exercises found</p>
                <p className="text-sm text-muted-foreground">
                  {searchValue || filterValue
                    ? "Try adjusting your search or filter criteria"
                    : "No exercises available"}
                </p>
                {(searchValue || filterValue) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchValue("");
                      setFilterValue("");
                    }}
                    className="mt-4"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              refinedExercises?.map((exercise) => {
                const hasDuplicate = duplicateNames.has(exercise.name);

                return (
                  <div
                    key={exercise._id}
                    onClick={() => onSelect(exercise._id)}
                    className="p-4 w-full rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base">
                            {exercise.name}
                          </p>
                          {hasDuplicate && exercise.equipment ? (
                            <p className="text-xs capitalize text-muted-foreground">
                              ({exercise.equipment})
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscleGroups.slice(0, 4).map((group) => {
                            const name = group.split("_").join(" ");
                            return (
                              <span
                                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                                key={group}
                              >
                                {name}
                              </span>
                            );
                          })}
                          {exercise.muscleGroups.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{exercise.muscleGroups.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      <PlusCircle className="text-brand size-6 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </DrawerNested>
  );
}
