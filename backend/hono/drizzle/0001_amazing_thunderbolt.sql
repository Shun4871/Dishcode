ALTER TABLE `user` ADD `clerk_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `email` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_clerk_id_unique` ON `user` (`clerk_id`);