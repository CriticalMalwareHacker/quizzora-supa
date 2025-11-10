"use server";

// 1. Import your cookie-based server client and give it an alias
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

// 2. Import the standard client for creating the admin client
import { createClient } from "@supabase/supabase-js";

import { redirect } from "next/navigation";

export async function deleteAccount() {
  // 3. Get the user's client by awaiting your async function (with 0 args)
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not found or not authenticated." };
  }

  // 4. Create the admin client using the standard (non-SSR) createClient
  // This one *correctly* takes 3 arguments
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    return { error: `Failed to delete account: ${deleteError.message}` };
  }

  // Log the user out from the server-side client
  await supabase.auth.signOut();

  // Redirect to home page
  return redirect("/");
}