"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (!POSTHOG_KEY) return;

		posthog.init(POSTHOG_KEY, {
			api_host: POSTHOG_HOST,
			autocapture: false,
			capture_pageview: true,
			capture_pageleave: true,
			persistence: "localStorage",
			disable_session_recording: false,
			mask_all_text: true,
			mask_all_element_attributes: true,
		});
	}, []);

	if (!POSTHOG_KEY) {
		return <>{children}</>;
	}

	return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function useIdentifyUser() {
	const posthogClient = usePostHog();

	return {
		identify: (userId: string, traits?: Record<string, unknown>) => {
			posthogClient.identify(userId, traits);
		},
		reset: () => {
			posthogClient.reset();
		},
	};
}
