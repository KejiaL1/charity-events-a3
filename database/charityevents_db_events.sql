-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `org_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `venue` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `ticket_price_cents` int DEFAULT '0',
  `is_free` tinyint(1) DEFAULT '0',
  `target_amount_cents` int DEFAULT '0',
  `raised_amount_cents` int DEFAULT '0',
  `status` enum('upcoming','past','paused') COLLATE utf8mb4_unicode_ci DEFAULT 'upcoming',
  `hero_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_org` (`org_id`),
  KEY `idx_city` (`city`),
  KEY `idx_start` (`start_datetime`),
  KEY `idx_cat` (`category_id`),
  CONSTRAINT `fk_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_org` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'City Charity Run',1,1,'A 10km community charity run through the lush greens of Centennial Parklands. Family-friendly with hydration stations and course marshals.','Raise funds for local school programs and community sports initiatives.','Centennial Parklands','Sydney','NSW','2025-11-01 08:00:00','2025-11-01 12:00:00',3000,0,1000000,250000,'upcoming','assets/img/city_charity_run.jpg',-33.896000,151.241100),(2,'Autumn Gala Night',2,1,'A black-tie gala featuring a three-course dinner, keynote speeches, and a live string quartet.','Raise scholarships for disadvantaged students in Greater Sydney.','Sydney Town Hall','Sydney','NSW','2025-11-29 18:00:00','2025-11-29 22:30:00',15000,0,3000000,500000,'upcoming','assets/img/autumn_gala_night.jpg',-33.867500,151.219500),(3,'Eco Auction 2025',3,2,'An auction of eco-friendly products and donated artworks to support reforestation and conservation projects.','Fund native tree planting and habitat restoration across NSW.','ICC Sydney – Parkside Ballroom','Sydney','NSW','2025-11-16 17:00:00','2025-11-16 20:00:00',0,1,1500000,300000,'upcoming','assets/img/eco_auction_2025.jpg',-33.874800,151.206600),(4,'Community Blood Drive',4,3,'Donate life-saving blood at our Town Hall donor centre. Appointments recommended; walk-ins welcome.','Support local hospitals with critical blood supplies.','Red Cross Lifeblood Donor Centre – Town Hall','Sydney','NSW','2025-11-07 03:32:34','2025-11-07 05:32:34',0,1,0,0,'upcoming','assets/img/community_blood_drive.jpg',-33.873300,151.206600),(5,'Bay Area Fun Run',1,2,'A 5km fun run around The Domain with live music and volunteer pacers. Great for beginners and families.','Support local park maintenance and environmental education.','The Domain','Sydney','NSW','2025-11-08 08:00:00','2025-11-08 11:00:00',2000,0,800000,120000,'upcoming','assets/img/bay_area_fun_run.jpg',-33.868800,151.209300),(6,'Winter Gala',2,1,'A formal winter fundraising gala with celebrity hosts and a silent auction.','Support winter shelter and essential services for vulnerable communities.','The Star Event Centre','Sydney','NSW','2026-01-06 19:00:00','2026-01-06 23:00:00',18000,0,4000000,700000,'upcoming','assets/img/winter_gala.jpg',-33.873100,151.205400);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-20  0:18:05
