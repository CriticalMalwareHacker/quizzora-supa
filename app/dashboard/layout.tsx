import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconSettings,
  IconUser,
  IconLogout,
  IconUsersGroup,
  IconPlayerPlay, // 1. Import the new icon
} from "@tabler/icons-react";
import { LogoutButton } from "@/components/logout-button";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconHome className="h-5 w-5" />,
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
  // 2. Add the new "Join Quiz" link here
  {
    label: "Join Quiz",
    href: "/dashboard/join",
    icon: <IconPlayerPlay className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
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
        <SidebarBody className="bg-neutral-100 dark:bg-neutral-800">
          <div className="flex flex-col h-full">
            <div className="flex flex-col space-y-4 flex-1">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <IconLogout className="h-5 w-5 text-red-500" />
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