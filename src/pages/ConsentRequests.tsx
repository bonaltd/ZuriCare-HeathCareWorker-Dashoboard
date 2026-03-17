import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import './ConsentRequests.css';

const scopeLabels: Record<string, string> = {
  allergies: 'Allergies',
  bloodType: 'Blood type',
  chronicConditions: 'Chronic conditions',
  vaccinationHistory: 'Vaccination history',
  prescriptionHistory: 'Medical history',
  emergencyContact: 'Emergency contact',
};

export default function ConsentRequests() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'granted' | 'denied'>('all');
  const [requests, setRequests] = useState<Array<{
    id: string;
    patient: string;
    zuriId: string;
    scopes: string[];
    status: string;
    sentAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.consent
      .list(filter === 'all' ? undefined : filter)
      .then((data) => { if (!cancelled) setRequests(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter]);

  const filtered = requests;

  return (
    <div className="consent-page">
      <header className="page-header">
        <div>
          <h1>Consent Requests</h1>
          <p className="page-subtitle">Track and manage data access requests</p>
        </div>
      </header>

      <div className="consent-filters">
        {(['all', 'pending', 'granted', 'denied'] as const).map((status) => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="consent-list">
        {loading ? (
          <p className="loading-state">Loading consent requests…</p>
        ) : filtered.length === 0 ? (
          <p className="loading-state">No consent requests found</p>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className={`consent-card consent-${req.status}`}>
              <div className="consent-card-header">
                <div>
                  <h3>{req.patient}</h3>
                  <code className="zuri-id">{req.zuriId}</code>
                </div>
                <span className={`consent-badge consent-badge-${req.status}`}>
                  {req.status === 'pending' && <Clock size={14} />}
                  {req.status === 'granted' && <Check size={14} />}
                  {req.status === 'denied' && <X size={14} />}
                  {req.status}
                </span>
              </div>
              <div className="consent-scopes">
                <strong>Requested:</strong>{' '}
                {req.scopes.map((s) => scopeLabels[s] || s).join(', ') || '—'}
              </div>
              <div className="consent-footer">
                <span className="consent-time">Sent {req.sentAt}</span>
                {req.status === 'pending' && (
                  <div className="consent-actions">
                    <button className="btn btn-sm btn-outline">
                      <RefreshCw size={14} />
                      Resend
                    </button>
                    <button className="btn btn-sm btn-outline">Cancel</button>
                  </div>
                )}
                {req.status === 'granted' && (
                  <Link to={`/medical-summary?patient=${req.zuriId}`} className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}>
                    View medical summary
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
