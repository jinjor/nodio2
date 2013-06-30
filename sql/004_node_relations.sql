DROP TABLE IF EXISTS `node_relations`;
CREATE TABLE `node_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `child_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parentid_to_nodeid` (`parent_id`),
  KEY `childid_to_nodeid` (`child_id`),
  CONSTRAINT `childid_to_nodeid` FOREIGN KEY (`child_id`) REFERENCES `nodes` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `parentid_to_nodeid` FOREIGN KEY (`parent_id`) REFERENCES `nodes` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10008 DEFAULT CHARSET=utf8;
LOCK TABLES `node_relations` WRITE;
INSERT INTO `node_relations` VALUES (10001,1000,3),(10002,1000,100),(10003,1000,1),(10004,1000,1),(10005,1000,4),(10006,1000,101),(10007,1000,2);
UNLOCK TABLES;