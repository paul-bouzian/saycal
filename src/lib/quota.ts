"use server";

import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/db/index";
import { userSubscriptions } from "@/db/schema";

const FREE_VOICE_LIMIT = 100;

interface QuotaResult {
	allowed: boolean;
	remaining: number;
	limit: number;
	plan: string;
}

export async function checkVoiceQuota(userId: string): Promise<QuotaResult> {
	const currentMonth = format(new Date(), "yyyy-MM");

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
		await db.insert(userSubscriptions).values({
			userId,
			plan: "free",
			voiceUsageMonth: currentMonth,
			voiceUsageCount: 0,
		});

		return {
			allowed: true,
			remaining: FREE_VOICE_LIMIT,
			limit: FREE_VOICE_LIMIT,
			plan: "free",
		};
	}

	if (subscription.plan === "premium") {
		return {
			allowed: true,
			remaining: -1,
			limit: -1,
			plan: "premium",
		};
	}

	if (subscription.voiceUsageMonth !== currentMonth) {
		await db
			.update(userSubscriptions)
			.set({
				voiceUsageMonth: currentMonth,
				voiceUsageCount: 0,
				updatedAt: new Date(),
			})
			.where(eq(userSubscriptions.userId, userId));

		return {
			allowed: true,
			remaining: FREE_VOICE_LIMIT,
			limit: FREE_VOICE_LIMIT,
			plan: "free",
		};
	}

	const remaining = FREE_VOICE_LIMIT - subscription.voiceUsageCount;

	return {
		allowed: remaining > 0,
		remaining: Math.max(0, remaining),
		limit: FREE_VOICE_LIMIT,
		plan: "free",
	};
}

export async function incrementVoiceUsage(userId: string): Promise<void> {
	const currentMonth = format(new Date(), "yyyy-MM");

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
		await db.insert(userSubscriptions).values({
			userId,
			plan: "free",
			voiceUsageMonth: currentMonth,
			voiceUsageCount: 1,
		});
		return;
	}

	if (subscription.voiceUsageMonth !== currentMonth) {
		await db
			.update(userSubscriptions)
			.set({
				voiceUsageMonth: currentMonth,
				voiceUsageCount: 1,
				updatedAt: new Date(),
			})
			.where(eq(userSubscriptions.userId, userId));
	} else {
		await db
			.update(userSubscriptions)
			.set({
				voiceUsageCount: subscription.voiceUsageCount + 1,
				updatedAt: new Date(),
			})
			.where(eq(userSubscriptions.userId, userId));
	}
}
