import { Router } from 'express';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

const DEMO_CLINIC_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_STAFF_ID = '00000000-0000-0000-0000-000000000002';

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT cr.id, p.zuri_care_id AS zuriId, p.full_name AS patient,
        cr.scopes_requested AS scopes, cr.status, cr.created_at AS sentAt
      FROM consent_requests cr
      JOIN patients p ON cr.patient_id = p.id
      WHERE cr.clinic_id = ?
    `;
    const params = [DEMO_CLINIC_ID];
    if (status && status !== 'all') {
      sql += ` AND cr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY cr.created_at DESC`;

    const rows = await query(sql, params);
    const list = rows.map((r) => ({
      id: r.id,
      patient: r.patient,
      zuriId: r.zuriId,
      scopes: Array.isArray(r.scopes) ? r.scopes : (r.scopes ? JSON.parse(r.scopes) : []),
      status: r.status,
      sentAt: formatTimeAgo(r.sentAt),
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, scopes, reason } = req.body;
    const [patient] = await query(`SELECT id FROM patients WHERE zuri_care_id = ? OR id = ?`, [
      patientId,
      patientId,
    ]);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO consent_requests (id, patient_id, requester_id, clinic_id, scopes_requested, status, reason, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, patient.id, DEMO_STAFF_ID, DEMO_CLINIC_ID, JSON.stringify(scopes || []), reason || null, expiresAt]
    );
    await query(
      `INSERT INTO audit_logs (id, actor_type, actor_id, patient_id, action, details) VALUES (?, 'clinic_staff', ?, ?, 'consent_request', ?)`,
      [randomUUID(), DEMO_STAFF_ID, patient.id, JSON.stringify({ scopes: scopes || [] })]
    );
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}

export default router;
