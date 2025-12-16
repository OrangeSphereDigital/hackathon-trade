import { useState } from 'react'
import { LayoutDashboard, Users, MessageSquare } from 'lucide-react'
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarItem,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/core/Logo'
import { useRouter } from '@tanstack/react-router'

export type AdminViewState = 'dashboard' | 'early-access' | 'founder-contact'

export function AdminSidebar() {
  const [activeView, setActiveView] = useState<AdminViewState>('dashboard')
  const { navigate } = useRouter()

  const handleNavigate = (view: AdminViewState, path: string) => {
    setActiveView(view)
    navigate({ to: path as any })
  }

  return (
    <>
      <SidebarHeader>
        <Logo showDesc={false} size="sm" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="pt-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => handleNavigate('dashboard', '/admin/dashboard')}
          />
          <SidebarItem
            icon={Users}
            label="Early Access"
            active={activeView === 'early-access'}
            onClick={() => handleNavigate('early-access', '/admin/early-access')}
          />
          <SidebarItem
            icon={MessageSquare}
            label="Founder Contact"
            active={activeView === 'founder-contact'}
            onClick={() =>
              handleNavigate('founder-contact', '/admin/founder-contact')
            }
          />
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
