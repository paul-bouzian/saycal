import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const navLinks = [
		{ label: m.link_features(), href: "#features" },
		{ label: m.link_pricing(), href: "#pricing" },
		{ label: m.link_faq(), href: "#faq" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="max-w-6xl mx-auto px-6">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<a href="/" className="flex items-center gap-2">
						<img src="/images/logo.png" alt="SayCal" className="h-8 w-auto" />
						<span className="font-bold text-xl">SayCal</span>
					</a>

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
						<Button variant="ghost" size="sm">
							{m.nav_sign_in()}
						</Button>
						<Button
							size="sm"
							className="bg-gradient-brand hover:bg-gradient-brand-hover text-white"
						>
							{m.nav_try_free()}
						</Button>
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 -mr-2"
						aria-label={m.nav_toggle_menu()}
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
							<Button variant="outline" className="w-full">
								{m.nav_sign_in()}
							</Button>
							<Button className="w-full bg-gradient-brand hover:bg-gradient-brand-hover text-white">
								{m.nav_try_free()}
							</Button>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
