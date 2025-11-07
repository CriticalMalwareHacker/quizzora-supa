import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconSettings,
  IconUser,
  IconLogout,
  IconUsersGroup,
  IconPlayerPlay,
  // REMOVED: IconChartBar and IconBuildingStore
} from "@tabler/icons-react";
import { LogoutButton } from "@/components/logout-button";
import { SidebarLogo } from "@/components/sidebar-logo"; 

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconHome className="h-5 w-5" />,
  },
  // REMOVED Marketplace Link
  // REMOVED Statistics Link
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

            <div className="flex flex-col space-y-4 flex-1 mt-6">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
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