"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth";

export function UserMenu() {
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const t = useTranslations();

	const user = session?.user;
	const email = user?.email ?? "";
	const name = user?.name ?? email.split("@")[0];
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
	}

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
				>
					<Avatar className="h-8 w-8">
						<AvatarFallback className="bg-gradient-to-br from-[#B552D9] to-[#FA8485] text-xs text-white">
							{initials}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/app/settings" className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						{t("user_menu_settings")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					{t("user_menu_sign_out")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
