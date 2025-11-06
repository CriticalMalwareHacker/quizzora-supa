import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award } from "lucide-react";
import Link from "next/link";

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { score: string; total: string };
}) {
  const score = Number(searchParams.score) || 0;
  const total = Number(searchParams.total) || 0;
  const percentage = total > 0 ? (score / total) * 100 : 0;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Award className="h-16 w-16 text-yellow-500 mx-auto" />
          <CardTitle className="text-3xl font-bold mt-4">
            Quiz Complete!
          </CardTitle>
          <CardDescription>
            You have successfully submitted your answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">YOUR SCORE</p>
            <p className="text-6xl font-bold text-primary">
              {score}
              <span className="text-3xl text-muted-foreground"> / {total}</span>
            </p>
            <p className="text-2xl font-semibold text-primary">
              {percentage.toFixed(0)}%
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}