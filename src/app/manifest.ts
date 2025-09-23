import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Overload",
    short_name: "Overload",
    description: "An app to help you track your gym workouts",
    orientation: "portrait",
    categories: ["gym", "workout", "fitness"],
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    lang: "en-GB",
    dir: "ltr",
  };
}
