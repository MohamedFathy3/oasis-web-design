-- CreateTable
CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` TINYINT UNSIGNED NOT NULL,
    `brand` LONGTEXT NOT NULL,
    `hero` LONGTEXT NOT NULL,
    `sections` LONGTEXT NOT NULL,
    `contact` LONGTEXT NOT NULL,
    `content` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `content_items` (
    `collection` VARCHAR(32) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,

    INDEX `content_items_order`(`collection`, `position`),
    PRIMARY KEY (`collection`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

