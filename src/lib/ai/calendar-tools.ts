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
		description: "Créer un nouvel événement dans le calendrier",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				title: {
					type: SchemaType.STRING,
					description: "Titre de l'événement",
				},
				date: {
					type: SchemaType.STRING,
					description: "Date au format YYYY-MM-DD",
				},
				startTime: {
					type: SchemaType.STRING,
					description: "Heure de début au format HH:MM",
				},
				endTime: {
					type: SchemaType.STRING,
					description: "Heure de fin au format HH:MM (optionnel, défaut +1h)",
				},
			},
			required: ["title", "date", "startTime"],
		},
	},
	{
		name: "getEvents",
		description:
			"Récupérer les événements du calendrier pour une période donnée",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				startDate: {
					type: SchemaType.STRING,
					description: "Date de début au format YYYY-MM-DD",
				},
				endDate: {
					type: SchemaType.STRING,
					description: "Date de fin au format YYYY-MM-DD",
				},
			},
			required: ["startDate", "endDate"],
		},
	},
	{
		name: "updateEvent",
		description: "Modifier un événement existant",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				eventTitle: {
					type: SchemaType.STRING,
					description: "Titre de l'événement à modifier (pour le trouver)",
				},
				newTitle: {
					type: SchemaType.STRING,
					description: "Nouveau titre (optionnel)",
				},
				newDate: {
					type: SchemaType.STRING,
					description: "Nouvelle date au format YYYY-MM-DD (optionnel)",
				},
				newStartTime: {
					type: SchemaType.STRING,
					description: "Nouvelle heure de début au format HH:MM (optionnel)",
				},
			},
			required: ["eventTitle"],
		},
	},
	{
		name: "deleteEvent",
		description: "Supprimer un événement",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				eventTitle: {
					type: SchemaType.STRING,
					description: "Titre de l'événement à supprimer",
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
					error: `Paramètres manquants: title=${title}, date=${date}, startTime=${startTime}`,
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
					error: `Format de date/heure invalide: date=${date}, startTime=${startTime}`,
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
					error: `Erreur base de données: ${dbError instanceof Error ? dbError.message : "inconnue"}`,
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
				where: and(
					eq(events.userId, userId),
					// events that overlap with the range
				),
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
				return { success: false, error: `Événement "${eventTitle}" non trouvé` };
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
				return { success: false, error: `Événement "${eventTitle}" non trouvé` };
			}

			await db.delete(events).where(eq(events.id, event.id));

			return { success: true, deleted: { title: event.title } };
		}

		default:
			return { success: false, error: `Fonction inconnue: ${name}` };
	}
}
