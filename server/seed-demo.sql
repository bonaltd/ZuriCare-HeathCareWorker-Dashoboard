-- Demo clinic and staff for ZuriCare dashboard
-- Run after zuricare_schema.sql
-- For existing DBs: run migrations/add-clinic-coordinates.sql to add lat/long/website/description

INSERT IGNORE INTO `clinics` (`id`, `name`, `type`, `address`, `location`, `country`, `phone`, `email`) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Health Clinic', 'clinic', '123 Main St', 'Nairobi', 'Kenya', '+254 700 000 000', 'demo@zuricare.org'),
('00000000-0000-0000-0000-000000000003', 'City Hospital', 'hospital', '45 Hospital Rd', 'Kampala', 'Uganda', '+256 700 000 000', 'info@cityhospital.ug'),
('00000000-0000-0000-0000-000000000004', 'Rural Health Centre', 'clinic', 'Village Square', 'Lusaka', 'Zambia', '+260 700 000 000', 'rural@health.zm'),
('00000000-0000-0000-0000-000000000005', 'Refugee Support Clinic', 'refugee_support', 'Camp Zone A', 'Nairobi', 'Kenya', '+254 711 000 000', 'support@refugee.org');

-- Password: demo123
INSERT IGNORE INTO `clinic_staff` (`id`, `clinic_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `is_active`) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111102', 'demo@zuricare.org', '$2b$10$T4cDzr5Q5U8rmuXJpdYvUeAzOUtcfRQDaWSE3bGbyXjxlhhpsIDVO', 'Dr. Jane Demo', '+254 700 000 001', 1);

-- Update password if staff already exists with placeholder
UPDATE `clinic_staff` SET `password_hash` = '$2b$10$T4cDzr5Q5U8rmuXJpdYvUeAzOUtcfRQDaWSE3bGbyXjxlhhpsIDVO' WHERE `email` = 'demo@zuricare.org' AND `password_hash` = 'placeholder';

-- Ensure demo clinic has country (for existing installs)
UPDATE `clinics` SET `country` = 'Kenya' WHERE `id` = '00000000-0000-0000-0000-000000000001' AND `country` IS NULL;

-- Demo clinic services (run once when clinic has no services)
INSERT INTO `clinic_services` (`id`, `clinic_id`, `service_name`)
SELECT UUID(), '00000000-0000-0000-0000-000000000001', s FROM (
  SELECT 'Vaccinations' AS s UNION SELECT 'Maternal care' UNION SELECT 'Refugee support'
) t
WHERE NOT EXISTS (SELECT 1 FROM clinic_services WHERE clinic_id = '00000000-0000-0000-0000-000000000001' LIMIT 1);

-- Demo consent defaults (clinic_settings)
INSERT INTO `clinic_settings` (`id`, `clinic_id`, `setting_key`, `setting_value`) VALUES
(UUID(), '00000000-0000-0000-0000-000000000001', 'consent_timeout', '24'),
(UUID(), '00000000-0000-0000-0000-000000000001', 'default_scopes', '["allergies","bloodType","chronicConditions"]')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
