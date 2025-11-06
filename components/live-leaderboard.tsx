// components/live-leaderboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IconCrown } from "@tabler/icons-react";

type Submission = {
  id: string;
  player_name: string;
  score: number;
  total: number;
  created_at: string;
};

type LiveLeaderboardProps = {
  quizId: string;
  currentSubmissionId?: string; // To highlight the current user
};

export function LiveLeaderboard({
  quizId,
  currentSubmissionId,
}: LiveLeaderboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Create a useCallback for fetching data
  const fetchLeaderboard = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("score", { ascending: false }) // Higher score first
      .order("created_at", { ascending: true }); // Then, earlier time first

    if (error) {
      setError(error.message);
    } else {
      setSubmissions(data || []);
    }
  }, [quizId]);

  useEffect(() => {
    // 2. Fetch data immediately on load
    fetchLeaderboard();

    // 3. Set up a polling interval to re-fetch every 5 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 5000); // 5000ms = 5 seconds

    // 4. Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [fetchLeaderboard]); // Depend on the memoized fetch function

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Could not load leaderboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Scores update automatically every 5 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub, index) => (
              <TableRow
                key={sub.id}
                className={cn(
                  sub.id === currentSubmissionId && "bg-muted font-bold",
                )}
              >
                <TableCell className="font-medium text-lg">
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <IconCrown className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {sub.player_name}
                  {sub.id === currentSubmissionId && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {sub.score} / {sub.total}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {submissions.length === 0 && (
          <p className="text-center text-muted-foreground p-4">
            No submissions yet. Be the first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}