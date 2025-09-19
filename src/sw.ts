import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload: Record<string, unknown> = {};
      try {
        payload = event.data ? event.data.json() : {};
      } catch {
        // Fallback if payload isn't JSON
        payload = { title: "Overload", body: event.data?.text() ?? "" };
      }
      const title = payload.title || "Overload";
      const options = {
        body: payload.body || "You have a new notification.",
        icon: payload.icon || "/web-app-manifest-192x192.png",
        badge: payload.badge || "/web-app-manifest-192x192.png",
        vibrate: payload.vibrate || [100, 50, 100],
        data: {
          ...(payload.data || {}),
          url: payload.url || "/",
          dateOfArrival: Date.now(),
        },
      } as unknown as NotificationOptions;
      if (typeof title !== "string") {
        throw new Error("Title is not a string");
      }

      return self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data?.url || "/");
      }
    })()
  );
});
