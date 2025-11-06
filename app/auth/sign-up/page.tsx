import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* --- MODIFIED THIS BUTTON (no underline) --- */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit justify-start p-0 h-auto mb-4 text-muted-foreground hover:text-primary hover:bg-transparent"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        {/* ------------------------------------------ */}
        <SignUpForm />
      </div>
    </div>
  );
}