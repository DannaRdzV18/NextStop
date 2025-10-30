-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: nextstop
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
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add usuario',7,'add_usuario'),(26,'Can change usuario',7,'change_usuario'),(27,'Can delete usuario',7,'delete_usuario'),(28,'Can view usuario',7,'view_usuario'),(29,'Can add usuario rol',8,'add_usuariorol'),(30,'Can change usuario rol',8,'change_usuariorol'),(31,'Can delete usuario rol',8,'delete_usuariorol'),(32,'Can view usuario rol',8,'view_usuariorol'),(33,'Can add rol',9,'add_rol'),(34,'Can change rol',9,'change_rol'),(35,'Can delete rol',9,'delete_rol'),(36,'Can view rol',9,'view_rol'),(37,'Can add sesion',10,'add_sesion'),(38,'Can change sesion',10,'change_sesion'),(39,'Can delete sesion',10,'delete_sesion'),(40,'Can view sesion',10,'view_sesion'),(41,'Can add proveedor api',11,'add_proveedorapi'),(42,'Can change proveedor api',11,'change_proveedorapi'),(43,'Can delete proveedor api',11,'delete_proveedorapi'),(44,'Can view proveedor api',11,'view_proveedorapi'),(45,'Can add detalle itinerario',12,'add_detalleitinerario'),(46,'Can change detalle itinerario',12,'change_detalleitinerario'),(47,'Can delete detalle itinerario',12,'delete_detalleitinerario'),(48,'Can view detalle itinerario',12,'view_detalleitinerario'),(49,'Can add favorito',13,'add_favorito'),(50,'Can change favorito',13,'change_favorito'),(51,'Can delete favorito',13,'delete_favorito'),(52,'Can view favorito',13,'view_favorito'),(53,'Can add historial busqueda',14,'add_historialbusqueda'),(54,'Can change historial busqueda',14,'change_historialbusqueda'),(55,'Can delete historial busqueda',14,'delete_historialbusqueda'),(56,'Can view historial busqueda',14,'view_historialbusqueda'),(57,'Can add itinerario',15,'add_itinerario'),(58,'Can change itinerario',15,'change_itinerario'),(59,'Can delete itinerario',15,'delete_itinerario'),(60,'Can view itinerario',15,'view_itinerario'),(61,'Can add log sistema',16,'add_logsistema'),(62,'Can change log sistema',16,'change_logsistema'),(63,'Can delete log sistema',16,'delete_logsistema'),(64,'Can view log sistema',16,'view_logsistema'),(65,'Can add favorito',17,'add_favorito'),(66,'Can change favorito',17,'change_favorito'),(67,'Can delete favorito',17,'delete_favorito'),(68,'Can view favorito',17,'view_favorito'),(69,'Can add historial busqueda',18,'add_historialbusqueda'),(70,'Can change historial busqueda',18,'change_historialbusqueda'),(71,'Can delete historial busqueda',18,'delete_historialbusqueda'),(72,'Can view historial busqueda',18,'view_historialbusqueda');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_itinerario`
--

DROP TABLE IF EXISTS `detalle_itinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_itinerario` (
  `id_detalle` bigint NOT NULL AUTO_INCREMENT,
  `id_itinerario` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `tipo_item` enum('DESTINO','HOTEL','TRANSPORTE') NOT NULL,
  `api_id` varchar(100) DEFAULT NULL,
  `nombre_item` varchar(200) NOT NULL,
  `origen` varchar(255) DEFAULT NULL,
  `destinos` varchar(255) DEFAULT NULL,
  `fecha_salida` datetime DEFAULT NULL,
  `fecha_llegada` datetime DEFAULT NULL,
  `costo_estimado` decimal(10,2) DEFAULT NULL,
  `orden` int DEFAULT NULL,
  `personas` int NOT NULL DEFAULT '1',
  `presupuesto` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_detalle`),
  KEY `id_itinerario` (`id_itinerario`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `detalle_itinerario_ibfk_1` FOREIGN KEY (`id_itinerario`) REFERENCES `itinerario` (`id_itinerario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_itinerario_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor_api` (`id_proveedor`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_itinerario`
--

LOCK TABLES `detalle_itinerario` WRITE;
/*!40000 ALTER TABLE `detalle_itinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_itinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(17,'favoritos','favorito'),(18,'historial','historialbusqueda'),(12,'itinerarios','detalleitinerario'),(13,'itinerarios','favorito'),(14,'itinerarios','historialbusqueda'),(15,'itinerarios','itinerario'),(11,'itinerarios','proveedorapi'),(16,'logs','logsistema'),(6,'sessions','session'),(9,'usuarios','rol'),(10,'usuarios','sesion'),(7,'usuarios','usuario'),(8,'usuarios','usuariorol');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-10-27 05:02:35.826970'),(2,'auth','0001_initial','2025-10-27 05:02:36.416820'),(3,'admin','0001_initial','2025-10-27 05:02:36.598633'),(4,'admin','0002_logentry_remove_auto_add','2025-10-27 05:02:36.606154'),(5,'admin','0003_logentry_add_action_flag_choices','2025-10-27 05:02:36.613524'),(6,'contenttypes','0002_remove_content_type_name','2025-10-27 05:02:36.748310'),(7,'auth','0002_alter_permission_name_max_length','2025-10-27 05:02:36.818488'),(8,'auth','0003_alter_user_email_max_length','2025-10-27 05:02:36.838896'),(9,'auth','0004_alter_user_username_opts','2025-10-27 05:02:36.845386'),(10,'auth','0005_alter_user_last_login_null','2025-10-27 05:02:36.903484'),(11,'auth','0006_require_contenttypes_0002','2025-10-27 05:02:36.906064'),(12,'auth','0007_alter_validators_add_error_messages','2025-10-27 05:02:36.913079'),(13,'auth','0008_alter_user_username_max_length','2025-10-27 05:02:36.986926'),(14,'auth','0009_alter_user_last_name_max_length','2025-10-27 05:02:37.054581'),(15,'auth','0010_alter_group_name_max_length','2025-10-27 05:02:37.071762'),(16,'auth','0011_update_proxy_permissions','2025-10-27 05:02:37.078687'),(17,'auth','0012_alter_user_first_name_max_length','2025-10-27 05:02:37.146299'),(18,'sessions','0001_initial','2025-10-27 05:02:37.180431'),(19,'usuarios','0001_initial','2025-10-27 05:08:29.804056'),(20,'itinerarios','0001_initial','2025-10-27 05:11:32.877705'),(21,'logs','0001_initial','2025-10-27 05:15:19.085876'),(22,'usuarios','0002_remove_usuario_roles_alter_rol_nombre','2025-10-27 05:18:24.093691'),(23,'itinerarios','0002_remove_historialbusqueda_usuario_and_more','2025-10-27 05:20:14.136111'),(24,'favoritos','0001_initial','2025-10-27 05:20:45.171395'),(25,'historial','0001_initial','2025-10-27 05:21:11.687121'),(26,'usuarios','0003_usuario_codigo_verificacion','2025-10-27 05:33:30.177659'),(27,'usuarios','0004_alter_usuario_password_hash','2025-10-28 06:19:34.410024'),(28,'usuarios','0005_alter_usuario_telefono','2025-10-28 18:18:32.286916');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_favorito` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_recurso` enum('DESTINO','HOTEL','ITINERARIO','TRANSPORTE') NOT NULL,
  `id_recurso_local` int DEFAULT NULL,
  `api_id` varchar(100) DEFAULT NULL,
  `fecha_marcado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorito`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `favorito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos_favorito`
--

DROP TABLE IF EXISTS `favoritos_favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos_favorito` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_recurso` varchar(12) NOT NULL,
  `id_recurso_local` int DEFAULT NULL,
  `api_id` varchar(100) DEFAULT NULL,
  `fecha_marcado` datetime(6) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `favoritos_favorito_usuario_id_e55f88cb_fk_usuarios_usuario_id` (`usuario_id`),
  CONSTRAINT `favoritos_favorito_usuario_id_e55f88cb_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos_favorito`
--

LOCK TABLES `favoritos_favorito` WRITE;
/*!40000 ALTER TABLE `favoritos_favorito` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos_favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_busqueda`
--

DROP TABLE IF EXISTS `historial_busqueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_busqueda` (
  `id_historial` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `termino_busqueda` varchar(255) NOT NULL,
  `fecha_busqueda` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `origen` enum('WEB','MOBILE') NOT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historial_busqueda_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_busqueda`
--

LOCK TABLES `historial_busqueda` WRITE;
/*!40000 ALTER TABLE `historial_busqueda` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_busqueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_historialbusqueda`
--

DROP TABLE IF EXISTS `historial_historialbusqueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_historialbusqueda` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `termino_busqueda` varchar(255) NOT NULL,
  `fecha_busqueda` datetime(6) NOT NULL,
  `origen` varchar(6) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `historial_historialb_usuario_id_6b6c21cf_fk_usuarios_` (`usuario_id`),
  CONSTRAINT `historial_historialb_usuario_id_6b6c21cf_fk_usuarios_` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_historialbusqueda`
--

LOCK TABLES `historial_historialbusqueda` WRITE;
/*!40000 ALTER TABLE `historial_historialbusqueda` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_historialbusqueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerario`
--

DROP TABLE IF EXISTS `itinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerario` (
  `id_itinerario` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `notas` text,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_itinerario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `itinerario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerario`
--

LOCK TABLES `itinerario` WRITE;
/*!40000 ALTER TABLE `itinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerarios_detalleitinerario`
--

DROP TABLE IF EXISTS `itinerarios_detalleitinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerarios_detalleitinerario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_item` varchar(12) NOT NULL,
  `api_id` varchar(100) DEFAULT NULL,
  `nombre_item` varchar(200) NOT NULL,
  `origen` varchar(255) DEFAULT NULL,
  `destinos` varchar(255) DEFAULT NULL,
  `fecha_salida` datetime(6) DEFAULT NULL,
  `fecha_llegada` datetime(6) DEFAULT NULL,
  `costo_estimado` decimal(10,2) NOT NULL,
  `orden` int DEFAULT NULL,
  `personas` int NOT NULL,
  `presupuesto` decimal(10,2) NOT NULL,
  `itinerario_id` bigint NOT NULL,
  `proveedor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `itinerarios_detallei_itinerario_id_08828b00_fk_itinerari` (`itinerario_id`),
  KEY `itinerarios_detallei_proveedor_id_09f216df_fk_itinerari` (`proveedor_id`),
  CONSTRAINT `itinerarios_detallei_itinerario_id_08828b00_fk_itinerari` FOREIGN KEY (`itinerario_id`) REFERENCES `itinerarios_itinerario` (`id`),
  CONSTRAINT `itinerarios_detallei_proveedor_id_09f216df_fk_itinerari` FOREIGN KEY (`proveedor_id`) REFERENCES `itinerarios_proveedorapi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerarios_detalleitinerario`
--

LOCK TABLES `itinerarios_detalleitinerario` WRITE;
/*!40000 ALTER TABLE `itinerarios_detalleitinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerarios_detalleitinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerarios_itinerario`
--

DROP TABLE IF EXISTS `itinerarios_itinerario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerarios_itinerario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `notas` longtext,
  `creado_en` datetime(6) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `itinerarios_itinerar_usuario_id_d1eab861_fk_usuarios_` (`usuario_id`),
  CONSTRAINT `itinerarios_itinerar_usuario_id_d1eab861_fk_usuarios_` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerarios_itinerario`
--

LOCK TABLES `itinerarios_itinerario` WRITE;
/*!40000 ALTER TABLE `itinerarios_itinerario` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerarios_itinerario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerarios_proveedorapi`
--

DROP TABLE IF EXISTS `itinerarios_proveedorapi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerarios_proveedorapi` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `url_base` varchar(255) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerarios_proveedorapi`
--

LOCK TABLES `itinerarios_proveedorapi` WRITE;
/*!40000 ALTER TABLE `itinerarios_proveedorapi` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerarios_proveedorapi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_sistema`
--

DROP TABLE IF EXISTS `log_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_sistema` (
  `id_log` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `tipo_evento` enum('INFO','WARNING','ERROR') NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_evento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `log_sistema_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_sistema`
--

LOCK TABLES `log_sistema` WRITE;
/*!40000 ALTER TABLE `log_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_logsistema`
--

DROP TABLE IF EXISTS `logs_logsistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_logsistema` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_evento` varchar(7) NOT NULL,
  `descripcion` longtext NOT NULL,
  `fecha_evento` datetime(6) NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_logsistema_usuario_id_34d8b018_fk_usuarios_usuario_id` (`usuario_id`),
  CONSTRAINT `logs_logsistema_usuario_id_34d8b018_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_logsistema`
--

LOCK TABLES `logs_logsistema` WRITE;
/*!40000 ALTER TABLE `logs_logsistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_logsistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor_api`
--

DROP TABLE IF EXISTS `proveedor_api`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor_api` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `url_base` varchar(255) NOT NULL,
  `tipo` enum('TRANSPORTE','VUELO','HOTEL') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor_api`
--

LOCK TABLES `proveedor_api` WRITE;
/*!40000 ALTER TABLE `proveedor_api` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedor_api` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id_sesion` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `ip_origen` varchar(45) NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_expiracion` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_sesion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `sesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion`
--

LOCK TABLES `sesion` WRITE;
/*!40000 ALTER TABLE `sesion` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(128) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `idioma_preferido` varchar(10) DEFAULT 'es',
  `moneda_preferida` varchar(10) DEFAULT 'MXN',
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `codigo_verificacion` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `id_usuario` int DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_rol`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_rol`
--

DROP TABLE IF EXISTS `usuarios_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_rol` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_rol`
--

LOCK TABLES `usuarios_rol` WRITE;
/*!40000 ALTER TABLE `usuarios_rol` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_sesion`
--

DROP TABLE IF EXISTS `usuarios_sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_sesion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ip_origen` varchar(45) NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `fecha_inicio` datetime(6) NOT NULL,
  `fecha_expiracion` datetime(6) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuarios_sesion_usuario_id_424dc6f4_fk_usuarios_usuario_id` (`usuario_id`),
  CONSTRAINT `usuarios_sesion_usuario_id_424dc6f4_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_sesion`
--

LOCK TABLES `usuarios_sesion` WRITE;
/*!40000 ALTER TABLE `usuarios_sesion` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_usuario`
--

DROP TABLE IF EXISTS `usuarios_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(128) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `idioma_preferido` varchar(10) NOT NULL,
  `moneda_preferida` varchar(10) NOT NULL,
  `email_verificado` tinyint(1) NOT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo_verificacion` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_usuario`
--

LOCK TABLES `usuarios_usuario` WRITE;
/*!40000 ALTER TABLE `usuarios_usuario` DISABLE KEYS */;
INSERT INTO `usuarios_usuario` VALUES (12,'Senen Juarez Tinoco','senen.juarez@gmail.com','pbkdf2_sha256$1000000$hmvvqKMSHTtEKI6cv2un6b$T/JpFlIEdEWH/GAB1+ebckcc5ahGBes2q/QJoo3iO9s=','','es','MXN',1,'2025-10-28 19:19:17.675341',1,NULL);
/*!40000 ALTER TABLE `usuarios_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_usuariorol`
--

DROP TABLE IF EXISTS `usuarios_usuariorol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_usuariorol` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rol_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuariorol_usuario_id_rol_id_7e053d9b_uniq` (`usuario_id`,`rol_id`),
  KEY `usuarios_usuariorol_rol_id_9ab2a472_fk_usuarios_rol_id` (`rol_id`),
  CONSTRAINT `usuarios_usuariorol_rol_id_9ab2a472_fk_usuarios_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `usuarios_rol` (`id`),
  CONSTRAINT `usuarios_usuariorol_usuario_id_d8904b57_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_usuariorol`
--

LOCK TABLES `usuarios_usuariorol` WRITE;
/*!40000 ALTER TABLE `usuarios_usuariorol` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_usuariorol` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 21:39:06
