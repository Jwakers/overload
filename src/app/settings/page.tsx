"use client";

import { PushNotificationManager } from "@/components/push-notification-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "convex/react";
import { Bell, Edit, Save, User, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function SettingsPage() {
  const user = useQuery(api.users.current);
  const updateBodyWeight = useMutation(api.users.updateBodyWeight);
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");

  // Initialize weight from user data
  useEffect(() => {
    if (user && typeof user.bodyWeight === "number") {
      setWeight(user.bodyWeight.toString());
      setWeightUnit(user.bodyWeightUnit || "lbs");
    }
  }, [user]);

  const handleWeightUpdate = async () => {
    if (!user || weight.trim() === "") return;
    const parsed = parseFloat(weight);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Please enter a valid weight greater than 0");
      return;
    }

    setIsUpdatingWeight(true);
    toast.promise(
      updateBodyWeight({
        bodyWeight: parsed,
        bodyWeightUnit: weightUnit,
      }),
      {
        loading: "Updating weight…",
        success: () => "Weight updated successfully",
        error: "Failed to update weight",
        finally: () => {
          setIsEditingWeight(false);
          setIsUpdatingWeight(false);
        },
      }
    );
  };

  if (user === undefined) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">You are not signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-6">
        {/* User Information Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                User Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your personal information and preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Name
              </Label>
              <div className="mt-1 p-3 bg-muted/50 border border-border rounded-md">
                <p className="text-foreground">{user.name}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">
                Body Weight
              </Label>
              <div className="mt-1 flex items-center gap-2">
                {isEditingWeight ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      value={weight}
                      disabled={isUpdatingWeight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="flex-1"
                      min={0}
                      inputMode="numeric"
                    />
                    <select
                      value={weightUnit}
                      disabled={isUpdatingWeight}
                      onChange={(e) =>
                        setWeightUnit(e.target.value as "lbs" | "kg")
                      }
                      className="px-3 py-2 border border-border rounded-md bg-background"
                      aria-label="Weight unit"
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                    <Button
                      onClick={handleWeightUpdate}
                      disabled={isUpdatingWeight}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                      aria-label="Save body weight"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsEditingWeight(false)}
                      disabled={isUpdatingWeight}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-md flex-1">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {user.bodyWeight
                          ? `${user.bodyWeight} ${user.bodyWeightUnit ?? "lbs"}`
                          : "Not set"}
                      </span>
                    </div>
                    <Button
                      onClick={() => setIsEditingWeight(true)}
                      variant="outline"
                      size="sm"
                      aria-label="Edit body weight"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">
                Preferences
              </Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">
                    Default Weight Unit
                  </span>
                  <Badge variant="secondary">
                    {user.preferences?.defaultWeightUnit ?? "lbs"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">
                    Default Rest Time
                  </span>
                  <Badge variant="secondary">
                    {user.preferences?.defaultRestTime ?? 60}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">
                    Weight Tracking
                  </span>
                  <Badge variant="secondary">
                    {user.preferences?.weightTrackingFrequency ?? "manual"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-muted rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
            </div>
          </div>

          <PushNotificationManager />
        </div>
      </div>
    </div>
  );
}
