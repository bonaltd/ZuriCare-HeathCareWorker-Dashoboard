-- =============================================================================
-- ZuriCare - Comprehensive Test Data
-- =============================================================================
-- Run in order: 1) zuricare_schema.sql  2) seed-demo.sql  3) db-updates-clinic-settings.sql  4) this file
-- Populates: patients, health profiles, prescriptions, consent, audit, transfers
--
-- Usage: npm run db:test-data
-- Or:    mysql -u root -p zuricare < server/seed-test-data.sql
-- =============================================================================

SET NAMES utf8mb4;

-- IDs for reference
-- Demo clinic: 00000000-0000-0000-0000-000000000001
-- Dr. Jane Demo: 00000000-0000-0000-0000-000000000002
-- City Hospital: 00000000-0000-0000-0000-000000000003

-- -----------------------------------------------------------------------------
-- 1. Additional staff for demo clinic
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `clinic_staff` (`id`, `clinic_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `is_active`) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111103', 'nurse@demo.zuricare.org', '$2b$10$T4cDzr5Q5U8rmuXJpdYvUeAzOUtcfRQDaWSE3bGbyXjxlhhpsIDVO', 'Nurse Mary Wanjiku', '+254 700 000 002', 1),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111104', 'reception@demo.zuricare.org', '$2b$10$T4cDzr5Q5U8rmuXJpdYvUeAzOUtcfRQDaWSE3bGbyXjxlhhpsIDVO', 'John Kamau', '+254 700 000 003', 1);

-- -----------------------------------------------------------------------------
-- 2. Patients (all registered at demo clinic)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patients` (`id`, `zuri_care_id`, `full_name`, `date_of_birth`, `nationality`, `phone`, `email`, `registration_clinic_id`, `created_at`) VALUES
('aaaaaaaa-0001-0001-0001-000000000001', 'ZC-20240301-ABC001', 'Grace Akinyi', '1985-03-15', 'Kenyan', '+254 722 111 001', 'grace.a@example.com', '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 45 DAY)),
('aaaaaaaa-0001-0001-0001-000000000002', 'ZC-20240305-DEF002', 'James Ochieng', '1992-07-22', 'Kenyan', '+254 733 222 002', NULL, '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 40 DAY)),
('aaaaaaaa-0001-0001-0001-000000000003', 'ZC-20240310-GHI003', 'Fatuma Hassan', '1978-11-08', 'Somali', '+254 744 333 003', 'fatuma.h@example.com', '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 35 DAY)),
('aaaaaaaa-0001-0001-0001-000000000004', 'ZC-20240315-JKL004', 'Peter Mwangi', '2001-01-30', 'Kenyan', '+254 755 444 004', NULL, '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('aaaaaaaa-0001-0001-0001-000000000005', 'ZC-20240320-MNO005', 'Amina Mohammed', '1995-05-12', 'Kenyan', '+254 766 555 005', 'amina.m@example.com', '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('aaaaaaaa-0001-0001-0001-000000000006', 'ZC-20240325-PQR006', 'Joseph Odhiambo', '1988-09-03', 'Kenyan', '+254 777 666 006', NULL, '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('aaaaaaaa-0001-0001-0001-000000000007', 'ZC-20240328-STU007', 'Mary Wambui', '1965-12-20', 'Kenyan', '+254 788 777 007', 'mary.w@example.com', '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('aaaaaaaa-0001-0001-0001-000000000008', 'ZC-20240329-VWX008', 'David Kipchoge', '2005-04-18', 'Kenyan', NULL, NULL, '00000000-0000-0000-0000-000000000001', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- -----------------------------------------------------------------------------
-- 3. Health profiles (blood type)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_health_profiles` (`id`, `patient_id`, `blood_type`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'O+'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000002', 'A+'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'B+'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000004', 'O-'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'AB+'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000006', 'A-'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'O+'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000008', 'B+');

-- -----------------------------------------------------------------------------
-- 4. Allergies
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_allergies` (`id`, `patient_id`, `allergy`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Penicillin'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Sulfa drugs'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'Peanuts'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'Latex'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'Penicillin');

-- -----------------------------------------------------------------------------
-- 5. Chronic conditions
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_chronic_conditions` (`id`, `patient_id`, `condition`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Type 2 Diabetes'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Hypertension'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'Asthma'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'HIV (on ART)'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000006', 'Hypertension'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'Type 2 Diabetes'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'Chronic kidney disease');

-- -----------------------------------------------------------------------------
-- 6. Vaccinations
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_vaccinations` (`id`, `patient_id`, `vaccine_name`, `date_administered`, `notes`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'COVID-19 (2 doses)', '2021-08-15', NULL),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Measles', '1990-03-01', 'Childhood'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000002', 'COVID-19 (2 doses)', '2021-09-20', NULL),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'COVID-19 (2 doses)', '2021-07-10', NULL),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000004', 'COVID-19 (2 doses)', '2022-01-05', NULL),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'Yellow fever', '2020-02-14', 'Travel'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'COVID-19 (2 doses)', '2021-06-01', NULL),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000008', 'Measles', '2006-05-01', 'Childhood');

-- -----------------------------------------------------------------------------
-- 7. Emergency contacts
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_emergency_contacts` (`id`, `patient_id`, `name`, `relationship`, `phone`, `is_primary`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'John Akinyi', 'Spouse', '+254 722 111 100', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000002', 'Sarah Ochieng', 'Sister', '+254 733 222 200', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'Hassan Ali', 'Brother', '+254 744 333 300', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000004', 'Jane Mwangi', 'Mother', '+254 755 444 400', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'Mohammed Hassan', 'Father', '+254 766 555 500', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000006', 'Lucy Odhiambo', 'Wife', '+254 777 666 600', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'James Wambui', 'Son', '+254 788 777 700', 1),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000008', 'Esther Kipchoge', 'Mother', '+254 799 888 800', 1);

-- -----------------------------------------------------------------------------
-- 8. Prescriptions
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `prescriptions` (`id`, `patient_id`, `medication_name`, `dosage`, `prescriber_id`, `prescriber_name`, `date_prescribed`, `duration`, `condition`, `pharmacy`, `status`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Metformin', '500mg twice daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Ongoing', 'Type 2 Diabetes', 'Nairobi Pharmacy', 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Amlodipine', '5mg once daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Ongoing', 'Hypertension', NULL, 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000002', 'Amoxicillin', '500mg three times daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '7 days', 'Upper respiratory infection', NULL, 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000003', 'Salbutamol inhaler', '2 puffs as needed', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Ongoing', 'Asthma', NULL, 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000005', 'Dolutegravir/Lamivudine', '1 tablet daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Ongoing', 'HIV', 'Clinic dispensary', 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000006', 'Losartan', '50mg once daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Ongoing', 'Hypertension', NULL, 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000007', 'Metformin', '1000mg twice daily', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'Ongoing', 'Type 2 Diabetes', NULL, 'active'),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000001', 'Paracetamol', '500mg as needed', '00000000-0000-0000-0000-000000000002', 'Dr. Jane Demo', DATE_SUB(CURDATE(), INTERVAL 60 DAY), '5 days', 'Fever', NULL, 'completed');

-- -----------------------------------------------------------------------------
-- 9. Consent requests (mix of pending, granted, denied)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `consent_requests` (`id`, `patient_id`, `requester_id`, `clinic_id`, `scopes_requested`, `scopes_granted`, `status`, `reason`, `expires_at`, `consent_expires_at`, `created_at`, `responded_at`) VALUES
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '["allergies","bloodType","chronicConditions","prescriptionHistory"]', '["allergies","bloodType","chronicConditions","prescriptionHistory"]', 'granted', 'Routine check-up', DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '["allergies","bloodType","chronicConditions"]', NULL, 'pending', 'Follow-up visit', DATE_ADD(NOW(), INTERVAL 24 HOUR), NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR), NULL),
('bbbbbbbb-0001-0001-0001-000000000003', 'aaaaaaaa-0001-0001-0001-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '["allergies","bloodType","chronicConditions","vaccinationHistory"]', '["allergies","bloodType","chronicConditions","vaccinationHistory"]', 'granted', 'Asthma management', DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('bbbbbbbb-0001-0001-0001-000000000004', 'aaaaaaaa-0001-0001-0001-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '["allergies","bloodType","chronicConditions","prescriptionHistory","emergencyContact"]', NULL, 'pending', 'HIV care visit', DATE_ADD(NOW(), INTERVAL 24 HOUR), NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL),
('bbbbbbbb-0001-0001-0001-000000000005', 'aaaaaaaa-0001-0001-0001-000000000006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '["allergies","bloodType","chronicConditions"]', NULL, 'denied', 'BP check', DATE_ADD(NOW(), INTERVAL 24 HOUR), NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- -----------------------------------------------------------------------------
-- 10. Audit logs (activity for dashboard)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `audit_logs` (`id`, `actor_type`, `actor_id`, `patient_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
('cccccccc-0001-0001-0001-000000000001', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000001', 'medical_summary_viewed', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('cccccccc-0001-0001-0001-000000000002', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000003', 'medical_summary_viewed', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('cccccccc-0001-0001-0001-000000000003', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000007', 'medical_summary_viewed', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('cccccccc-0001-0001-0001-000000000004', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000008', 'registration', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('cccccccc-0001-0001-0001-000000000005', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000007', 'registration', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('cccccccc-0001-0001-0001-000000000006', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000001', 'consent_request', 'consent_request', NULL, '{"scopes":["allergies","bloodType","chronicConditions"]}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('cccccccc-0001-0001-0001-000000000007', 'clinic_staff', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0001-0001-0001-000000000002', 'consent_request', 'consent_request', NULL, '{"scopes":["allergies","bloodType","chronicConditions"]}', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- -----------------------------------------------------------------------------
-- 11. Patient transfers (pending and completed)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `patient_transfers` (`id`, `patient_id`, `from_clinic_id`, `to_clinic_id`, `initiated_by`, `reason`, `status`, `transfer_date`, `notes`, `created_at`) VALUES
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'University studies in Kampala', 'pending', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Patient relocating for studies', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(UUID(), 'aaaaaaaa-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Family relocation to Lusaka', 'completed', CURDATE(), NULL, DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Update patient 2's registration clinic to reflect completed transfer
UPDATE `patients` SET `registration_clinic_id` = '00000000-0000-0000-0000-000000000004' WHERE `id` = 'aaaaaaaa-0001-0001-0001-000000000002';

-- -----------------------------------------------------------------------------
-- 12. Update demo clinic with hours and extra info
-- (Requires db-updates-clinic-settings.sql for latitude, longitude, website, description)
-- -----------------------------------------------------------------------------
UPDATE `clinics` SET `hours` = 'Mon–Fri 8am–6pm, Sat 9am–1pm' WHERE `id` = '00000000-0000-0000-0000-000000000001';

UPDATE `clinics` SET
  `latitude` = -1.2921,
  `longitude` = 36.8219,
  `website` = 'https://demo.zuricare.org',
  `description` = 'Demo Health Clinic – primary care, vaccinations, maternal health, and refugee support services.'
WHERE `id` = '00000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------------
-- Done
-- -----------------------------------------------------------------------------
