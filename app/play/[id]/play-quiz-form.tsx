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
import { Check, Loader2 } from "lucide-react";

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

  // ✅ 1. This function REPLACES the original 'handleSubmit'
  // We call this from 'onClick' so we are not using stale form state.
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    // We pass 'selectedAnswers' directly. Since this is called via 'onClick',
    // the state will be up-to-date from the user's last 'handleSelectAnswer'.
    await submitQuiz(quiz.id, selectedAnswers);
  };

  // The original 'handleSubmit' triggered by onSubmit is no longer needed.
  // We can remove it or just leave it un-used.

  return (
    // ✅ 2. Remove the 'onSubmit' from the form.
    // We are now handling submission with our button's onClick.
    <form>
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
            // ✅ 3. Change button to type="button" and add onClick
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={
                isLoading || !selectedAnswers.has(currentQuestion.id)
              } // Also disable if last question isn't answered
            >
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