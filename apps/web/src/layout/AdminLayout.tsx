import {
    SidebarProvider,
    Sidebar,
    SidebarInset
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import AdminHeader from '@/layout/AdminHeader'

export function AdminLayout({ children }: { children: any }) {
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <AdminSidebar />
            </Sidebar>
            <SidebarInset>
                <AdminHeader />
                <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
