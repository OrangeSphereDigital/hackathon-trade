import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/core/mode-toggle";
import UserMenu from "@/components/core/user-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardHeader() {
  const links = [{ to: "/", label: "Home" }] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-2 ">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
