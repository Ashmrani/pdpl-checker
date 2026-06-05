CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(2048) NOT NULL,
	`hostname` varchar(512) NOT NULL,
	`grade` varchar(2) NOT NULL,
	`score` int NOT NULL,
	`cookieCount` int NOT NULL,
	`trackerCount` int NOT NULL,
	`pdplStatus` varchar(32) NOT NULL,
	`report` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
