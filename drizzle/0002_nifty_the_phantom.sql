CREATE TABLE `artistContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('hero','release','video','live') NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` text NOT NULL,
	`label` varchar(128) NOT NULL DEFAULT '',
	`href` varchar(1024) NOT NULL DEFAULT '',
	`imageUrl` varchar(1024) NOT NULL DEFAULT '',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artistContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `artistContent_slug_unique` UNIQUE(`slug`)
);
