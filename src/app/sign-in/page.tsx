"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, Dumbbell, LogIn } from "lucide-react";
import Link from "next/link";
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Overload
              </span>
            </Link>
          </div>
        </div>
      </header>

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
