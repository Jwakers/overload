import { getAllMuscleGroups, MUSCLE_GROUPS } from "@/convex/lib/muscle_groups";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ExerciseFilterProps = {
  value: string;
  setValue: (value: string) => void;
  children: React.ReactNode;
};

export function ExerciseFilter({
  value,
  setValue,
  children,
}: ExerciseFilterProps) {
  const [open, setOpen] = useState(false);

  const mainGroups = Object.keys(MUSCLE_GROUPS);
  const allItems = new Set([...mainGroups, ...getAllMuscleGroups()]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
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
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  {group.split("_").join(" ")}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === group ? "opacity-100" : "opacity-0"
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
