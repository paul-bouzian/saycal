import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import {
	handleCheckoutCompleted,
	handleSubscriptionUpdated,
	handleSubscriptionDeleted,
	handleInvoicePaymentFailed,
} from "@/lib/stripe/webhooks";

export async function POST(request: Request) {
	const body = await request.text();
	const headersList = await headers();
	const signature = headersList.get("stripe-signature");

	if (!signature) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (error) {
		console.error("[Stripe Webhook] Signature verification failed:", error);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutCompleted(event.data.object);
				break;
			case "customer.subscription.updated":
				await handleSubscriptionUpdated(event.data.object);
				break;
			case "customer.subscription.deleted":
				await handleSubscriptionDeleted(event.data.object);
				break;
			case "invoice.payment_failed":
				await handleInvoicePaymentFailed(event.data.object);
				break;
			default:
				console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error(`[Stripe Webhook] Error processing ${event.type}:`, error);
		return NextResponse.json(
			{ error: "Webhook handler failed" },
			{ status: 500 },
		);
	}
}
