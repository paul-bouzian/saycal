import posthog from "posthog-js";

function capture(event: string, properties?: Record<string, unknown>): void {
	if (typeof window === "undefined") return;
	posthog.capture(event, properties);
}

export const analytics = {
	signUp: () => capture("user_signed_up"),
	signIn: () => capture("user_signed_in"),
	signOut: () => capture("user_signed_out"),

	eventCreated: (method: "voice" | "manual") =>
		capture("event_created", { method }),
	eventUpdated: () => capture("event_updated"),
	eventDeleted: () => capture("event_deleted"),

	voiceRecordingStarted: () => capture("voice_recording_started"),
	voiceRecordingCompleted: (duration: number) =>
		capture("voice_recording_completed", { duration }),
	voiceQuotaReached: () => capture("voice_quota_reached"),

	subscriptionStarted: () => capture("subscription_started"),
	subscriptionCancelled: () => capture("subscription_cancelled"),
	upgradeModalViewed: () => capture("upgrade_modal_viewed"),
	upgradeModalClicked: () => capture("upgrade_modal_clicked"),

	viewChanged: (view: "day" | "week" | "month") =>
		capture("calendar_view_changed", { view }),
};
