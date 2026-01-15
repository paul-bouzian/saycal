"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth";

export function Navbar() {
	const t = useTranslations();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const { data: session, isPending } = authClient.useSession();

	const isLoggedIn = !!session?.user;

	const navLinks = [
		{ label: t("link_features"), href: "#features" },
		{ label: t("link_pricing"), href: "#pricing" },
		{ label: t("link_faq"), href: "#faq" },
	];

	async function handleSignOut() {
		await authClient.signOut();
		router.refresh();
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="max-w-6xl mx-auto px-6">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-2">
						<img src="/images/logo.png" alt="SayCal" className="h-8 w-auto" />
						<span className="font-bold text-xl">SayCal</span>
					</Link>

					{/* Desktop nav */}
					<nav className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								{link.label}
							</a>
						))}
					</nav>

					{/* Desktop CTA */}
					<div className="hidden md:flex items-center gap-4">
						{isPending ? (
							<div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
						) : isLoggedIn ? (
							<>
								<Button variant="ghost" size="sm" onClick={handleSignOut}>
									{t("nav_sign_out")}
								</Button>
								<Button
									size="sm"
									className="bg-gradient-brand hover:bg-gradient-brand-hover text-white"
									asChild
								>
									<Link href="/app">{t("nav_go_to_app")}</Link>
								</Button>
							</>
						) : (
							<>
								<Button variant="ghost" size="sm" asChild>
									<Link href="/auth/sign-in">{t("nav_sign_in")}</Link>
								</Button>
								<Button
									size="sm"
									className="bg-gradient-brand hover:bg-gradient-brand-hover text-white"
									asChild
								>
									<Link href="/auth/sign-up">{t("nav_try_free")}</Link>
								</Button>
							</>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 -mr-2"
						aria-label={t("nav_toggle_menu")}
					>
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden border-t border-border">
					<div className="px-6 py-4 space-y-4">
						{navLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								{link.label}
							</a>
						))}
						<div className="pt-4 space-y-2">
							{isLoggedIn ? (
								<>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											handleSignOut();
											setIsOpen(false);
										}}
									>
										{t("nav_sign_out")}
									</Button>
									<Button
										className="w-full bg-gradient-brand hover:bg-gradient-brand-hover text-white"
										asChild
									>
										<Link href="/app" onClick={() => setIsOpen(false)}>
											{t("nav_go_to_app")}
										</Link>
									</Button>
								</>
							) : (
								<>
									<Button variant="outline" className="w-full" asChild>
										<Link href="/auth/sign-in">{t("nav_sign_in")}</Link>
									</Button>
									<Button
										className="w-full bg-gradient-brand hover:bg-gradient-brand-hover text-white"
										asChild
									>
										<Link href="/auth/sign-up">{t("nav_try_free")}</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
