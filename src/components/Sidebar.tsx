import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileCheck,
  Pill,
  ClipboardList,
  ArrowRightLeft,
  Settings,
} from 'lucide-react';
import logo from '../assets/ZuriCare.png';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/scan', icon: QrCode, label: 'Scan QR' },
  { to: '/consent', icon: FileCheck, label: 'Consent Requests' },
  { to: '/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer Patient' },
  { to: '/audit', icon: ClipboardList, label: 'Audit Log' },
  { to: '/settings', icon: Settings, label: 'Clinic Settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="ZuriCare" className="sidebar-logo-img" />
        <span className="sidebar-subtitle">Healthcare Dashboard</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">JD</div>
          <div>
            <div className="sidebar-user-name">Dr. Jane Demo</div>
            <div className="sidebar-user-role">Clinician</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
