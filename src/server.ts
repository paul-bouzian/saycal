import handler from "@tanstack/react-start/server-entry";
import { baseLocale, locales, localizeUrl } from "./paraglide/runtime";
import { paraglideMiddleware } from "./paraglide/server";

const secondaryLocale = locales.find((locale) => locale !== baseLocale);
const baseLocalePrefix = baseLocale.split("-")[0]?.toLowerCase();

function hasLocalePrefix(pathname: string) {
	if (!secondaryLocale) {
		return false;
	}
	return (
		pathname === `/${secondaryLocale}` ||
		pathname.startsWith(`/${secondaryLocale}/`)
	);
}

function prefersBaseLocale(acceptLanguage: string | null) {
	if (!acceptLanguage || !baseLocalePrefix) {
		return false;
	}
	return acceptLanguage
		.split(",")
		.map((part) => part.trim().toLowerCase())
		.some((part) => part.startsWith(baseLocalePrefix));
}

function isDocumentRequest(request: Request) {
	return (
		request.headers.get("Sec-Fetch-Dest") === "document" ||
		request.headers.get("Accept")?.includes("text/html")
	);
}

// Server-side URL localization/redirects for Paraglide
export default {
	async fetch(req: Request): Promise<Response> {
		const url = new URL(req.url);
		const acceptLanguage = req.headers.get("accept-language");

		if (
			secondaryLocale &&
			isDocumentRequest(req) &&
			!hasLocalePrefix(url.pathname) &&
			acceptLanguage &&
			!prefersBaseLocale(acceptLanguage)
		) {
			const redirectUrl = localizeUrl(url, { locale: secondaryLocale });
			return Response.redirect(redirectUrl, 307);
		}

		return paraglideMiddleware(req, () => handler.fetch(req));
	},
};
