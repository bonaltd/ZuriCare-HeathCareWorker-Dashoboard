import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Calendar } from 'lucide-react';
import { api } from '../api/client';
import './MedicalSummary.css';

const defaultSummary = {
  patientId: '',
  patientName: '',
  consentGrantedAt: '—',
  expiry: 'Single visit',
  allergies: [] as string[],
  bloodType: '—',
  chronicConditions: [] as string[],
  vaccinationHistory: [] as string[],
  prescriptionHistory: [] as Array<{ medication: string; dosage: string; prescriber: string; date: string; status: string }>,
  emergencyContact: { name: '—', relationship: '—', phone: '—' },
};

export default function MedicalSummary() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient') || '';
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError('No patient ID provided');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.medicalSummary(patientId)
      .then((data) => {
        if (!cancelled) {
          setSummary({
            patientId: data.patientId,
            patientName: data.patientName,
            consentGrantedAt: data.consentGrantedAt,
            expiry: data.expiry,
            allergies: data.allergies || [],
            bloodType: data.bloodType || '—',
            chronicConditions: data.chronicConditions || [],
            vaccinationHistory: data.vaccinationHistory || [],
            prescriptionHistory: data.prescriptionHistory || [],
            emergencyContact: data.emergencyContact || defaultSummary.emergencyContact,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [patientId]);

  if (loading) {
    return (
      <div className="medical-summary-page">
        <p className="loading-state">Loading medical summary…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medical-summary-page">
        <div className="summary-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="medical-summary-page">
      <header className="summary-header">
        <div>
          <h1>Medical Summary</h1>
          <p className="page-subtitle">
            {summary.patientName} • <code className="zuri-id">{summary.patientId || patientId}</code>
          </p>
        </div>
        <div className="consent-meta">
          <span><Shield size={16} /> Consent granted: {summary.consentGrantedAt}</span>
          <span><Calendar size={16} /> Expiry: {summary.expiry}</span>
        </div>
      </header>

      <div className="summary-sections">
        <section className="summary-section">
          <h2>Allergies</h2>
          <ul>
            {summary.allergies.length ? summary.allergies.map((a, i) => (
              <li key={i}>{a}</li>
            )) : <li>None recorded</li>}
          </ul>
        </section>

        <section className="summary-section">
          <h2>Blood Type</h2>
          <p className="blood-type">{summary.bloodType}</p>
        </section>

        <section className="summary-section">
          <h2>Chronic Conditions</h2>
          <ul>
            {summary.chronicConditions.length ? summary.chronicConditions.map((c, i) => (
              <li key={i}>{c}</li>
            )) : <li>None recorded</li>}
          </ul>
        </section>

        <section className="summary-section">
          <h2>Vaccination History</h2>
          <ul>
            {summary.vaccinationHistory.length ? summary.vaccinationHistory.map((v, i) => (
              <li key={i}>{v}</li>
            )) : <li>None recorded</li>}
          </ul>
        </section>

        <section className="summary-section">
          <h2>Prescription History</h2>
          <div className="prescription-list">
            {summary.prescriptionHistory.length ? summary.prescriptionHistory.map((p, i) => (
              <div key={i} className="prescription-item">
                <div className="prescription-header">
                  <strong>{p.medication}</strong>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                </div>
                <p>{p.dosage}</p>
                <p className="prescription-meta">Prescribed by {p.prescriber} on {p.date}</p>
              </div>
            )) : <p>No prescriptions recorded</p>}
          </div>
        </section>

        <section className="summary-section">
          <h2>Emergency Contact</h2>
          <div className="emergency-contact">
            <p><strong>{summary.emergencyContact.name}</strong></p>
            <p>{summary.emergencyContact.relationship}</p>
            <p>{summary.emergencyContact.phone}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
