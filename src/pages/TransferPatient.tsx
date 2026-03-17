import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightLeft, Plus, Check, Camera, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api/client';
import SearchableSelect from '../components/SearchableSelect';
import './TransferPatient.css';

type SearchableOption = { value: string; label: string; sublabel?: string };

const DEMO_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

export default function TransferPatient() {
  const [searchParams] = useSearchParams();
  const preselectedPatient = searchParams.get('patient') || '';

  const [showForm, setShowForm] = useState(false);
  const [transfers, setTransfers] = useState<Array<{
    id: string;
    patientId: string;
    patientName: string;
    fromClinic: string;
    fromCountry: string;
    toClinic: string;
    toCountry: string;
    reason: string;
    status: string;
    transferDate: string;
    createdAt: string;
  }>>([]);
  const [clinics, setClinics] = useState<Array<{ id: string; name: string; type: string; location: string; country: string }>>([]);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patientId: preselectedPatient,
    toCountry: '',
    toClinicId: '',
    reason: '',
    transferDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [patientSelectMode, setPatientSelectMode] = useState<'search' | 'scan'>('search');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const loadTransfers = () => {
    api.transfers.list(filter === 'all' ? undefined : filter).then(setTransfers).catch(() => setTransfers([]));
  };

  useEffect(() => {
    loadTransfers();
  }, [filter]);

  useEffect(() => {
    setForm((p) => ({ ...p, patientId: preselectedPatient || p.patientId }));
  }, [preselectedPatient]);

  useEffect(() => {
    api.transfers.clinics(DEMO_CLINIC_ID).then(setClinics).catch(() => setClinics([]));
    api.patients.list().then((list) => setPatients(list.map((p) => ({ id: p.id, name: p.name })))).catch(() => setPatients([]));
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.patientId || !form.toCountry || !form.toClinicId) {
      setError('Please select patient, country, and facility');
      return;
    }
    setSubmitting(true);
    try {
      await api.transfers.create({
        patientId: form.patientId,
        toClinicId: form.toClinicId,
        reason: form.reason || undefined,
        transferDate: form.transferDate || undefined,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      setForm({ patientId: '', toCountry: '', toClinicId: '', reason: '', transferDate: '', notes: '' });
      loadTransfers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const countries = [...new Set(clinics.map((c) => c.country).filter((c) => c && c !== '—'))].sort();
  const countryOptions: SearchableOption[] = countries.map((c) => ({ value: c, label: c }));

  const facilitiesInCountry = form.toCountry
    ? clinics.filter((c) => c.country === form.toCountry)
    : [];
  const facilityOptions: SearchableOption[] = facilitiesInCountry.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: `${c.location} • ${c.type}`,
  }));

  const patientOptions: SearchableOption[] = patients.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: p.id,
  }));

  const handleCountryChange = (val: string) => {
    setForm((p) => ({ ...p, toCountry: val, toClinicId: '' }));
  };

  const extractZuriCareId = (text: string): string => {
    const trimmed = text.trim();
    const match = trimmed.match(/ZC[-A-Z0-9]+/i);
    return match ? match[0] : trimmed;
  };

  const handleScannedCode = async (decodedText: string) => {
    const id = extractZuriCareId(decodedText);
    try {
      const res = await api.patients.lookup(id);
      if (res.found && res.id) {
        setForm((p) => ({ ...p, patientId: res.id }));
        setPatientSelectMode('search');
        stopScanning();
      }
    } catch {
      // ignore
    }
    stopScanning();
  };

  const startScanning = async () => {
    setScanError(null);
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 150));
    try {
      const html5QrCode = new Html5Qrcode('transfer-qr-reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => handleScannedCode(decodedText),
        () => {}
      );
      scannerRef.current = html5QrCode;
    } catch (err) {
      setIsScanning(false);
      setScanError(err instanceof Error ? err.message : 'Could not access camera.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!showForm) {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
      setPatientSelectMode('search');
    }
  }, [showForm]);

  const handleComplete = async (id: string) => {
    try {
      await api.transfers.complete(id);
      loadTransfers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete transfer');
    }
  };

  return (
    <div className="transfer-page">
      <header className="page-header">
        <div>
          <h1>Transfer Patient</h1>
          <p className="page-subtitle">Move patients between clinics—same country or across borders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Initiate transfer
        </button>
      </header>

      {error && <div className="transfer-error">{error}</div>}

      <div className="transfer-toolbar">
        <div className="filter-tabs">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="transfer-list">
        {loading ? (
          <p className="loading-state">Loading transfers…</p>
        ) : transfers.length === 0 ? (
          <div className="transfer-empty">
            <ArrowRightLeft size={48} />
            <p>No transfers yet</p>
            <p className="transfer-empty-hint">Initiate a transfer to move a patient to another clinic in the same country or abroad.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              Initiate transfer
            </button>
          </div>
        ) : (
          transfers.map((t) => (
            <div key={t.id} className={`transfer-card transfer-${t.status}`}>
              <div className="transfer-card-main">
                <div className="transfer-route">
                  <span className="transfer-clinic">{t.fromClinic}</span>
                  <span className="transfer-country">{t.fromCountry}</span>
                  <ArrowRightLeft size={20} className="transfer-arrow" />
                  <span className="transfer-clinic">{t.toClinic}</span>
                  <span className="transfer-country">{t.toCountry}</span>
                </div>
                <div className="transfer-patient">
                  <Link to={`/medical-summary?patient=${t.patientId}`} className="transfer-patient-link">
                    {t.patientName}
                  </Link>
                  <code className="zuri-id">{t.patientId}</code>
                </div>
                {t.reason && <p className="transfer-reason">{t.reason}</p>}
                <div className="transfer-meta">
                  <span className={`transfer-status transfer-status-${t.status}`}>{t.status}</span>
                  <span className="transfer-date">{t.createdAt}</span>
                </div>
              </div>
              {t.status === 'pending' && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleComplete(t.id)}
                >
                  <Check size={14} />
                  Complete transfer
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Initiate patient transfer</h2>
            <p className="modal-hint">Transfer a patient to another clinic in the same country or a different country.</p>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit} className="transfer-form">
              <div className="form-group">
                <label>Patient</label>
                <div className="transfer-patient-select">
                  <div className="transfer-patient-tabs">
                    <button
                      type="button"
                      className={`transfer-patient-tab ${patientSelectMode === 'search' ? 'transfer-patient-tab-active' : ''}`}
                      onClick={() => { setPatientSelectMode('search'); stopScanning(); }}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      className={`transfer-patient-tab ${patientSelectMode === 'scan' ? 'transfer-patient-tab-active' : ''}`}
                      onClick={() => setPatientSelectMode('scan')}
                    >
                      Scan QR
                    </button>
                  </div>
                  {patientSelectMode === 'search' ? (
                    <SearchableSelect
                      options={patientOptions}
                      value={form.patientId}
                      onChange={(v) => setForm((p) => ({ ...p, patientId: v }))}
                      placeholder="Select patient..."
                      searchPlaceholder="Search by name or ZuriCare ID..."
                      required
                    />
                  ) : (
                    <div className="transfer-scan-area">
                      {!isScanning ? (
                        <div className="transfer-scan-placeholder">
                          <Camera size={40} />
                          <p>Scan patient QR code</p>
                          <button type="button" className="btn btn-primary btn-sm" onClick={startScanning}>
                            <Camera size={18} />
                            Start camera
                          </button>
                        </div>
                      ) : (
                        <div className="transfer-scan-active">
                          <div id="transfer-qr-reader" className="transfer-qr-reader" />
                          <button type="button" className="btn btn-outline btn-sm" onClick={stopScanning}>
                            <CameraOff size={16} />
                            Stop
                          </button>
                        </div>
                      )}
                      {scanError && <p className="transfer-scan-error">{scanError}</p>}
                      {form.patientId && (
                        <p className="transfer-scan-selected">
                          Selected: <strong>{patients.find((p) => p.id === form.patientId)?.name || form.patientId}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="transfer-destination-section">
                <h3 className="transfer-section-title">Destination</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <SearchableSelect
                      options={countryOptions}
                      value={form.toCountry}
                      onChange={handleCountryChange}
                      placeholder="Select country first..."
                      searchPlaceholder="Search country..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Facility</label>
                    <SearchableSelect
                      options={facilityOptions}
                      value={form.toClinicId}
                      onChange={(v) => setForm((p) => ({ ...p, toClinicId: v }))}
                      placeholder={form.toCountry ? 'Select facility...' : 'Select country first'}
                      searchPlaceholder="Search facility..."
                      required
                      disabled={!form.toCountry}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Reason (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Relocation, specialist care"
                    value={form.reason}
                    onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Transfer date (optional)</label>
                  <input
                    type="date"
                    value={form.transferDate}
                    onChange={(e) => setForm((p) => ({ ...p, transferDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Initiate transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
