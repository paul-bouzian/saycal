import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	themeColor: "#B552D9",
};

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "https://saycal.app",
	),
	title: "SayCal - Voice-Driven Calendar",
	description: "Manage your calendar with your voice",
	icons: {
		icon: [
			{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: "SayCal - Voice-Driven Calendar",
		description: "Manage your calendar with your voice",
		images: ["/logo512.png"],
		type: "website",
	},
	twitter: {
		card: "summary",
		images: ["/logo512.png"],
	},
	manifest: "/manifest.json",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
