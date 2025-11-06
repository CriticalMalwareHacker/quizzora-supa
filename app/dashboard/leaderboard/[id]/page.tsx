// app/dashboard/leaderboard/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { LiveLeaderboard } from "@/components/live-leaderboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Helper to get just the quiz title
async function getQuizTitle(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("title")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }
  return data.title;
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check for user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/auth/login");
  }

  const title = await getQuizTitle(id);

  if (!title) {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/dashboard/host">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Host List
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">
        Leaderboard: <span className="font-normal">{title}</span>
      </h1>
      <LiveLeaderboard quizId={id} />
    </div>
  );
}