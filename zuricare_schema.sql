-- =============================================================================
-- ZuriCare - Full Database Schema (MariaDB / MySQL)
-- =============================================================================
-- Digital health identity for mobile populations across Africa
-- Patient Mobile App + Healthcare Worker Dashboard
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. CORE: Clinics & Facilities
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clinics` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('clinic', 'hospital', 'ngo', 'refugee_support', 'maternal', 'vaccination') NOT NULL DEFAULT 'clinic',
  `address` VARCHAR(500) NULL,
  `location` VARCHAR(255) NULL,
  `latitude` DECIMAL(10, 8) NULL COMMENT 'GPS latitude',
  `longitude` DECIMAL(11, 8) NULL COMMENT 'GPS longitude',
  `country` VARCHAR(100) NULL COMMENT 'Country for patient transfer',
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `website` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `hours` VARCHAR(100) NULL,
  `open_24_7` TINYINT(1) NOT NULL DEFAULT 0,
  `refugee_friendly` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_clinics_type` (`type`),
  INDEX `idx_clinics_location` (`location`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clinic_services` (
  `id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `service_name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_clinic_services_clinic` (`clinic_id`),
  CONSTRAINT `fk_clinic_services_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. CORE: Roles & Permissions (Healthcare Worker Dashboard)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roles` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `permissions` JSON NULL COMMENT 'JSON array of permission keys',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. CORE: Clinic Staff (Healthcare Workers)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clinic_staff` (
  `id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clinic_staff_email_clinic` (`clinic_id`, `email`),
  INDEX `idx_clinic_staff_clinic` (`clinic_id`),
  INDEX `idx_clinic_staff_role` (`role_id`),
  INDEX `idx_clinic_staff_email` (`email`),
  CONSTRAINT `fk_clinic_staff_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_clinic_staff_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. CORE: Patients (ZuriCare ID holders)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patients` (
  `id` CHAR(36) NOT NULL,
  `zuri_care_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE NULL,
  `nationality` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `pin_hash` VARCHAR(255) NULL COMMENT 'Hashed PIN for app login',
  `registration_clinic_id` CHAR(36) NULL,
  `mosip_rid` VARCHAR(100) NULL COMMENT 'MOSIP registration ID if verified',
  `language_preference` VARCHAR(10) NOT NULL DEFAULT 'en',
  `offline_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_patients_zuri_care_id` (`zuri_care_id`),
  INDEX `idx_patients_clinic` (`registration_clinic_id`),
  INDEX `idx_patients_phone` (`phone`),
  INDEX `idx_patients_name` (`full_name`(100)),
  CONSTRAINT `fk_patients_clinic` FOREIGN KEY (`registration_clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. HEALTH PROFILE: Demographics & Core Health Data
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patient_health_profiles` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `blood_type` VARCHAR(10) NULL COMMENT 'e.g. O+, A-, AB+',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_health_profile_patient` (`patient_id`),
  CONSTRAINT `fk_health_profile_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patient_allergies` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `allergy` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_allergies_patient` (`patient_id`),
  CONSTRAINT `fk_allergies_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patient_chronic_conditions` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `condition` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_chronic_patient` (`patient_id`),
  CONSTRAINT `fk_chronic_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patient_vaccinations` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `vaccine_name` VARCHAR(255) NOT NULL,
  `date_administered` DATE NULL,
  `notes` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_vaccinations_patient` (`patient_id`),
  CONSTRAINT `fk_vaccinations_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patient_emergency_contacts` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `relationship` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_patient` (`patient_id`),
  CONSTRAINT `fk_emergency_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PRESCRIPTIONS (Medical History)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(255) NULL,
  `prescriber_id` CHAR(36) NULL,
  `prescriber_name` VARCHAR(255) NULL,
  `date_prescribed` DATE NOT NULL,
  `duration` VARCHAR(100) NULL COMMENT 'e.g. 7 days, Ongoing',
  `condition` VARCHAR(255) NULL,
  `pharmacy` VARCHAR(255) NULL,
  `status` ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prescriptions_patient` (`patient_id`),
  INDEX `idx_prescriptions_prescriber` (`prescriber_id`),
  INDEX `idx_prescriptions_status` (`status`),
  INDEX `idx_prescriptions_date` (`date_prescribed`),
  CONSTRAINT `fk_prescriptions_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prescriptions_prescriber` FOREIGN KEY (`prescriber_id`) REFERENCES `clinic_staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. CONSENT: Access Requests & Grants
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `consent_requests` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `requester_id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `scopes_requested` JSON NOT NULL COMMENT 'Array: allergies, bloodType, chronicConditions, vaccinationHistory, prescriptionHistory, emergencyContact',
  `scopes_granted` JSON NULL COMMENT 'Array of scopes patient agreed to share',
  `status` ENUM('pending', 'granted', 'denied', 'expired') NOT NULL DEFAULT 'pending',
  `reason` VARCHAR(500) NULL COMMENT 'Optional reason for request',
  `expires_at` DATETIME NULL COMMENT 'When request expires if no response',
  `consent_expires_at` DATETIME NULL COMMENT 'When granted consent expires (e.g. 24h, 30 days)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_consent_patient` (`patient_id`),
  INDEX `idx_consent_requester` (`requester_id`),
  INDEX `idx_consent_clinic` (`clinic_id`),
  INDEX `idx_consent_status` (`status`),
  INDEX `idx_consent_created` (`created_at`),
  CONSTRAINT `fk_consent_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consent_requester` FOREIGN KEY (`requester_id`) REFERENCES `clinic_staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consent_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consent_revocations` (
  `id` CHAR(36) NOT NULL,
  `consent_request_id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `revoked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_revocation_consent` (`consent_request_id`),
  CONSTRAINT `fk_revocation_consent` FOREIGN KEY (`consent_request_id`) REFERENCES `consent_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_revocation_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. SCREENING: Self-Screening History (Patient App)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `screening_history` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NULL COMMENT 'NULL if screening before sync/link',
  `category` VARCHAR(255) NULL COMMENT 'e.g. Respiratory, General, Digestive',
  `symptoms` JSON NULL COMMENT 'Array of symptom labels with severity',
  `recommendation` VARCHAR(50) NULL COMMENT 'urgent, moderate, mild',
  `duration` VARCHAR(50) NULL COMMENT 'days, weeks',
  `risk_factors_count` INT NOT NULL DEFAULT 0,
  `timestamp` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_screening_patient` (`patient_id`),
  INDEX `idx_screening_timestamp` (`timestamp`),
  CONSTRAINT `fk_screening_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. AUDIT: Access & Activity Logs
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL,
  `actor_type` ENUM('patient', 'clinic_staff', 'system') NOT NULL,
  `actor_id` CHAR(36) NULL COMMENT 'patient_id or clinic_staff_id',
  `patient_id` CHAR(36) NULL COMMENT 'Patient affected by action',
  `action` VARCHAR(100) NOT NULL COMMENT 'e.g. consent_request, consent_granted, medical_summary_viewed',
  `entity_type` VARCHAR(50) NULL COMMENT 'e.g. consent_request, prescription',
  `entity_id` CHAR(36) NULL,
  `details` JSON NULL COMMENT 'Additional context',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_actor` (`actor_type`, `actor_id`),
  INDEX `idx_audit_patient` (`patient_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. NOTIFICATIONS (Patient App)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `type` VARCHAR(50) NULL COMMENT 'e.g. screening, consent_request, health_tip',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `data` JSON NULL COMMENT 'e.g. consent_request_id for deep linking',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_patient` (`patient_id`),
  INDEX `idx_notifications_read` (`is_read`),
  INDEX `idx_notifications_created` (`created_at`),
  CONSTRAINT `fk_notifications_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. MOSIP: Identity Verification (Optional Integration)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mosip_registrations` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `mosip_rid` VARCHAR(100) NOT NULL,
  `national_id` VARCHAR(100) NULL,
  `verification_status` ENUM('pending', 'verified', 'failed') NOT NULL DEFAULT 'pending',
  `demographic_data` JSON NULL,
  `verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mosip_patient` (`patient_id`),
  INDEX `idx_mosip_rid` (`mosip_rid`),
  CONSTRAINT `fk_mosip_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. DEVICE / APP: Patient App Sessions (for sync & push)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patient_devices` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `device_id` VARCHAR(255) NULL,
  `push_token` VARCHAR(500) NULL,
  `platform` VARCHAR(20) NULL COMMENT 'ios, android',
  `last_sync_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_devices_patient` (`patient_id`),
  CONSTRAINT `fk_devices_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. CLINIC SETTINGS: Consent defaults, timeouts
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clinic_settings` (
  `id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clinic_setting` (`clinic_id`, `setting_key`),
  CONSTRAINT `fk_settings_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. INVITES: Staff invitations (optional)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `staff_invites` (
  `id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `accepted_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invite_token` (`token`),
  INDEX `idx_invites_clinic` (`clinic_id`),
  CONSTRAINT `fk_invites_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invites_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. PATIENT TRANSFERS: Clinic-to-clinic (same or different country)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patient_transfers` (
  `id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) NOT NULL,
  `from_clinic_id` CHAR(36) NOT NULL,
  `to_clinic_id` CHAR(36) NOT NULL,
  `initiated_by` CHAR(36) NOT NULL COMMENT 'clinic_staff id',
  `reason` VARCHAR(500) NULL COMMENT 'e.g. Relocation, specialist care',
  `status` ENUM('pending', 'accepted', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `transfer_date` DATE NULL COMMENT 'When transfer takes effect',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transfer_patient` (`patient_id`),
  INDEX `idx_transfer_from` (`from_clinic_id`),
  INDEX `idx_transfer_to` (`to_clinic_id`),
  INDEX `idx_transfer_status` (`status`),
  CONSTRAINT `fk_transfer_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfer_from` FOREIGN KEY (`from_clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfer_to` FOREIGN KEY (`to_clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfer_initiated` FOREIGN KEY (`initiated_by`) REFERENCES `clinic_staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SEED DATA: Default Roles (run once; safe to skip if roles exist)
-- =============================================================================

INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `permissions`) VALUES
('11111111-1111-1111-1111-111111111101', 'clinic_admin', 'Full clinic management', '["manage_clinic","manage_staff","register_patient","request_access","view_summary","add_prescription","view_audit","export_audit","transfer_patient"]'),
('11111111-1111-1111-1111-111111111102', 'doctor', 'Primary care provider', '["register_patient","request_access","view_summary","add_prescription","transfer_patient"]'),
('11111111-1111-1111-1111-111111111103', 'nurse', 'Clinical support', '["register_patient","request_access","view_summary"]'),
('11111111-1111-1111-1111-111111111104', 'receptionist', 'Front-desk staff', '["register_patient","request_access"]'),
('11111111-1111-1111-1111-111111111105', 'ngo_worker', 'Refugee support', '["register_patient","request_access"]');

-- =============================================================================
-- VIEWS: Useful queries
-- =============================================================================

-- Pending consent requests for a clinic
CREATE OR REPLACE VIEW `v_pending_consents` AS
SELECT
  cr.id,
  cr.patient_id,
  p.zuri_care_id,
  p.full_name AS patient_name,
  cr.requester_id,
  cs.full_name AS requester_name,
  cr.clinic_id,
  c.name AS clinic_name,
  cr.scopes_requested,
  cr.status,
  cr.created_at
FROM consent_requests cr
JOIN patients p ON cr.patient_id = p.id
JOIN clinic_staff cs ON cr.requester_id = cs.id
JOIN clinics c ON cr.clinic_id = c.id
WHERE cr.status = 'pending';

-- Patient summary with health profile
CREATE OR REPLACE VIEW `v_patient_summary` AS
SELECT
  p.id,
  p.zuri_care_id,
  p.full_name,
  p.date_of_birth,
  p.nationality,
  p.phone,
  p.email,
  php.blood_type,
  (SELECT GROUP_CONCAT(pa.allergy SEPARATOR ', ') FROM patient_allergies pa WHERE pa.patient_id = p.id) AS allergies,
  (SELECT GROUP_CONCAT(pcc.condition SEPARATOR ', ') FROM patient_chronic_conditions pcc WHERE pcc.patient_id = p.id) AS chronic_conditions,
  p.registration_clinic_id,
  c.name AS registration_clinic_name,
  p.created_at
FROM patients p
LEFT JOIN patient_health_profiles php ON php.patient_id = p.id
LEFT JOIN clinics c ON p.registration_clinic_id = c.id;
