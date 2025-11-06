"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type Quiz } from "@/app/dashboard/quiz-list";

// This is a Server Action. It runs securely on the server.
export async function submitQuiz(
  quizId: string,
  answers: Map<string, string>,
) {
  const supabase = await createClient();

  // 1. Securely fetch the quiz data *with* the answers
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("questions")
    .eq("id", quizId)
    .single();

  if (error || !quiz) {
    return { error: "Quiz not found." };
  }

  const questions = quiz.questions as Quiz["questions"];
  if (!questions) {
    return { error: "No questions found for this quiz." };
  }

  // 2. Grade the quiz
  let score = 0;
  for (const question of questions) {
    if (answers.get(question.id) === question.correctAnswerId) {
      score++;
    }
  }

  const total = questions.length;

  // ✅ NEW: Serialize the answers Map to pass in the URL
  const answersString = JSON.stringify(Array.from(answers.entries()));
  const encodedAnswers = encodeURIComponent(answersString);

  // 3. Redirect to the results page with score, total, and answers
  redirect(
    `/play/${quizId}/results?score=${score}&total=${total}&answers=${encodedAnswers}`,
  );
}