import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useTransition } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function WeightUnitToggle() {
  const user = useQuery(api.users.current);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const [isPending, startTransition] = useTransition();

  const handleWeightUnitChange = async (unit: "lbs" | "kg") => {
    // No-op early return to prevent unnecessary writes and UI churn
    if ((user?.preferences?.defaultWeightUnit ?? "lbs") === unit) return;

    startTransition(() => {
      toast.promise(
        updatePreferences({ preferences: { defaultWeightUnit: unit } }),
        {
          loading: "Updating preferences…",
          success: `Preferences updated. Weight unit changed to ${unit.toUpperCase()}`,
          error: "Failed to update weight unit. Please try again.",
        }
      );
    });
  };

  if (!user)
    return (
      <div className="text-sm gap-2 inline-grid grid-cols-2 ml-auto">
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-9 w-12" />
      </div>
    );

  return (
    <div className="text-sm gap-2 inline-grid grid-cols-2 ml-auto">
      <button
        className={cn(
          "p-2 px-3 z-10 rounded bg-muted",
          isPending && "bg-brand/50 cursor-not-allowed",
          user.preferences?.defaultWeightUnit === "lbs" &&
            "bg-brand text-brand-foreground"
        )}
        onClick={() => handleWeightUnitChange("lbs")}
        disabled={isPending}
        title="Change weight unit to lbs"
        type="button"
      >
        LBS
      </button>
      <button
        className={cn(
          "p-2 px-3 z-10 rounded transition-colors",
          isPending && "bg-brand/50 cursor-not-allowed",
          user.preferences?.defaultWeightUnit === "kg" &&
            "bg-brand text-brand-foreground"
        )}
        onClick={() => handleWeightUnitChange("kg")}
        disabled={isPending}
        title="Change weight unit to kg"
        type="button"
      >
        KG
      </button>
    </div>
  );
}
