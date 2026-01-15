import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { type UserSubscription, userSubscriptions } from "@/db/schema";

/**
 * Ensures a user has a subscription record.
 * Creates a free subscription if none exists.
 * Uses upsert pattern to avoid race conditions with concurrent requests.
 */
export async function ensureUserSubscription(
	userId: string,
): Promise<UserSubscription> {
	const [subscription] = await db
		.insert(userSubscriptions)
		.values({
			userId,
			plan: "free",
			voiceUsageCount: 0,
		})
		.onConflictDoNothing({ target: userSubscriptions.userId })
		.returning();

	// If insert was skipped due to conflict, fetch the existing record
	if (!subscription) {
		const existing = await db.query.userSubscriptions.findFirst({
			where: eq(userSubscriptions.userId, userId),
		});
		if (!existing) {
			throw new Error("Failed to create or find subscription");
		}
		return existing;
	}

	return subscription;
}
