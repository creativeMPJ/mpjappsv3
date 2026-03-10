-- MySQL dump 10.13  Distrib 8.4.6, for macos12.7 (x86_64)
--
-- Host: 127.0.0.1    Database: mpjappsv3
-- ------------------------------------------------------
-- Server version	8.0.31

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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('1b4acf3f-ad80-4868-bdd1-2231b9baeda1','5a39165e49f08b4b82583f9f6a90c05783d24a777b2e73ba00900db64b39ca70','2026-03-07 15:17:04.999','20260307151704_init_mysql',NULL,NULL,'2026-03-07 15:17:04.296',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cities_region_id_fkey` (`region_id`),
  CONSTRAINT `cities_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES ('7598cad9-5ad5-4f16-b3f2-da765e7c68e2','Kota Surabaya','27618204-7686-497d-a046-dd9b03e2fd52','2026-03-07 15:17:15');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crews`
--

DROP TABLE IF EXISTS `crews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crews` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jabatan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jabatan_code_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niam` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skill` json DEFAULT NULL,
  `xp_level` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `crews_jabatan_code_id_fkey` (`jabatan_code_id`),
  KEY `crews_profile_id_fkey` (`profile_id`),
  CONSTRAINT `crews_jabatan_code_id_fkey` FOREIGN KEY (`jabatan_code_id`) REFERENCES `jabatan_codes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `crews_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crews`
--

LOCK TABLES `crews` WRITE;
/*!40000 ALTER TABLE `crews` DISABLE KEYS */;
/*!40000 ALTER TABLE `crews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_reports`
--

DROP TABLE IF EXISTS `event_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_reports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participation_count` int NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_reports_event_id_fkey` (`event_id`),
  KEY `event_reports_region_id_fkey` (`region_id`),
  CONSTRAINT `event_reports_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `event_reports_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_reports`
--

LOCK TABLES `event_reports` WRITE;
/*!40000 ALTER TABLE `event_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` datetime(3) NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'upcoming',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow_up_logs`
--

DROP TABLE IF EXISTS `follow_up_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow_up_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `claim_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'whatsapp_followup',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `follow_up_logs_claim_id_fkey` (`claim_id`),
  KEY `follow_up_logs_region_id_fkey` (`region_id`),
  CONSTRAINT `follow_up_logs_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `pesantren_claims` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `follow_up_logs_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow_up_logs`
--

LOCK TABLES `follow_up_logs` WRITE;
/*!40000 ALTER TABLE `follow_up_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `follow_up_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jabatan_codes`
--

DROP TABLE IF EXISTS `jabatan_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jabatan_codes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jabatan_codes`
--

LOCK TABLES `jabatan_codes` WRITE;
/*!40000 ALTER TABLE `jabatan_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `jabatan_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesantren_claim_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `attempts` int NOT NULL DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `otp_verifications_pesantren_claim_id_fkey` (`pesantren_claim_id`),
  CONSTRAINT `otp_verifications_pesantren_claim_id_fkey` FOREIGN KEY (`pesantren_claim_id`) REFERENCES `pesantren_claims` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_requests`
--

DROP TABLE IF EXISTS `password_reset_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `processed_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_requests`
--

LOCK TABLES `password_reset_requests` WRITE;
/*!40000 ALTER TABLE `password_reset_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesantren_claim_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricing_package_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_amount` int NOT NULL,
  `unique_code` int NOT NULL,
  `total_amount` int NOT NULL,
  `status` enum('pending_payment','pending_verification','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_payment',
  `proof_file_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `verified_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_pesantren_claim_id_fkey` (`pesantren_claim_id`),
  KEY `payments_user_id_fkey` (`user_id`),
  KEY `payments_pricing_package_id_fkey` (`pricing_package_id`),
  CONSTRAINT `payments_pesantren_claim_id_fkey` FOREIGN KEY (`pesantren_claim_id`) REFERENCES `pesantren_claims` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `payments_pricing_package_id_fkey` FOREIGN KEY (`pricing_package_id`) REFERENCES `pricing_packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pesantren_claims`
--

DROP TABLE IF EXISTS `pesantren_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pesantren_claims` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesantren_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_pengajuan` enum('klaim','pesantren_baru') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pesantren_baru',
  `status` enum('pending','regional_approved','pusat_approved','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `region_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kecamatan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_pengelola` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_pengelola` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dokumen_bukti_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mpj_id_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `regional_approved_at` datetime DEFAULT NULL,
  `claimed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pesantren_claims_region_id_fkey` (`region_id`),
  KEY `pesantren_claims_user_id_fkey` (`user_id`),
  CONSTRAINT `pesantren_claims_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pesantren_claims_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pesantren_claims`
--

LOCK TABLES `pesantren_claims` WRITE;
/*!40000 ALTER TABLE `pesantren_claims` DISABLE KEYS */;
/*!40000 ALTER TABLE `pesantren_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing_packages`
--

DROP TABLE IF EXISTS `pricing_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_packages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('registration','renewal','upgrade') COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga_paket` int NOT NULL,
  `harga_diskon` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing_packages`
--

LOCK TABLES `pricing_packages` WRITE;
/*!40000 ALTER TABLE `pricing_packages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin_regional','admin_pusat','admin_finance','coordinator','crew') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status_account` enum('pending','active','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status_payment` enum('paid','unpaid','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `profile_level` enum('basic','silver','gold','platinum') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'basic',
  `nama_pesantren` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_pengasuh` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_media` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat_singkat` text COLLATE utf8mb4_unicode_ci,
  `no_wa_pendaftar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_pengasuh_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sk_pesantren_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `jumlah_santri` int DEFAULT NULL,
  `tipe_pesantren` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `program_unggulan` json DEFAULT NULL,
  `sejarah` text COLLATE utf8mb4_unicode_ci,
  `visi_misi` text COLLATE utf8mb4_unicode_ci,
  `social_links` json DEFAULT NULL,
  `is_alumni` tinyint(1) NOT NULL DEFAULT '0',
  `niam` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat_lengkap` text COLLATE utf8mb4_unicode_ci,
  `kecamatan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kode_pos` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maps_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ketua_media` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_berdiri` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah_kru` int DEFAULT NULL,
  `logo_media_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_gedung_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenjang_pendidikan` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_niam_key` (`niam`),
  KEY `profiles_city_id_fkey` (`city_id`),
  KEY `profiles_region_id_fkey` (`region_id`),
  CONSTRAINT `profiles_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `profiles_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES ('1cf33930-e80c-4eeb-aa8e-70127f98ba36','admin_pusat','active','unpaid','basic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 15:17:16','2026-03-07 15:17:16'),('5f03a3b7-eeab-4463-bd7c-80f6abf55973','user','active','unpaid','basic','Pesantren Nurul Huda','KH. Ahmad',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 15:20:30','2026-03-07 15:20:30'),('61b13a81-d677-48ca-8635-ae5f18fe38c0','admin_pusat','active','unpaid','basic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 15:20:30','2026-03-07 15:20:30'),('623c6243-8705-405f-98a3-6a627fcc88f2','admin_regional','active','unpaid','basic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'27618204-7686-497d-a046-dd9b03e2fd52',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 15:20:30','2026-03-07 15:20:30'),('f37c298b-f7f5-4e22-ae7e-bca47c9c689a','admin_finance','active','unpaid','basic',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 15:20:30','2026-03-07 15:20:30');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `regions_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES ('27618204-7686-497d-a046-dd9b03e2fd52','Jawa Timur','35','2026-03-07 15:17:15');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('7243b735-9667-46bf-ab8b-61d6badc24f5','claim_base_price','20000','Harga dasar klaim akun lama','2026-03-07 15:17:15','2026-03-07 15:17:15'),('7726cdeb-6b26-494e-9abf-4d2c2661c29d','registration_base_price','50000','Harga dasar pendaftaran pesantren baru','2026-03-07 15:17:15','2026-03-07 15:17:15');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin_regional','admin_pusat','admin_finance','coordinator','crew') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_roles_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('44b3a203-28dc-4b76-921a-48d86761c3b4','1cf33930-e80c-4eeb-aa8e-70127f98ba36','admin_pusat','2026-03-07 15:17:16'),('5ab3ba71-4361-4fff-b6d6-cd6f0f61f75e','623c6243-8705-405f-98a3-6a627fcc88f2','admin_regional','2026-03-07 15:20:30'),('88b9c28d-e888-4c99-9f52-6222b2b2dc29','61b13a81-d677-48ca-8635-ae5f18fe38c0','admin_pusat','2026-03-07 15:20:30'),('a1c8f3aa-cb3a-44f6-a116-2260e353a951','f37c298b-f7f5-4e22-ae7e-bca47c9c689a','admin_finance','2026-03-07 15:20:30'),('ea2e91fa-0d39-4e56-b283-5833d2001ba3','5f03a3b7-eeab-4463-bd7c-80f6abf55973','user','2026-03-07 15:20:30');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1cf33930-e80c-4eeb-aa8e-70127f98ba36','admin@gmail.com','$2b$10$WmJSZqO3AGKS5HP07hkAXOTYqJWE4gc9fp8Cg8ICOVJjdc/xgeIxu','2026-03-07 15:17:16','2026-03-07 15:17:16'),('5f03a3b7-eeab-4463-bd7c-80f6abf55973','user@mpj.id','$2b$10$.MTmZ9HEH/6jU3NXhcHZs.0HgSuJUQt74EQ83U8rnw6fZSLzDh0/q','2026-03-07 15:20:30','2026-03-07 15:20:30'),('61b13a81-d677-48ca-8635-ae5f18fe38c0','pusat@mpj.id','$2b$10$6/av21iDbmCsIJB2e5ztcuWJ9MvKgPFPfDEMe7mO1IhpLjHHYsccy','2026-03-07 15:20:30','2026-03-07 15:20:30'),('623c6243-8705-405f-98a3-6a627fcc88f2','regional@mpj.id','$2b$10$C9ozsj64WJoG59oy1LM4BOp06uyoMq5l75i/F5vkO6sko1ZLEXDuG','2026-03-07 15:20:30','2026-03-07 15:20:30'),('f37c298b-f7f5-4e22-ae7e-bca47c9c689a','finance@mpj.id','$2b$10$IE/7OtttwBjzQ5yvoqMDYeZ/JzNIxh5W5ovRgCCWws4jvr6zwgIrq','2026-03-07 15:20:30','2026-03-07 15:20:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-07 22:29:11
