"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoicePanel } from "./voice-panel";

export function VoiceButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={cn(
					"fixed bottom-6 right-6 z-50",
					"flex size-14 items-center justify-center rounded-full",
					"bg-gradient-to-br from-[#B552D9] to-[#FA8485] shadow-lg shadow-primary/30",
					"transition-all hover:scale-105 active:scale-95",
					isOpen && "pointer-events-none scale-0 opacity-0",
				)}
			>
				<Mic className="size-6 text-white" />
			</button>

			<VoicePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
