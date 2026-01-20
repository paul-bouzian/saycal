"use server";

import { transcribeAudio } from "@/lib/ai/deepgram";
import {
	processWithTools,
	type VoiceResponse,
	type ConversationMessage,
} from "@/lib/ai/gemini";
import { checkVoiceAccess, checkAndIncrementVoiceDuration } from "@/lib/quota";
import { authServer } from "@/lib/auth-server";

const MAX_AUDIO_DURATION_SECONDS = 30;
const MAX_AUDIO_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ProcessVoiceResult {
	transcript: string;
	result: VoiceResponse;
}

export async function processVoiceCommand(
	formData: FormData,
	conversationHistory: ConversationMessage[] = [],
	audioDurationSeconds: number,
): Promise<ProcessVoiceResult> {
	const { data: session } = await authServer.getSession();
	if (!session?.user?.id) {
		throw new Error("Not authenticated");
	}

	const userId = session.user.id;

	const accessCheck = await checkVoiceAccess(userId);
	if (!accessCheck.allowed) {
		if (accessCheck.reason === "premium_required") {
			throw new Error("PREMIUM_REQUIRED");
		}
		throw new Error("Access denied");
	}

	const audioFile = formData.get("audio") as File;
	if (!audioFile) {
		throw new Error("Audio file missing");
	}

	if (audioFile.size === 0) {
		throw new Error("Empty audio file");
	}

	if (audioFile.size > MAX_AUDIO_FILE_SIZE_BYTES) {
		throw new Error("Audio file too large");
	}

	const clampedDuration = Math.min(
		Math.max(1, Math.ceil(audioDurationSeconds)),
		MAX_AUDIO_DURATION_SECONDS,
	);

	const quotaCheck = await checkAndIncrementVoiceDuration(userId, clampedDuration);
	if (!quotaCheck.allowed) {
		if (quotaCheck.reason === "daily_limit_reached") {
			throw new Error("DAILY_LIMIT_REACHED");
		}
		throw new Error("PREMIUM_REQUIRED");
	}

	const transcript = await transcribeAudio(audioFile);

	if (!transcript || transcript.trim() === "") {
		throw new Error("I didn't understand. Could you repeat?");
	}

	const result = await processWithTools(transcript, userId, conversationHistory);

	return {
		transcript,
		result,
	};
}
