import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/layout/DashboardHeader";
import { cn } from "@/lib/utils";

export function DashboardLayout({
  children,
  className = "",
}: {
  children: any;
  className?: string;
}) {
  return (
    <SidebarProvider className="overflow-hidden">
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main
          className={cn(
            "flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-4 h-screen",
            className
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
