import { CreateSplitDialog } from "@/components/workout-components/create-split-dialog";
import { Metadata } from "next";
import SplitGrid from "./_components/split-grid";

export const metadata: Metadata = {
  title: "Splits",
  description: "Manage your workout splits and training programmes.",
};

export default function SplitsPage() {
  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Workout Splits</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your workout programs
          </p>
        </div>
        <div className="ml-auto">
          <CreateSplitDialog />
        </div>
      </div>
      <SplitGrid />
    </div>
  );
}
