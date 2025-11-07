"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { ArrowRight, Download, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Quiz } from "../quiz-list";
import { importQuiz } from "./actions"; 
import { useRouter } from "next/navigation";

// Define a type for a quiz fetched for the marketplace (public attributes only)
type MarketplaceQuiz = Omit<Quiz, 'questions' | 'is_public' | 'created_at' | 'title'> & {
    title: string | null;
    created_at: string;
    questions_count: number;
    owner_email: string; 
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allQuizzes, setAllQuizzes] = useState<MarketplaceQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const fetchPublicQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // ✅ FIX: Simplified query to avoid implicit JOIN on 'users' table which causes RLS errors.
    const { data: quizzes, error: fetchError } = await supabase
      .from("quizzes")
      .select(`
        id, 
        title, 
        created_at, 
        cover_image_url,
        user_id,
        questions
      `)
      .eq("is_public", true)
      .limit(100);

    if (fetchError) {
      // Show the actual error message
      setError(`Failed to load quizzes from the marketplace: ${fetchError.message}`); 
      setAllQuizzes([]);
    } else {
      // Map the data into the MarketplaceQuiz format
      const marketplaceData: MarketplaceQuiz[] = quizzes.map((q: any) => ({
        id: q.id,
        title: q.title,
        created_at: q.created_at,
        cover_image_url: q.cover_image_url,
        questions_count: q.questions ? q.questions.length : 0,
        // Use a placeholder name derived from user_id if available
        owner_email: q.user_id ? `User-${q.user_id.substring(0, 4)}` : "Community Creator",
      }));
      setAllQuizzes(marketplaceData);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPublicQuizzes();
  }, [fetchPublicQuizzes]);

  // --- Handlers ---
  const handleImport = async (quizId: string) => {
    setImportingId(quizId);

    try {
        const { error, newQuizId } = await importQuiz(quizId);

        if (error) {
            alert(`Import failed: ${error}`);
        } else {
            alert("Quiz imported successfully! Redirecting to your dashboard.");
            // Refresh dashboard data and navigate to the new quiz list
            router.push(`/dashboard`);
        }
    } catch (e) {
        alert("An unexpected error occurred during import.");
    } finally {
        setImportingId(null);
    }
  };

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return allQuizzes;
    }
    return allQuizzes.filter(
      (quiz) =>
        quiz.title?.toLowerCase().includes(query) ||
        quiz.owner_email.toLowerCase().includes(query), 
    );
  }, [searchQuery, allQuizzes]);

  // --- Loading States ---
  if (loading) {
    return (
        <div className="w-full max-w-4xl mx-auto text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading marketplace...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-10">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchPublicQuizzes} variant="outline" className="mt-4">
            Try Reloading
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
        
        <div className="space-y-2">
            <h1 className="font-bold text-3xl tracking-tight">
                Quiz Marketplace
            </h1>
            <p className="text-muted-foreground">
                Browse and instantly start playing quizzes created by the community.
            </p>
        </div>

        <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by title or creator..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {filteredQuizzes.length === 0 && (
            <div className="text-center text-muted-foreground py-10 border border-dashed rounded-lg">
                <p className="text-lg font-medium">No public quizzes found matching your search.</p>
                <p>
                    Be the first to share one by making your own quiz public on the Dashboard!
                </p>
            </div>
        )}

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
                <Card
                    key={quiz.id}
                    className="flex flex-col justify-between"
                >
                    <CardHeader>
                        <Badge
                            variant="secondary"
                            className="w-fit mb-2"
                        >
                            Creator: {quiz.owner_email}
                        </Badge>
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                                {quiz.title || "Untitled Public Quiz"}
                            </CardTitle>
                        </div>
                        <CardDescription className="pt-1">
                            Questions: {quiz.questions_count}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 flex flex-col gap-2">
                        <Button
                            asChild
                            className="w-full"
                            variant="default"
                        >
                            <Link href={`/play/${quiz.id}`}>
                                Start Quiz
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                        <Button
                            onClick={() => handleImport(quiz.id)}
                            className="w-full"
                            variant="outline"
                            disabled={importingId === quiz.id}
                        >
                            {importingId === quiz.id ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Import to my Quizzes
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}