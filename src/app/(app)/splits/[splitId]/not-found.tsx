import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { Dumbbell, Home } from "lucide-react";
import Link from "next/link";

export default function SplitNotFound() {
  return (
    <div className="container px-4 py-16 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <Dumbbell className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl">Split Not Found</CardTitle>
          <CardDescription className="text-base">
            The workout split you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to access it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href={ROUTES.SPLITS}>
              <Dumbbell className="w-4 h-4 mr-2" />
              View All Splits
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.DASHBOARD}>
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
