
DROP TABLE IF EXISTS `node_views`;
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

LOCK TABLES `node_views` WRITE;
INSERT INTO `node_views` VALUES (1,10001,200,20),(2,10002,200,100),(3,10003,200,260),(4,10004,340,340),(5,10005,480,420),(6,10006,100,400),(7,10007,160,570);
UNLOCK TABLES;