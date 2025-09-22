import { BarChart3, Dumbbell, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import Hero from "./_components/hero";

const InstallPrompt = dynamic(() => import("@/components/install-prompt"));

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full">
      <div className="container safe-area-inset">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Progressive Overload
            </h3>
            <p className="text-muted-foreground">
              Monitor your fitness journey with detailed analytics and progress
              tracking to ensure consistent improvement.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-success-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Workout Templates
            </h3>
            <p className="text-muted-foreground">
              Access personalized workout plans designed for your fitness level
              and goals with structured progression.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Data Insights
            </h3>
            <p className="text-muted-foreground">
              Get powerful insights into your performance with detailed
              analytics and progress visualization.
            </p>
          </div>
        </div>

        <InstallPrompt />
      </div>
    </main>
  );
}
