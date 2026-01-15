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

	const cleanup = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		if (audioContextRef.current && audioContextRef.current.state !== "closed") {
			audioContextRef.current.close();
		}
		audioContextRef.current = null;
		mediaRecorderRef.current = null;
		chunksRef.current = [];
		setAnalyserNode(null);
		setIsRecording(false);
	}, []);

	const startRecording = useCallback(async () => {
		try {
			cleanup();
			setError(null);
			setDuration(0);

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

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

			const recorder = new MediaRecorder(stream, { mimeType });
			chunksRef.current = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			recorder.start(100);
			mediaRecorderRef.current = recorder;
			setIsRecording(true);

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
			setError("Permission microphone refusée");
			throw err;
		}
	}, [maxDuration, cleanup]);

	const stopRecording = useCallback(async (): Promise<Blob> => {
		return new Promise((resolve) => {
			const recorder = mediaRecorderRef.current;

			if (!recorder || recorder.state === "inactive") {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				cleanup();
				resolve(blob);
				return;
			}

			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				cleanup();
				resolve(blob);
			};

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
