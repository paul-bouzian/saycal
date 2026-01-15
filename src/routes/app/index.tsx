import {
	RedirectToSignIn,
	SignedIn,
	SignedOut,
	UserButton,
} from "@neondatabase/neon-js/auth/react/ui";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/app/")({
	component: AppDashboard,
});

function AppDashboard() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<>
			<SignedIn>
				<div className="min-h-screen bg-background">
					<header className="flex items-center justify-between border-b p-4">
						<h1 className="text-xl font-bold text-gradient-brand">SayCal</h1>
						<UserButton />
					</header>
					<main className="p-4">
						<p className="text-foreground">
							{m.app_welcome({
								name: session?.user?.name || session?.user?.email || "",
							})}
						</p>
					</main>
				</div>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
}
