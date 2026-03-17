import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const DEMO_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

router.get('/stats', async (req, res) => {
  try {
    const [regToday] = await query(
      `SELECT COUNT(*) AS c FROM patients 
       WHERE DATE(created_at) = CURDATE() AND (registration_clinic_id = ? OR ? IS NULL)`,
      [DEMO_CLINIC_ID, DEMO_CLINIC_ID]
    );
    const [pending] = await query(
      `SELECT COUNT(*) AS c FROM consent_requests WHERE status = 'pending' AND clinic_id = ?`,
      [DEMO_CLINIC_ID]
    );
    const [accessCount] = await query(
      `SELECT COUNT(*) AS c FROM audit_logs 
       WHERE actor_type = 'clinic_staff' AND DATE(created_at) = CURDATE()`
    );

    res.json({
      patientsToday: regToday?.c ?? 0,
      pendingConsent: pending?.c ?? 0,
      accessEvents: accessCount?.c ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const rows = await query(`
      SELECT al.action, p.full_name AS patient, al.created_at
      FROM audit_logs al
      LEFT JOIN patients p ON al.patient_id = p.id
      WHERE al.actor_type = 'clinic_staff'
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    const list = rows.map((r) => ({
      patient: r.patient ? r.patient.split(' ')[0] + '.' : 'Unknown',
      action: formatAction(r.action),
      time: formatTimeAgo(r.created_at),
      status: getStatus(r.action),
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/charts/weekly', async (req, res) => {
  try {
    const rows = await query(`
      SELECT DAYNAME(DATE_SUB(CURDATE(), INTERVAL (6 - n) DAY)) AS day_short,
             DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (6 - n) DAY), '%a') AS day,
             COALESCE(c.cnt, 0) AS count
      FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) nums
      LEFT JOIN (
        SELECT DATE(created_at) AS d, COUNT(*) AS cnt
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
      ) c ON c.d = DATE_SUB(CURDATE(), INTERVAL (6 - nums.n) DAY)
      ORDER BY nums.n
    `);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = rows.map((r, i) => ({
      day: days[new Date(Date.now() - (6 - i) * 86400000).getDay()] || r.day,
      count: r.count ?? 0,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/charts/consent', async (req, res) => {
  try {
    const rows = await query(`
      SELECT status, COUNT(*) AS value FROM consent_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY status
    `);
    const colors = { granted: '#059669', pending: '#FF8C00', denied: '#dc2626', expired: '#64748b' };
    const result = rows.map((r) => ({
      name: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      value: r.value,
      color: colors[r.status] || '#64748b',
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function formatAction(a) {
  const m = { consent_granted: 'Consent granted', consent_denied: 'Consent denied', consent_request: 'Access request sent', medical_summary_viewed: 'Medical summary viewed', registration: 'New registration' };
  return m[a] || a;
}
function getStatus(a) {
  if (a === 'consent_granted') return 'granted';
  if (a === 'consent_denied') return 'denied';
  if (a === 'consent_request') return 'pending';
  if (a === 'medical_summary_viewed') return 'viewed';
  if (a === 'registration') return 'registered';
  return 'viewed';
}
function formatTimeAgo(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(d).toLocaleDateString();
}

export default router;
