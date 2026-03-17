import { Router } from 'express';
import { query } from '../db.js';
import { randomUUID } from 'crypto';
import { getSession } from './auth.js';
import { sendInviteEmail } from '../utils/email.js';

const router = Router();

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Session expired' });
  req.user = session;
  next();
}

// GET clinic settings (clinic info, services, consent defaults, staff)
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const clinicId = req.user.clinicId || '00000000-0000-0000-0000-000000000001';

    const [clinic] = await query(
      `SELECT id, name, type, address, location, country, phone, email, website, description,
              hours, open_24_7, refugee_friendly, latitude, longitude
       FROM clinics WHERE id = ?`,
      [clinicId]
    );
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    const services = await query(
      `SELECT service_name FROM clinic_services WHERE clinic_id = ?`,
      [clinicId]
    );

    const settingsRows = await query(
      `SELECT setting_key, setting_value FROM clinic_settings WHERE clinic_id = ?`,
      [clinicId]
    );
    const settings = Object.fromEntries(settingsRows.map((r) => [r.setting_key, r.setting_value]));

    let defaultScopes = ['allergies', 'bloodType', 'chronicConditions'];
    if (settings.default_scopes) {
      try {
        defaultScopes = JSON.parse(settings.default_scopes);
      } catch {
        /* use default */
      }
    }

    const staffRows = await query(
      `SELECT cs.id, cs.full_name, cs.email, r.name AS role_name
       FROM clinic_staff cs
       JOIN roles r ON cs.role_id = r.id
       WHERE cs.clinic_id = ? AND cs.is_active = 1
       ORDER BY r.name`,
      [clinicId]
    );

    res.json({
      clinic: {
        id: clinic.id,
        name: clinic.name,
        type: clinic.type,
        address: clinic.address || '',
        location: clinic.location || '',
        country: clinic.country || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        website: clinic.website || '',
        description: clinic.description || '',
        hours: clinic.hours || '',
        open24_7: !!clinic.open_24_7,
        refugeeFriendly: !!clinic.refugee_friendly,
        latitude: clinic.latitude != null ? String(clinic.latitude) : '',
        longitude: clinic.longitude != null ? String(clinic.longitude) : '',
      },
      services: services.map((s) => s.service_name),
      consentTimeout: settings.consent_timeout || '24',
      defaultScopes,
      staff: staffRows.map((s) => ({
        id: s.id,
        fullName: s.full_name,
        email: s.email,
        role: s.role_name,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT clinic settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const clinicId = req.user.clinicId || '00000000-0000-0000-0000-000000000001';
    const {
      name,
      type,
      address,
      location,
      country,
      phone,
      email,
      website,
      description,
      hours,
      open24_7,
      refugeeFriendly,
      latitude,
      longitude,
      services,
      consentTimeout,
      defaultScopes,
    } = req.body;

    const lat = latitude && String(latitude).trim() ? parseFloat(latitude) : null;
    const lng = longitude && String(longitude).trim() ? parseFloat(longitude) : null;

    await query(
      `UPDATE clinics SET
        name = ?, type = ?, address = ?, location = ?, country = ?,
        phone = ?, email = ?, website = ?, description = ?, hours = ?,
        open_24_7 = ?, refugee_friendly = ?, latitude = ?, longitude = ?
       WHERE id = ?`,
      [
        name ?? '',
        type ?? 'clinic',
        address ?? '',
        location ?? '',
        country ?? '',
        phone ?? '',
        email ?? '',
        website ?? '',
        description ?? '',
        hours ?? '',
        open24_7 ? 1 : 0,
        refugeeFriendly ? 1 : 0,
        lat,
        lng,
        clinicId,
      ]
    );

    if (Array.isArray(services)) {
      await query(`DELETE FROM clinic_services WHERE clinic_id = ?`, [clinicId]);
      for (const svc of services) {
        if (svc && svc.trim()) {
          await query(
            `INSERT INTO clinic_services (id, clinic_id, service_name) VALUES (?, ?, ?)`,
            [randomUUID(), clinicId, svc.trim()]
          );
        }
      }
    }

    if (consentTimeout != null) {
      await query(
        `DELETE FROM clinic_settings WHERE clinic_id = ? AND setting_key = 'consent_timeout'`,
        [clinicId]
      );
      await query(
        `INSERT INTO clinic_settings (id, clinic_id, setting_key, setting_value) VALUES (?, ?, 'consent_timeout', ?)`,
        [randomUUID(), clinicId, String(consentTimeout)]
      );
    }

    if (Array.isArray(defaultScopes)) {
      await query(
        `DELETE FROM clinic_settings WHERE clinic_id = ? AND setting_key = 'default_scopes'`,
        [clinicId]
      );
      await query(
        `INSERT INTO clinic_settings (id, clinic_id, setting_key, setting_value) VALUES (?, ?, 'default_scopes', ?)`,
        [randomUUID(), clinicId, JSON.stringify(defaultScopes)]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET roles (for invite dropdown)
router.get('/roles', requireAuth, async (req, res) => {
  try {
    const rows = await query(`SELECT id, name, description FROM roles ORDER BY name`);
    res.json(rows.map((r) => ({ id: r.id, name: r.name, description: r.description || '' })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST invite staff
router.post('/invite', requireAuth, async (req, res) => {
  try {
    const clinicId = req.user.clinicId || '00000000-0000-0000-0000-000000000001';
    const { email, roleId } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!roleId) return res.status(400).json({ error: 'Role is required' });

    const emailNorm = email.trim().toLowerCase();

    const [existing] = await query(
      `SELECT id FROM clinic_staff WHERE clinic_id = ? AND LOWER(email) = ?`,
      [clinicId, emailNorm]
    );
    if (existing) return res.status(400).json({ error: 'User already belongs to this clinic' });

    const [pending] = await query(
      `SELECT id FROM staff_invites WHERE clinic_id = ? AND LOWER(email) = ? AND accepted_at IS NULL AND expires_at > NOW()`,
      [clinicId, emailNorm]
    );
    if (pending) return res.status(400).json({ error: 'Invite already sent to this email' });

    const [role] = await query(`SELECT id FROM roles WHERE id = ?`, [roleId]);
    if (!role) return res.status(400).json({ error: 'Invalid role' });

    const id = randomUUID();
    const token = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO staff_invites (id, clinic_id, role_id, email, token, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, clinicId, roleId, emailNorm, token, expiresAt]
    );

    const [clinicRow] = await query(`SELECT name FROM clinics WHERE id = ?`, [clinicId]);
    const [roleRow] = await query(`SELECT name FROM roles WHERE id = ?`, [roleId]);
    const clinicName = clinicRow?.name || 'the clinic';
    const roleName = roleRow?.name || 'staff';

    const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;

    const emailResult = await sendInviteEmail({
      to: emailNorm,
      clinicName,
      roleName,
      inviteLink,
      expiresIn: '7 days',
    });

    res.json({
      ok: true,
      inviteId: id,
      emailSent: emailResult.sent,
      message: emailResult.sent
        ? `Invite email sent to ${emailNorm}. They have 7 days to accept.`
        : `Invite created for ${emailNorm}. Email could not be sent—check server logs or SMTP config.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
