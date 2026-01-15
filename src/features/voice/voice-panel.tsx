"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mic, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { VoiceWaveform } from "./voice-waveform";
import { VoiceMessage } from "./voice-message";
import { processVoiceCommand } from "@/lib/actions/voice";
import type { VoiceResponse, ConversationMessage } from "@/lib/ai/gemini";

type PanelState =
	| { step: "idle" }
	| { step: "recording"; duration: number }
	| { step: "processing"; stage: "transcribing" | "thinking" | "executing" }
	| { step: "response"; message: VoiceResponse }
	| { step: "error"; message: string };

interface VoicePanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export function VoicePanel({ isOpen, onClose }: VoicePanelProps) {
	const [state, setState] = useState<PanelState>({ step: "idle" });
	const [transcript, setTranscript] = useState<string | null>(null);
	const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
	const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const queryClient = useQueryClient();
	const { startRecording, stopRecording, analyserNode, duration } =
		useVoiceRecorder();

	const clearAutoCloseTimer = () => {
		if (autoCloseTimerRef.current) {
			clearTimeout(autoCloseTimerRef.current);
			autoCloseTimerRef.current = null;
		}
	};

	useEffect(() => {
		if (isOpen && state.step === "idle") {
			handleStartRecording();
		}
	}, [isOpen, state.step]);

	useEffect(() => {
		return () => clearAutoCloseTimer();
	}, []);

	const handleStartRecording = async () => {
		try {
			await startRecording();
			setState({ step: "recording", duration: 0 });
		} catch {
			setState({ step: "error", message: "Microphone unavailable" });
		}
	};

	const handleStopRecording = async () => {
		const blob = await stopRecording();
		setState({ step: "processing", stage: "transcribing" });

		try {
			const formData = new FormData();
			formData.append("audio", blob, "recording.webm");

			const response = await processVoiceCommand(formData, conversationHistory);

			setTranscript(response.transcript);
			setState({
				step: "response",
				message: response.result,
			});

			setConversationHistory((prev) => [
				...prev,
				{ role: "user", content: response.transcript },
				{ role: "assistant", content: response.result.text },
			]);

			const hasAction = response.result.action;
			if (hasAction) {
				queryClient.invalidateQueries({ queryKey: ["events"] });

				autoCloseTimerRef.current = setTimeout(() => {
					handleClose();
				}, 1500);
			}
		} catch (error) {
			setState({
				step: "error",
				message:
					error instanceof Error ? error.message : "Processing error",
			});
		}
	};

	const handleClose = () => {
		clearAutoCloseTimer();
		setState({ step: "idle" });
		setTranscript(null);
		setConversationHistory([]);
		onClose();
	};

	const handleNewCommand = () => {
		clearAutoCloseTimer();
		setTranscript(null);
		setState({ step: "idle" });
	};

	if (!isOpen) return null;

	return (
		<div
			className={cn(
				"fixed bottom-6 right-6 z-50",
				"w-80 rounded-2xl border border-border bg-white shadow-2xl",
				"animate-in fade-in slide-in-from-bottom-4 duration-300",
			)}
		>
			<div className="flex items-center justify-between border-b p-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#B552D9] to-[#FA8485]">
						<Mic className="size-4 text-white" />
					</div>
					<span className="font-medium">Voice Assistant</span>
				</div>
				<button
					type="button"
					onClick={handleClose}
					className="rounded-full p-1 hover:bg-muted"
				>
					<X className="size-5" />
				</button>
			</div>

			<div className="min-h-[200px] p-4">
				{state.step === "recording" && (
					<div className="flex flex-col items-center gap-4">
						<VoiceWaveform analyserNode={analyserNode} />
						<p className="text-sm text-muted-foreground">
							Speak now... ({duration}s)
						</p>
						<button
							type="button"
							onClick={handleStopRecording}
							className="flex size-12 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
						>
							<Square className="size-5 fill-white text-white" />
						</button>
					</div>
				)}

				{state.step === "processing" && (
					<div className="flex flex-col items-center gap-4 py-8">
						<Loader2 className="size-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">
							{state.stage === "transcribing" && "Transcribing..."}
							{state.stage === "thinking" && "Thinking..."}
							{state.stage === "executing" && "Executing..."}
						</p>
					</div>
				)}

				{state.step === "response" && (
					<div className="space-y-4">
						{transcript && (
							<div className="flex justify-end">
								<div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#B552D9] to-[#FA8485] px-4 py-2 text-white">
									<p className="text-sm">{transcript}</p>
								</div>
							</div>
						)}

						<VoiceMessage response={state.message} />

						<div className="flex gap-2 pt-2">
							<button
								type="button"
								onClick={handleNewCommand}
								className="flex-1 rounded-lg bg-gradient-to-br from-[#B552D9] to-[#FA8485] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
							>
								New command
							</button>
							<button
								type="button"
								onClick={handleClose}
								className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
							>
								Close
							</button>
						</div>
					</div>
				)}

				{state.step === "error" && (
					<div className="flex flex-col items-center gap-4 py-8">
						<div className="flex size-12 items-center justify-center rounded-full bg-red-100">
							<X className="size-6 text-red-500" />
						</div>
						<p className="text-center text-sm text-muted-foreground">
							{state.message}
						</p>
						<button
							type="button"
							onClick={handleNewCommand}
							className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
