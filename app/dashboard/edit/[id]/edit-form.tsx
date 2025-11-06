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
// 1. FIX: Removed unused 'Upload' icon
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
// 3. FIX: Import next/image
import Image from "next/image";

// FIX: Update import path to go up two levels
import { type Quiz } from "../../quiz-list";

// Define local types
type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
};

// Renamed component to EditForm
export function EditForm({ quiz }: { quiz: Quiz }) {
  // Initialize state from the quiz prop
  const [title, setTitle] = useState(quiz.title || "");
  const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Add state for cover image
  // 2. FIX: Prefixed unused setter with an underscore
  const [coverImageUrl, _setCoverImageUrl] = useState<string | null>(
    quiz.cover_image_url,
  );
  const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(
    null,
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    quiz.cover_image_url,
  );

  // --- All question/option management functions are identical ---

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      options: [],
      correctAnswerId: null,
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

  // --- Save Quiz Logic (identical, with cover image upload) ---
  const handleUpdateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    // ✅ Get user to create storage path
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to update a quiz.");
      setIsLoading(false);
      return;
    }

    let updatedCoverUrl = coverImageUrl;

    // ✅ Upload new cover image if one was selected
    if (newCoverImageFile) {
      const filePath = `${user.id}/${quiz.id}-${newCoverImageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("quiz_covers")
        .upload(filePath, newCoverImageFile, {
          cacheControl: "3600",
          upsert: true, // Overwrite existing image for this quiz
        });

      if (uploadError) {
        setError(`Failed to upload image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      // Get the new public URL
      const { data: publicUrlData } = supabase.storage
        .from("quiz_covers")
        .getPublicUrl(uploadData.path);

      if (!publicUrlData) {
        setError("Failed to get public URL for image.");
        setIsLoading(false);
        return;
      }
      updatedCoverUrl = publicUrlData.publicUrl;
    }

    const quizData = {
      title: title,
      questions: questions,
      cover_image_url: updatedCoverUrl, // ✅ Save the new or existing URL
    };

    const { error: updateError } = await supabase
      .from("quizzes")
      .update(quizData)
      .eq("id", quiz.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  // ✅ New handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Edit Quiz</h2>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button onClick={handleUpdateQuiz} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

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

        {/* ✅ Add Cover Image Upload Section */}
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
              {/* 3. FIX: Replaced <img> with next/Image */}
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
              <div className="space-y-2">
                <Label>Options</Label>
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Button
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
              <Button
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

      <Button
        variant="secondary"
        className="w-full mt-6"
        onClick={addQuestion}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>

      {error && (
        <p className="text-destructive text-center mt-4">{error}</p>
      )}
    </div>
  );
}