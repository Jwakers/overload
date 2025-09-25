"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAX_EXERCISES_TO_SHOW } from "@/constants";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import type { FunctionReturnType } from "convex/server";
import { Calendar, Plus } from "lucide-react";

type SplitListItemProps = {
  split: FunctionReturnType<typeof api.splits.getSplits>[number];
  onSelect: () => void;
  variant?: "button" | "card";
  isSelected?: boolean;
  showUpdatedDate?: boolean;
};

export function SplitListItem({
  split,
  onSelect,
  variant = "button",
  isSelected = false,
  showUpdatedDate = true,
}: SplitListItemProps) {
  const exercisesToShow = split.exercises.slice(0, MAX_EXERCISES_TO_SHOW);

  if (variant === "card") {
    return (
      <button type="button" onClick={onSelect}>
        <Card className="cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle>{split.name}</CardTitle>
              <Badge
                variant={split.isActive ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {split.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {split.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {split.description}
              </p>
            )}

            {exercisesToShow.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {exercisesToShow.map((exercise) => (
                  <Badge
                    key={exercise._id}
                    variant="outline"
                    className="text-xs"
                  >
                    {exercise.name}
                  </Badge>
                ))}
                {exercisesToShow.length < split.exercises.length && (
                  <Badge variant="outline" className="text-xs">
                    +{split.exercises.length - exercisesToShow.length} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="ml-auto">
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center gap-2 text-brand text-sm font-medium group-hover:scale-105 transition-transform">
                <Plus className="h-4 w-4" />
                <span>Select Split</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "w-full group cursor-pointer rounded border p-3 transition-colors hover:border-brand/80 hover:bg-brand/10",
        isSelected && "border-muted-foreground bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium">{split.name}</h4>
          <Badge
            variant={split.isActive ? "default" : "secondary"}
            className="text-xs shrink-0"
          >
            {split.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {split.description && (
          <p className="text-sm text-muted-foreground text-left line-clamp-2">
            {split.description}
          </p>
        )}

        {exercisesToShow.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercisesToShow.map((exercise) => (
              <Badge key={exercise._id} variant="outline" className="text-xs">
                {exercise.name}
              </Badge>
            ))}
            {exercisesToShow.length < split.exercises.length && (
              <Badge variant="outline" className="text-xs">
                +{split.exercises.length - exercisesToShow.length} more
              </Badge>
            )}
          </div>
        )}

        {showUpdatedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Updated {new Date(split.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </button>
  );
}
