import { createClient } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function transcribeAudio(audioFile: File): Promise<string> {
	const arrayBuffer = await audioFile.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
		buffer,
		{
			model: "nova-2",
			language: "fr",
			smart_format: true,
		},
	);

	if (error) {
		throw new Error(`Transcription failed: ${error.message}`);
	}

	const transcript =
		result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

	return transcript.trim();
}
