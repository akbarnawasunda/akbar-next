CREATE TABLE IF NOT EXISTS `galleryAnalytics` (
  `id` int AUTO_INCREMENT NOT NULL,
  `gallery` varchar(64) NOT NULL,
  `visitorHash` varchar(64) NOT NULL,
  `visitDay` varchar(10) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `galleryAnalytics_id` PRIMARY KEY(`id`),
  UNIQUE KEY `galleryAnalytics_visitor_day_unique` (`gallery`,`visitorHash`,`visitDay`),
  KEY `galleryAnalytics_gallery_day_idx` (`gallery`,`visitDay`)
);
