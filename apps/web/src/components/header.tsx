import { ModeToggle } from "./core/mode-toggle";
import UserMenu from "./core/user-menu";
import { Logo } from "./core/Logo";

export default function Header() {
	const links = [
		{ to: "#monitor", label: "Live Monitor" },
		{ to: "#arbitrage", label: "Arbitrage" },
		{ to: "#simulation", label: "Arbitrage" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-3 bg-background">
				<Logo />
				<nav className="flex gap-4 text-lg justify-end items-center">
					{links.map(({ to, label }) => {
						return (
							<a key={to} href={to}>
								{label}
							</a>
						);
					})}
					<ModeToggle />
					<UserMenu />
				</nav>
			</div>
			<hr />
		</div>
	);
}
