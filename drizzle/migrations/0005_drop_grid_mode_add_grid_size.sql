ALTER TABLE `tabs` DROP COLUMN `grid_mode`;--> statement-breakpoint
ALTER TABLE `tabs` ADD `grid_size` text DEFAULT 'medium' NOT NULL;