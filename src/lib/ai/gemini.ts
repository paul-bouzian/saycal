import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";
import { calendarTools, executeCalendarTool } from "./calendar-tools";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface VoiceResponse {
	type: "success" | "info" | "error";
	text: string;
	action?: "created" | "updated" | "deleted" | "listed";
	events?: Array<{ title: string; date: string; time: string }>;
}

export interface ConversationMessage {
	role: "user" | "assistant";
	content: string;
}

function getSystemPrompt(): string {
	const now = new Date();
	const dateStr = format(now, "yyyy-MM-dd HH:mm");
	const tomorrowDate = format(
		new Date(now.getTime() + 24 * 60 * 60 * 1000),
		"yyyy-MM-dd",
	);

	return `You are the voice assistant for SayCal, a calendar application.

IMPORTANT: Always respond in the SAME LANGUAGE as the user's message.

Current date and time: ${dateStr}
Tomorrow's date (YYYY-MM-DD format): ${tomorrowDate}

IMPORTANT RULES:
1. ALWAYS use YYYY-MM-DD format for dates (e.g., 2026-01-16)
2. ALWAYS use HH:MM format for times (e.g., 18:00, 09:30)
3. "tomorrow" / "demain" = ${tomorrowDate}
4. "six pm" / "dix-huit heures" / "18h" = 18:00
5. "nine am" / "neuf heures" / "9h" = 09:00
6. Default duration = 1 hour

BEHAVIOR for creating an event:
- 3 elements needed: TITLE, DATE (day) and TIME
- REMEMBER information given in previous messages of the conversation
- If all 3 are provided (in this message OR in previous ones) → create the event IMMEDIATELY
- If one or more are missing → ask for ALL missing info in ONE SINGLE question
  Examples (adapt to user's language):
  - "add an appointment" (missing date + time) → "When and at what time?"
  - "appointment tomorrow" (missing title + time) → "What title and at what time?"
  - "tomorrow" alone (missing title + time) → "What appointment and at what time?"
  - "appointment tomorrow at 6pm" → title="Appointment", create immediately
- If title is not explicit but we have date+time → use "Appointment" / "Rendez-vous" as default title (based on user's language)
- After creation → confirm briefly (e.g., "Done! Appointment created for tomorrow at 6pm.")

EXAMPLE:
- "meeting tomorrow at 6pm" → createEvent(title: "Meeting", date: "${tomorrowDate}", startTime: "18:00")
- "rendez-vous avec mamie demain à dix-huit heures" → createEvent(title: "Rendez-vous avec mamie", date: "${tomorrowDate}", startTime: "18:00")`;
}

export async function processWithTools(
	userMessage: string,
	userId: string,
	conversationHistory: ConversationMessage[] = [],
): Promise<VoiceResponse> {
	const model = genAI.getGenerativeModel({
		model: "gemini-2.0-flash-exp",
		systemInstruction: getSystemPrompt(),
		tools: [{ functionDeclarations: calendarTools }],
	});

	const history = conversationHistory.map((msg) => ({
		role: msg.role === "user" ? "user" : "model",
		parts: [{ text: msg.content }],
	})) as Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;

	const chat = model.startChat({ history });
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
			const actionMap: Record<string, VoiceResponse["action"]> = {
				createEvent: "created",
				updateEvent: "updated",
				deleteEvent: "deleted",
				getEvents: "listed",
			};
			lastAction = actionMap[functionCall.name];

			if (functionCall.name === "getEvents" && result.events) {
				eventsList = result.events as VoiceResponse["events"];
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
