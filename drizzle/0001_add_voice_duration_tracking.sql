-- Migration: Add voice duration tracking columns
-- This adds daily duration tracking for premium users' voice commands

ALTER TABLE "user_subscriptions"
ADD COLUMN IF NOT EXISTS "voice_usage_date" varchar(10);

ALTER TABLE "user_subscriptions"
ADD COLUMN IF NOT EXISTS "voice_usage_duration_seconds" integer NOT NULL DEFAULT 0;
