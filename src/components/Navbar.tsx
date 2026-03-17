import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/scan': 'Scan QR',
  '/consent': 'Consent Requests',
  '/medical-summary': 'Medical Summary',
  '/prescriptions': 'Prescriptions',
  '/transfer': 'Transfer Patient',
  '/audit': 'Audit Log',
  '/settings': 'Clinic Settings',
  '/register': 'Register Patient',
  '/request-access': 'Request Access',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const pathname = location.pathname;
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" aria-label="Toggle menu">
        <Menu size={24} />
      </button>
      <h1 className="navbar-title">{pageTitle}</h1>
      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={20} />
          <input type="search" placeholder="Search patients, prescriptions..." />
        </div>
        <div className="navbar-actions">
          <button className="navbar-icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="navbar-badge">3</span>
          </button>
          <div className="navbar-user">
            <div className="navbar-user-avatar">{user ? getInitials(user.fullName) : '—'}</div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.fullName ?? '—'}</span>
              <span className="navbar-user-role">{user?.clinicName ?? '—'}</span>
            </div>
            <button
              className="navbar-logout-btn"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
