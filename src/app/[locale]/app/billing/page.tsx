import { CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSubscriptionInfo } from "@/lib/actions/billing";
import { PricingCard } from "@/features/billing/pricing-card";
import { ManageSubscription } from "@/features/billing/manage-subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BillingPageProps {
	searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
	const t = await getTranslations();
	const params = await searchParams;
	const subscription = await getSubscriptionInfo();

	const showSuccess = params.success === "true";

	return (
		<div className="max-w-2xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold">{t("billing_title")}</h1>
				<p className="text-muted-foreground">{t("billing_subtitle")}</p>
			</div>

			{showSuccess && (
				<Alert className="border-green-500 bg-green-50">
					<CheckCircle className="size-4 text-green-500" />
					<AlertTitle>{t("billing_success_title")}</AlertTitle>
					<AlertDescription>{t("billing_success_desc")}</AlertDescription>
				</Alert>
			)}

			<PricingCard isPremium={subscription.plan === "premium"} />

			{subscription.stripeCustomerId && <ManageSubscription />}
		</div>
	);
}
