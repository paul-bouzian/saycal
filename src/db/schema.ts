import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgSchema,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Reference to neon_auth schema (managed by Neon Auth)
const neonAuthSchema = pgSchema("neon_auth");

// User table managed by Neon Auth - declared for relations
export const neonAuthUser = neonAuthSchema.table("user", {
	id: uuid("id").primaryKey(),
	email: text("email").notNull(),
	name: text("name"),
	emailVerified: timestamp("emailVerified"),
	createdAt: timestamp("createdAt").defaultNow(),
	updatedAt: timestamp("updatedAt"),
});

// Events table
export const events = pgTable(
	"events",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => neonAuthUser.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 200 }).notNull(),
		startAt: timestamp("start_at", { withTimezone: true }).notNull(),
		endAt: timestamp("end_at", { withTimezone: true }).notNull(),
		color: varchar("color", { length: 7 }), // hex color, e.g. #B552D9
		createdVia: varchar("created_via", { length: 10 })
			.notNull()
			.default("manual"), // 'voice' | 'manual'
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userStartIdx: index("events_user_start_idx").on(
			table.userId,
			table.startAt,
		),
	}),
);

// User subscriptions table
export const userSubscriptions = pgTable(
	"user_subscriptions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => neonAuthUser.id, { onDelete: "cascade" })
			.unique(),
		stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
		stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
		plan: varchar("plan", { length: 20 }).notNull().default("free"), // 'free' | 'premium'
		voiceUsageMonth: varchar("voice_usage_month", { length: 7 }), // '2026-01'
		voiceUsageCount: integer("voice_usage_count").notNull().default(0),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdx: index("user_subscriptions_user_idx").on(table.userId),
	}),
);

// Drizzle relations
export const eventsRelations = relations(events, ({ one }) => ({
	user: one(neonAuthUser, {
		fields: [events.userId],
		references: [neonAuthUser.id],
	}),
}));

export const userSubscriptionsRelations = relations(
	userSubscriptions,
	({ one }) => ({
		user: one(neonAuthUser, {
			fields: [userSubscriptions.userId],
			references: [neonAuthUser.id],
		}),
	}),
);

// TypeScript types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// Zod schemas for validation
export const insertEventSchema = createInsertSchema(events, {
	title: z.string().min(1).max(200),
	startAt: z.coerce.date(),
	endAt: z.coerce.date(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional(),
});

export const selectEventSchema = createSelectSchema(events);
