"use client";

import { ROUTES } from "@/constants";
import { UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading } from "convex/react";
import { Dumbbell } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.DASHBOARD} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Overload</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <AuthLoading>
              <div className="size-7 animate-pulse rounded-full bg-muted" />
            </AuthLoading>
            <Authenticated>
              <UserButton />
            </Authenticated>
          </nav>
        </div>
      </div>
    </header>
  );
}
