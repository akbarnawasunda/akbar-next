CREATE TABLE `fanSignals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(64) NOT NULL DEFAULT 'home',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fanSignals_id` PRIMARY KEY(`id`),
	CONSTRAINT `fanSignals_email_unique` UNIQUE(`email`)
);
