import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Camera, CameraOff, CheckCircle, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api/client';
import './ScanQR.css';

export default function ScanQR() {
  const [lookupId, setLookupId] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; name?: string; id?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setSearchResult(null);
    try {
      const res = await api.patients.lookup(lookupId.trim());
      setSearchResult(
        res.found
          ? { found: true, name: res.name, id: res.id }
          : { found: false, id: lookupId.trim() }
      );
    } catch {
      setSearchResult({ found: false, id: lookupId.trim() });
    } finally {
      setLookupLoading(false);
    }
  };

  const extractZuriCareId = (text: string): string => {
    const trimmed = text.trim();
    const match = trimmed.match(/ZC[-A-Z0-9]+/i);
    return match ? match[0] : trimmed;
  };

  const handleScannedCode = async (decodedText: string) => {
    const id = extractZuriCareId(decodedText);
    setScannedId(id);
    try {
      const res = await api.patients.lookup(id);
      setSearchResult(
        res.found
          ? { found: true, name: res.name, id: res.id }
          : { found: false, id }
      );
    } catch {
      setSearchResult({ found: false, id });
    }
    stopScanning();
  };

  const startScanning = async () => {
    setScanError(null);
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScannedCode(decodedText),
        () => {}
      );
      scannerRef.current = html5QrCode;
    } catch (err) {
      setIsScanning(false);
      setScanError(err instanceof Error ? err.message : 'Could not access camera. Ensure you have granted permission.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const clearResult = () => {
    setSearchResult(null);
    setScannedId(null);
    setLookupId('');
  };

  return (
    <div className="scan-page">
      <header className="page-header">
        <div>
          <h1>Scan QR / Patient Lookup</h1>
          <p className="page-subtitle">Identify patients via QR code or ZuriCare ID</p>
        </div>
      </header>

      <div className="scan-options">
        <section className="scan-section">
          <h2>Scan patient QR code</h2>
          <div className="scan-camera-area" ref={scanContainerRef}>
            {!isScanning ? (
              <div className="scan-camera-placeholder">
                <Camera size={48} />
                <p>Point your camera at the patient's QR code</p>
                <p className="scan-hint">QR codes can contain ZuriCare ID or a link to patient data</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startScanning}
                >
                  <Camera size={18} />
                  Start camera
                </button>
              </div>
            ) : (
              <div className="qr-scanner-wrapper">
                <div id="qr-reader" className="qr-reader" />
                <button
                  type="button"
                  className="btn btn-outline scan-stop-btn"
                  onClick={stopScanning}
                >
                  <CameraOff size={18} />
                  Stop camera
                </button>
              </div>
            )}
          </div>
          {scanError && (
            <div className="scan-error">
              <XCircle size={20} />
              <span>{scanError}</span>
            </div>
          )}
        </section>

        <section className="lookup-section">
          <h2>Or lookup by ZuriCare ID</h2>
          <form onSubmit={handleLookup} className="lookup-form">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="e.g. ZC-20240315-ABC123"
                value={lookupId}
                onChange={(e) => {
                  setLookupId(e.target.value);
                  setSearchResult(null);
                }}
              />
            </div>
            <div className="lookup-form-actions">
              <button type="submit" className="btn btn-primary" disabled={lookupLoading}>
                {lookupLoading ? 'Looking up…' : 'Look up patient'}
              </button>
              {(searchResult || scannedId) && (
                <button type="button" className="btn btn-outline" onClick={clearResult}>
                  Clear
                </button>
              )}
            </div>
          </form>

          {searchResult && (
            <div className={`lookup-result lookup-${searchResult.found ? 'found' : 'not-found'}`}>
              {searchResult.found ? (
                <>
                  <div className="lookup-result-header">
                    <CheckCircle size={24} />
                    <h3>Patient found</h3>
                  </div>
                  <p><strong>{searchResult.name}</strong></p>
                  <p><code className="zuri-id">{searchResult.id}</code></p>
                  <div className="lookup-actions">
                    <Link
                      to={`/request-access?patient=${searchResult.id}`}
                      className="btn btn-primary"
                    >
                      Request access
                    </Link>
                    <Link
                      to={`/medical-summary?patient=${searchResult.id}`}
                      className="btn btn-outline"
                    >
                      View summary
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="lookup-result-header">
                    <XCircle size={24} />
                    <h3>Patient not found</h3>
                  </div>
                  <p>
                    No patient with ZuriCare ID <code className="zuri-id">{searchResult.id || lookupId}</code> was found.
                  </p>
                  <Link to="/register" className="btn btn-primary">
                    <UserPlus size={18} />
                    Register new patient
                  </Link>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
