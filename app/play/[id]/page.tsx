import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { PlayQuizForm } from "./play-quiz-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// ✅ FIX: Define local types based on the imported Quiz type
// This is the shape of a single question *with* the answer
type QuestionWithAnswer = NonNullable<Quiz["questions"]>[number];
// This is the shape of a single option
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
  // ✅ FIX: Replaced 'any' with the specific 'QuestionWithAnswer' type
  const playerQuestions = quiz.questions?.map((q: QuestionWithAnswer) => ({
    id: q.id,
    text: q.text,
    // ✅ FIX: Replaced 'any' with the specific 'Option' type
    options: q.options.map((opt: Option) => ({ id: opt.id, text: opt.text })),
    // correctAnswerId is intentionally removed
  }));

  return { ...quiz, questions: playerQuestions } as Quiz;
}

// ✅ FIX: accept params as a Promise and await it (Next 15+ / App Router)
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

        {/* Pass the answer-less quiz to the client form */}
        <PlayQuizForm quiz={quiz} />
      </div>
    </div>
  );
}
