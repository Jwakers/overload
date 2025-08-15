export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  SIGN_IN: "/sign-in",
  SETTINGS: "/settings",
  SPLITS: "/splits",
} as const satisfies Record<string, `/${string}`>;
