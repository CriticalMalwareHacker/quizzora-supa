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
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateQuizWithAI } from "./actions";

// Define types for our quiz structure
export type Option = {
  id: string;
  text: string;
};

// ✅ MODIFIED Question type
export type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
  image_url: string | null; // For preview or existing URL
  image_file: File | null; // For new file to upload
  image_suggestion: string | null; // For AI suggestion
};

// ✅ MODIFIED AI response type
type AiQuizResponse = {
  title: string;
  questions: {
    text: string;
    image_suggestion: string; // Added image suggestion
    options: { text: string }[];
    correctAnswerText: string;
  }[];
};

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiQuestionLimit, setAiQuestionLimit] = useState(10);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- Quiz Management ---
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      options: [],
      correctAnswerId: null,
      image_url: null, // ✅ ADDED
      image_file: null, // ✅ ADDED
      image_suggestion: null, // ✅ ADDED
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, text } : q)),
    );
  };

  // ✅ --- NEW Question Image Handlers ---
  const handleQuestionFileChange = (
    questionId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setQuestions(
        questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                image_file: file,
                image_url: previewUrl,
                image_suggestion: null, // Clear suggestion on manual upload
              }
            : q,
        ),
      );
    }
  };

  const removeQuestionImage = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, image_file: null, image_url: null } : q,
      ),
    );
  };
  // ------------------------------------

  // --- Option Management (No changes) ---
  const addOption = (questionId: string) => {
    const newOption: Option = {
      id: crypto.randomUUID(),
      text: "",
    };
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newOption] } : q,
      ),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((opt) => opt.id !== optionId),
              correctAnswerId:
                q.correctAnswerId === optionId ? null : q.correctAnswerId,
            }
          : q,
      ),
    );
  };

  const handleOptionTextChange = (
    questionId: string,
    optionId: string,
    text: string,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text } : opt,
              ),
            }
          : q,
      ),
    );
  };

  const setCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswerId: optionId } : q,
      ),
    );
  };

  // --- ✅ MODIFIED Save Quiz Logic - REMOVED is_public ---
  const handleSaveQuiz = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to create a quiz.");
      }

      const newQuizId = crypto.randomUUID();
      let coverImageUrl: string | null = null;

      // 1. Upload cover image (if any)
      if (coverImageFile) {
        const filePath = `${user.id}/${newQuizId}-${coverImageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("quiz_covers")
          .upload(filePath, coverImageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("quiz_covers")
          .getPublicUrl(uploadData.path);
        coverImageUrl = publicUrlData?.publicUrl || null;
      }

      // 2. Upload all question images (if any)
      const questionsWithUploadedImages = await Promise.all(
        questions.map(async (q) => {
          if (!q.image_file) {
            // No new file, return question as-is
            return q;
          }

          // We have a new file, upload it
          const filePath = `${user.id}/${newQuizId}/${q.id}-${q.image_file.name}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("quiz_covers") // Using same bucket
              .upload(filePath, q.image_file, {
                cacheControl: "3600",
                upsert: true,
              });

          if (uploadError) {
            throw new Error(
              `Image upload failed for question "${q.text}": ${uploadError.message}`,
            );
          }

          const { data: publicUrlData } = supabase.storage
            .from("quiz_covers")
            .getPublicUrl(uploadData.path);

          if (!publicUrlData) {
            throw new Error("Failed to get public URL for question image.");
          }

          // Return the question with the new public URL
          return {
            ...q,
            image_url: publicUrlData.publicUrl,
            image_file: null, // Clear the local file
          };
        }),
      );

      // 3. Prepare final data for DB (strip client-side properties)
      const questionsForDb = questionsWithUploadedImages.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswerId: q.correctAnswerId,
        image_url: q.image_url,
      }));

      type QuizInsertData = {
        id: string;
        user_id: string;
        title: string;
        questions: typeof questionsForDb;
        cover_image_url: string | null;
        // REMOVED is_public
      };

      const quizData: QuizInsertData = {
        id: newQuizId,
        user_id: user.id,
        title: title,
        questions: questionsForDb,
        cover_image_url: coverImageUrl,
        // REMOVED is_public: false, 
      };

      // 4. Insert into 'quizzes' table
      const { error: insertError } = await supabase
        .from("quizzes")
        .insert(quizData);

      if (insertError) {
        throw new Error(`Failed to save quiz: ${insertError.message}`);
      }

      // Success! Redirect to the dashboard.
      router.push("/dashboard");
    } catch (error) {
      // ✅ FIXED: Used 'unknown' type and checked if it's an Error instance
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error) || "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- ✅ MODIFIED AI Quiz Generation Handler ---
  const handleGenerateAiQuiz = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAiLoading(true);
    setAiError(null);

    try {
      const result = await generateQuizWithAI(aiPrompt, aiQuestionLimit);

      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error("No data returned from AI.");

      const aiQuiz = result.data as AiQuizResponse;

      setTitle(aiQuiz.title);

      const newQuestions: Question[] = aiQuiz.questions.map((aiQ) => {
        const newQuestionId = crypto.randomUUID();
        let correctOptionId: string | null = null;

        const newOptions: Option[] = aiQ.options.map((aiOpt) => {
          const newOptionId = crypto.randomUUID();
          if (aiOpt.text === aiQ.correctAnswerText) {
            correctOptionId = newOptionId;
          }
          return { id: newOptionId, text: aiOpt.text };
        });

        if (!correctOptionId && newOptions.length > 0) {
          console.warn("AI correct answer text didn't match. Defaulting.");
          correctOptionId = newOptions[0].id;
        }

        return {
          id: newQuestionId,
          text: aiQ.text,
          options: newOptions,
          correctAnswerId: correctOptionId,
          image_url: null,
          image_file: null,
          image_suggestion: aiQ.image_suggestion || null, // ✅ Save suggestion
        };
      });

      setQuestions(newQuestions);
      setIsAiModalOpen(false);
      setAiPrompt("");
    } catch (error) {
      // ✅ FIXED: Used 'unknown' type and checked if it's an Error instance
      if (error instanceof Error) {
        setAiError(error.message);
      } else {
        setAiError(String(error) || "Failed to generate quiz.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Create New Quiz</h2>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>

          {/* AI GENERATOR BUTTON & MODAL (No changes here) */}
          <AlertDialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Quiz with AI</AlertDialogTitle>
                <AlertDialogDescription>
                  Describe the topic for your quiz, and AI will generate
                  questions for you.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Quiz Topic</Label>
                  <Input
                    id="ai-prompt"
                    placeholder="e.g., World Geography, Anime: One Piece"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-limit">Number of Questions</Label>
                  <Input
                    id="ai-limit"
                    type="number"
                    value={aiQuestionLimit}
                    onChange={(e) => setAiQuestionLimit(Number(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                {aiError && <p className="text-sm text-destructive">{aiError}</p>}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleGenerateAiQuiz}
                  disabled={isAiLoading}
                >
                  {isAiLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isAiLoading ? "Generating..." : "Generate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* ---------------------------------- */}

          <Button onClick={handleSaveQuiz} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </div>

      {/* Quiz Title Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="quiz-title">Quiz Title</Label>
          <Input
            id="quiz-title"
            placeholder="Enter your quiz title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
        </CardContent>
        <CardContent>
          <Label htmlFor="cover-image">Cover Image</Label>
          <Input
            id="cover-image"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="file:text-primary file:font-medium"
          />
          {coverImagePreview && (
            <div className="mt-4 relative w-full h-48">
              <Image
                src={coverImagePreview}
                alt="Cover image preview"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ MODIFIED Questions List */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Question {index + 1}</CardTitle>
                <CardDescription>
                  Set the question and its options.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Text Input */}
              <div>
                <Label htmlFor={`q-${q.id}-text`}>Question Text</Label>
                <Input
                  id={`q-${q.id}-text`}
                  placeholder="What is...?"
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionTextChange(q.id, e.target.value)
                  }
                />
              </div>

              {/* ✅ NEW: Question Image Input */}
              <div className="mt-4">
                <Label htmlFor={`q-${q.id}-image`}>Question Image</Label>
                <Input
                  id={`q-${q.id}-image`}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleQuestionFileChange(q.id, e)}
                  className="file:text-primary file:font-medium"
                />
                {q.image_suggestion && !q.image_url && (
                  <p className="text-sm text-muted-foreground mt-1">
                    AI suggestion: &ldquo;{q.image_suggestion}&rdquo;
                  </p>
                )}
                {q.image_url && (
                  <div className="mt-2 relative w-full h-40">
                    <Image
                      src={q.image_url} // This shows the object URL preview
                      alt="Question image preview"
                      fill
                      className="rounded-md object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeQuestionImage(q.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {/* --------------------------- */}

              {/* Options List */}
              <div className="space-y-2 mt-4">
                <Label>Options</Label>
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCorrectAnswer(q.id, opt.id)}
                      className={cn(
                        "shrink-0",
                        q.correctAnswerId === opt.id &&
                          "border-green-600 text-green-600",
                      )}
                    >
                      {q.correctAnswerId === opt.id ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder={`Option ${q.options.indexOf(opt) + 1}`}
                      value={opt.text}
                      onChange={(e) =>
                        handleOptionTextChange(q.id, opt.id, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeOption(q.id, opt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => addOption(q.id)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Button */}
      <Button
        type="button"
        variant="secondary"
        className="w-full mt-6"
        onClick={addQuestion}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>

      {/* Display Error Message */}
      {error && (
        <p className="text-destructive text-center mt-4">{error}</p>
      )}
    </div>
  );
}