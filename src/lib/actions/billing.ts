"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { userSubscriptions } from "@/db/schema";
import { authServer } from "@/lib/auth-server";

export interface SubscriptionInfo {
	plan: "free" | "premium";
	stripeCustomerId: string | null;
	stripeSubscriptionId: string | null;
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
	const { data: session } = await authServer.getSession();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, session.user.id),
	});

	if (!subscription) {
		return {
			plan: "free",
			stripeCustomerId: null,
			stripeSubscriptionId: null,
		};
	}

	return {
		plan: subscription.plan as "free" | "premium",
		stripeCustomerId: subscription.stripeCustomerId,
		stripeSubscriptionId: subscription.stripeSubscriptionId,
	};
}

export async function getUserPlan(): Promise<"free" | "premium"> {
	const { data: session } = await authServer.getSession();
	if (!session?.user?.id) {
		return "free";
	}

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, session.user.id),
	});

	return (subscription?.plan as "free" | "premium") ?? "free";
}
