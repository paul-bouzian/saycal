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

	return `Tu es l'assistant vocal de SayCal, une application de calendrier.
Tu aides l'utilisateur à gérer ses événements par la voix.

Date et heure actuelles: ${dateStr}

Tu peux:
- Créer des événements (createEvent)
- Modifier des événements (updateEvent)
- Supprimer des événements (deleteEvent)
- Lister des événements (getEvents)

Règles:
- "demain" = demain
- "lundi prochain" = le prochain lundi
- Si pas de durée précisée, durée = 1 heure
- Réponds toujours en français, de manière concise et amicale

Comportement pour la création d'événements:
- Si l'utilisateur donne le titre (ou une description suffisante), la date ET l'heure → exécute directement sans demander confirmation
- Si l'heure n'est pas précisée → demande poliment à quelle heure (ex: "À quelle heure veux-tu ce rendez-vous ?")
- Génère un titre clair et concis à partir de la description de l'utilisateur
- Après une action réussie, confirme brièvement (ex: "C'est noté ! Rendez-vous avec mamie créé pour demain à 18h.")`;
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
