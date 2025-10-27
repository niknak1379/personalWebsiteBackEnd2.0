-- MySQL dump 10.13  Distrib 8.4.7, for macos15.4 (arm64)
--
-- Host: localhost    Database: projects
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Projects`
--

DROP TABLE IF EXISTS `Projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Projects` (
  `name` varchar(28) NOT NULL,
  `description` varchar(135) NOT NULL,
  `longDescription` text NOT NULL,
  `status` varchar(255) NOT NULL,
  `pictureURL` varchar(255) DEFAULT NULL,
  `githubURL` varchar(255) DEFAULT NULL,
  `deploymentURL` varchar(255) DEFAULT NULL,
  `obsidianURL` varchar(255) DEFAULT NULL,
  `carouselImage_1` varchar(255) DEFAULT NULL,
  `carouselImage_2` varchar(255) DEFAULT NULL,
  `carouselImage_3` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Projects`
--

LOCK TABLES `Projects` WRITE;
/*!40000 ALTER TABLE `Projects` DISABLE KEYS */;
INSERT INTO `Projects` VALUES ('Nikan\'s Personal Website V2','Second iteration of my website. Deployed on AWS, with more spohisticated networking.','My very own personal website, Showcasing my Projects and interests. Backend used for storing the database containing the projects and \r\ncontacting and email functinality is written in Express.js and hosted on Docker containers on an AWS EC2 instance. Assets are stored in S3 buckets. Migrated the majority of the vanilla HTML and JS\r\nto react to further familiarize myself with the framework and how it interacts with server side APIs. The app is client side rendered completely.','In Progress','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/mainPage.avif','https://github.com/niknak1379/personalWebsite2.0','https://nikanostovan.dev/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/detailPage.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/contactForm.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/projectsPage.avif'),('Nikan\'s Personal Website V3','Third iteration of my Website, with full Database operations Using Multen and OAuth.','Third iteration of my Website, adding frontend for manipulating the backend DB. Using Multen and OAuth.\r\nAdds a personal dashbord for myself to manipulate the projects individually and to insert new projects into the \r\nwebsite without having to manually mainipulate the database instance on the EC2.','To Be Started','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/mainPage.avif','https://github.com/niknak1379/personalWebsite2.0','https://nikanostovan.dev/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/detailPage.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/contactForm.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV2.0/projectsPage.avif'),('Obsidian Notes and Blog','My obsidian Vault which contains the notes I have taken on the concepts I have learned, and blog like articles for my own use.','My obsidian Vault which contains the notes I have taken on the concepts I have learned, and blog like articles for my own use.\nHosted on GitHub Pages using Quartz V4.0. Further documentation of future projects and their research notes will be on publicly \npublished on here.','Complete','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/1.avif','https://github.com/niknak1379/ObsidianNotes','https://notes.nikanostovan.dev/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/2.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/3.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/obsidianBlog/4.avif'),('PASA club\'s Website','Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.','Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club. \r\nIt is written in react and mostly uses Tailwind or styling. \r\nDoes not have any app functionality or dedicated APIs as of yet, \r\nwill most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\r\nAlso if you are reading this please donate to the club through the venmo link it is much appreciated :)','Complete','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainLight.avif','https://github.com/niknak1379/pasa-website','https://pasaatucsd.com/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainDark.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/venmo.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/page.avif'),('Personal Home Lab(ish)','Features currently include: PiHole for network wide adblock, Home-Assistant for IoT management','My Personal Homelab currently running on 2 different Raspberry-pis. One running Home-Assistant for IoT management and the other PiHole for network wide adblock. \r\nwill mostlikely add NAS and other functinoaliteis if I need more space for storing images and photography related files.\r\n','Complete','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/homelab.avif','https://github.com/niknak1379/pasa-website','https://pasaatucsd.org/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/PH.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/homeLab/HA.avif','CarouselURL 3 goes here'),('Personal Website V1','My very own personal website, Showcasing my Projects and interests. Uses mostly vanilla JS and some React','My very own personal website, Showcasing my Projects and interests. Deployed on Vercel, using mostly vanilla JS and some React,\r\nMostly used Vanilla JS in order to learn JS fundamentals and JS event loop and basic API implementations, and service workers. Only used some react on\r\nthe main page to familiarize myself with the syntax and how it works. Backend for emailing and contact information processing is written with Express.js and hosted on Vercell','Complete','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/mainLight.avif','https://github.com/niknak1379/personalWebsite','https://nikanostovan.dev/','https://notes.nikanostovan.dev/','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/mainDark.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/projects.avif','https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/personalV1.0/contactMe.avif');
/*!40000 ALTER TABLE `Projects` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `validStatus` BEFORE INSERT ON `Projects` FOR EACH ROW BEGIN
    IF NOT EXISTS (SELECT status FROM Status WHERE status = new.status) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid status';  
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `defaultTag` AFTER INSERT ON `Projects` FOR EACH ROW BEGIN
    INSERT INTO ProjectTags
    VALUES(new.name, 'ALL');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ProjectTags`
--

DROP TABLE IF EXISTS `ProjectTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProjectTags` (
  `name` varchar(28) NOT NULL,
  `tag` varchar(255) NOT NULL,
  KEY `name` (`name`),
  CONSTRAINT `projecttags_ibfk_1` FOREIGN KEY (`name`) REFERENCES `Projects` (`name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProjectTags`
--

LOCK TABLES `ProjectTags` WRITE;
/*!40000 ALTER TABLE `ProjectTags` DISABLE KEYS */;
INSERT INTO `ProjectTags` VALUES ('Obsidian Notes and Blog','ALL'),('Obsidian Notes and Blog','Github Pages'),('Nikan\'s Personal Website V2','ALL'),('Nikan\'s Personal Website V2','Javascript'),('Nikan\'s Personal Website V2','FrontEnd'),('Nikan\'s Personal Website V2','BackEnd'),('Nikan\'s Personal Website V2','MySQL'),('Nikan\'s Personal Website V2','AWS'),('Nikan\'s Personal Website V2','Networking'),('Nikan\'s Personal Website V3','ALL'),('Nikan\'s Personal Website V3','AWS'),('Nikan\'s Personal Website V3','OAuth'),('Personal Home Lab(ish)','ALL'),('Personal Home Lab(ish)','Raspberry'),('Personal Home Lab(ish)','Pi'),('Personal Home Lab(ish)','Linux'),('Personal Home Lab(ish)','IT'),('Personal Home Lab(ish)','Networking'),('Personal Website V1','ALL'),('Personal Website V1','Javascript'),('Personal Website V1','FrontEnd'),('Personal Website V1','ALL'),('Personal Website V1','Javascript'),('Personal Website V1','FrontEnd'),('PASA club\'s Website','ALL'),('PASA club\'s Website','React'),('PASA club\'s Website','Tailwind'),('PASA club\'s Website','FrontEnd');
/*!40000 ALTER TABLE `ProjectTags` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `updateTag` BEFORE INSERT ON `ProjectTags` FOR EACH ROW BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE tag = new.tag) THEN
        INSERT INTO Tags(tag)
        VALUES (new.tag);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Status`
--

DROP TABLE IF EXISTS `Status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Status` (
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Status`
--

LOCK TABLES `Status` WRITE;
/*!40000 ALTER TABLE `Status` DISABLE KEYS */;
INSERT INTO `Status` VALUES ('Complete'),('In Progress'),('To Be Started');
/*!40000 ALTER TABLE `Status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tags`
--

DROP TABLE IF EXISTS `Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tags` (
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tags`
--

LOCK TABLES `Tags` WRITE;
/*!40000 ALTER TABLE `Tags` DISABLE KEYS */;
INSERT INTO `Tags` VALUES ('ALL'),('AWS'),('BackEnd'),('FrontEnd'),('Github Pages'),('IT'),('Javascript'),('Linux'),('MySQL'),('Networking'),('OAuth'),('Pi'),('Raspberry'),('Raspberry-Pi'),('React'),('Tailwind');
/*!40000 ALTER TABLE `Tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `refreshToken` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('nikan','$2b$10$KVBlu6xO4.ur8QNjtGM2Gu2c.1k1lT89X28tEO3MuX2cDXR.KbMky','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibmlrYW4iLCJpYXQiOjE3NDQ5MjI3MjR9.aCSz5Bll5I0NSBrhuhVNJAogu3ReuwO2OKL5zx7BZEk'),('102046077891560748914','a',NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-26 14:14:45
