CREATE TABLE `qrcodes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(20) NOT NULL DEFAULT 'static',
	`original_url` text NOT NULL,
	`short_code` varchar(10),
	`style_options` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qrcodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `qrcodes_short_code_unique` UNIQUE(`short_code`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`qrcode_id` int NOT NULL,
	`user_agent` text,
	`ip_address` varchar(45),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `qrcodes` ADD CONSTRAINT `qrcodes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scans` ADD CONSTRAINT `scans_qrcode_id_qrcodes_id_fk` FOREIGN KEY (`qrcode_id`) REFERENCES `qrcodes`(`id`) ON DELETE no action ON UPDATE no action;