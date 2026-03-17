import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

// Simple in-memory session store (use Redis/DB in production)
const sessions = new Map();

export function getSession(token) {
  return sessions.get(token);
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Session expired' });
  req.user = session;
  next();
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [staff] = await query(
      `SELECT cs.id, cs.email, cs.password_hash, cs.full_name, cs.clinic_id, c.name AS clinic_name
       FROM clinic_staff cs
       JOIN clinics c ON cs.clinic_id = c.id
       WHERE cs.email = ? AND cs.is_active = 1`,
      [email.trim().toLowerCase()]
    );

    if (!staff) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, staff.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await query(
      `UPDATE clinic_staff SET last_login_at = NOW() WHERE id = ?`,
      [staff.id]
    );

    const token = randomUUID();
    sessions.set(token, {
      id: staff.id,
      email: staff.email,
      fullName: staff.full_name,
      clinicId: staff.clinic_id,
      clinicName: staff.clinic_name,
    });

    res.json({
      token,
      user: {
        id: staff.id,
        email: staff.email,
        fullName: staff.full_name,
        clinicId: staff.clinic_id,
        clinicName: staff.clinic_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Session expired' });
  res.json({ user: session });
});

export default router;
