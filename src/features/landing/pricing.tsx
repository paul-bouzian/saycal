import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

export function Pricing() {
	const tiers = [
		{
			name: m.pricing_tier_free_name(),
			price: m.pricing_tier_free_price(),
			period: m.pricing_tier_free_period(),
			description: m.pricing_tier_free_description(),
			features: [
				m.pricing_tier_free_feature_1(),
				m.pricing_tier_free_feature_2(),
				m.pricing_tier_free_feature_3(),
				m.pricing_tier_free_feature_4(),
				m.pricing_tier_free_feature_5(),
				m.pricing_tier_free_feature_6(),
				m.pricing_tier_free_feature_7(),
			],
			cta: m.pricing_tier_free_cta(),
			ctaVariant: "outline" as const,
			note: m.pricing_tier_free_note(),
			icon: null,
			highlighted: false,
		},
		{
			name: m.pricing_tier_premium_name(),
			price: m.pricing_tier_premium_price(),
			period: m.pricing_tier_premium_period(),
			description: m.pricing_tier_premium_description(),
			features: [
				m.pricing_tier_premium_feature_1(),
				m.pricing_tier_premium_feature_2(),
				m.pricing_tier_premium_feature_3(),
				m.pricing_tier_premium_feature_4(),
				m.pricing_tier_premium_feature_5(),
			],
			cta: m.pricing_tier_premium_cta(),
			ctaVariant: "default" as const,
			note: m.pricing_tier_premium_note(),
			icon: Star,
			highlighted: true,
		},
	];

	return (
		<section id="pricing" className="py-20 px-6">
			<div className="max-w-6xl mx-auto">
				{/* Section headline */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					{m.pricing_title()}
				</h2>

				<p className="text-center text-muted-foreground mb-16 text-lg">
					{m.pricing_subtitle()}
				</p>

				{/* Pricing cards */}
				<div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
					{tiers.map((tier) => (
						<Card
							key={tier.name}
							className={cn(
								"relative flex flex-col",
								tier.highlighted
									? "border-primary shadow-xl shadow-primary/10 scale-105"
									: "border-border shadow-lg",
							)}
						>
							{tier.highlighted && (
								<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-white border-0">
									{m.pricing_badge_popular()}
								</Badge>
							)}

							<CardHeader className="pb-4">
								<div className="flex items-center gap-2 mb-2">
									{tier.icon && <tier.icon className="w-5 h-5 text-primary" />}
									<h3 className="text-xl font-bold">{tier.name}</h3>
								</div>
								<div className="flex items-baseline gap-1">
									<span className="text-4xl font-bold">{tier.price}</span>
									<span className="text-muted-foreground">{tier.period}</span>
								</div>
								<p className="text-sm text-muted-foreground mt-2">
									{tier.description}
								</p>
							</CardHeader>

							<CardContent className="flex-1 flex flex-col">
								<ul className="space-y-3 mb-8 flex-1">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-start gap-2">
											<Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>

								<Button
									variant={tier.ctaVariant}
									className={cn(
										"w-full",
										tier.highlighted &&
											"bg-gradient-brand hover:bg-gradient-brand-hover text-white",
									)}
								>
									{tier.cta}
								</Button>

								<p className="text-xs text-muted-foreground text-center mt-3">
									{tier.note}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Guarantee */}
				<div className="max-w-xl mx-auto text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
					<p className="text-lg font-semibold mb-2">
						{m.pricing_guarantee_title()}
					</p>
					<p className="text-muted-foreground">{m.pricing_guarantee_body()}</p>
				</div>
			</div>
		</section>
	);
}
