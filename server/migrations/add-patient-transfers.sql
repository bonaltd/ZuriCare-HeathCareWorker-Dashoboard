-- Run this ONLY if you have an existing database created before the patient_transfers feature.
-- Skip if you ran the full zuricare_schema.sql fresh (it already includes country + patient_transfers).

-- Add country to clinics (may fail if column already exists - that's ok)
ALTER TABLE `clinics` ADD COLUMN `country` VARCHAR(100) NULL COMMENT 'Country for patient transfer' AFTER `location`;
