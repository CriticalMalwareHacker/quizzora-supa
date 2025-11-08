"use client";

import { useState } from "react";
import { type Quiz } from "../quiz-list";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, FileText, BarChart, QrCode } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { QRCodeSVG } from "qrcode.react";

export function HostQuizList({ quizzes }: { quizzes: Quiz[] }) {
  const [copiedQuizId, setCopiedQuizId] = useState<string | null>(null);
  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);

  const handleCopyLink = (quizId: string) => {
    const link = `${window.location.origin}/play/${quizId}`;
    navigator.clipboard.writeText(link);
    setCopiedQuizId(quizId);
    setTimeout(() => setCopiedQuizId(null), 2000); // Reset after 2 seconds
  };

  const handleShowQrCode = (quizId: string) => {
    const link = `${window.location.origin}/play/${quizId}`;
    setQrCodeLink(link);
  };

  if (quizzes.length === 0) {
    return (
      <div className="border rounded-lg border-dashed p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold">No quizzes found</h3>
        <p className="text-sm">
          You need to create a quiz before you can host it.
        </p>
      </div>
    );
  }

  return (
    <AlertDialog
      open={!!qrCodeLink}
      onOpenChange={(open) => !open && setQrCodeLink(null)}
    >
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            {/* ✅ MODIFIED: Added flex-col, gap-4, and md:flex-row */}
            <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-lg">
                  {quiz.title || "Untitled Quiz"}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>
                    {quiz.questions ? quiz.questions.length : 0} questions
                  </span>
                </div>
              </div>
              {/* ✅ MODIFIED: Stack buttons vertically on mobile, row on md screens */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Button asChild variant="ghost" className="w-full md:w-auto">
                  <Link href={`/dashboard/leaderboard/${quiz.id}`}>
                    <BarChart className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Link>
                </Button>

                {/* ✅ MODIFIED: Grouped QR and Copy buttons for better mobile layout */}
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShowQrCode(quiz.id)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleCopyLink(quiz.id)}
                    className="w-full flex-1 md:w-[130px] md:flex-none" // Fills remaining space on mobile
                  >
                    {copiedQuizId === quiz.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4 mr-2" /> Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ QR Code Modal Content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Scan to Join Quiz
          </AlertDialogTitle>
        </AlertDialogHeader>
        {/* ✅ 1. Added a white, padded wrapper div */}
        <div className="flex items-center justify-center p-4 bg-white rounded-lg">
          {qrCodeLink && (
            <QRCodeSVG
              value={qrCodeLink}
              size={256}
              bgColor={"#FFFFFF"} // ✅ 2. Explicitly set background
              fgColor={"#000000"} // ✅ 3. Explicitly set foreground
              includeMargin={true} // ✅ 4. Ensure quiet zone
            />
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}