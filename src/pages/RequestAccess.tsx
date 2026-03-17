import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { api } from '../api/client';
import './RequestAccess.css';

const SCOPES = [
  { key: 'allergies', label: 'Allergies' },
  { key: 'bloodType', label: 'Blood type' },
  { key: 'chronicConditions', label: 'Chronic conditions' },
  { key: 'vaccinationHistory', label: 'Vaccination history' },
  { key: 'prescriptionHistory', label: 'Medical history (prescriptions)' },
  { key: 'emergencyContact', label: 'Emergency contact' },
];

export default function RequestAccess() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient') || '';
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['allergies', 'bloodType']);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const toggleScope = (key: string) => {
    setSelectedScopes((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError('No patient ID');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await api.consent.request({ patientId, scopes: selectedScopes, reason: reason || undefined });
      setSent(true);
      setTimeout(() => navigate('/consent'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="request-access-page">
        <div className="request-sent">
          <Send size={48} />
          <h2>Request sent</h2>
          <p>The patient will receive the consent request on their ZuriCare app.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="request-access-page">
      <header className="page-header">
        <div>
          <h1>Request access</h1>
          <p className="page-subtitle">
            Patient: <code className="zuri-id">{patientId || '—'}</code>
          </p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="request-access-form">
        <div className="form-section">
          <h2>Select data scopes</h2>
          <p className="form-hint">Choose which health data you need to access.</p>
          <div className="scope-checkboxes">
            {SCOPES.map(({ key, label }) => (
              <label key={key} className="scope-checkbox">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes(key)}
                  onChange={() => toggleScope(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Reason (optional)</h2>
          <input
            type="text"
            placeholder="e.g. Routine check-up, Emergency care"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="reason-input"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={selectedScopes.length === 0 || sending}>
            <Send size={18} />
            {sending ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </form>
    </div>
  );
}
