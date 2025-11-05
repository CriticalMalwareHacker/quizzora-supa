import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconSettings,
  IconUser,
  IconLogout,
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
    href: "/profile",
    icon: <IconUser className="h-5 w-5" />,
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
      {/* FIX 1: This div now uses `flex-col` for mobile and `md:flex-row` for desktop.
        This stacks the mobile header on top of the content, fixing the disappearing content issue.
        `h-screen` makes the layout fill the viewport.
      */}
      <div className="flex flex-col md:flex-row h-screen">
        
        {/* SidebarBody renders:
          1. MobileSidebar: `flex md:hidden` (the top header bar on mobile)
          2. DesktopSidebar: `hidden md:flex` (the side panel on desktop)
        */}
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

        {/* Main content area
          - `flex-1`: Ensures it takes up the remaining space.
          - `overflow-auto`: Allows this area to scroll if content is too long.
        */}
        <main className="flex-1 overflow-auto">
          {/* FIX 2: Removed `max-w-5xl` and other flex classes from this wrapper.
            It's now just for padding, allowing the content to stretch to fill the available space.
          */}
          <div className="p-6 md:p-10">
            {children}
          </div>
        </main>
      </div>
    </Sidebar>
  );
}