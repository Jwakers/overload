"use client";

import { sendNotification } from "@/app/actions";
import usePushNotification from "@/lib/hooks/use-push-notifications";
import { Bell, BellOff, CheckCircle, Code, Send, XCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function PushNotificationManager() {
  const {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    isUpdating,
  } = usePushNotification();

  function handleTest(formData: FormData) {
    const message = formData.get("message") as string;
    if (!subscription) throw new Error("No subscription found");

    sendNotification(JSON.parse(JSON.stringify(subscription)), "test", message);
  }

  if (!isSupported) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Not Supported
        </h3>
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {permission === "denied" ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Notifications Blocked
              </h3>
              <p className="text-sm text-destructive/80 mb-4">
                Please enable notifications in your browser settings to receive
                workout reminders.
              </p>
              <div className="bg-destructive/5 border border-destructive/10 rounded-md p-3">
                <p className="text-xs text-destructive/70">
                  <strong>How to enable:</strong> Click the notification icon in
                  your browser&apos;s address bar, or go to Settings → Privacy &
                  Security → Notifications
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : subscription && permission === "granted" ? (
        <div className="space-y-6">
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Notifications Enabled
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive workout reminders and progress updates
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unsubscribeFromPush}
                  disabled={isUpdating}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <BellOff className="w-4 h-4 mr-1" />
                  Disable
                </Button>
              </div>
            </div>
          </div>

          <DevTestPanel handleTest={handleTest} isUpdating={isUpdating} />
        </div>
      ) : subscription && permission !== "granted" ? (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Permission Required
                </h3>
                <p className="text-sm text-yellow-700/80 mb-4">
                  You have a notification subscription but need to grant device
                  permission to receive notifications.
                </p>
                <Button
                  onClick={subscribeToPush}
                  disabled={isUpdating}
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isUpdating ? "Requesting..." : "Grant Permission"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enable Notifications
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Get workout reminders and progress updates to stay motivated and
              on track with your fitness goals.
            </p>
            <Button
              onClick={subscribeToPush}
              disabled={isUpdating}
              className="w-full bg-brand hover:bg-brand/90 text-white shadow-sm"
              size="lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isUpdating ? "Enabling..." : "Enable Notifications"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DevTestPanel({
  handleTest,
  isUpdating,
}: {
  handleTest: (formData: FormData) => void;
  isUpdating: boolean;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="bg-gradient-to-br border-dashed from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <Code className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-800">
            Development Tools
          </h4>
          <p className="text-xs text-amber-600">
            Testing and debugging features
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-amber-300 text-amber-700 bg-amber-100"
        >
          DEV ONLY
        </Badge>
      </div>
      <div className="space-y-4">
        <form action={handleTest}>
          <Label className="text-sm font-medium text-amber-800 mb-3 block">
            Test Notification
          </Label>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter test message..."
              name="message"
              className="flex-1 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
            />
            <Button
              type="submit"
              disabled={isUpdating}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              <Send className="w-4 h-4 mr-1" />
              Send Test
            </Button>
          </div>
        </form>
        <div className="bg-amber-100/50 border border-amber-200 rounded-md p-3">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> This feature is only available in development
            mode for testing purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
