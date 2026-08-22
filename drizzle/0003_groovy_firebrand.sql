CREATE TABLE `artistInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryType` enum('booking','remix','collaboration','licensing') NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organization` varchar(160),
	`projectTitle` varchar(255) NOT NULL,
	`location` varchar(160),
	`timeline` varchar(160),
	`budgetContext` varchar(255),
	`message` text NOT NULL,
	`source` enum('epk','release','universe','licensing') NOT NULL,
	`status` enum('new','reviewed','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artistInquiries_id` PRIMARY KEY(`id`)
);
