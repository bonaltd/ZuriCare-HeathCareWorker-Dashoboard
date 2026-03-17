import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/ZuriCare.png';
import './HealthCard.css';

export interface HealthCardPatient {
  fullName: string;
  dateOfBirth?: string;
  nationality?: string;
  zuriCareId: string;
  photoUrl?: string | null;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function HealthCard({ patient }: { patient: HealthCardPatient }) {
  const { fullName, dateOfBirth, nationality, zuriCareId, photoUrl } = patient;

  return (
    <div className="health-card" id="health-card">
      <div className="health-card-header">
        <div className="health-card-brand">
          <img src={logo} alt="Zuri Care" className="health-card-logo" />
        </div>
        <h1 className="health-card-title">HEALTH CARD</h1>
      </div>

      <div className="health-card-body">
        <div className="health-card-left">
          <div className="health-card-photo-wrap">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="health-card-photo" />
            ) : (
              <div className="health-card-photo-initials">{getInitials(fullName)}</div>
            )}
          </div>
          <div className="health-card-details">
            <p className="health-card-name">{fullName.toUpperCase()}</p>
            <div className="health-card-row">
              <span className="health-card-label">DATE OF BIRTH</span>
              <span className="health-card-value">{dateOfBirth || '—'}</span>
            </div>
            <div className="health-card-row">
              <span className="health-card-label">NATIONALITY</span>
              <span className="health-card-value">{nationality || '—'}</span>
            </div>
          </div>
        </div>
        <div className="health-card-qr-wrap">
          <QRCodeSVG
            value={zuriCareId}
            size={120}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: logo,
              height: 28,
              width: 28,
              excavate: true,
            }}
            className="health-card-qr"
          />
        </div>
      </div>

      <div className="health-card-divider" />

      <div className="health-card-footer">
        <div className="health-card-id-row">
          <span className="health-card-label">ZURICARE ID</span>
          <span className="health-card-id-value">{zuriCareId}</span>
        </div>
        <p className="health-card-tagline">Quality Care Without Borders</p>
      </div>
    </div>
  );
}
