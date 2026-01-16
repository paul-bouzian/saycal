"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics/events";

interface UpgradeModalProps {
	isOpen: boolean;
	onClose: () => void;
	usageCount: number;
	usageLimit: number;
}

const FEATURES = [
	"upgrade_feature_unlimited_voice",
	"upgrade_feature_priority_support",
	"upgrade_feature_early_access",
] as const;

export function UpgradeModal({
	isOpen,
	onClose,
	usageCount,
	usageLimit,
}: UpgradeModalProps) {
	const t = useTranslations();
	const { redirect, isLoading } = useStripeRedirect("/api/stripe/checkout");

	useEffect(() => {
		if (isOpen) {
			analytics.upgradeModalViewed();
		}
	}, [isOpen]);

	const handleUpgradeClick = () => {
		analytics.upgradeModalClicked();
		redirect();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B552D9] to-[#FA8485]">
						<Sparkles className="size-6 text-white" />
					</div>
					<DialogTitle className="text-center">
						{t("upgrade_modal_title")}
					</DialogTitle>
					<DialogDescription className="text-center">
						{t("upgrade_modal_description", {
							used: usageCount,
							limit: usageLimit,
						})}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					{FEATURES.map((feature) => (
						<div key={feature} className="flex items-center gap-2 text-sm">
							<Check className="size-4 text-primary" />
							<span>{t(feature)}</span>
						</div>
					))}
				</div>

				<div className="flex flex-col gap-2">
					<Button
						onClick={handleUpgradeClick}
						disabled={isLoading}
						className="w-full bg-gradient-to-r from-[#B552D9] to-[#FA8485] hover:opacity-90"
					>
						{isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
						{t("upgrade_modal_cta")}
					</Button>
					<Button variant="ghost" onClick={onClose}>
						{t("upgrade_modal_later")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
