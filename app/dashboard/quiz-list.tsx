"use client";

// New imports for client-side logic
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Updated icons
import { FileText, Eye, Edit, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"; // Make sure to create this component or install it

// Define the types for the quiz data from Supabase
type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
};

// This is the shape of the data we're getting from the 'quizzes' table
export type Quiz = {
  id: string;
  title: string;
  created_at: string;
  questions: Question[] | null;
};

type QuizListProps = {
  quizzes: Quiz[];
};

export function QuizList({ quizzes }: QuizListProps) {
  // Use state to manage the list of quizzes on the client
  const [currentQuizzes, setCurrentQuizzes] = useState(quizzes);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (quizId: string) => {
    // Optimistically remove the quiz from the UI
    const optimisticQuizzes = currentQuizzes.filter((q) => q.id !== quizId);
    setCurrentQuizzes(optimisticQuizzes);

    // Make the delete request to Supabase
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

    if (error) {
      // If it fails, log the error and revert the state
      console.error("Failed to delete quiz:", error.message);
      setCurrentQuizzes(quizzes); // Revert to original data
      // You could show an error toast here
    } else {
      // Refresh server-side props to ensure consistency
      router.refresh();
    }
  };

  // Handle the empty state
  if (currentQuizzes.length === 0) {
    return (
      <div className="border rounded-lg border-dashed p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold">No quizzes found</h3>
        <p className="text-sm">
          Get started by creating your first quiz!
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AlertDialog>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentQuizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{quiz.title || "Untitled Quiz"}</CardTitle>
              <CardDescription>
                Created on: {formatDate(quiz.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-muted-foreground">
                <FileText className="h-4 w-4 mr-2" />
                <span>
                  {quiz.questions ? quiz.questions.length : 0} questions
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button variant="outline" size="sm" asChild>
                {/* UPDATED: "View" button */}
                <Link href={`/dashboard/view/${quiz.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  {/* UPDATED: Link to edit page */}
                  <Link href={`/dashboard/edit/${quiz.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                {/* UPDATED: Delete Button with Confirmation */}
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your quiz &quot;{quiz.title || "Untitled Quiz"}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(quiz.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AlertDialog>
  );
}