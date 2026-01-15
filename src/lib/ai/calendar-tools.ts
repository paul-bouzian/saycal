import {
	SchemaType,
	type FunctionDeclaration,
} from "@google/generative-ai";
import { and, eq, ilike } from "drizzle-orm";
import { parse, startOfDay, endOfDay, addHours, format } from "date-fns";
import { db } from "@/db/index";
import { events } from "@/db/schema";

export const calendarTools: FunctionDeclaration[] = [
	{
		name: "createEvent",
		description: "Create a new event in the calendar",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				title: {
					type: SchemaType.STRING,
					description: "Event title",
				},
				date: {
					type: SchemaType.STRING,
					description: "Date in YYYY-MM-DD format",
				},
				startTime: {
					type: SchemaType.STRING,
					description: "Start time in HH:MM format",
				},
				endTime: {
					type: SchemaType.STRING,
					description: "End time in HH:MM format (optional, defaults to +1h)",
				},
			},
			required: ["title", "date", "startTime"],
		},
	},
	{
		name: "getEvents",
		description: "Retrieve calendar events for a given period",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				startDate: {
					type: SchemaType.STRING,
					description: "Start date in YYYY-MM-DD format",
				},
				endDate: {
					type: SchemaType.STRING,
					description: "End date in YYYY-MM-DD format",
				},
			},
			required: ["startDate", "endDate"],
		},
	},
	{
		name: "updateEvent",
		description: "Update an existing event",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				eventTitle: {
					type: SchemaType.STRING,
					description: "Title of the event to update (used to find it)",
				},
				newTitle: {
					type: SchemaType.STRING,
					description: "New title (optional)",
				},
				newDate: {
					type: SchemaType.STRING,
					description: "New date in YYYY-MM-DD format (optional)",
				},
				newStartTime: {
					type: SchemaType.STRING,
					description: "New start time in HH:MM format (optional)",
				},
			},
			required: ["eventTitle"],
		},
	},
	{
		name: "deleteEvent",
		description: "Delete an event",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				eventTitle: {
					type: SchemaType.STRING,
					description: "Title of the event to delete",
				},
			},
			required: ["eventTitle"],
		},
	},
];

export async function executeCalendarTool(
	name: string,
	args: Record<string, unknown>,
	userId: string,
): Promise<Record<string, unknown>> {
	switch (name) {
		case "createEvent": {
			const { title, date, startTime, endTime } = args as {
				title: string;
				date: string;
				startTime: string;
				endTime?: string;
			};

			if (!title || !date || !startTime) {
				return {
					success: false,
					error: `Missing parameters: title=${title}, date=${date}, startTime=${startTime}`,
				};
			}

			const startAt = parse(
				`${date} ${startTime}`,
				"yyyy-MM-dd HH:mm",
				new Date(),
			);

			if (Number.isNaN(startAt.getTime())) {
				return {
					success: false,
					error: `Invalid date/time format: date=${date}, startTime=${startTime}`,
				};
			}

			const endAt = endTime
				? parse(`${date} ${endTime}`, "yyyy-MM-dd HH:mm", new Date())
				: addHours(startAt, 1);

			try {
				const [event] = await db
					.insert(events)
					.values({
						userId,
						title,
						startAt,
						endAt,
						createdVia: "voice",
						color: "#B552D9",
					})
					.returning();

				return {
					success: true,
					event: {
						id: event.id,
						title,
						date,
						startTime,
						endTime: format(endAt, "HH:mm"),
					},
				};
			} catch (dbError) {
				console.error("Database error:", dbError);
				return {
					success: false,
					error: `Database error: ${dbError instanceof Error ? dbError.message : "unknown"}`,
				};
			}
		}

		case "getEvents": {
			const { startDate, endDate } = args as {
				startDate: string;
				endDate: string;
			};

			const start = startOfDay(parse(startDate, "yyyy-MM-dd", new Date()));
			const end = endOfDay(parse(endDate, "yyyy-MM-dd", new Date()));

			const userEvents = await db.query.events.findMany({
				where: eq(events.userId, userId),
				orderBy: (events, { asc }) => [asc(events.startAt)],
			});

			const filteredEvents = userEvents.filter(
				(e) => e.startAt >= start && e.startAt <= end,
			);

			return {
				success: true,
				count: filteredEvents.length,
				events: filteredEvents.map((e) => ({
					title: e.title,
					date: format(e.startAt, "yyyy-MM-dd"),
					time: format(e.startAt, "HH:mm"),
				})),
			};
		}

		case "updateEvent": {
			const { eventTitle, newTitle, newDate, newStartTime } = args as {
				eventTitle: string;
				newTitle?: string;
				newDate?: string;
				newStartTime?: string;
			};

			const event = await db.query.events.findFirst({
				where: and(
					eq(events.userId, userId),
					ilike(events.title, `%${eventTitle}%`),
				),
			});

			if (!event) {
				return { success: false, error: `Event "${eventTitle}" not found` };
			}

			const updates: Record<string, unknown> = { updatedAt: new Date() };
			if (newTitle) updates.title = newTitle;

			if (newDate || newStartTime) {
				const dateStr = newDate || format(event.startAt, "yyyy-MM-dd");
				const timeStr = newStartTime || format(event.startAt, "HH:mm");
				const newStartAt = parse(
					`${dateStr} ${timeStr}`,
					"yyyy-MM-dd HH:mm",
					new Date(),
				);
				updates.startAt = newStartAt;
				updates.endAt = addHours(newStartAt, 1);
			}

			await db.update(events).set(updates).where(eq(events.id, event.id));

			return {
				success: true,
				updated: {
					title: (newTitle as string) || event.title,
					date: newDate || format(event.startAt, "yyyy-MM-dd"),
					time: newStartTime || format(event.startAt, "HH:mm"),
				},
			};
		}

		case "deleteEvent": {
			const { eventTitle } = args as { eventTitle: string };

			const event = await db.query.events.findFirst({
				where: and(
					eq(events.userId, userId),
					ilike(events.title, `%${eventTitle}%`),
				),
			});

			if (!event) {
				return { success: false, error: `Event "${eventTitle}" not found` };
			}

			await db.delete(events).where(eq(events.id, event.id));

			return { success: true, deleted: { title: event.title } };
		}

		default:
			return { success: false, error: `Unknown function: ${name}` };
	}
}
