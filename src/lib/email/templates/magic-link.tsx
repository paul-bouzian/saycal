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

interface MagicLinkEmailProps {
	magicLink: string;
}

export function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Votre lien de connexion SayCal</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Text style={styles.title}>SayCal</Text>
					<Text style={styles.text}>
						Cliquez sur le bouton ci-dessous pour vous connecter à SayCal.
					</Text>
					<Section style={styles.buttonContainer}>
						<Button style={styles.button} href={magicLink}>
							Se connecter
						</Button>
					</Section>
					<Text style={styles.footer}>
						Ce lien expire dans 15 minutes. Si vous n&apos;avez pas demandé ce
					lien, ignorez cet email.
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
		color: "#B552D9",
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
