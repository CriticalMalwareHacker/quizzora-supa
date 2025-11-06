import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
// 1. Import the new client component
import { DashboardSidebarContent } from "./dashboard-sidebar-content";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sidebar>
      <div className="flex flex-col md:flex-row h-screen">
        <SidebarBody className="bg-neutral-100 dark:bg-neutral-800">
          
          {/* 2. This is the only component inside the sidebar body now */}
          <DashboardSidebarContent />

        </SidebarBody>

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-10">{children}</div>
        </main>
      </div>
    </Sidebar>
  );
}