import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl">Dashboard</h2>
        <Button asChild>
          {/* --- THIS LINK IS UPDATED --- */}
          <Link href="/create-quiz">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p>Your existing quizzes will be listed here.</p>
        <p className="text-sm">Start by creating a new quiz!</p>
      </div>
    </div>
  );
}