"use client";

import { AuthView } from "@neondatabase/auth/react/ui";
import { useTranslations } from "next-intl";
import { use } from "react";

type Props = {
	params: Promise<{ pathname: string }>;
};

export default function AuthPage({ params }: Props) {
	const { pathname } = use(params);
	const t = useTranslations();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md px-4">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-gradient-brand">SayCal</h1>
					<p className="mt-2 text-muted-foreground">{t("auth_tagline")}</p>
				</div>
				<AuthView pathname={pathname} />
			</div>
		</div>
	);
}
