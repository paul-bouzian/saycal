"use client";

import { useCallback, useRef, useState } from "react";

interface UseVoiceRecorderReturn {
	isRecording: boolean;
	duration: number;
	analyserNode: AnalyserNode | null;
	startRecording: () => Promise<void>;
	stopRecording: () => Promise<Blob>;
	error: string | null;
}

export function useVoiceRecorder(maxDuration = 30000): UseVoiceRecorderReturn {
	const [isRecording, setIsRecording] = useState(false);
	const [duration, setDuration] = useState(0);
	const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
	const [error, setError] = useState<string | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const cleanup = useCallback(async () => {
		console.log("[VoiceRecorder] cleanup started");
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			console.log("[VoiceRecorder] stopping recorder, state:", mediaRecorderRef.current.state);
			mediaRecorderRef.current.stop();
		}
		mediaRecorderRef.current = null;
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		if (audioContextRef.current && audioContextRef.current.state !== "closed") {
			console.log("[VoiceRecorder] closing audio context");
			await audioContextRef.current.close();
		}
		audioContextRef.current = null;
		chunksRef.current = [];
		setAnalyserNode(null);
		setIsRecording(false);
		console.log("[VoiceRecorder] cleanup done");
	}, []);

	const startRecording = useCallback(async () => {
		console.log("[VoiceRecorder] startRecording called");
		try {
			await cleanup();
			setError(null);
			setDuration(0);

			console.log("[VoiceRecorder] requesting microphone");
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			console.log("[VoiceRecorder] got stream, tracks:", stream.getAudioTracks().length);

			const audioContext = new AudioContext();
			const source = audioContext.createMediaStreamSource(stream);
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			audioContextRef.current = audioContext;
			setAnalyserNode(analyser);

			const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
				? "audio/webm;codecs=opus"
				: "audio/webm";
			console.log("[VoiceRecorder] using mimeType:", mimeType);

			const recorder = new MediaRecorder(stream, { mimeType });
			chunksRef.current = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
					console.log("[VoiceRecorder] chunk received, size:", e.data.size, "total chunks:", chunksRef.current.length);
				}
			};

			recorder.start(100);
			mediaRecorderRef.current = recorder;
			setIsRecording(true);
			console.log("[VoiceRecorder] recording started");

			timerRef.current = setInterval(() => {
				setDuration((d) => {
					if (d >= maxDuration / 1000) {
						return d;
					}
					return d + 1;
				});
			}, 1000);

			setTimeout(() => {
				if (mediaRecorderRef.current?.state === "recording") {
					mediaRecorderRef.current.stop();
				}
			}, maxDuration);
		} catch (err) {
			console.error("[VoiceRecorder] error:", err);
			setError("Microphone permission denied");
			throw err;
		}
	}, [maxDuration, cleanup]);

	const stopRecording = useCallback(async (): Promise<Blob> => {
		console.log("[VoiceRecorder] stopRecording called");
		const recorder = mediaRecorderRef.current;
		const chunks = [...chunksRef.current];
		console.log("[VoiceRecorder] current chunks:", chunks.length, "recorder state:", recorder?.state);

		if (!recorder || recorder.state === "inactive") {
			console.log("[VoiceRecorder] recorder inactive, creating blob from", chunks.length, "chunks");
			const blob = new Blob(chunks, { type: "audio/webm" });
			console.log("[VoiceRecorder] blob size:", blob.size);
			await cleanup();
			return blob;
		}

		return new Promise((resolve) => {
			recorder.onstop = async () => {
				const finalChunks = [...chunksRef.current];
				console.log("[VoiceRecorder] recorder stopped, creating blob from", finalChunks.length, "chunks");
				const blob = new Blob(finalChunks, { type: "audio/webm" });
				console.log("[VoiceRecorder] blob size:", blob.size);
				await cleanup();
				resolve(blob);
			};

			console.log("[VoiceRecorder] stopping recorder");
			recorder.stop();
		});
	}, [cleanup]);

	return {
		isRecording,
		duration,
		analyserNode,
		startRecording,
		stopRecording,
		error,
	};
}
