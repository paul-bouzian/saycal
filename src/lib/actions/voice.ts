"use server";

import { transcribeAudio } from "@/lib/ai/deepgram";
import {
	processWithTools,
	type VoiceResponse,
	type ConversationMessage,
} from "@/lib/ai/gemini";
import { checkVoiceQuota, incrementVoiceUsage } from "@/lib/quota";
import { authServer } from "@/lib/auth-server";

export interface ProcessVoiceResult {
	transcript: string;
	result: VoiceResponse;
	remaining: number;
}

export async function processVoiceCommand(
	formData: FormData,
	conversationHistory: ConversationMessage[] = [],
): Promise<ProcessVoiceResult> {
	const { data: session } = await authServer.getSession();
	if (!session?.user?.id) {
		throw new Error("Non authentifié");
	}

	const userId = session.user.id;

	const quota = await checkVoiceQuota(userId);
	if (!quota.allowed) {
		throw new Error("Quota vocal atteint. Passez à Premium pour continuer.");
	}

	const audioFile = formData.get("audio") as File;
	if (!audioFile) {
		throw new Error("Fichier audio manquant");
	}

	console.log("[Voice] audio file received, size:", audioFile.size, "type:", audioFile.type);

	if (audioFile.size === 0) {
		throw new Error("Fichier audio vide");
	}

	const transcript = await transcribeAudio(audioFile);

	if (!transcript || transcript.trim() === "") {
		throw new Error("Je n'ai pas compris. Pouvez-vous répéter?");
	}

	const result = await processWithTools(transcript, userId, conversationHistory);

	await incrementVoiceUsage(userId);

	return {
		transcript,
		result,
		remaining: quota.remaining - 1,
	};
}
