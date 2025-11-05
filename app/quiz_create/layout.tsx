import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconHome, IconSettings, IconUser, IconLogout } from "@tabler/icons-react";
import { LogoutButton } from "@/components/logout-button";

// This layout is copied from your dashboard layout to protect the new route
// and keep the UI consistent

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

export default function CreateQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sidebar>
      <main className="min-h-screen">
        <div className="flex flex-col h-screen">
          <div className="flex flex-1 overflow-hidden">
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
              {/* The content from your new page.tsx will go here */}
              {children}
            </main>
          </div>
        </div>
      </main>
    </Sidebar>
  );
}