import { AccountView } from "@neondatabase/neon-js/auth/react/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/$pathname")({
	component: AccountPage,
});

function AccountPage() {
	const { pathname } = Route.useParams();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<AccountView pathname={pathname} />
		</div>
	);
}
