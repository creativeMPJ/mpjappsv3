-- CreateTable
CREATE TABLE `letters` (
    `id` VARCHAR(36) NOT NULL,
    `direction` ENUM('incoming', 'outgoing') NOT NULL,
    `scope` ENUM('pusat', 'regional') NOT NULL,
    `region_id` VARCHAR(36) NULL,
    `letter_number` VARCHAR(191) NULL,
    `origin_number` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `document_type` ENUM('surat_keputusan', 'surat_tugas', 'surat_undangan', 'surat_edaran', 'surat_keterangan', 'surat_rekomendasi', 'berita_acara', 'lainnya') NOT NULL,
    `sender_name` VARCHAR(191) NULL,
    `recipient_name` VARCHAR(191) NULL,
    `signer_name` VARCHAR(191) NULL,
    `signer_position` VARCHAR(191) NULL,
    `letter_date` DATETIME(0) NULL,
    `received_at` DATETIME(0) NULL,
    `status` ENUM('draft', 'registered', 'finalized', 'archived', 'rejected') NOT NULL DEFAULT 'draft',
    `final_file_url` VARCHAR(191) NULL,
    `scan_file_url` VARCHAR(191) NULL,
    `validation_qr_url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_id` VARCHAR(36) NOT NULL,
    `updated_by_id` VARCHAR(36) NULL,
    `archived_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `letters_direction_idx`(`direction`),
    INDEX `letters_scope_idx`(`scope`),
    INDEX `letters_region_id_idx`(`region_id`),
    INDEX `letters_status_idx`(`status`),
    INDEX `letters_letter_date_idx`(`letter_date`),
    INDEX `letters_created_at_idx`(`created_at`),
    INDEX `letters_scope_region_id_direction_status_idx`(`scope`, `region_id`, `direction`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `signatures` (
    `id` VARCHAR(36) NOT NULL,
    `scope` ENUM('pusat', 'regional') NOT NULL,
    `region_id` VARCHAR(36) NULL,
    `leader_name` VARCHAR(191) NOT NULL,
    `position_name` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` VARCHAR(36) NOT NULL,
    `updated_by_id` VARCHAR(36) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `signatures_scope_idx`(`scope`),
    INDEX `signatures_region_id_idx`(`region_id`),
    INDEX `signatures_is_active_idx`(`is_active`),
    INDEX `signatures_scope_region_id_position_name_idx`(`scope`, `region_id`, `position_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_positions` (
    `id` VARCHAR(36) NOT NULL,
    `scope` ENUM('pusat', 'regional') NOT NULL,
    `region_id` VARCHAR(36) NULL,
    `document_type` ENUM('surat_keputusan', 'surat_tugas', 'surat_undangan', 'surat_edaran', 'surat_keterangan', 'surat_rekomendasi', 'berita_acara', 'lainnya') NOT NULL,
    `number_x` DECIMAL(10, 2) NOT NULL,
    `number_y` DECIMAL(10, 2) NOT NULL,
    `signature_x` DECIMAL(10, 2) NOT NULL,
    `signature_y` DECIMAL(10, 2) NOT NULL,
    `qr_x` DECIMAL(10, 2) NOT NULL,
    `qr_y` DECIMAL(10, 2) NOT NULL,
    `font_size` INTEGER NOT NULL,
    `target_page` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` VARCHAR(36) NOT NULL,
    `updated_by_id` VARCHAR(36) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `template_positions_scope_idx`(`scope`),
    INDEX `template_positions_region_id_idx`(`region_id`),
    INDEX `template_positions_document_type_idx`(`document_type`),
    INDEX `template_positions_is_active_idx`(`is_active`),
    INDEX `template_positions_scope_region_id_document_type_idx`(`scope`, `region_id`, `document_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_positions` ADD CONSTRAINT `template_positions_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_positions` ADD CONSTRAINT `template_positions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_positions` ADD CONSTRAINT `template_positions_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
