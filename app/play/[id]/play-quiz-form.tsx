"use client";

import { useState } from "react";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { submitQuiz } from "./actions"; // We will create this next
import { Check, Loader2 } from "lucide-react";

// The 'quiz' prop here has NO answers
export function PlayQuizForm({ quiz }: { quiz: Quiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(
    new Map(),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(questionId, optionId);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // When the form is submitted, call the Server Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 'submitQuiz' is a Server Action.
    // We pass it the quiz ID and the answers.
    // It will securely grade the quiz on the server and handle the redirect.
    await submitQuiz(quiz.id, selectedAnswers);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <CardDescription className="text-lg pt-2">
            {currentQuestion.text}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswers.get(currentQuestion.id) === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                className={cn(
                  "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent/50",
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground",
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
                <span>{opt.text}</span>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            Back
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Quiz
            </Button>
          ) : (
            <Button type="button" variant="default" onClick={handleNext}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}