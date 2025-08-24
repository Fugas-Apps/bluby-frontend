-- migration: 0000_cooing_speedball.sql
-- Better Auth tables (these will be created automatically by better-auth-cloudflare)
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
-- Application tables
CREATE TABLE IF NOT EXISTS `food_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fat` integer NOT NULL,
	`processed` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`total_calories` integer NOT NULL,
	`total_protein` integer NOT NULL,
	`total_carbs` integer NOT NULL,
	`total_fat` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `meal_items` (
	`meal_id` text NOT NULL,
	`food_item_id` text NOT NULL,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_item_id`) REFERENCES `food_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pantry_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`is_scanned` integer DEFAULT false,
	`barcode` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fat` integer NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `recipe_ingredients` (
	`recipe_id` text NOT NULL,
	`ingredient` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`goal` text,
	`avatar_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_allergies` (
	`user_id` text NOT NULL,
	`allergy` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_preferences` (
	`user_id` text NOT NULL,
	`preference` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_intolerances` (
	`user_id` text NOT NULL,
	`intolerance` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

