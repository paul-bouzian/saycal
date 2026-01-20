"use server";

import { eq, sql, and } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/db/index";
import { userSubscriptions } from "@/db/schema";

const PREMIUM_DAILY_DURATION_LIMIT_SECONDS = 600; // 10 minutes per day (hidden limit)

type QuotaDenialReason = "premium_required" | "daily_limit_reached";

interface QuotaResult {
	allowed: boolean;
	reason?: QuotaDenialReason;
	plan: string;
}

export async function checkVoiceAccess(userId: string): Promise<QuotaResult> {
	await db
		.insert(userSubscriptions)
		.values({
			userId,
			plan: "free",
			voiceUsageDate: null,
			voiceUsageDurationSeconds: 0,
		})
		.onConflictDoNothing();

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
		return {
			allowed: false,
			reason: "premium_required",
			plan: "free",
		};
	}

	if (subscription.plan !== "premium") {
		return {
			allowed: false,
			reason: "premium_required",
			plan: subscription.plan,
		};
	}

	return {
		allowed: true,
		plan: "premium",
	};
}

interface QuotaIncrementResult {
	allowed: boolean;
	reason?: QuotaDenialReason;
	plan: string;
}

export async function checkAndIncrementVoiceDuration(
	userId: string,
	durationSeconds: number,
): Promise<QuotaIncrementResult> {
	const currentDate = format(new Date(), "yyyy-MM-dd");

	await db
		.insert(userSubscriptions)
		.values({
			userId,
			plan: "free",
			voiceUsageDate: currentDate,
			voiceUsageDurationSeconds: 0,
		})
		.onConflictDoNothing();

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
		return {
			allowed: false,
			reason: "premium_required",
			plan: "free",
		};
	}

	if (subscription.plan !== "premium") {
		return {
			allowed: false,
			reason: "premium_required",
			plan: subscription.plan,
		};
	}

	const result = await db
		.update(userSubscriptions)
		.set({
			voiceUsageDate: currentDate,
			voiceUsageDurationSeconds: sql`
				CASE
					WHEN ${userSubscriptions.voiceUsageDate} != ${currentDate} THEN ${durationSeconds}
					ELSE ${userSubscriptions.voiceUsageDurationSeconds} + ${durationSeconds}
				END
			`,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(userSubscriptions.userId, userId),
				sql`(
					${userSubscriptions.voiceUsageDate} != ${currentDate}
					OR ${userSubscriptions.voiceUsageDurationSeconds} + ${durationSeconds} <= ${PREMIUM_DAILY_DURATION_LIMIT_SECONDS}
				)`,
			),
		)
		.returning();

	if (result.length === 0) {
		return {
			allowed: false,
			reason: "daily_limit_reached",
			plan: "premium",
		};
	}

	return {
		allowed: true,
		plan: "premium",
	};
}

export async function getUserPlan(userId: string): Promise<"free" | "premium"> {
	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	return (subscription?.plan as "free" | "premium") ?? "free";
}
