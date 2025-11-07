import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

// Import the new client component and its type
import { QuizList, type Quiz } from "./quiz-list";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // --- MODIFIED: Fetch Quizzes - REMOVED is_public ---
  const { data: quizzes, error: quizError } = await supabase
    .from("quizzes")
    .select("id, title, created_at, questions, cover_image_url") // REMOVED is_public
    .eq("user_id", data.claims.sub) 
    .order("created_at", { ascending: false });

  if (quizError) {
    console.error("Error fetching quizzes:", quizError.message);
  }
  // -------------------------

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl">Dashboard</h2>
        <Button asChild>
          <Link href="/dashboard/create-quiz">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz
          </Link>
        </Button>
      </div>

      <QuizList quizzes={(quizzes as Quiz[]) || []} />
    </div>
  );
}