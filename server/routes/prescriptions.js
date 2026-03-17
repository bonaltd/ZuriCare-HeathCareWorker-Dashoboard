import { Router } from 'express';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

const DEMO_STAFF_ID = '00000000-0000-0000-0000-000000000002';

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT pr.id, p.full_name AS patient, pr.medication_name AS medication, pr.dosage,
        pr.prescriber_name AS prescriber, DATE_FORMAT(pr.date_prescribed, '%Y-%m-%d') AS date,
        pr.condition, pr.status
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ` AND pr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY pr.date_prescribed DESC`;

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, medicationName, dosage, datePrescribed, duration, condition, pharmacy } = req.body;
    const id = randomUUID();

    const [patient] = await query(`SELECT id FROM patients WHERE zuri_care_id = ? OR id = ?`, [
      patientId,
      patientId,
    ]);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    await query(
      `INSERT INTO prescriptions (id, patient_id, medication_name, dosage, prescriber_id, prescriber_name, date_prescribed, duration, condition, pharmacy, status)
       VALUES (?, ?, ?, ?, ?, 'Dr. Jane Demo', ?, ?, ?, ?, 'active')`,
      [id, patient.id, medicationName, dosage || null, DEMO_STAFF_ID, datePrescribed || new Date().toISOString().slice(0, 10), duration || null, condition || null, pharmacy || null]
    );
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
