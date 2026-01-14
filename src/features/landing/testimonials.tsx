import { Github, MapPin, Quote, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

export function Testimonials() {
	const testimonials = [
		{
			quote: m.testimonial_1_quote(),
			author: m.testimonial_1_author(),
			role: m.testimonial_1_role(),
			result: m.testimonial_1_result(),
		},
		{
			quote: m.testimonial_2_quote(),
			author: m.testimonial_2_author(),
			role: m.testimonial_2_role(),
			result: m.testimonial_2_result(),
		},
		{
			quote: m.testimonial_3_quote(),
			author: m.testimonial_3_author(),
			role: m.testimonial_3_role(),
			result: m.testimonial_3_result(),
		},
	];

	const trustIndicators = [
		{
			icon: Github,
			label: m.trust_indicator_1_label(),
			description: m.trust_indicator_1_desc(),
		},
		{
			icon: MapPin,
			label: m.trust_indicator_2_label(),
			description: m.trust_indicator_2_desc(),
		},
		{
			icon: Shield,
			label: m.trust_indicator_3_label(),
			description: m.trust_indicator_3_desc(),
		},
	];

	return (
		<section className="py-20 px-6">
			<div className="max-w-5xl mx-auto">
				{/* Section headline */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					{m.testimonials_title()}
				</h2>

				<p className="text-center text-muted-foreground mb-16 text-lg">
					{m.testimonials_subtitle()}
				</p>

				{/* Testimonials */}
				<div className="grid md:grid-cols-3 gap-6 mb-16">
					{testimonials.map((testimonial) => (
						<Card key={testimonial.author} className="border-0 shadow-lg">
							<CardContent className="p-6">
								<Quote className="w-8 h-8 text-primary/20 mb-4" />
								<p className="text-foreground mb-4 leading-relaxed">
									"{testimonial.quote}"
								</p>
								<div className="border-t border-border pt-4">
									<p className="font-semibold">{testimonial.author}</p>
									<p className="text-sm text-muted-foreground">
										{testimonial.role}
									</p>
									<p className="text-sm text-primary font-medium mt-2">
										{testimonial.result}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Trust indicators */}
				<div className="flex flex-wrap justify-center gap-8 md:gap-16">
					{trustIndicators.map((indicator) => (
						<div key={indicator.label} className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<indicator.icon className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">{indicator.label}</p>
								<p className="text-sm text-muted-foreground">
									{indicator.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
