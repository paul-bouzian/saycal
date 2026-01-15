"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/index";
import { events, insertEventSchema } from "@/db/schema";
import { authServer } from "@/lib/auth-server";

// Helper to get authenticated user ID
async function getAuthenticatedUserId(): Promise<string> {
	const { data: session } = await authServer.getSession();
	if (!session?.user?.id) {
		throw new Error("Unauthorized: No active session");
	}
	return session.user.id;
}

// Schema for date range query
const dateRangeSchema = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

// Schema for creating an event
const createEventSchema = insertEventSchema
	.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
	.extend({
		startAt: z.coerce.date(),
		endAt: z.coerce.date(),
	});

// Schema for updating an event
const updateEventSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).max(200).optional(),
	description: z.string().optional().nullable(),
	startAt: z.coerce.date().optional(),
	endAt: z.coerce.date().optional(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional()
		.nullable(),
});

// Schema for deleting an event
const deleteEventSchema = z.object({
	id: z.string().uuid(),
});

// Fetch events for a date range
export async function getEvents(input: z.infer<typeof dateRangeSchema>) {
	const userId = await getAuthenticatedUserId();
	const { startDate, endDate } = dateRangeSchema.parse(input);

	const result = await db.query.events.findMany({
		where: and(
			eq(events.userId, userId),
			lte(events.startAt, endDate),
			gte(events.endAt, startDate),
		),
		orderBy: (events, { asc }) => [asc(events.startAt)],
	});

	return result;
}

// Create a new event
export async function createEvent(input: z.infer<typeof createEventSchema>) {
	const userId = await getAuthenticatedUserId();
	const data = createEventSchema.parse(input);

	const [newEvent] = await db
		.insert(events)
		.values({ ...data, userId })
		.returning();

	return newEvent;
}

// Update an event
export async function updateEvent(input: z.infer<typeof updateEventSchema>) {
	const userId = await getAuthenticatedUserId();
	const { id, ...updateData } = updateEventSchema.parse(input);

	// Only update fields that are provided
	const fieldsToUpdate: Record<string, unknown> = {
		updatedAt: new Date(),
	};

	if (updateData.title !== undefined) fieldsToUpdate.title = updateData.title;
	if (updateData.description !== undefined)
		fieldsToUpdate.description = updateData.description;
	if (updateData.startAt !== undefined)
		fieldsToUpdate.startAt = updateData.startAt;
	if (updateData.endAt !== undefined) fieldsToUpdate.endAt = updateData.endAt;
	if (updateData.color !== undefined) fieldsToUpdate.color = updateData.color;

	const [updated] = await db
		.update(events)
		.set(fieldsToUpdate)
		.where(and(eq(events.id, id), eq(events.userId, userId)))
		.returning();

	return updated;
}

// Delete an event
export async function deleteEvent(input: z.infer<typeof deleteEventSchema>) {
	const userId = await getAuthenticatedUserId();
	const { id } = deleteEventSchema.parse(input);

	await db
		.delete(events)
		.where(and(eq(events.id, id), eq(events.userId, userId)));

	return { success: true };
}
