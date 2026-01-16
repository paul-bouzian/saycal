import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

export function PaymentFailedEmail() {
	return (
		<Html>
			<Head />
			<Preview>Action requise : paiement échoué</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Text style={styles.title}>Paiement échoué</Text>
					<Text style={styles.text}>
						Nous n&apos;avons pas pu renouveler votre abonnement SayCal Premium.
					</Text>
					<Text style={styles.text}>
						Pour continuer à profiter de la création vocale illimitée, veuillez
						mettre à jour vos informations de paiement.
					</Text>
					<Section style={styles.buttonContainer}>
						<Button style={styles.button} href="https://saycal.app/app/billing">
							Mettre à jour le paiement
						</Button>
					</Section>
					<Text style={styles.footer}>
						Sans action de votre part, votre abonnement sera suspendu dans 7
						jours.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const styles = {
	body: {
		backgroundColor: "#f6f9fc",
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	},
	container: {
		backgroundColor: "#ffffff",
		margin: "40px auto",
		padding: "40px",
		borderRadius: "12px",
		maxWidth: "480px",
	},
	title: {
		fontSize: "24px",
		fontWeight: "bold" as const,
		textAlign: "center" as const,
		color: "#dc2626",
	},
	text: {
		fontSize: "16px",
		lineHeight: "24px",
		color: "#1A1A2E",
	},
	buttonContainer: {
		textAlign: "center" as const,
		margin: "32px 0",
	},
	button: {
		backgroundColor: "#B552D9",
		borderRadius: "8px",
		color: "#fff",
		fontSize: "16px",
		fontWeight: "bold" as const,
		textDecoration: "none",
		textAlign: "center" as const,
		padding: "12px 24px",
	},
	footer: {
		fontSize: "14px",
		color: "#6B7280",
		textAlign: "center" as const,
	},
};
