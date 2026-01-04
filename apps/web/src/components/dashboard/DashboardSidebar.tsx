import { Activity, BarChart2, Zap } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/core/Logo";

export function DashboardSidebar() {
  const items = [
    {
      url: "#monitor",
      label: "Live Monitor",
      icon: Activity,
    },
    {
      url: "#arbitrage",
      label: "Arbitrage",
      icon: Zap,
    },
    {
      url: "#simulation",
      label: "Simulation",
      icon: BarChart2,
    },
  ] as const;

  const handleScroll = (id: string) => {
    const element = document.getElementById(id.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <SidebarHeader>
        <Logo showDesc={false} size="sm" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="pt-2">
          {items.map((item) => {
            return (
              <SidebarItem
                key={item.url}
                icon={item.icon}
                label={item.label}
                onClick={() => handleScroll(item.url)}
              />
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
