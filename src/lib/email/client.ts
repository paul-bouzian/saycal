import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
	if (!resendInstance) {
		if (!process.env.RESEND_API_KEY) {
			throw new Error("RESEND_API_KEY is required");
		}
		resendInstance = new Resend(process.env.RESEND_API_KEY);
	}
	return resendInstance;
}

export const resend = {
	get emails() {
		return getResend().emails;
	},
};

export const EMAIL_CONFIG = {
	from: "SayCal <noreply@saycal.app>",
	appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://saycal.app",
} as const;
