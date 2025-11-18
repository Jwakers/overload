import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Dumbbell, Save } from "lucide-react";

export default function WorkoutLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Button variant="ghost" size="sm" disabled className="h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Skeleton className="h-8 w-8" />
            <div className="text-sm gap-2 inline-grid grid-cols-2 ml-auto">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="container px-4 py-4 space-y-4">
          {/* Split Selection Grid Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="text-center py-2">
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 bg-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Skeleton className="h-10 w-40 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-inset-bottom z-10">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button disabled variant="secondary" size="lg">
              <Save size={16} />
              <span className="hidden sm:inline">Save workout</span>
              <span className="sm:hidden">Save</span>
            </Button>

            <button
              type="button"
              disabled
              className="bg-brand/50 text-brand-foreground flex items-center gap-2 px-4 py-3 rounded-full shadow-lg flex-1 max-w-50 justify-center cursor-not-allowed opacity-50"
            >
              <Dumbbell size={18} />
              <p className="text-sm font-semibold">Add exercise</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
