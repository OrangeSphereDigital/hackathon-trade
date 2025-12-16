import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Activity, LayoutDashboard, Users, MessageSquare } from 'lucide-react'
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarItem,
    SidebarInset
} from '@/components/ui/sidebar'
import { Logo } from '@/components/core/Logo';
import Header from '@/components/header';

type ViewState = 'dashboard' | 'early-access' | 'founder-contact';
export function AdminLayout({ children }: { children: any }) {
    const [activeView, setActiveView] = useState<ViewState>('dashboard');
    const { navigate } = useRouter()

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Logo showDesc={false} size='sm'/>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu className='pt-2'>
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            active={activeView === 'dashboard'}
                            onClick={() => navigate('/admin/dashboard' as any)}
                        />
                        <SidebarItem
                            icon={Users}
                            label="Early Access"
                            active={activeView === 'early-access'}
                            onClick={() => navigate('/admin/early-access' as any)}
                        />
                        <SidebarItem
                            icon={MessageSquare}
                            label="Founder Contact"
                            active={activeView === 'founder-contact'}
                            onClick={() => navigate('/admin/founder-contact' as any)}
                        />
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <Header />
                <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

