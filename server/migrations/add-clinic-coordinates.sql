-- Add coordinates and extra facility info to clinics
-- Run manually if columns already exist (ignore errors)
ALTER TABLE `clinics` ADD COLUMN `latitude` DECIMAL(10, 8) NULL COMMENT 'GPS latitude' AFTER `location`;
ALTER TABLE `clinics` ADD COLUMN `longitude` DECIMAL(11, 8) NULL COMMENT 'GPS longitude' AFTER `latitude`;
ALTER TABLE `clinics` ADD COLUMN `website` VARCHAR(500) NULL AFTER `email`;
ALTER TABLE `clinics` ADD COLUMN `description` TEXT NULL AFTER `website`;
