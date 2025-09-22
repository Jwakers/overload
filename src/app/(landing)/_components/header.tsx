"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Dumbbell, LogIn } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Overload</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Authenticated>
              <Button asChild>
                <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
              </Button>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </nav>
        </div>
      </div>
    </header>
  );
}
