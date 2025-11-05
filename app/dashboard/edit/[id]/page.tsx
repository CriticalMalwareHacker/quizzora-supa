import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// FIX: Update Quiz type import path
import { type Quiz } from "../../quiz-list";

// FIX: Import the client component from its new co-located file
import { EditForm } from "./edit-form";

// Fetch data for a single quiz
async function getQuiz(id: string) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select()
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single();

  if (quizError || !quiz) {
    return null;
  }

  return quiz as Quiz;
}

// FIX: Changed function signature to accept `props`
export default async function EditQuizPage(props: {
  params: { id: string };
}) {
  // FIX: Await props and destructure params here
  const { params } = await props;
  const quiz = await getQuiz(params.id);

  if (!quiz) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Quiz not found</h2>
        <p className="text-muted-foreground">
          This quiz may not exist or you may not have permission to edit it.
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Pass the server-fetched quiz data to the client component form
  return <EditForm quiz={quiz} />;
}