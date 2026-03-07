-- CreateTable
CREATE TABLE `regions` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `regions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'upcoming',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_reports` (
    `id` VARCHAR(36) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `region_id` VARCHAR(36) NOT NULL,
    `participation_count` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `photo_url` VARCHAR(191) NULL,
    `submitted_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(36) NOT NULL,
    `role` ENUM('user', 'admin_regional', 'admin_pusat', 'admin_finance', 'coordinator', 'crew') NOT NULL DEFAULT 'user',
    `status_account` ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
    `status_payment` ENUM('paid', 'unpaid', 'expired') NOT NULL DEFAULT 'unpaid',
    `profile_level` ENUM('basic', 'silver', 'gold', 'platinum') NOT NULL DEFAULT 'basic',
    `nama_pesantren` VARCHAR(191) NULL,
    `nama_pengasuh` VARCHAR(191) NULL,
    `nama_media` VARCHAR(191) NULL,
    `alamat_singkat` TEXT NULL,
    `no_wa_pendaftar` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NULL,
    `city_id` VARCHAR(36) NULL,
    `region_id` VARCHAR(36) NULL,
    `logo_url` VARCHAR(191) NULL,
    `foto_pengasuh_url` VARCHAR(191) NULL,
    `sk_pesantren_url` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `jumlah_santri` INTEGER NULL,
    `tipe_pesantren` VARCHAR(191) NULL,
    `program_unggulan` JSON NULL,
    `sejarah` TEXT NULL,
    `visi_misi` TEXT NULL,
    `social_links` JSON NULL,
    `is_alumni` BOOLEAN NOT NULL DEFAULT false,
    `niam` VARCHAR(191) NULL,
    `alamat_lengkap` TEXT NULL,
    `kecamatan` VARCHAR(191) NULL,
    `desa` VARCHAR(191) NULL,
    `kode_pos` VARCHAR(191) NULL,
    `maps_link` VARCHAR(191) NULL,
    `ketua_media` VARCHAR(191) NULL,
    `tahun_berdiri` VARCHAR(191) NULL,
    `jumlah_kru` INTEGER NULL,
    `logo_media_path` VARCHAR(191) NULL,
    `foto_gedung_path` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `tiktok` VARCHAR(191) NULL,
    `jenjang_pendidikan` JSON NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `profiles_niam_key`(`niam`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `role` ENUM('user', 'admin_regional', 'admin_pusat', 'admin_finance', 'coordinator', 'crew') NOT NULL DEFAULT 'user',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_roles_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesantren_claims` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `pesantren_name` VARCHAR(191) NOT NULL,
    `jenis_pengajuan` ENUM('klaim', 'pesantren_baru') NOT NULL DEFAULT 'pesantren_baru',
    `status` ENUM('pending', 'regional_approved', 'pusat_approved', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `region_id` VARCHAR(36) NULL,
    `kecamatan` VARCHAR(191) NULL,
    `nama_pengelola` VARCHAR(191) NULL,
    `email_pengelola` VARCHAR(191) NULL,
    `dokumen_bukti_url` VARCHAR(191) NULL,
    `mpj_id_number` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `approved_by` VARCHAR(36) NULL,
    `approved_at` DATETIME(0) NULL,
    `regional_approved_at` DATETIME(0) NULL,
    `claimed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `pesantren_claim_id` VARCHAR(36) NOT NULL,
    `pricing_package_id` VARCHAR(36) NULL,
    `base_amount` INTEGER NOT NULL,
    `unique_code` INTEGER NOT NULL,
    `total_amount` INTEGER NOT NULL,
    `status` ENUM('pending_payment', 'pending_verification', 'verified', 'rejected') NOT NULL DEFAULT 'pending_payment',
    `proof_file_url` VARCHAR(191) NULL,
    `rejection_reason` TEXT NULL,
    `verified_by` VARCHAR(36) NULL,
    `verified_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_packages` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('registration', 'renewal', 'upgrade') NOT NULL,
    `harga_paket` INTEGER NOT NULL,
    `harga_diskon` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jabatan_codes` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crews` (
    `id` VARCHAR(36) NOT NULL,
    `profile_id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NULL,
    `jabatan_code_id` VARCHAR(36) NULL,
    `niam` VARCHAR(191) NULL,
    `skill` JSON NULL,
    `xp_level` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` VARCHAR(36) NOT NULL,
    `user_phone` VARCHAR(191) NOT NULL,
    `otp_code` VARCHAR(191) NOT NULL,
    `pesantren_claim_id` VARCHAR(36) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expires_at` DATETIME(0) NOT NULL,
    `verified_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_up_logs` (
    `id` VARCHAR(36) NOT NULL,
    `admin_id` VARCHAR(36) NOT NULL,
    `claim_id` VARCHAR(36) NOT NULL,
    `region_id` VARCHAR(36) NOT NULL,
    `action_type` VARCHAR(191) NOT NULL DEFAULT 'whatsapp_followup',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_requests` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `processed_by` VARCHAR(36) NULL,
    `processed_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_reports` ADD CONSTRAINT `event_reports_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_reports` ADD CONSTRAINT `event_reports_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesantren_claims` ADD CONSTRAINT `pesantren_claims_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesantren_claims` ADD CONSTRAINT `pesantren_claims_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_pesantren_claim_id_fkey` FOREIGN KEY (`pesantren_claim_id`) REFERENCES `pesantren_claims`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_pricing_package_id_fkey` FOREIGN KEY (`pricing_package_id`) REFERENCES `pricing_packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crews` ADD CONSTRAINT `crews_jabatan_code_id_fkey` FOREIGN KEY (`jabatan_code_id`) REFERENCES `jabatan_codes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crews` ADD CONSTRAINT `crews_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_verifications` ADD CONSTRAINT `otp_verifications_pesantren_claim_id_fkey` FOREIGN KEY (`pesantren_claim_id`) REFERENCES `pesantren_claims`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_logs` ADD CONSTRAINT `follow_up_logs_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `pesantren_claims`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_logs` ADD CONSTRAINT `follow_up_logs_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
