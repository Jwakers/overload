import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const user = useQuery(api.users.current);
  const createSubscription = useMutation(
    api.pushSubscriptions.createSubscription
  );
  const deleteSubscription = useMutation(
    api.pushSubscriptions.deleteSubscription
  );
  const userSubscriptions = useQuery(
    api.pushSubscriptions.getUserSubscriptions,
    !user ? "skip" : undefined
  );

  useEffect(() => {
    if (!user) return;
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }

    // Check current notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    async function registerServiceWorker() {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  }, [user]);

  useEffect(() => {
    if (!userSubscriptions) return;

    // Find if we have a matching subscription in the database
    const dbSub = userSubscriptions.find(
      (sub) => subscription && sub.endpoint === subscription.endpoint
    );

    if (!subscription) return;
    if (subscription && dbSub) return;

    const p256dh = subscription.getKey("p256dh");
    const auth = subscription.getKey("auth");
    if (!p256dh || !auth) throw new Error("Keys missing for subscription");

    setIsUpdating(true);
    toast.promise(
      createSubscription({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64url(p256dh),
        auth: arrayBufferToBase64url(auth),
        userAgent: navigator.userAgent,
      }),
      {
        loading: "Updating push notification subscription...",
        success: "Push notification subscription updated successfully",
        error: "Error updating push notification subscription",
        finally: () => setIsUpdating(false),
      }
    );
  }, [createSubscription, deleteSubscription, subscription, userSubscriptions]);

  async function subscribeToPush() {
    if (!user) return;
    setIsUpdating(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
    } catch (error) {
      console.error("Error subscribing to push notifications", error);
      toast.error("Error subscribing to push notifications");
    } finally {
      setIsUpdating(false);
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    if (!subscription?.endpoint) {
      toast.error("Error unsubscribing from push notifications");
      return;
    }

    toast.promise(deleteSubscription({ endpoint: subscription?.endpoint }), {
      loading: "Unsubscribing from push notifications...",
      success: "Unsubscribed from push notifications",
      error: "Error unsubscribing from push notifications",
    });
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);
    return permission;
  }

  return {
    isSupported,
    subscription,
    permission,
    isUpdating,
    subscribeToPush,
    unsubscribeFromPush,
    requestNotificationPermission,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
