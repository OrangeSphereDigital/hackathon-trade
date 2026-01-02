import { useState } from "react";
import { LayoutDashboard, Users, MessageSquare, UserCog } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/core/Logo";
import { useRouter, useLocation } from "@tanstack/react-router";

export type AdminViewState =
  | "dashboard"
  | "early-access"
  | "founder-contact"
  | "users";

export function AdminSidebar() {
  const [activeView, setActiveView] = useState<AdminViewState>("dashboard");
  const { navigate } = useRouter();
  const location = useLocation();

  const handleNavigate = (view: AdminViewState, path: string) => {
    setActiveView(view);
    navigate({ to: path as any });
  };

  const items = [
    {
      url: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      view: "dashboard" as AdminViewState,
    },
    {
      url: "/admin/early-access",
      label: "Early Access",
      icon: Users,
      view: "early-access" as AdminViewState,
    },
    {
      url: "/admin/founder-contact",
      label: "Founder Contact",
      icon: MessageSquare,
      view: "founder-contact" as AdminViewState,
    },
    {
      url: "/admin/users",
      label: "Users",
      icon: UserCog,
      view: "users" as AdminViewState,
    },
  ] as const;

  return (
    <>
      <SidebarHeader>
        <Logo showDesc={false} size="sm" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="pt-2">
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarItem
                key={item.url}
                icon={item.icon}
                label={item.label}
                active={isActive}
                onClick={() => handleNavigate(item.view, item.url)}
              />
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
