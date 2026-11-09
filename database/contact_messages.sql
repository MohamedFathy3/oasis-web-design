CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `subject` VARCHAR(160) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `contact_messages_inbox` (`is_read`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
