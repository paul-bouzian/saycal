import { AudioWaveform, CalendarDays, Download, PenLine } from "lucide-react";
import { m } from "@/paraglide/messages";

const features = [
	{
		icon: AudioWaveform,
		title: m.features_item_1_title(),
		description: m.features_item_1_desc(),
	},
	{
		icon: CalendarDays,
		title: m.features_item_2_title(),
		description: m.features_item_2_desc(),
	},
	{
		icon: PenLine,
		title: m.features_item_3_title(),
		description: m.features_item_3_desc(),
	},
	{
		icon: Download,
		title: m.features_item_4_title(),
		description: m.features_item_4_desc(),
	},
];

export function Features() {
	return (
		<section className="py-20 px-6 bg-muted/30">
			<div className="max-w-5xl mx-auto">
				{/* Section headline */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					{m.features_title()}
				</h2>

				<p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto text-lg">
					{m.features_subtitle()}
				</p>

				{/* Features list */}
				<div className="space-y-12">
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className={`flex flex-col md:flex-row items-start gap-6 md:gap-10 ${
								index % 2 === 1 ? "md:flex-row-reverse" : ""
							}`}
						>
							<div className="shrink-0 w-full md:w-auto flex justify-center md:justify-start">
								<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-brand text-white shadow-lg shadow-primary/20">
									<feature.icon className="w-10 h-10" />
								</div>
							</div>
							<div className="flex-1 text-center md:text-left">
								<h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
								<p className="text-lg text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
