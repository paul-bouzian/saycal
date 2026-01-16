"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { authClient } from "@/lib/auth";
import { PosthogProvider } from "@/lib/analytics/posthog";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
					},
				},
			}),
	);

	return (
		<PosthogProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<NeonAuthUIProvider
						// @ts-expect-error - Type conflict between @better-fetch/fetch versions (npm vs bun)
						authClient={authClient}
						emailOTP
						redirectTo="/app"
						defaultTheme="light"
					>
						{children}
					</NeonAuthUIProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</PosthogProvider>
	);
}
