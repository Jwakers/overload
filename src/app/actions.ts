"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:wakehamretail@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  title: string | undefined,
  message: string
) {
  console.log("Sending notification:", subscription, message);
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: title || "Notification",
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
