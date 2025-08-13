"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { BarChart3, Dumbbell, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-brand/10">
      <AuthLoading>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-brand-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand bg-clip-text text-transparent">
              Overload
            </h1>
            <p className="text-muted-foreground mt-2">
              Your fitness journey starts here
            </p>
          </div>

          {/* Sign In Section */}
          <div className="gap-y-6 flex flex-col items-center">
            <Button asChild variant="primary" className="min-w-60" size="lg">
              <SignInButton mode="modal">Sign In</SignInButton>
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span>New to Overload?</span>{" "}
                <Button asChild variant="link" className="p-0">
                  <SignUpButton mode="modal">Create an account</SignUpButton>
                </Button>
              </p>
            </div>
          </div>

          <Separator className="my-8 mx-auto max-w-80" />

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-brand-muted rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-4 h-4 text-brand" />
              </div>
              <p className="text-xs text-muted-foreground">
                Progressive Overload
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-success-muted rounded-lg flex items-center justify-center mx-auto">
                <Dumbbell className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">Workout Templates</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-brand-muted rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-4 h-4 text-brand" />
              </div>
              <p className="text-xs text-muted-foreground">Data Insights</p>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-success to-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-8 h-8 text-success-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Overload!
          </h2>
          <p className="text-muted-foreground mb-6">
            You&apos;re all set and ready to go!
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-brand to-brand text-brand-foreground py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
