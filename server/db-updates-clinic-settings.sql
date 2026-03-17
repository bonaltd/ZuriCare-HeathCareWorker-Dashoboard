-- =============================================================================
-- ZuriCare - Database updates for Clinic Settings feature
-- =============================================================================
-- Run this script on an existing ZuriCare database to add:
--   - Clinic coordinates (latitude, longitude)
--   - Website and description fields
--   - Operating hours for demo clinic
--   - Demo clinic services and consent defaults
--
-- Usage: mysql -u root -p zuricare < db-updates-clinic-settings.sql
-- Safe to run multiple times (idempotent).
-- =============================================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- 1. Add new columns to clinics table (only if they don't exist)
-- -----------------------------------------------------------------------------

DROP PROCEDURE IF EXISTS _zuricare_add_clinic_columns;

DELIMITER //

CREATE PROCEDURE _zuricare_add_clinic_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clinics' AND COLUMN_NAME = 'latitude'
  ) THEN
    ALTER TABLE `clinics` ADD COLUMN `latitude` DECIMAL(10, 8) NULL COMMENT 'GPS latitude' AFTER `location`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clinics' AND COLUMN_NAME = 'longitude'
  ) THEN
    ALTER TABLE `clinics` ADD COLUMN `longitude` DECIMAL(11, 8) NULL COMMENT 'GPS longitude' AFTER `latitude`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clinics' AND COLUMN_NAME = 'website'
  ) THEN
    ALTER TABLE `clinics` ADD COLUMN `website` VARCHAR(500) NULL AFTER `email`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clinics' AND COLUMN_NAME = 'description'
  ) THEN
    ALTER TABLE `clinics` ADD COLUMN `description` TEXT NULL AFTER `website`;
  END IF;
END //

DELIMITER ;

CALL _zuricare_add_clinic_columns();
DROP PROCEDURE _zuricare_add_clinic_columns;

-- -----------------------------------------------------------------------------
-- 2. Operating hours for demo clinic
-- -----------------------------------------------------------------------------

UPDATE `clinics`
SET `hours` = 'Mon–Fri 8am–6pm, Sat 9am–1pm'
WHERE `id` = '00000000-0000-0000-0000-000000000001'
  AND (`hours` IS NULL OR TRIM(`hours`) = '');

-- -----------------------------------------------------------------------------
-- 3. Demo clinic services (only if demo clinic has none)
-- -----------------------------------------------------------------------------

INSERT INTO `clinic_services` (`id`, `clinic_id`, `service_name`)
SELECT UUID(), '00000000-0000-0000-0000-000000000001', s FROM (
  SELECT 'Vaccinations' AS s
  UNION SELECT 'Maternal care'
  UNION SELECT 'Refugee support'
  UNION SELECT 'General practice'
  UNION SELECT 'Emergency care'
  UNION SELECT 'Mental health'
  UNION SELECT 'HIV/TB care'
  UNION SELECT 'Laboratory'
) t
WHERE NOT EXISTS (
  SELECT 1 FROM clinic_services
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001'
  LIMIT 1
);

-- -----------------------------------------------------------------------------
-- 4. Demo consent defaults (clinic_settings)
-- -----------------------------------------------------------------------------

INSERT INTO `clinic_settings` (`id`, `clinic_id`, `setting_key`, `setting_value`) VALUES
(UUID(), '00000000-0000-0000-0000-000000000001', 'consent_timeout', '24'),
(UUID(), '00000000-0000-0000-0000-000000000001', 'default_scopes', '["allergies","bloodType","chronicConditions"]')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- -----------------------------------------------------------------------------
-- Done
-- -----------------------------------------------------------------------------
