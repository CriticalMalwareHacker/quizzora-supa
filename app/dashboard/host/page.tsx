import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type Quiz } from "../quiz-list"; // Import Quiz type
import { HostQuizList } from "./host-quiz-list";

export default async function HostQuizPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // --- MODIFIED: Fetch Quizzes ---
  const { data: quizzes, error: quizError } = await supabase
    .from("quizzes")
    .select("id, title, questions")
    .eq("user_id", data.claims.sub) // ✅ ADD THIS LINE
    .order("created_at", { ascending: false });

  if (quizError) {
    console.error("Error fetching quizzes:", quizError.message);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Host a Quiz</h1>
      <p className="text-muted-foreground mb-6">
        Select a quiz to get a shareable link. Anyone with the link will be
        able to play your quiz.
      </p>
      <HostQuizList quizzes={(quizzes as Quiz[]) || []} />
    </div>
  );
}