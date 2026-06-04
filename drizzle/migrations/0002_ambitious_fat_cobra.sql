ALTER TABLE `profiles` ADD `trial_ends_at` integer;
--> statement-breakpoint
UPDATE `profiles` SET `subscription_status` = 'active' WHERE `subscription_status` IS NULL;
