import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./core/mode-toggle";
import UserMenu from "./core/user-menu";
import { Logo } from "./core/Logo";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/arbitrage", label: "Arbitrage" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-2 ">
				<nav className="flex gap-4 text-lg items-center">
					<Logo/>
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
