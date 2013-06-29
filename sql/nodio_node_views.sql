CREATE DATABASE  IF NOT EXISTS `nodio` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `nodio`;
-- MySQL dump 10.13  Distrib 5.5.16, for Win32 (x86)
--
-- Host: 127.0.0.1    Database: nodio
-- ------------------------------------------------------
-- Server version	5.5.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `node_views`
--

DROP TABLE IF EXISTS `node_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_rel_id` int(11) NOT NULL,
  `offset_x` int(11) NOT NULL,
  `offset_y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `node_rel_id_UNIQUE` (`node_rel_id`),
  KEY `nodeviewrelid_to_noderelid` (`node_rel_id`),
  CONSTRAINT `nodeviewrelid_to_noderelid` FOREIGN KEY (`node_rel_id`) REFERENCES `node_relations` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_views`
--

LOCK TABLES `node_views` WRITE;
/*!40000 ALTER TABLE `node_views` DISABLE KEYS */;
INSERT INTO `node_views` VALUES (1,10001,200,20),(2,10002,200,100),(3,10003,200,260),(4,10004,340,340),(5,10005,480,420),(6,10006,100,400),(7,10007,160,570);
/*!40000 ALTER TABLE `node_views` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-06-30  2:34:19
