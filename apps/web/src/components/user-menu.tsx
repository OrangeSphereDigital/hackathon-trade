import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	console.log(session)

	if (isPending) {
		return <Skeleton className="h-9 w-9 rounded-full" />;
	}

	if (!session) {
		return (
			<Button variant="outline" asChild>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<User className="h-5 w-5" />
					<span className="sr-only">User menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card" align="end">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{session.user.name}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{session.user.role === "admin" && (
					<DropdownMenuItem asChild>
						<Link to="/admin">Admin Dashboard</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild>
					<Link to="/dashboard">Dashboard</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/arbitrage">Arbitrage</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Button
						variant="destructive"
						className="w-full justify-start cursor-pointer"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({
											to: "/",
										});
									},
								},
							});
						}}
					>
						Sign Out
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
