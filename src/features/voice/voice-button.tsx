"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoicePanel } from "./voice-panel";
import { PremiumRequiredModal } from "@/features/billing/premium-required-modal";
import { getUserPlan } from "@/lib/actions/billing";

export function VoiceButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	const { data: plan } = useQuery({
		queryKey: ["userPlan"],
		queryFn: getUserPlan,
		staleTime: 60 * 1000,
	});

	const handleClick = () => {
		if (plan !== "premium") {
			setShowUpgradeModal(true);
		} else {
			setIsOpen(true);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					"fixed bottom-6 right-6 z-50 cursor-pointer",
					"flex size-14 items-center justify-center rounded-full",
					"bg-gradient-to-br from-[#B552D9] to-[#FA8485] shadow-lg shadow-primary/30",
					"transition-all hover:scale-105 active:scale-95",
					isOpen && "pointer-events-none scale-0 opacity-0",
				)}
			>
				<Mic className="size-6 text-white" />
			</button>

			<VoicePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

			<PremiumRequiredModal
				isOpen={showUpgradeModal}
				onClose={() => setShowUpgradeModal(false)}
			/>
		</>
	);
}
