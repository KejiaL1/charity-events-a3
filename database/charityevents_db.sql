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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'Blood Drive'),(3,'Charity Auction'),(1,'Fun Run'),(2,'Gala Dinner');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `about` text COLLATE utf8mb4_unicode_ci,
  `contact_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Hope Foundation','Focus on child education.','contact@hope.org'),(2,'Green Earth','Environmental protection.','hello@green.org'),(3,'Care&Share','Community support.','team@care.org');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `num_tickets` int NOT NULL DEFAULT '1',
  `registration_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reg_event` (`event_id`),
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,'Alice','alice@example.com',1,'2025-10-20 02:06:33'),(2,2,'Bob','bob@example.com',2,'2025-10-20 02:06:33'),(3,4,'User_3438','user2597@example.com',1,'2025-10-20 02:29:10'),(4,5,'User_5567','user9818@example.com',1,'2025-10-20 02:29:10'),(5,3,'User_2498','user5317@example.com',3,'2025-10-20 02:29:10'),(6,6,'User_9499','user224@example.com',1,'2025-10-20 02:29:10'),(7,2,'User_2447','user4361@example.com',2,'2025-10-20 02:29:10'),(8,1,'User_9247','user2837@example.com',2,'2025-10-20 02:29:10'),(9,4,'User_3704','user9191@example.com',2,'2025-10-20 02:29:10'),(10,5,'User_6640','user8672@example.com',2,'2025-10-20 02:29:10'),(11,3,'User_1183','user5592@example.com',2,'2025-10-20 02:29:10'),(12,6,'User_5287','user3194@example.com',1,'2025-10-20 02:29:10'),(13,2,'User_969','user4511@example.com',3,'2025-10-20 02:29:10'),(14,1,'User_4719','user4644@example.com',3,'2025-10-20 02:29:10'),(15,4,'User_1366','user9650@example.com',2,'2025-10-20 02:29:10'),(16,5,'User_1815','user6616@example.com',3,'2025-10-20 02:29:10'),(17,3,'User_8311','user8660@example.com',3,'2025-10-20 02:29:10'),(18,6,'User_5851','user4156@example.com',1,'2025-10-20 02:29:10'),(19,2,'User_3659','user8619@example.com',1,'2025-10-20 02:29:10'),(20,1,'User_4727','user7283@example.com',1,'2025-10-20 02:29:10'),(21,4,'User_9319','user9896@example.com',1,'2025-10-20 02:29:10'),(22,5,'User_7907','user4980@example.com',1,'2025-10-20 02:29:10'),(23,3,'User_937','user1160@example.com',1,'2025-10-20 02:29:10'),(24,6,'User_1467','user8365@example.com',3,'2025-10-20 02:29:10'),(25,2,'User_2016','user7814@example.com',1,'2025-10-20 02:29:10'),(26,1,'User_1653','user9210@example.com',1,'2025-10-20 02:29:10'),(27,4,'User_7809','user5780@example.com',2,'2025-10-20 02:29:10'),(28,5,'User_34','user3746@example.com',3,'2025-10-20 02:29:10'),(29,3,'User_1897','user3603@example.com',1,'2025-10-20 02:29:10'),(30,6,'User_811','user7082@example.com',1,'2025-10-20 02:29:10'),(31,2,'User_3642','user9275@example.com',2,'2025-10-20 02:29:10'),(32,1,'User_9426','user779@example.com',2,'2025-10-20 02:29:10'),(33,4,'User_5745','user1873@example.com',1,'2025-10-20 02:29:10'),(34,5,'User_5029','user8756@example.com',3,'2025-10-20 02:29:10'),(35,3,'User_7188','user9865@example.com',3,'2025-10-20 02:29:10'),(36,6,'User_9210','user2767@example.com',2,'2025-10-20 02:29:10'),(37,2,'User_2727','user5015@example.com',3,'2025-10-20 02:29:10'),(38,1,'User_9432','user6474@example.com',2,'2025-10-20 02:29:10'),(39,4,'User_940','user2484@example.com',3,'2025-10-20 02:29:10'),(40,5,'User_531','user3866@example.com',3,'2025-10-20 02:29:10'),(41,3,'User_7072','user2158@example.com',3,'2025-10-20 02:29:10'),(42,6,'User_1388','user8223@example.com',3,'2025-10-20 02:29:10'),(43,2,'User_74','user9526@example.com',3,'2025-10-20 02:29:10'),(44,1,'User_8448','user22@example.com',2,'2025-10-20 02:29:10'),(45,4,'User_3771','user4551@example.com',1,'2025-10-20 02:29:10'),(46,5,'User_3554','user3447@example.com',2,'2025-10-20 02:29:10'),(47,3,'User_2507','user2827@example.com',2,'2025-10-20 02:29:10'),(48,6,'User_4575','user3041@example.com',1,'2025-10-20 02:29:10'),(49,2,'User_8279','user6953@example.com',3,'2025-10-20 02:29:10'),(50,1,'User_8769','user4070@example.com',2,'2025-10-20 02:29:10'),(51,4,'User_7998','user7863@example.com',2,'2025-10-20 02:29:10'),(52,5,'User_3024','user9151@example.com',3,'2025-10-20 02:29:10'),(53,3,'User_5959','user9748@example.com',1,'2025-10-20 02:29:10'),(54,6,'User_5073','user2774@example.com',3,'2025-10-20 02:29:10'),(55,2,'User_4923','user8669@example.com',3,'2025-10-20 02:29:10'),(56,1,'User_6858','user8572@example.com',1,'2025-10-20 02:29:10'),(57,4,'User_5699','user1646@example.com',1,'2025-10-20 02:29:10'),(58,5,'User_717','user193@example.com',3,'2025-10-20 02:29:10'),(59,3,'User_3493','user1019@example.com',2,'2025-10-20 02:29:10'),(60,6,'User_16','user6238@example.com',1,'2025-10-20 02:29:10'),(61,2,'User_6980','user1485@example.com',2,'2025-10-20 02:29:10'),(62,1,'User_7960','user351@example.com',3,'2025-10-20 02:29:10');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-20  2:30:19
