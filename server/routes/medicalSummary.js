import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { patient: patientId } = req.query;
    if (!patientId) return res.status(400).json({ error: 'patient (ZuriCare ID) required' });

    const [patient] = await query(
      `SELECT id, zuri_care_id, full_name FROM patients WHERE UPPER(zuri_care_id) = UPPER(?)`,
      [patientId.trim()]
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const [profile] = await query(
      `SELECT blood_type FROM patient_health_profiles WHERE patient_id = ?`,
      [patient.id]
    );
    const allergies = await query(`SELECT allergy FROM patient_allergies WHERE patient_id = ?`, [patient.id]);
    const chronic = await query(`SELECT \`condition\` FROM patient_chronic_conditions WHERE patient_id = ?`, [patient.id]);
    const vaccinations = await query(`SELECT vaccine_name FROM patient_vaccinations WHERE patient_id = ?`, [patient.id]);
    const prescriptions = await query(
      `SELECT medication_name AS medication, dosage, prescriber_name AS prescriber, 
        DATE_FORMAT(date_prescribed, '%Y-%m-%d') AS date, status
       FROM prescriptions WHERE patient_id = ? ORDER BY date_prescribed DESC`,
      [patient.id]
    );
    const [emergency] = await query(
      `SELECT name, relationship, phone FROM patient_emergency_contacts WHERE patient_id = ? LIMIT 1`,
      [patient.id]
    );

    const [consent] = await query(
      `SELECT responded_at, consent_expires_at FROM consent_requests 
       WHERE patient_id = ? AND status = 'granted' ORDER BY responded_at DESC LIMIT 1`,
      [patient.id]
    );

    res.json({
      patientId: patient.zuri_care_id,
      patientName: patient.full_name,
      consentGrantedAt: consent?.responded_at
        ? new Date(consent.responded_at).toLocaleString()
        : '—',
      expiry: consent?.consent_expires_at
        ? new Date(consent.consent_expires_at).toLocaleDateString()
        : 'Single visit',
      allergies: allergies.map((a) => a.allergy),
      bloodType: profile?.blood_type || '—',
      chronicConditions: chronic.map((c) => c['condition']),
      vaccinationHistory: vaccinations.map((v) => v.vaccine_name),
      prescriptionHistory: prescriptions.map((p) => ({
        medication: p.medication,
        dosage: p.dosage || '—',
        prescriber: p.prescriber || '—',
        date: p.date,
        status: p.status,
      })),
      emergencyContact: emergency
        ? {
            name: emergency.name,
            relationship: emergency.relationship || '—',
            phone: emergency.phone,
          }
        : { name: '—', relationship: '—', phone: '—' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
