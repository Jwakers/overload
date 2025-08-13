"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { BarChart3, CheckCircle, Dumbbell, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-brand/5 via-brand/10 to-brand/5">
      <AuthLoading>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-md w-full">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-brand-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand bg-clip-text text-transparent">
              Overload
            </h1>
            <p className="text-muted-foreground mt-2">
              Your fitness journey starts here
            </p>
          </div>

          {/* Sign In Section */}
          <div className="space-y-6">
            <SignInButton mode="modal">
              <Button variant="default" className="w-full" size="lg">
                Sign In
              </Button>
            </SignInButton>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span>New to Overload?</span>{" "}
                <SignUpButton mode="modal">
                  <Button variant="link" className="p-0 h-auto">
                    Create an account
                  </Button>
                </SignUpButton>
              </p>
            </div>
          </div>

          <Separator className="my-8" />

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
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-success to-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-8 h-8 text-success-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Overload!
          </h2>
          <p className="text-muted-foreground mb-6">
            You&apos;re all set and ready to go!
          </p>

          <Button asChild variant="default" className="w-full" size="lg">
            <button onClick={() => router.push("/")}>Go to Dashboard</button>
          </Button>
        </div>
      </Authenticated>
    </div>
  );
}
