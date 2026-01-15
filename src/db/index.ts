import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema.ts";

const databaseUrl = import.meta.env.VITE_DATABASE_URL;
if (!databaseUrl) {
	throw new Error("VITE_DATABASE_URL is required");
}

export const db = drizzle(databaseUrl, { schema });
