
DROP TABLE IF EXISTS `child_node_params`;

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

LOCK TABLES `child_node_params` WRITE;

INSERT INTO `child_node_params` VALUES (10002,10002,'in',NULL,NULL,NULL),(10003,10002,'attack',NULL,NULL,NULL),(10004,10002,'decay',NULL,NULL,NULL),(10005,10002,'sustain',NULL,NULL,NULL),(10006,10002,'release',NULL,NULL,NULL),(10010,10003,'in',NULL,NULL,NULL),(10011,10003,'gain',NULL,NULL,NULL),(10013,10004,'in',NULL,NULL,NULL),(10014,10004,'gain',NULL,NULL,NULL),(10016,10005,'in',NULL,NULL,NULL),(10017,10005,'delayTime',NULL,NULL,NULL),(10019,10006,'in',NULL,NULL,NULL),(10021,10007,'in',NULL,NULL,NULL);

UNLOCK TABLES;
