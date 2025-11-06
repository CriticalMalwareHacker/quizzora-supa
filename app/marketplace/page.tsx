"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconSearch,
  IconBook,
  IconLock,
  IconCode,
} from "@tabler/icons-react";
import { HeroHeader } from "@/components/header";
import Link from "next/link";
import FooterSection from "@/components/footer"; // <-- 1. IMPORTED FOOTER

// Mock data for the marketplace quizzes
const marketplaceQuizzes = [
  {
    id: "1",
    title: "AWS Certified Cloud Practitioner",
    description:
      "Test your foundational knowledge of AWS cloud concepts, services, and terminology.",
    icon: <IconBook className="h-5 w-5 text-muted-foreground" />,
    category: "Cloud Computing",
  },
  {
    id: "2",
    title: "Google Cloud Digital Leader",
    description:
      "Validate your understanding of Google Cloud core products and services.",
    icon: <IconBook className="h-5 w-5 text-muted-foreground" />,
    category: "Cloud Computing",
  },
  {
    id: "3",
    title: "JavaScript Fundamentals",
    description:
      "Test your knowledge of variables, data types, functions, and the DOM.",
    icon: <IconCode className="h-5 w-5 text-muted-foreground" />,
    category: "Web Development",
  },
  {
    id: "4",
    title: "Project Management Professional (PMP)",
    description:
      "Test your ability to manage people, processes, and business priorities of projects.",
    icon: <IconBook className="h-5 w-5 text-muted-foreground" />,
    category: "Business",
  },
  {
    id: "5",
    title: "Web Programming Basics (HTML/CSS)",
    description:
      "Learn the building blocks of the web. Covers structure, styling, and layout.",
    icon: <IconCode className="h-5 w-5 text-muted-foreground" />,
    category: "Web Development",
  },
  {
    id: "6",
    title: "React Hooks Deep Dive",
    description:
      "Master useState, useEffect, useContext, and custom hooks in React.",
    icon: <IconCode className="h-5 w-5 text-muted-foreground" />,
    category: "Web Development",
  },
];

export default function PublicMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return marketplaceQuizzes;
    }
    return marketplaceQuizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div className="relative pt-24 md:pt-36">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Marketplace Section */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="font-bold text-3xl tracking-tight">
                  Quiz Marketplace
                </h2>
                <p className="text-muted-foreground">
                  Browse quizzes created by the community. Log in to start
                  playing and create your own.
                </p>

                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, category, or keyword..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="flex flex-col justify-between"
                    >
                      <CardHeader>
                        <Badge
                          variant="secondary"
                          className="w-fit mb-2"
                        >
                          {quiz.category}
                        </Badge>
                        <div className="flex items-center gap-3">
                          {quiz.icon}
                          <CardTitle className="text-lg">
                            {quiz.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="pt-1">
                          {quiz.description}
                        </CardDescription>
                      </CardHeader>

                      {/* ✅ Set to default (black) variant. Centering is built-in. */}
                      <CardContent className="pt-4">
                        <Button
                          asChild
                          className="w-full"
                          variant="default"
                        >
                          <Link href="/auth/login">
                            <IconLock className="h-4 w-4 mr-2" />
                            Login to Start Quiz
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredQuizzes.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    <p className="text-lg font-medium">No quizzes found</p>
                    <p>
                      Try adjusting your search terms or check back later!
                    </p>
                  </div>
                )}
              </div>

              {/* Create Quiz Section (Sidebar on right) */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Create Your Own Quiz</CardTitle>
                    <CardDescription>
                      Want to create your own quiz? Sign up for free to get
                      started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      className="w-full btn-apple-gradient"
                    >
                      <Link href="/auth/sign-up">
                        <IconPlus className="h-4 w-4 mr-2" />
                        Sign Up to Create
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection /> {/* <-- 2. ADDED FOOTER COMPONENT */}
    </>
  );
}