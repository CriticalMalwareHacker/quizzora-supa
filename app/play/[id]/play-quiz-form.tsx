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
import { submitQuiz } from "./actions";
import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

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

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // ✅ FIX: Changed from + 1 to - 1
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await submitQuiz(quiz.id, selectedAnswers);
  };

  if (!currentQuestion) {
    // Handle case where questions might be empty
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Questions</CardTitle>
          <CardDescription>
            This quiz does not have any questions yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AlertDialog>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <CardDescription className="text-lg pt-2">
                  {currentQuestion.text}
                </CardDescription>
              </div>

              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
            </div>

            {currentQuestion.image_url && (
              <div className="relative w-full h-48 mt-4">
                <Image
                  src={currentQuestion.image_url}
                  alt={`Image for question ${currentQuestionIndex + 1}`}
                  fill
                  className="rounded-md object-contain"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected =
                selectedAnswers.get(currentQuestion.id) === opt.id;
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

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
          <AlertDialogDescription>
            All your progress for this quiz will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/dashboard/join">Exit</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}