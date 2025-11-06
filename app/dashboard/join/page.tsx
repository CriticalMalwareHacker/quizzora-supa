"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function JoinQuizPage() {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Try to parse the URL
      const url = new URL(link);
      const pathParts = url.pathname.split("/");
      
      // Look for the '/play/' segment
      const playIndex = pathParts.indexOf("play");

      if (playIndex !== -1 && pathParts[playIndex + 1]) {
        // Found '/play/[id]'
        const quizId = pathParts[playIndex + 1];
        router.push(`/play/${quizId}`);
      } else {
        throw new Error("Invalid URL path");
      }
    } catch (_) {
      // If URL parsing fails, check if it's just a raw ID
      if (link.trim().length > 0) {
        // Basic check: is it a plausible ID? (e.g., UUID format)
        // This regex checks for a standard UUID
        if (link.trim().match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
          router.push(`/play/${link.trim()}`);
        } else {
          setError("Invalid link or ID. Please paste a valid quiz link.");
        }
      } else {
        setError("Please enter a link or ID.");
      }
    }
  };

  return (
    // ✅ MODIFIED THIS LINE
    <div className="w-full max-w-2xl mx-auto pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Join a Quiz</CardTitle>
          <CardDescription>
            Paste the quiz link or ID provided by the host to start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinQuiz} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-link">Quiz Link or ID</Label>
              <Input
                id="quiz-link"
                placeholder="https://.../play/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Join Quiz
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}