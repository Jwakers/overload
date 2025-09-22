"use client";

import { Authenticated } from "convex/react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { SignInButton } from "@clerk/nextjs";
import { Unauthenticated } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
        Welcome to <span className="text-brand">Overload</span>
      </h2>
      <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
        Your fitness journey starts here. Track your workouts, monitor your
        progress, and achieve your goals with our comprehensive fitness
        platform.
      </p>
      <div className="mt-10 flex justify-center space-x-4">
        <Unauthenticated>
          <SignInButton mode="modal">
            <Button size="lg" className="px-8">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Button asChild size="lg" className="px-8">
            <Link href={ROUTES.DASHBOARD}>Go to Dashboard</Link>
          </Button>
        </Authenticated>
        <Button variant="outline" size="lg" className="px-8">
          Learn More
        </Button>
      </div>
    </div>
  );
}
