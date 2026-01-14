import { Code2, LayoutGrid, Mic, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

export function Solution() {
	const benefits = [
		{
			icon: Mic,
			title: m.solution_benefit_1_title(),
			description: m.solution_benefit_1_desc(),
		},
		{
			icon: LayoutGrid,
			title: m.solution_benefit_2_title(),
			description: m.solution_benefit_2_desc(),
		},
		{
			icon: Smartphone,
			title: m.solution_benefit_3_title(),
			description: m.solution_benefit_3_desc(),
		},
		{
			icon: Code2,
			title: m.solution_benefit_4_title(),
			description: m.solution_benefit_4_desc(),
		},
	];

	return (
		<section className="py-20 px-6">
			<div className="max-w-5xl mx-auto">
				{/* Section headline */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						{m.solution_title()}
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{m.solution_subtitle()}
					</p>
				</div>

				{/* Value proposition highlight */}
				<div className="text-center mb-16 p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
					<p className="text-xl md:text-2xl font-medium">
						{m.solution_highlight_prefix()}{" "}
						<span className="text-gradient-brand font-bold">
							{m.solution_highlight_emphasis()}
						</span>
					</p>
				</div>

				{/* Benefits grid */}
				<div className="grid md:grid-cols-2 gap-6">
					{benefits.map((benefit) => (
						<Card
							key={benefit.title}
							className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
						>
							<CardContent className="p-6">
								<div className="flex gap-4">
									<div className="shrink-0">
										<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-brand text-white">
											<benefit.icon className="w-6 h-6" />
										</div>
									</div>
									<div>
										<h3 className="text-lg font-semibold mb-2">
											{benefit.title}
										</h3>
										<p className="text-muted-foreground">
											{benefit.description}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
