"use client";

import { ROUTES } from "@/constants";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SignInRedirect() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect_url");
  // Only allow same-origin relative paths like "/foo" (reject "//" and absolute URLs)
  const redirectUrl =
    rawRedirect && /^\/(?!\/)/.test(rawRedirect)
      ? rawRedirect
      : ROUTES.DASHBOARD;
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  return null;
}
