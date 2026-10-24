CREATE DATABASE IF NOT EXISTS oasis_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oasis_web;

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  brand LONGTEXT NOT NULL,
  hero LONGTEXT NOT NULL,
  sections LONGTEXT NOT NULL,
  contact LONGTEXT NOT NULL,
  content LONGTEXT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_items (
  collection VARCHAR(32) NOT NULL,
  item_id VARCHAR(191) NOT NULL,
  position INT NOT NULL,
  content LONGTEXT NOT NULL,
  PRIMARY KEY (collection, item_id),
  INDEX content_items_order (collection, position)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message LONGTEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX contact_messages_inbox (is_read, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
