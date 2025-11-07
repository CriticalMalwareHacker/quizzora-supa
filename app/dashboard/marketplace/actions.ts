"use server";

import { createClient } from "@/lib/supabase/server";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { v4 as uuidv4 } from "uuid";

/**
 * Toggles the 'is_public' status of a user's quiz.
 */
export async function toggleQuizPublicStatus(quizId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: "User not authenticated." };
  }

  // Update the status, ensuring only the owner can modify their quiz
  const { error } = await supabase
    .from("quizzes")
    .update({ is_public: isPublic })
    .eq("id", quizId)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Failed to update quiz visibility:", error.message);
    return { error: `Failed to update quiz visibility: ${error.message}` };
  }

  return { success: true };
}

/**
 * Imports a public quiz into the current user's private collection by duplicating it.
 */
export async function importQuiz(publicQuizId: string) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: "User not authenticated." };
  }
  const userId = userData.user.id;

  // 1. Fetch the public quiz
  const { data: quizToImport, error: fetchError } = await supabase
    .from("quizzes")
    // Fetch all columns needed for duplication
    .select("title, questions, cover_image_url, is_public")
    .eq("id", publicQuizId)
    .single();

  if (fetchError || !quizToImport) {
    return { error: "Public quiz not found or database error." };
  }

  const questions = quizToImport.questions as Quiz["questions"];

  if (!questions) {
    return { error: "Quiz has no questions to import." };
  }

  // 2. Map existing quiz data to new, unique IDs to avoid primary key conflicts
  const newQuizId = uuidv4();

  const newQuestions = questions.map((oldQ) => {
    const newQId = uuidv4();

    // Map options and find the new correct answer ID
    let newCorrectAnswerId: string | null = null;

    const newOptions = oldQ.options.map((oldOpt) => {
      const newOptId = uuidv4();

      if (oldOpt.id === oldQ.correctAnswerId) {
        newCorrectAnswerId = newOptId;
      }
      return { id: newOptId, text: oldOpt.text };
    });

    return {
      id: newQId,
      text: oldQ.text,
      options: newOptions,
      correctAnswerId: newCorrectAnswerId,
      image_url: oldQ.image_url,
    };
  });

  // 3. Prepare the new quiz record
  const newQuizData = {
    id: newQuizId,
    user_id: userId,
    title: `(Imported) ${quizToImport.title}`,
    questions: newQuestions,
    cover_image_url: quizToImport.cover_image_url,
    is_public: false, // Imported quiz is private by default
  };

  // 4. Insert the new quiz
  const { error: insertError } = await supabase
    .from("quizzes")
    .insert(newQuizData);

  if (insertError) {
    console.error("Failed to import quiz:", insertError.message);
    return { error: `Failed to import quiz: ${insertError.message}` };
  }

  return { success: true, newQuizId };
}