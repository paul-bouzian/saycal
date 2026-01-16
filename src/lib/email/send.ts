import { resend, EMAIL_FROM } from "./client";
import { MagicLinkEmail } from "./templates/magic-link";
import { WelcomeEmail } from "./templates/welcome";
import { PaymentFailedEmail } from "./templates/payment-failed";

export async function sendMagicLink(to: string, magicLink: string) {
	const { error } = await resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Votre lien de connexion SayCal",
		react: MagicLinkEmail({ magicLink }),
	});

	if (error) {
		console.error("[Email] Failed to send magic link:", error);
		throw new Error("Failed to send email");
	}
}

export async function sendWelcomeEmail(to: string, userName?: string) {
	const { error } = await resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Bienvenue sur SayCal !",
		react: WelcomeEmail({ userName }),
	});

	if (error) {
		console.error("[Email] Failed to send welcome email:", error);
		throw new Error("Failed to send email");
	}
}

export async function sendPaymentFailedEmail(to: string) {
	const { error } = await resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Action requise : problème de paiement SayCal",
		react: PaymentFailedEmail(),
	});

	if (error) {
		console.error("[Email] Failed to send payment failed email:", error);
		throw new Error("Failed to send email");
	}
}

export function queueWelcomeEmail(to: string, userName?: string) {
	sendWelcomeEmail(to, userName).catch((error) => {
		console.error("[Email] Queued welcome email failed:", error);
	});
}
