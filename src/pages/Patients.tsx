import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, MoreVertical, Eye, FileCheck, ArrowRightLeft, Camera, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api/client';
import './Patients.css';

const ROWS_PER_PAGE = 3;

export default function Patients() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<Array<{ id: string; name: string; phone: string; lastAccess: string; registered: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanCard, setShowScanCard] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedPatient, setScannedPatient] = useState<{ id: string; name: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const extractZuriCareId = (text: string): string => {
    const trimmed = text.trim();
    const match = trimmed.match(/ZC[-A-Z0-9]+/i);
    return match ? match[0] : trimmed;
  };

  const handleScannedCode = async (decodedText: string) => {
    const id = extractZuriCareId(decodedText);
    try {
      const res = await api.patients.lookup(id);
      if (res.found && res.id && res.name) {
        setScannedPatient({ id: res.id, name: res.name });
      } else {
        setScannedPatient({ id, name: 'Patient not found' });
      }
    } catch {
      setScannedPatient({ id, name: 'Lookup failed' });
    }
    stopScanning();
  };

  const startScanning = async () => {
    setScanError(null);
    setScannedPatient(null);
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 150));
    try {
      const html5QrCode = new Html5Qrcode('patients-qr-reader');
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
        /* ignore */
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const closeScanCard = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setShowScanCard(false);
    setIsScanning(false);
    setScannedPatient(null);
    setScanError(null);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!showScanCard) {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  }, [showScanCard]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.patients
      .list({ search: search || undefined, filter: filter === 'recent' ? 'recent' : undefined })
      .then((data) => {
        if (!cancelled) setPatients(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(patients.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedPatients = patients.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <div className="patients-page">
      <header className="page-header">
        <div>
          <h1>Patients</h1>
          <p className="page-subtitle">Search and manage registered patients</p>
        </div>
        <Link to="/register" className="btn btn-primary">
          <UserPlus size={18} />
          Register patient
        </Link>
      </header>

      <div className="patients-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search by name, ZuriCare ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All patients</option>
          <option value="recent">Registered this week</option>
          <option value="accessed">Accessed recently</option>
        </select>
        <button
          type="button"
          className={`btn btn-outline ${showScanCard ? 'btn-active' : ''}`}
          onClick={() => setShowScanCard((v) => !v)}
        >
          <Camera size={18} />
          {showScanCard ? 'Hide scanner' : 'Scan QR'}
        </button>
      </div>

      {showScanCard && (
        <div className="patients-scan-card">
          <div className="patients-scan-card-header">
            <h3>Scan patient QR code</h3>
            <p>Point camera at the patient&apos;s QR code instead of searching</p>
            <button type="button" className="btn-close-scan" onClick={closeScanCard} aria-label="Close">×</button>
          </div>
          <div className="patients-scan-card-body">
            {!isScanning ? (
              <div className="patients-scan-placeholder">
                <Camera size={48} />
                <p>Scan patient QR code from their card or app</p>
                <button type="button" className="btn btn-primary" onClick={startScanning}>
                  <Camera size={18} />
                  Start camera
                </button>
              </div>
            ) : (
              <div className="patients-scan-active">
                <div id="patients-qr-reader" className="patients-qr-reader" />
                <button type="button" className="btn btn-outline btn-sm" onClick={stopScanning}>
                  <CameraOff size={16} />
                  Stop camera
                </button>
              </div>
            )}
            {scanError && <p className="patients-scan-error">{scanError}</p>}
            {scannedPatient && (
              <div className={`patients-scan-result ${scannedPatient.name === 'Patient not found' || scannedPatient.name === 'Lookup failed' ? 'patients-scan-not-found' : ''}`}>
                <p>
                  {scannedPatient.name === 'Patient not found' || scannedPatient.name === 'Lookup failed'
                    ? <>No patient found for <code className="zuri-id">{scannedPatient.id}</code></>
                    : <>Patient identified: <strong>{scannedPatient.name}</strong> <code className="zuri-id">{scannedPatient.id}</code></>
                  }
                </p>
                <div className="patients-scan-actions">
                  {(scannedPatient.name === 'Patient not found' || scannedPatient.name === 'Lookup failed') ? (
                    <>
                      <Link to="/register" className="btn btn-primary" onClick={closeScanCard}>
                        Register new patient
                      </Link>
                      <button type="button" className="btn btn-outline" onClick={() => setScannedPatient(null)}>
                        Scan again
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={`/medical-summary?patient=${scannedPatient.id}`} className="btn btn-primary" onClick={closeScanCard}>
                        View summary
                      </Link>
                      <Link to={`/transfer?patient=${scannedPatient.id}`} className="btn btn-outline" onClick={closeScanCard}>
                        Transfer
                      </Link>
                      <button type="button" className="btn btn-outline" onClick={() => setScannedPatient(null)}>
                        Scan again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="patients-error">
          {error}
        </div>
      )}

      <div className="patients-table-container">
        {loading ? (
          <p className="loading-state">Loading patients…</p>
        ) : (
          <>
            <table className="patients-table">
              <thead>
                <tr>
                  <th>ZuriCare ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Last access</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <code className="zuri-id">{patient.id}</code>
                    </td>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.lastAccess}</td>
                    <td>{patient.registered}</td>
                    <td>
                      <div className="patient-actions">
                        <Link to={`/medical-summary?patient=${patient.id}`} className="btn-icon" title="View medical summary">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/request-access?patient=${patient.id}`} className="btn-icon" title="Request access">
                          <FileCheck size={18} />
                        </Link>
                        <Link to={`/transfer?patient=${patient.id}`} className="btn-icon" title="Transfer patient">
                          <ArrowRightLeft size={18} />
                        </Link>
                        <button className="btn-icon" title="More options">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <div className="pagination-controls">
                <div className="pagination-buttons">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-page">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
              <span className="pagination-info">
                Showing {patients.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ROWS_PER_PAGE, patients.length)} of {patients.length} patients
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
