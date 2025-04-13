ALTER TABLE `user` RENAME COLUMN "id" TO "user_id";--> statement-breakpoint
CREATE TABLE `favorite` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`recipe_url` text NOT NULL
);
