import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { type User } from "@supabase/supabase-js";
import { UpdateProfileForm } from "@/components/update-profile-form";
// ✅ Import the new icons
import { IconMapPin, IconMail, IconFileText, IconPlayerPlay } from "@tabler/icons-react"; 

// Helper function to get the display name
function getDisplayName(user: User) {
  return (
    user.user_metadata?.username || user.user_metadata?.full_name || user.email
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ✅ --- ADDED: Fetch user's stats ---
  const { count: quizCount, error: countError } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  
  // (You would fetch real data for quizzes played from your DB)
  const quizzesCreated = countError ? 0 : quizCount || 0;
  const quizzesPlayed = 0; // Placeholder
  // ---------------------------------

  const email = user.email || "No email provided";
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    "https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/riva-dashboard-tailwind/img/avatars/avatar1.jpg";
  const location = user.user_metadata?.location || "Not specified";

  return (
    <div className="flex flex-col gap-8">
      {/* ✅ Removed the "Welcome" H1, as it's redundant */}

      {/* ✅ --- MODIFIED: Streamlined Profile Card --- */}
      <div className="relative flex flex-col w-full min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30 dark:bg-neutral-800/30">
        {/* Card Body */}
        <div className="p-6 md:p-8 flex-auto min-h-[70px] bg-transparent">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-2">
              <div className="relative inline-block shrink-0 rounded-2xl">
                <Image
                  className="inline-block shrink-0 rounded-2xl w-24 h-24 lg:w-28 lg:h-28 object-cover"
                  src={avatarUrl}
                  alt="Profile picture"
                  width={112}
                  height={112}
                />
                <div className="group/tooltip relative">
                  <span className="w-4 h-4 absolute bg-green-500 rounded-full bottom-0 end-0 -mb-1 -mr-1 border-2 border-white dark:border-neutral-800"></span>
                </div>
              </div>
            </div>
            {/* User Info */}
            <div className="grow">
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <h2 className="text-secondary-inverse transition-colors duration-200 ease-in-out font-semibold text-2xl lg:text-3xl mr-1">
                    {getDisplayName(user)}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap pr-2 mb-4 font-medium gap-y-2 gap-x-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IconMapPin className="w-5 h-5 mr-1.5" />
                    {location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IconMail className="w-5 h-5 mr-1.5" />
                    {email}
                  </div>
                </div>
              </div>
              
              {/* ✅ --- REPLACED: New Stats Section --- */}
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconFileText className="w-5 h-5" />
                  <span className="font-medium text-foreground text-base">
                    {quizzesCreated}
                  </span>
                  Quizzes Created
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconPlayerPlay className="w-5 h-5" />
                  <span className="font-medium text-foreground text-base">
                    {quizzesPlayed}
                  </span>
                  Quizzes Played
                </div>
                {/* Add "Streak" here when data is available */}
              </div>
              {/* ------------------------------------ */}

            </div>
          </div>
          
          {/* ✅ REMOVED: Deleted the <hr> and <ul> for the tabs */}
        </div>
      </div>
      {/* --------------------------------------------- */}


      {/* Profile Edit Form */}
      <UpdateProfileForm user={user} />
    </div>
  );
}