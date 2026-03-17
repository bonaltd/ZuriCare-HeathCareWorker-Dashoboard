import { useState, useEffect } from 'react';
import { Save, UserPlus, MapPin, X } from 'lucide-react';
import { api } from '../api/client';
import './ClinicSettings.css';

const SERVICE_OPTIONS = [
  'Vaccinations',
  'Maternal care',
  'Refugee support',
  'General practice',
  'Emergency care',
  'Mental health',
  'HIV/TB care',
  'Laboratory',
];

const SCOPE_OPTIONS = [
  { key: 'allergies', label: 'Allergies' },
  { key: 'bloodType', label: 'Blood type' },
  { key: 'chronicConditions', label: 'Chronic conditions' },
  { key: 'vaccinationHistory', label: 'Vaccination history' },
  { key: 'prescriptionHistory', label: 'Prescription history' },
  { key: 'emergencyContact', label: 'Emergency contact' },
];

export default function ClinicSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clinic, setClinic] = useState({
    name: '',
    type: 'clinic',
    address: '',
    location: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    hours: '',
    open24_7: false,
    refugeeFriendly: false,
    latitude: '',
    longitude: '',
  });
  const [services, setServices] = useState<string[]>([]);
  const [consentTimeout, setConsentTimeout] = useState('24');
  const [defaultScopes, setDefaultScopes] = useState<string[]>(['allergies', 'bloodType', 'chronicConditions']);
  const [staff, setStaff] = useState<Array<{ id: string; fullName: string; email: string; role: string }>>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    api.clinic
      .getSettings()
      .then((data) => {
        setClinic(data.clinic);
        setServices(data.services);
        setConsentTimeout(data.consentTimeout);
        setDefaultScopes(data.defaultScopes);
        setStaff(data.staff);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleService = (name: string) => {
    setServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const toggleScope = (key: string) => {
    setDefaultScopes((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !inviteForm.roleId) return;
    setInviteSending(true);
    setInviteSuccess(null);
    setInviteError(null);
    try {
      const res = await api.clinic.invite({ email: inviteForm.email.trim(), roleId: inviteForm.roleId });
      setInviteSuccess(res.message);
      setInviteForm({ email: '', roleId: '' });
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess(null);
      }, 2000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteSending(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.clinic.updateSettings({
        ...clinic,
        services,
        consentTimeout,
        defaultScopes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <p className="loading-state">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1>Clinic Settings</h1>
          <p className="page-subtitle">Manage facility information, coordinates, and configuration</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      <div className="settings-sections">
        <section className="settings-section">
          <h2>Clinic information</h2>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Clinic name</label>
                <input
                  type="text"
                  value={clinic.name}
                  onChange={(e) => setClinic((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Demo Health Clinic"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={clinic.type}
                  onChange={(e) => setClinic((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="clinic">Clinic</option>
                  <option value="hospital">Hospital</option>
                  <option value="ngo">NGO</option>
                  <option value="refugee_support">Refugee support</option>
                  <option value="maternal">Maternal</option>
                  <option value="vaccination">Vaccination</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={clinic.address}
                onChange={(e) => setClinic((p) => ({ ...p, address: e.target.value }))}
                placeholder="Full street address"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location / City</label>
                <input
                  type="text"
                  value={clinic.location}
                  onChange={(e) => setClinic((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Nairobi"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={clinic.country}
                  onChange={(e) => setClinic((p) => ({ ...p, country: e.target.value }))}
                  placeholder="e.g. Kenya"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={clinic.phone}
                  onChange={(e) => setClinic((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={clinic.email}
                  onChange={(e) => setClinic((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contact@clinic.org"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>
            <MapPin size={18} />
            Coordinates & map
          </h2>
          <p className="settings-hint">GPS coordinates for maps and location services</p>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="text"
                  value={clinic.latitude}
                  onChange={(e) => setClinic((p) => ({ ...p, latitude: e.target.value }))}
                  placeholder="e.g. -1.2921"
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="text"
                  value={clinic.longitude}
                  onChange={(e) => setClinic((p) => ({ ...p, longitude: e.target.value }))}
                  placeholder="e.g. 36.8219"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Website & description</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={clinic.website}
                onChange={(e) => setClinic((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://www.clinic.org"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={clinic.description}
                onChange={(e) => setClinic((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the facility and services offered"
                rows={4}
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Opening hours & access</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Hours (e.g. Mon–Fri 8am–6pm)</label>
              <input
                type="text"
                value={clinic.hours}
                onChange={(e) => setClinic((p) => ({ ...p, hours: e.target.value }))}
                placeholder="Mon–Fri 8am–6pm, Sat 9am–1pm"
              />
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={clinic.open24_7}
                  onChange={(e) => setClinic((p) => ({ ...p, open24_7: e.target.checked }))}
                />
                Open 24/7
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={clinic.refugeeFriendly}
                  onChange={(e) => setClinic((p) => ({ ...p, refugeeFriendly: e.target.checked }))}
                />
                Refugee-friendly facility
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Services</h2>
          <p className="settings-hint">Service types offered at this facility</p>
          <div className="checkbox-group">
            {SERVICE_OPTIONS.map((name) => (
              <label key={name}>
                <input
                  type="checkbox"
                  checked={services.includes(name)}
                  onChange={() => toggleService(name)}
                />
                {name}
              </label>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2>Consent defaults</h2>
          <p className="settings-hint">Default settings for new consent requests</p>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Default consent timeout</label>
                <select
                  value={consentTimeout}
                  onChange={(e) => setConsentTimeout(e.target.value)}
                >
                  <option value="1">1 hour</option>
                  <option value="24">24 hours</option>
                  <option value="72">72 hours</option>
                  <option value="168">7 days</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default scopes for new requests</label>
                <div className="checkbox-group checkbox-group-scopes">
                  {SCOPE_OPTIONS.map(({ key, label }) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={defaultScopes.includes(key)}
                        onChange={() => toggleScope(key)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Staff</h2>
          <div className="staff-list">
            {staff.map((s) => (
              <div key={s.id} className="staff-item">
                <div className="staff-info">
                  <strong>{s.fullName}</strong>
                  <span>{s.email} • {s.role}</span>
                </div>
                {s.role === 'clinic_admin' && <span className="staff-badge">Admin</span>}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setShowInviteModal(true);
              setInviteError(null);
              setInviteSuccess(null);
              setInviteForm({ email: '', roleId: '' });
              api.clinic.getRoles().then((r) => {
                setRoles(r);
                setInviteForm((p) => ({ ...p, roleId: r[0]?.id || '' }));
              });
            }}
          >
            <UserPlus size={18} />
            Invite user
          </button>
        </section>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2>Invite user</h2>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="settings-invite-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="colleague@clinic.org"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteForm.roleId}
                  onChange={(e) => setInviteForm((p) => ({ ...p, roleId: e.target.value }))}
                  required
                >
                  <option value="">Select role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name.replace(/_/g, ' ')} {r.description ? `– ${r.description}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {inviteError && <p className="form-error">{inviteError}</p>}
              {inviteSuccess && <p className="invite-success">{inviteSuccess}</p>}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviteSending}>
                  {inviteSending ? 'Sending…' : 'Send invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saved && (
        <div className="toast">Settings saved successfully.</div>
      )}
    </div>
  );
}
