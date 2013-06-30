
DROP TABLE IF EXISTS `connections`;

CREATE TABLE `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_node_rel_id` int(11) NOT NULL,
  `target_child_param_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `connsourceid_to_noderlid` (`source_node_rel_id`),
  KEY `conntargetid_to_noderelid` (`target_child_param_id`),
  CONSTRAINT `connsourceid_to_noderlid` FOREIGN KEY (`source_node_rel_id`) REFERENCES `node_relations` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `conntargetid_to_noderelid` FOREIGN KEY (`target_child_param_id`) REFERENCES `child_node_params` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10009 DEFAULT CHARSET=utf8;

LOCK TABLES `connections` WRITE;
INSERT INTO `connections` VALUES (10001,10001,10002),(10002,10002,10010),(10003,10003,10013),(10004,10004,10016),(10005,10005,10013),(10006,10003,10019),(10007,10004,10019),(10008,10006,10021);
UNLOCK TABLES;