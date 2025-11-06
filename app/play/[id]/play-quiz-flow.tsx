// app/play/[id]/play-quiz-flow.tsx
"use client";

import { useState } from "react";
import { type Quiz } from "@/app/dashboard/quiz-list";
import { PlayQuizForm } from "./play-quiz-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PlayQuizFlow({ quiz }: { quiz: Quiz }) {
  const [playerName, setPlayerName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Quiz</CardTitle>
          <CardDescription>
            Please enter your name to join the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Start Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Once joined, render the quiz form and pass the player name
  return <PlayQuizForm quiz={quiz} playerName={playerName} />;
}