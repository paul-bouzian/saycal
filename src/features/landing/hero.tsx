import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function Hero() {
	return (
		<section className="relative py-20 md:py-32 px-6 overflow-hidden">
			{/* Gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

			<div className="relative max-w-4xl mx-auto text-center">
				{/* Main headline */}
				<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
					<span className="text-gradient-brand">{m.hero_title_emphasis()}</span>{" "}
					<span className="text-foreground">{m.hero_title_rest()}</span>
				</h1>

				{/* Subheadline */}
				<p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
					{m.hero_subtitle()}
				</p>

				{/* Example */}
				<p className="text-lg text-muted-foreground/80 mb-10">
					<span className="font-medium text-foreground">
						{m.hero_example_phrase()}
					</span>{" "}
					{m.hero_example_result()}
				</p>

				{/* CTA buttons */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
					<Button
						size="lg"
						className="bg-gradient-brand hover:bg-gradient-brand-hover text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
					>
						<Mic className="w-5 h-5 mr-2" />
						{m.hero_cta_primary()}
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="px-8 py-6 text-lg rounded-xl"
					>
						{m.hero_cta_secondary()}
					</Button>
				</div>

				{/* Micro-copy */}
				<p className="text-sm text-muted-foreground">{m.hero_microcopy()}</p>

				{/* Social proof snippet */}
				<div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<span className="inline-flex items-center gap-1.5">
						<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						{m.hero_social_open_source()}
					</span>
					<span className="text-border">•</span>
					<span>{m.hero_social_join_users()}</span>
				</div>
			</div>
		</section>
	);
}
