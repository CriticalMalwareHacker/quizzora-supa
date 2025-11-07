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
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type Quiz } from "../../quiz-list";

// Local small types
type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
  image_url: string | null; // For preview or existing URL
  image_file: File | null; // For new file to upload
};

export function EditForm({ quiz }: { quiz: Quiz }) {
  // Initialize state from the quiz prop
  const [title, setTitle] = useState(quiz.title || "");
  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions?.map((q) => ({
      ...q,
      image_file: null,
    })) || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(
    null,
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    quiz.cover_image_url,
  );

  // --- Question management ---
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      options: [],
      correctAnswerId: null,
      image_url: null,
      image_file: null,
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

  // Question image handlers
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
            ? { ...q, image_file: file, image_url: previewUrl }
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

  // Options
  const addOption = (questionId: string) => {
    const newOption: Option = { id: crypto.randomUUID(), text: "" };
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

  // --- Update quiz (uploads + db update) - REMOVED is_public ---
  const handleUpdateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to update a quiz.");
      }

      let updatedCoverUrl = coverImagePreview;

      // Upload cover image if changed
      if (newCoverImageFile) {
        const filePath = `${user.id}/${quiz.id}-${newCoverImageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("quiz_covers")
          .upload(filePath, newCoverImageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }

        const publicUrl = supabase.storage
          .from("quiz_covers")
          .getPublicUrl(uploadData.path).data.publicUrl;

        updatedCoverUrl = publicUrl || null;
      }

      // Upload question images as needed and build final questions
      const questionsWithUploadedImages = await Promise.all(
        questions.map(async (q) => {
          let finalImageUrl = q.image_url; // default: existing or preview

          if (q.image_file) {
            const filePath = `${user.id}/${quiz.id}/${q.id}-${q.image_file.name}`;
            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("quiz_covers").upload(filePath, q.image_file, {
                cacheControl: "3600",
                upsert: true,
              });

            if (uploadError) {
              throw new Error(`Image upload failed for question "${q.text}": ${uploadError.message}`);
            }

            finalImageUrl = supabase.storage
              .from("quiz_covers")
              .getPublicUrl(uploadData.path).data.publicUrl;
          } else if (q.image_url === null) {
            // user removed the image explicitly
            finalImageUrl = null;
          }

          return {
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswerId: q.correctAnswerId,
            image_url: finalImageUrl,
          };
        }),
      );

      const quizData = {
        title,
        questions: questionsWithUploadedImages,
        cover_image_url: updatedCoverUrl,
        // REMOVED is_public 
      };

      const { error: updateError } = await supabase
        .from("quizzes")
        .update(quizData)
        .eq("id", quiz.id);

      if (updateError) {
        throw new Error(`Failed to update quiz: ${updateError.message}`);
      }

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

      <div className="space-y-6">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Question {index + 1}</CardTitle>
                <CardDescription>Set the question and its options.</CardDescription>
              </div>
              <Button
                type="button"
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
                  onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor={`q-${q.id}-image`}>Question Image (Optional)</Label>
                <Input
                  id={`q-${q.id}-image`}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleQuestionFileChange(q.id, e)}
                  className="file:text-primary file:font-medium"
                />
                {q.image_url && (
                  <div className="mt-2 relative w-full h-40">
                    <Image
                      src={q.image_url}
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
                      onChange={(e) => handleOptionTextChange(q.id, opt.id, e.target.value)}
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

      <Button
        type="button"
        variant="secondary"
        className="w-full mt-6"
        onClick={addQuestion}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>

      {error && <p className="text-destructive text-center mt-4">{error}</p>}
    </div>
  );
}