import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/index";
import { userSubscriptions } from "@/db/schema";
import { getStripe } from "@/lib/stripe/client";
import { sendPaymentFailedEmail } from "@/lib/email/send";

export async function handleCheckoutCompleted(
	session: Stripe.Checkout.Session,
) {
	const customerId = session.customer as string;
	const subscriptionId = session.subscription as string;

	await db
		.update(userSubscriptions)
		.set({
			stripeSubscriptionId: subscriptionId,
			plan: "premium",
			updatedAt: new Date(),
		})
		.where(eq(userSubscriptions.stripeCustomerId, customerId));

	console.log(`[Stripe] Checkout completed for customer ${customerId}`);
}

export async function handleSubscriptionUpdated(
	subscription: Stripe.Subscription,
) {
	const customerId = subscription.customer as string;
	const status = subscription.status;

	const plan =
		status === "active" || status === "trialing" ? "premium" : "free";

	await db
		.update(userSubscriptions)
		.set({
			plan,
			stripeSubscriptionId: subscription.id,
			updatedAt: new Date(),
		})
		.where(eq(userSubscriptions.stripeCustomerId, customerId));

	console.log(`[Stripe] Subscription ${subscription.id} updated to ${plan}`);
}

export async function handleSubscriptionDeleted(
	subscription: Stripe.Subscription,
) {
	const customerId = subscription.customer as string;

	await db
		.update(userSubscriptions)
		.set({
			plan: "free",
			stripeSubscriptionId: null,
			updatedAt: new Date(),
		})
		.where(eq(userSubscriptions.stripeCustomerId, customerId));

	console.log(`[Stripe] Subscription ${subscription.id} cancelled`);
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
	const customerId =
		typeof invoice.customer === "string"
			? invoice.customer
			: invoice.customer?.id;

	if (!customerId) {
		console.error("[Stripe] No customer ID found in invoice");
		return;
	}

	try {
		const customer = await getStripe().customers.retrieve(customerId);

		if (!customer.deleted && customer.email) {
			await sendPaymentFailedEmail(customer.email);
			console.log(`[Stripe] Payment failed email sent to ${customer.email}`);
		}
	} catch (error) {
		console.error("[Stripe] Failed to handle payment failed:", error);
	}
}
