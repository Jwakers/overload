import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { ArrowRight, BarChart3, Dumbbell, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const InstallPrompt = dynamic(() => import("@/components/install-prompt"));

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full safe-area-inset">
      <div className="container">
        {/* Hero Section */}
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
            <Button asChild size="lg" className="px-8">
              <Link href={ROUTES.SIGN_IN}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>

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
