import { Router } from 'express';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

const DEMO_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

router.get('/', async (req, res) => {
  try {
    const { search, filter } = req.query;
    let sql = `
      SELECT p.id AS patient_uuid, p.zuri_care_id, p.full_name AS name, p.phone,
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS registered,
        (SELECT MAX(al.created_at) FROM audit_logs al 
         WHERE al.patient_id = p.id AND al.action LIKE '%summary%') AS last_access_at
      FROM patients p
      WHERE p.registration_clinic_id = ? OR ? IS NULL
    `;
    const params = [DEMO_CLINIC_ID, DEMO_CLINIC_ID];

    if (search && search.trim()) {
      sql += ` AND (p.zuri_care_id LIKE ? OR p.full_name LIKE ? OR p.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (filter === 'recent') {
      sql += ` AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const rows = await query(sql, params);
    const formatDate = (v) => {
      if (!v) return '—';
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      if (typeof v === 'string') return v.split(' ')[0].split('T')[0] || '—';
      return '—';
    };
    const patients = rows.map((r) => ({
      id: r.zuri_care_id,
      name: r.name,
      phone: r.phone || '—',
      lastAccess: formatDate(r.last_access_at),
      registered: r.registered || '—',
    }));
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/lookup/:zuriCareId', async (req, res) => {
  try {
    const { zuriCareId } = req.params;
    const [row] = await query(
      `SELECT id, zuri_care_id, full_name AS name, phone FROM patients 
       WHERE UPPER(zuri_care_id) = UPPER(?)`,
      [zuriCareId.trim()]
    );
    if (!row) return res.json({ found: false, id: zuriCareId.trim() });
    res.json({
      found: true,
      id: row.zuri_care_id,
      name: row.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      nationality,
      phone,
      email,
      bloodType,
      allergies = [],
      chronicConditions = [],
      vaccinations = [],
      emergencyContact,
    } = req.body;

    const id = randomUUID();
    const zuriCareId = `ZC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await query(
      `INSERT INTO patients (id, zuri_care_id, full_name, date_of_birth, nationality, phone, email, registration_clinic_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, zuriCareId, fullName, dateOfBirth || null, nationality || null, phone || null, email || null, DEMO_CLINIC_ID]
    );

    const healthProfileId = randomUUID();
    await query(
      `INSERT INTO patient_health_profiles (id, patient_id, blood_type) VALUES (?, ?, ?)`,
      [healthProfileId, id, bloodType || null]
    );

    for (const a of allergies) {
      await query(`INSERT INTO patient_allergies (id, patient_id, allergy) VALUES (?, ?, ?)`, [
        randomUUID(),
        id,
        a,
      ]);
    }
    for (const c of chronicConditions) {
      await query(`INSERT INTO patient_chronic_conditions (id, patient_id, \`condition\`) VALUES (?, ?, ?)`, [
        randomUUID(),
        id,
        c,
      ]);
    }
    for (const v of vaccinations) {
      await query(`INSERT INTO patient_vaccinations (id, patient_id, vaccine_name) VALUES (?, ?, ?)`, [
        randomUUID(),
        id,
        v,
      ]);
    }
    if (emergencyContact?.name && emergencyContact?.phone) {
      await query(
        `INSERT INTO patient_emergency_contacts (id, patient_id, name, relationship, phone) VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), id, emergencyContact.name, emergencyContact.relationship || null, emergencyContact.phone]
      );
    }

    await query(
      `INSERT INTO audit_logs (id, actor_type, actor_id, patient_id, action) VALUES (?, 'clinic_staff', '00000000-0000-0000-0000-000000000002', ?, 'registration')`,
      [randomUUID(), id]
    );

    res.status(201).json({ id, zuriCareId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
