// /components/auth-button.tsx (Modified)
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine the best display name
  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {displayName}!
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}