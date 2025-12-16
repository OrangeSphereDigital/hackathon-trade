import {
    SidebarProvider,
    Sidebar,
    SidebarInset
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import AdminHeader from '@/layout/AdminHeader'
import { cn } from '@/lib/utils'

export function AdminLayout({ children, className = "" }: { children: any, className?: string }) {
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <AdminSidebar />
            </Sidebar>
            <SidebarInset>
                <AdminHeader />
                <main className={cn("flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-4", className)}>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
