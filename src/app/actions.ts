"use server";

import webpush, { WebPushError } from "web-push";

const contact = process.env.VAPID_CONTACT_EMAIL;
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey || !contact) {
  throw new Error(
    "Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_CONTACT_EMAIL."
  );
}

webpush.setVapidDetails(contact, publicKey, privateKey);

export async function sendNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  title = "Notification",
  message: string
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body: message,
        icon: "/web-app-manifest-192x192.png",
        badge: "/web-app-manifest-192x192.png",
      })
    );
    return { success: true };
  } catch (error: unknown) {
    const status = error instanceof WebPushError ? error.statusCode : undefined;
    if (status === 404 || status === 410) {
      console.warn("Push subscription is gone:", subscription?.endpoint);
      return { success: false, reason: "gone" as const };
    }
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
