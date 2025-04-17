CREATE TABLE `search_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clerk_id` text NOT NULL,
	`people` integer NOT NULL,
	`oven` integer NOT NULL,
	`hotplate` integer NOT NULL,
	`mixer` integer NOT NULL,
	`time` integer NOT NULL,
	`toaster` integer NOT NULL,
	`pressurecooker` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `favorite` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `birthday` text;--> statement-breakpoint
ALTER TABLE `user` ADD `gender` text;