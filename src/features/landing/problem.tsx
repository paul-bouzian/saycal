import { Clock, MousePointerClick, Settings2 } from "lucide-react";
import { m } from "@/paraglide/messages";

const painPoints = [
	{
		icon: Clock,
		title: m.problem_pain_1_title(),
		description: m.problem_pain_1_desc(),
	},
	{
		icon: MousePointerClick,
		title: m.problem_pain_2_title(),
		description: m.problem_pain_2_desc(),
	},
	{
		icon: Settings2,
		title: m.problem_pain_3_title(),
		description: m.problem_pain_3_desc(),
	},
];

export function Problem() {
	return (
		<section className="py-20 px-6 bg-muted/30">
			<div className="max-w-5xl mx-auto">
				{/* Section headline */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					{m.problem_title()}
				</h2>

				<p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
					{m.problem_subtitle()}
				</p>

				{/* Pain points */}
				<div className="grid md:grid-cols-3 gap-8 mb-12">
					{painPoints.map((point) => (
						<div key={point.title} className="text-center">
							<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
								<point.icon className="w-7 h-7" />
							</div>
							<h3 className="text-xl font-semibold mb-2">{point.title}</h3>
							<p className="text-muted-foreground">{point.description}</p>
						</div>
					))}
				</div>

				{/* Agitation */}
				<div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl p-8 text-center">
					<p className="text-lg text-muted-foreground leading-relaxed">
						{m.problem_agitation_line1()}
					</p>
					<p className="text-lg text-foreground font-medium mt-4">
						{m.problem_agitation_line2()}
					</p>
				</div>
			</div>
		</section>
	);
}
