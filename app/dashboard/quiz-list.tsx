"use client";

// New imports for client-side logic
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Import 3D Card components
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/3d-card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog";

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
          // 1. Replaced <Card> with <CardContainer>
          <CardContainer key={quiz.id} className="inter-var">
            {/* 2. Replaced CardHeader/Content/Footer with <CardBody> */}
            <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border flex flex-col">
              {/* 3. Replaced <CardTitle> with <CardItem> */}
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                {quiz.title || "Untitled Quiz"}
              </CardItem>

              {/* 4. Replaced <CardDescription> with <CardItem> */}
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                Created on: {formatDate(quiz.created_at)}
              </CardItem>

              {/* 5. Replaced <CardContent> with <CardItem> */}
              {/* Added flex-grow to push footer to bottom */}
              <div className="flex-grow mt-6">
                <CardItem
                  translateZ="40"
                  className="flex items-center text-muted-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>
                    {quiz.questions ? quiz.questions.length : 0} questions
                  </span>
                </CardItem>
              </div>

              {/* 6. Replaced <CardFooter> with a div and <CardItem> for buttons */}
              <div className="flex justify-between items-center mt-8">
                <CardItem
                  translateZ={20}
                  asChild // Use asChild to pass props to Button/Link
                >
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/view/${quiz.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </CardItem>

                <div className="flex gap-2">
                  <CardItem translateZ={20} asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/edit/${quiz.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardItem>

                  <CardItem translateZ={20} asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </CardItem>
                </div>
              </div>
            </CardBody>

            {/* This is the modal content. It's kept as a sibling to CardBody 
              so it doesn't get warped by the 3D transform.
            */}
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
          </CardContainer>
        ))}
      </div>
    </AlertDialog>
  );
}