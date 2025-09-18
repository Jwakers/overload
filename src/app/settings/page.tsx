"use client";

import { PushNotificationManager } from "@/components/push-notification-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "convex/react";
import { Bell, Edit, Save, User, Weight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function SettingsPage() {
  const user = useQuery(api.users.current);
  const updateUser = useMutation(api.users.update);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");

  // Initialize weight from user data
  useEffect(() => {
    if (user?.bodyWeight) {
      setWeight(user.bodyWeight.toString());
      setWeightUnit(user.bodyWeightUnit || "lbs");
    }
  }, [user]);

  const handleWeightUpdate = async () => {
    if (!user || !weight) return;

    startTransition(async () => {
      toast.promise(
        updateUser({
          bodyWeight: parseFloat(weight),
          bodyWeightUnit: weightUnit,
          lastBodyWeightUpdate: Date.now(),
        }),
        {
          loading: "Updating weight…",
          success: () => "Weight updated successfully",
          error: "Failed to update weight",
        }
      );
    });
  };

  if (!user) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">Loading user information...</p>
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
                      disabled={isPending}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="flex-1"
                    />
                    <select
                      value={weightUnit}
                      disabled={isPending}
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
                      disabled={isPending}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsEditingWeight(false)}
                      disabled={isPending}
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
                          ? `${user.bodyWeight} ${user.bodyWeightUnit || "lbs"}`
                          : "Not set"}
                      </span>
                    </div>
                    <Button
                      onClick={() => setIsEditingWeight(true)}
                      variant="outline"
                      size="sm"
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
                    {user.preferences?.defaultWeightUnit || "lbs"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">
                    Default Rest Time
                  </span>
                  <Badge variant="secondary">
                    {user.preferences?.defaultRestTime || 60}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">
                    Weight Tracking
                  </span>
                  <Badge variant="secondary">
                    {user.preferences?.weightTrackingFrequency || "manual"}
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
