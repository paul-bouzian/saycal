"use server";

import { eq, sql, and } from "drizzle-orm";
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

/**
 * Atomically check quota and increment usage in a single operation.
 * Returns quota info and whether the request was allowed.
 */
export async function checkAndIncrementQuota(
	userId: string,
): Promise<QuotaResult> {
	const currentMonth = format(new Date(), "yyyy-MM");

	// Upsert: create subscription if not exists, or get existing
	await db
		.insert(userSubscriptions)
		.values({
			userId,
			plan: "free",
			voiceUsageMonth: currentMonth,
			voiceUsageCount: 0,
		})
		.onConflictDoNothing();

	// Get current subscription
	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
		// Should never happen after upsert, but handle gracefully
		return {
			allowed: false,
			remaining: 0,
			limit: FREE_VOICE_LIMIT,
			plan: "free",
		};
	}

	// Premium users have unlimited access
	if (subscription.plan === "premium") {
		return {
			allowed: true,
			remaining: -1,
			limit: -1,
			plan: "premium",
		};
	}

	// Atomic conditional update: increment only if under limit
	// This prevents race conditions by using database-level atomicity
	const result = await db
		.update(userSubscriptions)
		.set({
			voiceUsageMonth: currentMonth,
			voiceUsageCount: sql`
				CASE
					WHEN ${userSubscriptions.voiceUsageMonth} != ${currentMonth} THEN 1
					ELSE ${userSubscriptions.voiceUsageCount} + 1
				END
			`,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(userSubscriptions.userId, userId),
				// Only update if: new month OR count is under limit
				sql`(${userSubscriptions.voiceUsageMonth} != ${currentMonth} OR ${userSubscriptions.voiceUsageCount} < ${FREE_VOICE_LIMIT})`,
			),
		)
		.returning();

	// If no rows updated, quota was exceeded
	if (result.length === 0) {
		const current = await db.query.userSubscriptions.findFirst({
			where: eq(userSubscriptions.userId, userId),
		});
		return {
			allowed: false,
			remaining: 0,
			limit: FREE_VOICE_LIMIT,
			plan: current?.plan ?? "free",
		};
	}

	const updated = result[0];
	const remaining = FREE_VOICE_LIMIT - updated.voiceUsageCount;

	return {
		allowed: true,
		remaining: Math.max(0, remaining),
		limit: FREE_VOICE_LIMIT,
		plan: updated.plan,
	};
}

/**
 * Check voice quota without incrementing (for display purposes).
 */
export async function getVoiceQuota(userId: string): Promise<QuotaResult> {
	const currentMonth = format(new Date(), "yyyy-MM");

	const subscription = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (!subscription) {
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

	// Reset count if new month
	const count =
		subscription.voiceUsageMonth === currentMonth
			? subscription.voiceUsageCount
			: 0;
	const remaining = FREE_VOICE_LIMIT - count;

	return {
		allowed: remaining > 0,
		remaining: Math.max(0, remaining),
		limit: FREE_VOICE_LIMIT,
		plan: "free",
	};
}
