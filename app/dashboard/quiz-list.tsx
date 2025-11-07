"use client";

// New imports for client-side logic
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// Import 3D Card components
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/3d-card";

import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, Trash2 } from "lucide-react"; // REMOVED Globe

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
// REMOVED: import related to Marketplace
// REMOVED: import related to Badge

// Define the types for the quiz data from Supabase
type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string | null;
  image_url: string | null; 
};

// This is the shape of the data we're getting from the 'quizzes' table
export type Quiz = {
  id: string;
  title: string;
  created_at: string;
  questions: Question[] | null;
  cover_image_url: string | null;
  // REMOVED is_public: boolean | null; 
};

type QuizListProps = {
  quizzes: Quiz[];
};

export function QuizList({ quizzes }: QuizListProps) {
  // Use state to manage the list of quizzes on the client
  const [currentQuizzes, setCurrentQuizzes] = useState(quizzes);
  const router = useRouter();
  const supabase = createClient();

  // REMOVED handleTogglePublic function

  const handleDelete = async (quizId: string) => {
    // Optimistically remove the quiz from the UI
    const optimisticQuizzes = currentQuizzes.filter((q) => q.id !== quizId);
    setCurrentQuizzes(optimisticQuizzes);

    // Make the delete request to Supabase
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

    if (error) {
      // If it fails, log the error and revert the state
      console.error("Failed to delete quiz:", error.message);
      setCurrentQuizzes(quizzes); // Revert to original data (props)
    } else {
      // Refresh server-side props to ensure consistency
      router.refresh();
    }
  };

  // Handle the empty state
  if (!currentQuizzes || currentQuizzes.length === 0) {
    return (
      <div className="border rounded-lg border-dashed p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold">No quizzes found</h3>
        <p className="text-sm">Get started by creating your first quiz!</p>
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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">
      {currentQuizzes.map((quiz) => (
        <AlertDialog key={quiz.id}>
          <CardContainer className="inter-var">
            {/* Card Body with 3D Card components */}
            <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border flex flex-col">
              <div className="flex justify-between items-start">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                  >
                    {quiz.title || "Untitled Quiz"}
                  </CardItem>
                  {/* REMOVED Public Badge UI */}
              </div>

              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                Created on: {formatDate(quiz.created_at)}
              </CardItem>

              {/* Cover image */}
              <CardItem translateZ="100" className="w-full mt-4 h-40 relative">
                <Image
                  src={quiz.cover_image_url || "/quizhero.jpg"}
                  alt={quiz.title || "Quiz cover image"}
                  fill
                  className="object-cover rounded-xl group-hover/card:shadow-xl"
                />
              </CardItem>

              {/* Content showing number of questions */}
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

              {/* Footer actions */}
              <div className="flex justify-between items-center mt-8">
                <CardItem translateZ={20} asChild>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/view/${quiz.id}`}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </CardItem>

                <div className="flex gap-2 items-center">
                  {/* REMOVED Public/Private Toggle Button */}
                  
                  <CardItem translateZ={20} asChild>
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/dashboard/edit/${quiz.id}`}
                        className="flex items-center"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardItem>

                  <CardItem translateZ={20} asChild>
                    {/* Trigger for the alert dialog */}
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </CardItem>
                </div>
              </div>
            </CardBody>

            {/* Alert dialog content */}
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  quiz{" "}
                  <span className="font-medium">
                    &ldquo;{quiz.title || "Untitled Quiz"}&rdquo;
                  </span>
                  .
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
        </AlertDialog>
      ))}
    </div>
  );
}