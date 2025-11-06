// app/play/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
// ✅ 1. Import the new client component
import {PlayQuizFlow} from "./play-quiz-flow";

// Define local types based on the imported Quiz type
type QuestionWithAnswer = NonNullable<Quiz["questions"]>[number];
type Option = QuestionWithAnswer["options"][number];

// Fetch quiz data, but strip the answers
async function getPlayerQuiz(id: string) {
  const supabase = await createClient();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("id, title, cover_image_url, questions")
    .eq("id", id)
    .single();

  if (error || !quiz) {
    return null;
  }

  // CRITICAL: Strip the correct answers before sending to the client
  const playerQuestions = quiz.questions?.map((q: QuestionWithAnswer) => ({
    id: q.id,
    text: q.text,
    image_url: q.image_url || null,
    options: q.options.map((opt: Option) => ({ id: opt.id, text: opt.text })),
    // correctAnswerId is intentionally removed
  }));

  return { ...quiz, questions: playerQuestions } as Quiz;
}

export default async function PlayQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getPlayerQuiz(id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-10">
      <div className="w-full max-w-2xl">
        <Card className="mb-6 overflow-hidden">
          {quiz.cover_image_url && (
            <div className="relative w-full h-48">
              <Image
                src={quiz.cover_image_url}
                alt={quiz.title || "Quiz cover"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
        </Card>

        {/* ✅ 2. Render the new client component with the quiz data */}
        <PlayQuizFlow quiz={quiz} />
      </div>
    </div>
  );
}