import { Router } from 'express';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();
const DEMO_STAFF_ID = '00000000-0000-0000-0000-000000000002';

// List clinics (for transfer destination dropdown)
router.get('/clinics', async (req, res) => {
  try {
    const { exclude } = req.query;
    let sql = `SELECT id, name, type, location, country FROM clinics ORDER BY country, name`;
    const rows = await query(sql);
    const clinics = rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      location: r.location,
      country: r.country || '—',
    }));
    if (exclude) {
      const ids = exclude.split(',').map((s) => s.trim());
      const filtered = clinics.filter((c) => !ids.includes(c.id));
      return res.json(filtered);
    }
    res.json(clinics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List transfers (for current clinic)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT pt.id, p.zuri_care_id AS patientId, p.full_name AS patientName,
        fc.name AS fromClinic, fc.country AS fromCountry,
        tc.name AS toClinic, tc.country AS toCountry,
        pt.reason, pt.status, pt.transfer_date AS transferDate,
        DATE_FORMAT(pt.created_at, '%Y-%m-%d %H:%i') AS createdAt
      FROM patient_transfers pt
      JOIN patients p ON pt.patient_id = p.id
      JOIN clinics fc ON pt.from_clinic_id = fc.id
      JOIN clinics tc ON pt.to_clinic_id = tc.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ` AND pt.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY pt.created_at DESC LIMIT 50`;

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create transfer
router.post('/', async (req, res) => {
  try {
    const { patientId, toClinicId, reason, transferDate, notes } = req.body;

    const [patient] = await query(
      `SELECT id, registration_clinic_id FROM patients WHERE zuri_care_id = ? OR id = ?`,
      [patientId, patientId]
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const fromClinicId = patient.registration_clinic_id;
    if (!fromClinicId) return res.status(400).json({ error: 'Patient has no registration clinic' });
    if (fromClinicId === toClinicId) return res.status(400).json({ error: 'Cannot transfer to same clinic' });

    const [toClinic] = await query(`SELECT id FROM clinics WHERE id = ?`, [toClinicId]);
    if (!toClinic) return res.status(404).json({ error: 'Destination clinic not found' });

    const id = randomUUID();

    await query(
      `INSERT INTO patient_transfers (id, patient_id, from_clinic_id, to_clinic_id, initiated_by, reason, status, transfer_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, patient.id, fromClinicId, toClinicId, DEMO_STAFF_ID, reason || null, transferDate || null, notes || null]
    );

    await query(
      `INSERT INTO audit_logs (id, actor_type, actor_id, patient_id, action, details) VALUES (?, 'clinic_staff', ?, ?, 'patient_transfer', ?)`,
      [randomUUID(), DEMO_STAFF_ID, patient.id, JSON.stringify({ to_clinic_id: toClinicId, reason })]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Complete transfer (update patient's registration_clinic_id)
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const [transfer] = await query(
      `SELECT patient_id, to_clinic_id, status FROM patient_transfers WHERE id = ?`,
      [id]
    );
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
    if (transfer.status !== 'pending' && transfer.status !== 'accepted') {
      return res.status(400).json({ error: 'Transfer cannot be completed' });
    }

    await query(`UPDATE patients SET registration_clinic_id = ? WHERE id = ?`, [
      transfer.to_clinic_id,
      transfer.patient_id,
    ]);
    await query(`UPDATE patient_transfers SET status = 'completed' WHERE id = ?`, [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
