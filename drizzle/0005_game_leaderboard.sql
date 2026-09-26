CREATE TABLE IF NOT EXISTS `gameLeaderboard` (
  `id` int AUTO_INCREMENT NOT NULL,
  `username` varchar(80) NOT NULL,
  `score` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `gameLeaderboard_id` PRIMARY KEY (`id`),
  KEY `gameLeaderboard_score_idx` (`score`, `createdAt`)
);
