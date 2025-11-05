// app/dashboard/view/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";

// corrected import path
import { type Quiz } from "../../quiz-list";
import { cn } from "@/lib/utils";

async function getQuiz(id: string) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select()
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single();

  if (quizError || !quiz) {
    return null;
  }

  return quiz as Quiz;
}

// ✅ For Next 15+: params is a Promise
export default async function ViewQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await the params Promise
  const quiz = await getQuiz(id);

  if (!quiz) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Quiz not found</h2>
        <p className="text-muted-foreground">
          This quiz may not exist or you may not have permission to view it.
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">
            {quiz.title || "Untitled Quiz"}
          </CardTitle>
          <CardDescription>
            Created on:{" "}
            {new Date(quiz.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {quiz.questions?.map((q, index) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle>
                Question {index + 1}: {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options.map((opt) => (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-md border text-sm",
                    opt.id === q.correctAnswerId
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                      : "border-border",
                  )}
                >
                  {opt.id === q.correctAnswerId ? (
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span>{opt.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
