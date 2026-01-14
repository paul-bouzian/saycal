import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import neon from "./neon-vite-plugin.ts";

const config = defineConfig(({ command }) => {
	const enableCloudflare = command === "build";

	return {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		plugins: [
			devtools(),
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
				strategy: ["url"],
			}),
			...(enableCloudflare
				? [cloudflare({ viteEnvironment: { name: "ssr" } })]
				: []),
			// neon, // Temporarily disabled
			// this is the plugin that enables path aliases
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			tanstackStart({
				vite: {
					installDevServerMiddleware: true,
				},
			}),
			viteReact(),
		],
	};
});

export default config;
