import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconSettings,
  IconUser,
  IconLogout,
  IconUsersGroup,
  IconPlayerPlay,
  IconChartBar, // ✅ 1. Import the new icon
} from "@tabler/icons-react";
import { LogoutButton } from "@/components/logout-button";
import { SidebarLogo } from "@/components/sidebar-logo";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconHome className="h-5 w-5" />,
  },
  // ✅ 2. Add the new Statistics link
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
    href: "/dashboard/settings",
    icon: <IconSettings className="h-5 w-5" />,
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sidebar>
      <div className="flex flex-col md:flex-row h-screen">
        <SidebarBody className="bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-lg border-r border-neutral-200/50 dark:border-neutral-700/50">
          <div className="flex flex-col h-full">
            
            <SidebarLogo />

           <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <IconLogout className="h-5 w-5 text-red-500" />
              <LogoutButton />
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <LogoutButton />
            </div>
          </div>
        </SidebarBody>

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-10">{children}</div>
        </main>
      </div>
    </Sidebar>
  );
}