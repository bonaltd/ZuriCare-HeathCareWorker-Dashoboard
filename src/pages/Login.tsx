import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Users, Shield, FileText, ClipboardList, ArrowRightLeft } from 'lucide-react';
import logo from '../assets/ZuriCare.png';
import { useAuth } from '../contexts/AuthContext';
import BackgroundDecorations from '../components/BackgroundDecorations';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) {
    return (
      <div className="login-page login-loading-wrap">
        <BackgroundDecorations />
        <div className="auth-loading">
          <div className="auth-loading-spinner" />
          <p>Redirecting…</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <BackgroundDecorations />

      <div className="login-wrapper">
        <div className="login-about">
          <h1 className="login-about-title">Healthcare Worker Dashboard</h1>
          <p className="login-about-region">Assisting mobile patients across Africa</p>
          <p className="login-about-desc">
            For doctors, nurses, and clinic staff. ZuriCare helps healthcare workers assist 
            patients who use the ZuriCare mobile app—securely manage patient data, request 
            consent, and access medical summaries while keeping patient privacy at the centre.
          </p>
          <ul className="login-about-features">
            <li><Users size={18} /> Patient registration & QR identification</li>
            <li><Shield size={18} /> Consent-based data access</li>
            <li><FileText size={18} /> Medical summaries & prescriptions</li>
            <li><ClipboardList size={18} /> Full audit trail for compliance</li>
            <li><ArrowRightLeft size={18} /> Transfer patients between clinics</li>
          </ul>
        </div>

        <div className="login-container">
          <div className="login-card">
          <div className="login-card-decorations" aria-hidden="true">
            <svg viewBox="0 0 440 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#006666" stopOpacity="0.06" />
                  <stop offset="50%" stopColor="#00CED1" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#66CC00" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="cardGradGreen" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#66CC00" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#006666" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="cardOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00CED1" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#66CC00" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#008080" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <circle cx="380" cy="60" r="40" fill="url(#cardGrad)" />
              <circle cx="50" cy="420" r="50" fill="url(#cardGradGreen)" />
              <circle cx="220" cy="260" r="60" fill="url(#cardGrad)" />
              <rect x="20" y="80" width="80" height="60" rx="12" fill="none" stroke="url(#cardOutline)" strokeWidth="1" />
              <rect x="340" y="380" width="70" height="55" rx="10" fill="none" stroke="url(#cardOutline)" strokeWidth="1" />
              {[[100, 50, 150, 100], [320, 200, 370, 250], [80, 350, 130, 400]].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#66CC00" strokeOpacity="0.12" strokeWidth="1" />
              ))}
              <g fill="#66CC00" fillOpacity="0.1">
                {Array.from({ length: 12 }, (_, i) => (
                  <circle key={i} cx={30 + (i % 4) * 14} cy={120 + Math.floor(i / 4) * 16} r="1.5" />
                ))}
              </g>
              <g fill="#66CC00" fillOpacity="0.1">
                {Array.from({ length: 12 }, (_, i) => (
                  <circle key={`b-${i}`} cx={350 + (i % 4) * 14} cy={340 + Math.floor(i / 4) * 16} r="1.5" />
                ))}
              </g>
            </svg>
          </div>
          <div className="login-logo">
            <img src={logo} alt="ZuriCare" className="login-logo-img" />
          </div>
          <h2>Sign in</h2>
          <p className="login-card-hint">Healthcare workers: sign in with your clinic credentials</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <div className="login-input-wrap">
                <Mail size={20} className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@clinic.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <Lock size={20} className="login-input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="login-demo-hint">
            Demo: <code>demo@zuricare.org</code> / <code>demo123</code>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
