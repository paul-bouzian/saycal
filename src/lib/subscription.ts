import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { type UserSubscription, userSubscriptions } from "@/db/schema";

/**
 * Ensures a user has a subscription record.
 * Creates a free subscription if none exists.
 */
export async function ensureUserSubscription(
	userId: string,
): Promise<UserSubscription> {
	const existing = await db.query.userSubscriptions.findFirst({
		where: eq(userSubscriptions.userId, userId),
	});

	if (existing) {
		return existing;
	}

	const [created] = await db
		.insert(userSubscriptions)
		.values({
			userId,
			plan: "free",
			voiceUsageCount: 0,
		})
		.returning();

	return created;
}
