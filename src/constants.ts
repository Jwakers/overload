export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  SPLITS: "/splits",
} as const satisfies Record<string, `/${string}`>;

export const MAX_EXERCISES_TO_SHOW = 3; // How many exercises show in pill form in condensed split views
