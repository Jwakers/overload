"use client";

import { ROUTES } from "@/constants";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SignInRedirect() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || ROUTES.DASHBOARD;
  const auth = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [auth, redirectUrl, router]);

  return null;
}
