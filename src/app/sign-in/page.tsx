"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { ArrowRight, Dumbbell, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || ROUTES.DASHBOARD;
  const auth = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [auth, redirectUrl, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <Authenticated>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back!
              </h1>
              <Button asChild size="lg" className="w-full">
                <Link href={ROUTES.DASHBOARD}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Authenticated>

          <Unauthenticated>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome to Overload
                </h1>
                <p className="text-muted-foreground">
                  Your fitness journey starts here. Sign in to track your
                  workouts, monitor your progress, and achieve your goals.
                </p>
                <p className="text-muted-foreground">
                  This page should redirect automatically to the dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <SignInButton mode="modal">
                  <Button>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </SignInButton>

                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account? Sign in to create one
                  automatically.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={ROUTES.HOME}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </Unauthenticated>
        </div>
      </main>
    </div>
  );
}
