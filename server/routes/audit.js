import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { dateFrom, dateTo, action, user } = req.query;
    let sql = `
      SELECT al.id, al.created_at AS timestamp, cs.full_name AS user, p.zuri_care_id AS patient,
        al.action, al.details
      FROM audit_logs al
      LEFT JOIN clinic_staff cs ON al.actor_id = cs.id AND al.actor_type = 'clinic_staff'
      LEFT JOIN patients p ON al.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (dateFrom) {
      sql += ` AND al.created_at >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND al.created_at <= ?`;
      params.push(dateTo + ' 23:59:59');
    }
    if (action && action !== 'all') {
      sql += ` AND al.action LIKE ?`;
      params.push(`%${action}%`);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT 100`;

    const rows = await query(sql, params);
    const list = rows.map((r) => {
      let result = 'Success';
      let scopes = '—';
      if (r.details) {
        try {
          const d = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
          result = d.result || result;
          scopes = d.scopes ? (Array.isArray(d.scopes) ? d.scopes.join(', ') : d.scopes) : scopes;
        } catch {}
      }
      return {
        id: r.id,
        timestamp: r.timestamp ? r.timestamp.replace('T', ' ').slice(0, 16) : '',
        user: r.user || 'System',
        patient: r.patient || '—',
        action: formatAction(r.action),
        result,
        scopes,
      };
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function formatAction(action) {
  const map = {
    consent_request: 'Access request sent',
    consent_granted: 'Consent granted',
    consent_denied: 'Consent denied',
    medical_summary_viewed: 'Medical summary viewed',
    registration: 'Registration',
  };
  return map[action] || action;
}

export default router;
