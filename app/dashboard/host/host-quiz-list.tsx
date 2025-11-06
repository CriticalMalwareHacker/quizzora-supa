"use client";

import { useState } from "react";
import { type Quiz } from "../quiz-list";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// ✅ 1. Import new icons
import { Check, Clipboard, FileText, BarChart } from "lucide-react";
import Link from "next/link"; // ✅ 2. Import Link

export function HostQuizList({ quizzes }: { quizzes: Quiz[] }) {
  const [copiedQuizId, setCopiedQuizId] = useState<string | null>(null);

  const handleCopyLink = (quizId: string) => {
    const link = `${window.location.origin}/play/${quizId}`;
    navigator.clipboard.writeText(link);
    setCopiedQuizId(quizId);
    setTimeout(() => setCopiedQuizId(null), 2000); // Reset after 2 seconds
  };

  if (quizzes.length === 0) {
    return (
      <div className="border rounded-lg border-dashed p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold">No quizzes found</h3>
        <p className="text-sm">
          You need to create a quiz before you can host it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                {quiz.title || "Untitled Quiz"}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <FileText className="h-4 w-4 mr-2" />
                <span>
                  {quiz.questions ? quiz.questions.length : 0} questions
                </span>
              </div>
            </div>
            {/* ✅ 3. Add button group */}
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/leaderboard/${quiz.id}`}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Leaderboard
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCopyLink(quiz.id)}
                className="w-[130px]"
              >
                {copiedQuizId === quiz.id ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-2" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}