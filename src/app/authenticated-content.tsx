"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export default function AuthenticatedContent() {
  return (
    <>
      <AuthLoading>
        <div>Auth Loading...</div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome to Overload</h1>
          <p className="text-gray-600">Please sign in to continue</p>
          <SignInButton />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome to Overload</h1>
          <UserButton />
          <p className="text-gray-600">You are now authenticated!</p>
        </div>
      </Authenticated>
    </>
  );
}
