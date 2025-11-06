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
import { Plus, Trash2, CheckCircle, Circle, Upload } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- New Imports ---
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
// ✅ Import Image from next/image
import Image from "next/image";
// -------------------

// Define types for our quiz structure
type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
};

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // --- New State ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // ✅ Add state for cover image
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );
  // -----------------

  // --- Quiz Management (No changes) ---
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

  // --- Updated Save Quiz Logic ---
  const handleSaveQuiz = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    // 1. Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to create a quiz.");
      setIsLoading(false);
      return;
    }

    // 2. Prepare the data for insertion
    const quizData: any = {
      user_id: user.id,
      title: title,
      questions: questions, // The 'questions' state array is saved as JSONB
    };

    let coverImageUrl: string | null = null;

    // 2. Upload cover image if one is selected
    if (coverImageFile) {
      const filePath = `${user.id}/${
        quizData.id
      }-${coverImageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("quiz_covers")
        .upload(filePath, coverImageFile, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting if file exists (e.g., re-saving draft)
        });

      if (uploadError) {
        setError(`Failed to upload image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("quiz_covers")
        .getPublicUrl(uploadData.path);

      if (!publicUrlData) {
        setError("Failed to get public URL for image.");
        setIsLoading(false);
        return;
      }
      coverImageUrl = publicUrlData.publicUrl;
    }

    // 4. Prepare the data for insertion
    const quizDataWithCover = {
      ...quizData,
      cover_image_url: coverImageUrl,
    };

    // 5. Insert into the 'quizzes' table
    const { error: insertError } = await supabase
      .from("quizzes")
      .insert(quizDataWithCover); // Use data with cover image URL

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
    } else {
      // Success! Redirect to the dashboard.
      router.push("/dashboard");
    }
  };

  // ✅ New handler for file input change
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
              <Image
                src={coverImagePreview}
                alt="Cover image preview"
                layout="fill"
                className="rounded-md object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List (No changes below this line) */}
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

              {/* Options List */}
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

              {/* Add Option Button */}
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

      {/* Add Question Button */}
      <Button
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
