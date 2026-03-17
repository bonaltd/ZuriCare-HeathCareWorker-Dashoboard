import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight, Check, QrCode, Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../api/client';
import HealthCard from '../components/HealthCard';
import './PatientRegistration.css';

const STEPS = [
  'Identity',
  'Demographics',
  'Health profile',
  'Prescriptions',
  'Generate ID & QR',
];

export default function PatientRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nationalId: '',
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    phone: '',
    email: '',
    photoDataUrl: '' as string,
    allergies: [] as string[],
    allergyInput: '',
    bloodType: '',
    chronicConditions: [] as string[],
    conditionInput: '',
    vaccinations: [] as string[],
    vaccinationInput: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadCard = async () => {
    const el = document.getElementById('health-card');
    if (!el) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `zuricare-health-card-${generatedId ?? 'patient'}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const addToList = (field: 'allergies' | 'chronicConditions' | 'vaccinations', inputField: string) => {
    const value = formData[inputField as keyof typeof formData] as string;
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
        [inputField]: '',
      }));
    }
  };

  const removeFromList = (field: 'allergies' | 'chronicConditions' | 'vaccinations', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((p) => ({ ...p, photoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearPhoto = () => setFormData((p) => ({ ...p, photoDataUrl: '' }));

  const handleComplete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.patients.register({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth || undefined,
        nationality: formData.nationality || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        bloodType: formData.bloodType || undefined,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        vaccinations: formData.vaccinations,
        emergencyContact:
          formData.emergencyName && formData.emergencyPhone
            ? {
                name: formData.emergencyName,
                relationship: formData.emergencyRelationship || undefined,
                phone: formData.emergencyPhone,
              }
            : undefined,
      });
      setGeneratedId(res.zuriCareId);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <header className="page-header">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} />
          Back
        </Link>
        <div>
          <h1>Register new patient</h1>
          <p className="page-subtitle">Multi-step enrollment into ZuriCare</p>
        </div>
      </header>

      <div className="step-indicator">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step-indicator-item ${step > i + 1 ? 'step-done' : ''} ${step === i + 1 ? 'step-active' : ''}`}
          >
            <span className="step-number">{step > i + 1 ? <Check size={16} /> : i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="registration-form-card">
        {step === 1 && (
          <div className="form-step">
            <h2>Identity verification</h2>
            <p className="form-hint">Enter national ID, refugee ID, or passport number.</p>
            <div className="form-group">
              <label>ID / Passport number</label>
              <input
                type="text"
                placeholder="Optional – MOSIP lookup"
                value={formData.nationalId}
                onChange={(e) => setFormData((p) => ({ ...p, nationalId: e.target.value }))}
              />
            </div>
            <p className="form-hint">If no ID available, proceed to manual entry.</p>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Demographics</h2>
            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Full name"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  placeholder="e.g. Kenyan"
                  value={formData.nationality}
                  onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group patient-photo-group">
              <label>Patient photo (optional)</label>
              <p className="form-hint">This will appear on the health card. Take a photo or upload an image.</p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoChange}
                className="patient-photo-input"
                aria-label="Take or upload patient photo"
              />
              {formData.photoDataUrl ? (
                <div className="patient-photo-preview-wrap">
                  <img src={formData.photoDataUrl} alt="Patient" className="patient-photo-preview" />
                  <div className="patient-photo-actions">
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => photoInputRef.current?.click()}>
                      <Camera size={16} />
                      Change photo
                    </button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={clearPhoto} aria-label="Remove photo">
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline patient-photo-trigger"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Camera size={20} />
                  Take or upload photo
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Health profile</h2>
            <div className="form-group">
              <label>Allergies</label>
              <div className="tag-input">
                <input
                  type="text"
                  placeholder="e.g. Penicillin"
                  value={formData.allergyInput}
                  onChange={(e) => setFormData((p) => ({ ...p, allergyInput: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('allergies', 'allergyInput'))}
                />
                <button type="button" className="btn btn-sm btn-outline" onClick={() => addToList('allergies', 'allergyInput')}>
                  Add
                </button>
              </div>
              <div className="tag-list">
                {formData.allergies.map((a, i) => (
                  <span key={i} className="tag">
                    {a} <button type="button" onClick={() => removeFromList('allergies', i)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Blood type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData((p) => ({ ...p, bloodType: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chronic conditions</label>
              <div className="tag-input">
                <input
                  type="text"
                  placeholder="e.g. Asthma, Diabetes"
                  value={formData.conditionInput}
                  onChange={(e) => setFormData((p) => ({ ...p, conditionInput: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('chronicConditions', 'conditionInput'))}
                />
                <button type="button" className="btn btn-sm btn-outline" onClick={() => addToList('chronicConditions', 'conditionInput')}>
                  Add
                </button>
              </div>
              <div className="tag-list">
                {formData.chronicConditions.map((c, i) => (
                  <span key={i} className="tag">
                    {c} <button type="button" onClick={() => removeFromList('chronicConditions', i)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Vaccination history</label>
              <div className="tag-input">
                <input
                  type="text"
                  placeholder="e.g. COVID-19, Measles"
                  value={formData.vaccinationInput}
                  onChange={(e) => setFormData((p) => ({ ...p, vaccinationInput: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('vaccinations', 'vaccinationInput'))}
                />
                <button type="button" className="btn btn-sm btn-outline" onClick={() => addToList('vaccinations', 'vaccinationInput')}>
                  Add
                </button>
              </div>
              <div className="tag-list">
                {formData.vaccinations.map((v, i) => (
                  <span key={i} className="tag">
                    {v} <button type="button" onClick={() => removeFromList('vaccinations', i)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Emergency contact</label>
              <div className="form-row form-row-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData((p) => ({ ...p, emergencyName: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={formData.emergencyRelationship}
                  onChange={(e) => setFormData((p) => ({ ...p, emergencyRelationship: e.target.value }))}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <h2>Prescription history (optional)</h2>
            <p className="form-hint">Add current or previous prescriptions after registration.</p>
          </div>
        )}

        {step === 5 && generatedId && (
          <div className="form-step registration-complete-step">
            <h2>Patient registration complete</h2>
            <p className="registration-complete-subtitle">Download the health card for this patient.</p>
            {error && <p className="form-error">{error}</p>}
            <div className="zuri-id-display">
              <QrCode size={48} />
              <p>ZuriCare ID</p>
              <code className="zuri-id-large">{generatedId}</code>
            </div>
            <div className="health-card-preview-wrap printable-health-card-wrapper" id="printable-health-card">
              <HealthCard
                patient={{
                  fullName: formData.fullName,
                  dateOfBirth: formData.dateOfBirth || undefined,
                  nationality: formData.nationality || undefined,
                  zuriCareId: generatedId,
                  photoUrl: formData.photoDataUrl || undefined,
                }}
              />
            </div>
            <div className="completion-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDownloadCard}
                disabled={downloading}
              >
                <Download size={18} />
                {downloading ? 'Downloading…' : 'Download health card'}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/patients')}>
                Done
              </button>
            </div>
          </div>
        )}

        {step < 5 && (
          <div className="form-actions">
            {error && <p className="form-error">{error}</p>}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => (step === 4 ? handleComplete() : setStep((s) => s + 1))}
              disabled={submitting || (step === 2 && !formData.fullName.trim())}
            >
              {step === 4 ? (submitting ? 'Registering…' : 'Generate ID & QR') : 'Next'}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
