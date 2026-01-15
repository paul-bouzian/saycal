import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calendarTools, executeCalendarTool } from "./calendar-tools";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface VoiceResponse {
	type: "success" | "info" | "error";
	text: string;
	action?: "created" | "updated" | "deleted" | "listed";
	events?: Array<{ title: string; date: string; time: string }>;
}

function getSystemPrompt(): string {
	const now = new Date();
	const dateStr = format(now, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
	const tomorrowDate = format(
		new Date(now.getTime() + 24 * 60 * 60 * 1000),
		"yyyy-MM-dd",
	);

	return `Tu es l'assistant vocal de SayCal, une application de calendrier.

Date et heure actuelles: ${dateStr}
Date de demain (format YYYY-MM-DD): ${tomorrowDate}

RÈGLES IMPORTANTES:
1. Utilise TOUJOURS le format YYYY-MM-DD pour les dates (ex: 2026-01-16)
2. Utilise TOUJOURS le format HH:MM pour les heures (ex: 18:00, 09:30)
3. "demain" = ${tomorrowDate}
4. "dix-huit heures" ou "18h" = 18:00
5. "neuf heures" ou "9h" = 09:00
6. Durée par défaut = 1 heure

COMPORTEMENT:
- Si l'utilisateur donne une DATE et une HEURE → crée l'événement IMMÉDIATEMENT
- Si l'utilisateur ne donne PAS d'heure → demande "À quelle heure ?"
- Si le titre n'est pas clair → génère un titre (ex: "rendez-vous demain" → titre: "Rendez-vous")
- Après création → confirme brièvement (ex: "C'est noté ! Rendez-vous créé pour demain à 18h.")

EXEMPLE:
- "rendez-vous demain à 18h" → createEvent(title: "Rendez-vous", date: "${tomorrowDate}", startTime: "18:00")
- "rendez-vous avec mamie demain à dix-huit heures" → createEvent(title: "Rendez-vous avec mamie", date: "${tomorrowDate}", startTime: "18:00")`;
}

export async function processWithTools(
	userMessage: string,
	userId: string,
): Promise<VoiceResponse> {
	const model = genAI.getGenerativeModel({
		model: "gemini-2.0-flash-exp",
		systemInstruction: getSystemPrompt(),
		tools: [{ functionDeclarations: calendarTools }],
	});

	const chat = model.startChat();
	let response = await chat.sendMessage(userMessage);
	let lastAction: VoiceResponse["action"] | undefined;
	let eventsList: VoiceResponse["events"] | undefined;

	while (true) {
		const candidate = response.response.candidates?.[0];
		const part = candidate?.content?.parts?.[0];

		if (!part || !("functionCall" in part) || !part.functionCall) {
			break;
		}

		const functionCall = part.functionCall;
		const result = await executeCalendarTool(
			functionCall.name,
			(functionCall.args as Record<string, unknown>) || {},
			userId,
		);

		if (result.success) {
			switch (functionCall.name) {
				case "createEvent":
					lastAction = "created";
					break;
				case "updateEvent":
					lastAction = "updated";
					break;
				case "deleteEvent":
					lastAction = "deleted";
					break;
				case "getEvents":
					lastAction = "listed";
					if (result.events) {
						eventsList = result.events as VoiceResponse["events"];
					}
					break;
			}
		}

		response = await chat.sendMessage([
			{
				functionResponse: {
					name: functionCall.name,
					response: result,
				},
			},
		]);
	}

	const text = response.response.text();

	return {
		type: lastAction ? "success" : "info",
		text,
		action: lastAction,
		events: eventsList,
	};
}
