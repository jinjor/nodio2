DROP TABLE IF EXISTS `params`;
CREATE TABLE `params` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `min` float NOT NULL,
  `max` float NOT NULL,
  `step` float NOT NULL,
  `default` float NOT NULL,
  `max_in` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `paramnodeid_to_nodeid` (`node_id`),
  CONSTRAINT `paramnodeid_to_nodeid` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
LOCK TABLES `params` WRITE;
INSERT INTO `params` VALUES (1,1,'gain',0,1,0.01,0.3,99),(2,3,'type',0,3,1,0,0),(3,3,'freq',60,2000,0.1,440,99),(4,4,'delayTime',0,1,0.01,0.5,99),(5,100,'attack',0,200,0.1,5,0),(6,100,'delay',0,200,0.1,3,0),(7,100,'sustain',0,1,0.01,0.5,0),(8,100,'release',0,200,0.1,10,0);
UNLOCK TABLES;