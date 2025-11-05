"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  FileText,
  Type,
  Users,
  BarChart3,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Define the type for the generation source
type GenerationSource = "topic" | "document" | "text";

// Example structure for a generated question
type Question = {
  id: number;
  text: string;
  options: string[];
  answer: string;
};

export default function CreateQuizPage() {
  const [source, setSource] = useState<GenerationSource>("topic");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for AI generation logic
    console.log("Generating quiz from:", { source, topic, text });

    // Simulate AI generation
    setTimeout(() => {
      const generatedQuestions: Question[] = [
        {
          id: 1,
          text: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris",
        },
        {
          id: 2,
          text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          answer: "4",
        },
      ];
      setQuestions(generatedQuestions);
      setIsLoading(false);
    }, 1500);
  };

  const renderSourceInput = () => {
    switch (source) {
      case "topic":
        return (
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="Type your topic here or generate randomly..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        );
      case "document":
        return (
          <div className="space-y-2">
            <Label htmlFor="document">Upload Document</Label>
            <Input id="document" type="file" />
            <p className="text-sm text-muted-foreground">
              Upload a PDF, DOCX, or TXT file.
            </p>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Paste Text</Label>
            <textarea
              id="text"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={cn(
                "flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> AI Question
              Generator
            </CardTitle>
            <CardDescription>
              Create a new quiz using the power of AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateQuiz}>
              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button
                  type="button"
                  variant={source === "topic" ? "default" : "outline"}
                  onClick={() => setSource("topic")}
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Topic
                </Button>
                <Button
                  type="button"
                  variant={source === "document" ? "default" : "outline"}
                  onClick={() => setSource("document")}
                >
                  <FileText className="mr-2 h-4 w-4" /> Document
                </Button>
                <Button
                  type="button"
                  variant={source === "text" ? "default" : "outline"}
                  onClick={() => setSource("text")}
                >
                  <Type className="mr-2 h-4 w-4" /> Text
                </Button>
              </div>

              <div className="mb-6">{renderSourceInput()}</div>

              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="font-normal"
                >
                  <Users className="mr-2 h-4 w-4" /> Audience
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="font-normal"
                >
                  <BarChart3 className="mr-2 h-4 w-4" /> Difficulty
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button asChild type="button" variant="ghost">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>

            {/* Section to display generated questions */}
            {questions.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">
                  Generated Questions
                </h3>
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <Card key={q.id}>
                      <CardHeader>
                        <CardTitle className="text-md">
                          Question {index + 1}: {q.text}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-md border",
                              opt === q.answer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                                : "border-border",
                            )}
                          >
                            {opt === q.answer && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            <span>{opt}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button>Save Quiz</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}