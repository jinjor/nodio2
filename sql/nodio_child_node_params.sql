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
-- Table structure for table `child_node_params`
--

DROP TABLE IF EXISTS `child_node_params`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `child_node_params` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_relation_id` int(11) NOT NULL,
  `param_name` varchar(45) NOT NULL,
  `value` float DEFAULT NULL,
  `public_name` varchar(45) DEFAULT NULL,
  `public_max_in` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnparam_unique` (`node_relation_id`,`param_name`),
  KEY `cnparamrelid_to_noderel` (`node_relation_id`),
  CONSTRAINT `cnparamrelid_to_noderel` FOREIGN KEY (`node_relation_id`) REFERENCES `node_relations` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10022 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `child_node_params`
--

LOCK TABLES `child_node_params` WRITE;
/*!40000 ALTER TABLE `child_node_params` DISABLE KEYS */;
INSERT INTO `child_node_params` VALUES (10002,10002,'in',NULL,NULL,NULL),(10003,10002,'attack',NULL,NULL,NULL),(10004,10002,'decay',NULL,NULL,NULL),(10005,10002,'sustain',NULL,NULL,NULL),(10006,10002,'release',NULL,NULL,NULL),(10010,10003,'in',NULL,NULL,NULL),(10011,10003,'gain',NULL,NULL,NULL),(10013,10004,'in',NULL,NULL,NULL),(10014,10004,'gain',NULL,NULL,NULL),(10016,10005,'in',NULL,NULL,NULL),(10017,10005,'delayTime',NULL,NULL,NULL),(10019,10006,'in',NULL,NULL,NULL),(10021,10007,'in',NULL,NULL,NULL);
/*!40000 ALTER TABLE `child_node_params` ENABLE KEYS */;
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
