self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = event.data ? event.data.json() : {};
      } catch {
        // Fallback if payload isn't JSON
        payload = { title: "Overload", body: event.data?.text?.() ?? "" };
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
      };
      return self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || "/");
      }
    })()
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);
