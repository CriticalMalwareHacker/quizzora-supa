"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { v4 as uuidv4 } from "uuid";

export async function submitQuiz(
  quizId: string,
  answers: Map<string, string>,
  playerName: string,
) {
  const supabase = await createClient();

  // --- 1. GET THE LOGGED-IN USER ---
  // We do this to associate the submission with an account, if one exists.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Securely fetch the quiz data *with* the answers
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("questions")
    .eq("id", quizId)
    .single();

  if (error || !quiz) {
    console.error("Quiz not found error:", error);
    return { error: "Quiz not found." };
  }

  const questions = quiz.questions as Quiz["questions"];
  if (!questions) {
    console.error("No questions found for this quiz.");
    return { error: "No questions found for this quiz." };
  }

  // 3. Grade the quiz
  let score = 0;
  for (const question of questions) {
    if (answers.get(question.id) === question.correctAnswerId) {
      score++;
    }
  }
  const total = questions.length;

  // 4. Save the submission to the database
  const submissionId = uuidv4();
  const { error: submissionError } = await supabase
    .from("quiz_submissions")
    .insert({
      id: submissionId,
      quiz_id: quizId,
      player_name: playerName,
      score: score,
      total: total,
      user_id: user?.id || null, // --- This is the new line ---
    });

  if (submissionError) {
    console.error("Failed to save submission:", submissionError);
    // Continue anyway, but log the error
  }

  // 5. Serialize the answers Map to pass in the URL
  const answersString = JSON.stringify(Array.from(answers.entries()));
  const encodedAnswers = encodeURIComponent(answersString);

  // 6. Redirect to the results page
  redirect(
    `/play/${quizId}/results?score=${score}&total=${total}&answers=${encodedAnswers}&submissionId=${submissionId}`,
  );
}