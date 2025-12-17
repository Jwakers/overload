"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSplitDialog } from "@/components/workout-drawer/create-split-dialog";
import { ROUTES } from "@/constants";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Dumbbell, Plus } from "lucide-react";
import Link from "next/link";

export default function SplitGrid() {
  const splits = useQuery(api.splits.getSplits);

  if (splits === undefined) {
    return <SplitGridLoading />;
  }

  if (splits.length === 0) {
    return <SplitGridEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {splits.map((split) => (
        <Link href={`${ROUTES.SPLITS}/${split._id}`} key={split._id}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-xl group-hover:text-brand transition-colors">
                {split.name}
              </CardTitle>
              {split.description && (
                <CardDescription className="line-clamp-2">
                  {split.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Dumbbell className="h-4 w-4" />
                  <span>
                    {split.exercises.length}{" "}
                    {split.exercises.length === 1 ? "exercise" : "exercises"}
                  </span>
                </div>

                {split.exercises.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Exercises:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {split.exercises.slice(0, 3).map((exercise) => (
                        <Badge
                          key={exercise._id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {exercise.name}
                        </Badge>
                      ))}
                      {split.exercises.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{split.exercises.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {split.exercises.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No exercises added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function SplitGridEmpty() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No splits yet
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Create your first workout split to organize your training program.
          Group exercises together for efficient workout planning.
        </p>
        <CreateSplitDialog
          trigger={
            <button className="bg-brand hover:bg-brand/90 text-brand-foreground px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Create Your First Split
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}

function SplitGridLoading() {
  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-muted rounded w-64"></div>
          <div className="h-10 bg-muted rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
