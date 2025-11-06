"use client";

import { SidebarLink, useSidebar } from "@/components/ui/sidebar";
import {
  IconHome,
  IconSettings,
  IconUser,
  IconUsersGroup,
  IconPlayerPlay,
  IconHexagonLetterQ, // Using this as the icon for the logo
  IconChartBar, // ✅ 1. Import the missing icon
} from "@tabler/icons-react";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// All your links are now in this client component
const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconHome className="h-5 w-5" />,
  },
  // ✅ 2. Added the "Statistics" link
  {
    label: "Statistics",
    href: "/dashboard/stats",
    icon: <IconChartBar className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <IconUser className="h-5 w-5" />,
  },
  {
    label: "Host Quiz",
    href: "/dashboard/host",
    icon: <IconUsersGroup className="h-5 w-5" />,
  },
  {
    label: "Join Quiz",
    href: "/dashboard/join",
    icon: <IconPlayerPlay className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings", // ✅ 3. Corrected the path
    icon: <IconSettings className="h-5 w-5" />,
  },
];

// This component contains all the sidebar content
export function DashboardSidebarContent() {
  const { open, animate } = useSidebar();

  return (
    // This div uses justify-between to space items evenly
    <div className="flex flex-col h-full justify-between">
      {/* Top Section: Logo + Links */}
      <div>
        {/* 1. Logo Section */}
        <div className="pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 group/sidebar py-2",
              !open && "justify-center", // Center icon when closed
            )}
          >
            {/* Full Logo (when open) */}
            <motion.div
              animate={{
                display: animate
                  ? open
                    ? "inline-block"
                    : "none"
                  : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="whitespace-pre"
            >
              <Logo className="h-6 w-auto" />
            </motion.div>

            {/* Icon (when closed) */}
            <motion.div
              animate={{
                display: animate ? (open ? "none" : "flex") : "none",
              }}
              className={cn(
                "text-neutral-700 dark:text-neutral-200",
                !open && "flex items-center justify-center w-full",
              )}
            >
              {/* Using a placeholder 'Q' icon as the logo file is text */}
              <IconHexagonLetterQ className="h-6 w-6" />
            </motion.div>
          </Link>
        </div>

        {/* 2. Links Section */}
        <div className="flex flex-col space-y-4">
          {sidebarLinks.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </div>

      {/* 3. Logout Section */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <LogoutButton />
      </div>
    </div>
  );
}