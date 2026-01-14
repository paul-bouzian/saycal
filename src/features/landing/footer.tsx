import { Github, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { m } from "@/paraglide/messages";

export function Footer() {
	const footerLinks = {
		product: [
			{ label: m.link_features(), href: "#features" },
			{ label: m.link_pricing(), href: "#pricing" },
			{ label: m.link_faq(), href: "#faq" },
		],
		resources: [
			{ label: m.footer_link_docs(), href: "#" },
			{ label: m.footer_link_github(), href: "https://github.com" },
			{ label: m.footer_link_changelog(), href: "#" },
		],
		legal: [
			{ label: m.footer_link_imprint(), href: "#" },
			{ label: m.footer_link_privacy(), href: "#" },
			{ label: m.footer_link_terms(), href: "#" },
		],
	};

	const socialLinks = [
		{
			icon: Github,
			href: "https://github.com",
			label: m.footer_social_github(),
		},
		{
			icon: Twitter,
			href: "https://twitter.com",
			label: m.footer_social_twitter(),
		},
	];

	return (
		<footer className="py-16 px-6 bg-muted/30">
			<div className="max-w-6xl mx-auto">
				{/* Main footer content */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					{/* Brand column */}
					<div className="col-span-2 md:col-span-1">
						<div className="flex items-center gap-2 mb-4">
							<img src="/images/logo.png" alt="SayCal" className="h-8 w-auto" />
							<span className="font-bold text-xl">SayCal</span>
						</div>
						<p className="text-sm text-muted-foreground mb-4">
							{m.footer_tagline()}
						</p>
						{/* Social links */}
						<div className="flex gap-3">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
									aria-label={social.label}
								>
									<social.icon className="w-4 h-4" />
								</a>
							))}
						</div>
					</div>

					{/* Product links */}
					<div>
						<h4 className="font-semibold mb-4">{m.footer_product_title()}</h4>
						<ul className="space-y-3">
							{footerLinks.product.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Resources links */}
					<div>
						<h4 className="font-semibold mb-4">{m.footer_resources_title()}</h4>
						<ul className="space-y-3">
							{footerLinks.resources.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Legal links */}
					<div>
						<h4 className="font-semibold mb-4">{m.footer_legal_title()}</h4>
						<ul className="space-y-3">
							{footerLinks.legal.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Separator className="mb-8" />

				{/* Copyright */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<p>{m.footer_copyright({ year: new Date().getFullYear() })}</p>
					<p>{m.footer_made_with_love()}</p>
				</div>
			</div>
		</footer>
	);
}
