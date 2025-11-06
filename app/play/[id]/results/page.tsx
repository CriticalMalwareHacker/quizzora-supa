import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, XCircle, Circle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { cn } from "@/lib/utils";

//  Helper to get the quiz with correct answers (runs on server)
async function getQuizWithAnswers(id: string) {
  const supabase = await createClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("id, title, questions") // We only need questions
    .eq("id", id)
    .single();

  if (error || !quiz) {
    return null;
  }
  return quiz as Quiz; // This Quiz type includes correct answers
}

export default async function ResultsPage({
  params, // Get quiz ID from the URL path
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    score: string;
    total: string;
    answers: string; // Get the user's answers
  }>;
}) {
  const { id } = await params; // Get the quiz ID
  const {
    score: scoreStr,
    total: totalStr,
    answers: answersStr,
  } = await searchParams;

  // --- 1. Get Score and Total (Existing Logic) ---
  const score = Number(scoreStr) || 0;
  const total = Number(totalStr) || 0;
  const percentage = total > 0 ? (score / total) * 100 : 0;

  // --- 2. Get Full Quiz Data & User Answers ---
  const quiz = await getQuizWithAnswers(id);
  let userAnswers = new Map<string, string>();
  try {
    // Parse the answers string from the URL
    const parsedAnswers: [string, string][] = JSON.parse(
      decodeURIComponent(answersStr || "[]"),
    );
    userAnswers = new Map(parsedAnswers);
  } catch (e) {
    console.error("Failed to parse answers", e);
    // If parsing fails, we'll just show the score card
  }

  const allQuestions = quiz?.questions;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-10">
      <Card className="w-full max-w-2xl text-center">
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

          {/* ✅ UPDATED: Removed 'sm:flex-row' to keep buttons stacked */}
          <div className="flex flex-col gap-2 w-full">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/play/${id}`}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/dashboard">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answer Review Section */}
      {allQuestions && allQuestions.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
            Answer Review
          </h2>
          <div className="space-y-6">
            {allQuestions.map((q, index) => {
              const userAnswerId = userAnswers.get(q.id);
              const correctAnswerId = q.correctAnswerId;

              return (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle>
                      Question {index + 1}: {q.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = opt.id === userAnswerId;
                      const isCorrectAnswer = opt.id === correctAnswerId;
                      const isWrongAnswer = isSelected && !isCorrectAnswer;

                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md border text-sm",
                            // Style for the correct answer (always green)
                            isCorrectAnswer &&
                              "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                            // Style for the user's wrong selection (red)
                            isWrongAnswer &&
                              "border-destructive bg-destructive/10 dark:bg-destructive/20 dark:border-destructive/50",
                          )}
                        >
                          {/* Icon logic */}
                          {isCorrectAnswer ? (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          ) : isWrongAnswer ? (
                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}

                          <span className="flex-1">{opt.text}</span>

                          {/* Badge logic */}
                          {isWrongAnswer && (
                            <Badge variant="destructive" className="ml-auto">
                              Your Answer
                            </Badge>
                          )}
                          {isSelected && isCorrectAnswer && (
                            <Badge
                              variant="default"
                              className="ml-auto bg-green-600 hover:bg-green-700"
                            >
                              Your Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}