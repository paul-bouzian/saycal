import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { m } from "@/paraglide/messages";

export function FAQ() {
	const faqs = [
		{
			question: m.faq_1_question(),
			answer: m.faq_1_answer(),
		},
		{
			question: m.faq_2_question(),
			answer: m.faq_2_answer(),
		},
		{
			question: m.faq_3_question(),
			answer: m.faq_3_answer(),
		},
		{
			question: m.faq_4_question(),
			answer: m.faq_4_answer(),
		},
		{
			question: m.faq_5_question(),
			answer: m.faq_5_answer(),
		},
		{
			question: m.faq_6_question(),
			answer: m.faq_6_answer(),
		},
		{
			question: m.faq_7_question(),
			answer: m.faq_7_answer(),
		},
		{
			question: m.faq_8_question(),
			answer: m.faq_8_answer(),
		},
	];

	return (
		<section id="faq" className="py-20 px-6 bg-muted/30">
			<div className="max-w-3xl mx-auto">
				{/* Section headline */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
					{m.faq_title()}
				</h2>

				<p className="text-center text-muted-foreground mb-12 text-lg">
					{m.faq_subtitle()}
				</p>

				{/* FAQ Accordion */}
				<Accordion type="single" collapsible className="w-full">
					{faqs.map((faq, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className="border-b border-border"
						>
							<AccordionTrigger className="text-left text-lg font-medium py-6 hover:no-underline">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground text-base pb-6">
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
