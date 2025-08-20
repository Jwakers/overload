import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useTransition } from "react";
import { api } from "../../../convex/_generated/api";

export function WeightUnitToggle() {
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
    <div className="text-sm gap-2 inline-grid grid-cols-2 ml-auto">
      <button
        className={cn(
          "p-2 px-3 z-10 rounded bg-muted",
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
          "p-2 px-3 z-10 rounded transition-colors",
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
