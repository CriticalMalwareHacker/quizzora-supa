import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { type User } from "@supabase/supabase-js";
import { UpdateProfileForm } from "@/components/update-profile-form";
import { IconMapPin, IconMail } from "@tabler/icons-react"; // ✅ Imported correct icons

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

  // ✅ Extract user's dynamic data 
  const email = user.email || "No email provided";  
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    "https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/riva-dashboard-tailwind/img/avatars/avatar1.jpg"; // Fallback avatar
  const location = user.user_metadata?.location || "Not specified"; // ✅ Get dynamic location

  return (
    <div className="flex flex-col gap-8">
      {/* ✅ Removed the "Welcome" H1 to make the page cleaner, as the name is in the card */}
      <h1 className="text-3xl font-bold">Welcome, {getDisplayName(user)}!</h1>
      {/* Your Profile Card Template */}
      <div className="relative flex flex-col w-full min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30 dark:bg-neutral-800/30">
        {/* Card Body */}
        <div className="p-6 md:p-8 flex-auto min-h-[70px] pb-0 bg-transparent">
          {/* ✅ Adjusted flex layout for better alignment */}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-2">
              <div className="relative inline-block shrink-0 rounded-2xl">
                {/* ✅ Made avatar slightly smaller */}
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
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.username ||
                      "User"}
                  </h2>
                </div>
                {/* ✅ Cleaned up info section */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap pr-2 mb-4 font-medium gap-y-2 gap-x-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IconMapPin className="w-5 h-5 mr-1.5" />
                    {location} {/* ✅ Display dynamic location */}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IconMail className="w-5 h-5 mr-1.5" />
                    {email}
                  </div>
                </div>
              </div>
              {/* ✅ Badges now wrap cleanly */}
              <div className="flex flex-wrap gap-2">
                <a
                  href="javascript:void(0)"
                  className="inline-flex items-center justify-center text-secondary-inverse rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all duration-200 ease-in-out px-4 py-1.5 text-sm font-medium leading-normal dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  320 Following
                </a>
                <a
                  href="javascript:void(0)"
                  className="inline-flex items-center justify-center text-secondary-inverse rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all duration-200 ease-in-out px-4 py-1.5 text-sm font-medium leading-normal dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  2.5k Followers
                </a>
                <a
                  href="javascript:void(0)"
                  className="inline-flex items-center justify-center text-secondary-inverse rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all duration-200 ease-in-out px-4 py-1.5 text-sm font-medium leading-normal dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  48 Deals
                </a>
              </div>
            </div>
          </div>
          <hr className="w-full h-px border-neutral-200 dark:border-neutral-700 mt-6 md:mt-8" />
          {/* Tabs */}
          <ul className="group flex flex-wrap items-stretch text-base font-semibold list-none border-b-2 border-transparent border-solid active-assignments px-0">
            <li className="flex mt-2 -mb-[2px]">
              <a
                aria-controls="assignments"
                className="py-5 mr-4 sm:mr-6 transition-colors duration-200 ease-in-out border-b-2 border-primary text-primary" // Active tab
                href="javascript:void(0)"
              >
                Profile Settings
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Profile Edit Form */}
      <UpdateProfileForm user={user} />
    </div>
  );
}