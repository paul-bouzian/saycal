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

interface WelcomeEmailProps {
	userName?: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Bienvenue sur SayCal !</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Text style={styles.title}>Bienvenue sur SayCal !</Text>
					<Text style={styles.text}>
						{userName ? `Bonjour ${userName},` : "Bonjour,"}
					</Text>
					<Text style={styles.text}>
						Vous pouvez maintenant créer vos événements en les dictant
						simplement. Plus besoin de taper, parlez et c&apos;est noté !
					</Text>
					<Section style={styles.tips}>
						<Text style={styles.tipTitle}>Pour commencer</Text>
						<Text style={styles.tip}>• Cliquez sur le bouton micro</Text>
						<Text style={styles.tip}>• Dites &quot;Dentiste demain 14h&quot;</Text>
						<Text style={styles.tip}>• L&apos;événement est créé automatiquement</Text>
					</Section>
					<Section style={styles.buttonContainer}>
						<Button style={styles.button} href="https://saycal.app/app">
							Ouvrir SayCal
						</Button>
					</Section>
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
	tips: {
		backgroundColor: "#f9f5fb",
		borderRadius: "8px",
		padding: "20px",
		margin: "24px 0",
	},
	tipTitle: {
		fontSize: "16px",
		fontWeight: "bold" as const,
		color: "#B552D9",
		margin: "0 0 12px 0",
	},
	tip: {
		fontSize: "14px",
		lineHeight: "22px",
		color: "#1A1A2E",
		margin: "4px 0",
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
};
