import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { createFileRoute } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/auth/$pathname")({
	component: AuthPage,
});

function AuthPage() {
	const { pathname } = Route.useParams();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md px-4">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-gradient-brand">SayCal</h1>
					<p className="mt-2 text-muted-foreground">{m.auth_tagline()}</p>
				</div>
				<AuthView pathname={pathname} />
			</div>
		</div>
	);
}
