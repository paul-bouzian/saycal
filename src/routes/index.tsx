import { createFileRoute } from "@tanstack/react-router";
import {
	CTA,
	FAQ,
	Features,
	Footer,
	Hero,
	Navbar,
	Pricing,
	Problem,
	Solution,
	Testimonials,
} from "@/features/landing";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main>
				<Hero />
				<Problem />
				<Solution />
				<Features />
				<Testimonials />
				<Pricing />
				<FAQ />
				<CTA />
			</main>
			<Footer />
		</div>
	);
}
