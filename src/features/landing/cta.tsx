import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function CTA() {
	return (
		<section className="py-20 px-6">
			<div className="max-w-4xl mx-auto text-center">
				{/* Background decoration */}
				<div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-primary/10">
					{/* Headline */}
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
						{m.cta_title()}
					</h2>

					{/* Supporting copy */}
					<p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
						{m.cta_body_primary()}
					</p>

					<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
						{m.cta_body_secondary()}
					</p>

					{/* CTA */}
					<Button
						size="lg"
						className="bg-gradient-brand hover:bg-gradient-brand-hover text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
					>
						<Mic className="w-5 h-5 mr-2" />
						{m.cta_button()}
					</Button>

					{/* Trust */}
					<p className="text-sm text-muted-foreground mt-6">{m.cta_note()}</p>
				</div>
			</div>
		</section>
	);
}
