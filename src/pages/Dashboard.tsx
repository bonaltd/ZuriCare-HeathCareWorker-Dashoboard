import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  QrCode,
  FileCheck,
  Activity,
  Bell,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import './Dashboard.css';

const quickStatIcons = [
  { label: 'Patients registered today', icon: UserPlus },
  { label: 'Pending consent requests', icon: FileCheck },
  { label: 'Recent access events', icon: Activity },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ patientsToday: 0, pendingConsent: 0, accessEvents: 0 });
  const [activity, setActivity] = useState<Array<{ patient: string; action: string; time: string; status: string }>>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; count: number }>>([]);
  const [consentData, setConsentData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.activity(),
      api.dashboard.weeklyChart(),
      api.dashboard.consentChart(),
    ])
      .then(([s, a, w, c]) => {
        if (!cancelled) {
          setStats(s);
          setActivity(a);
          setWeeklyData(w.length ? w : [{ day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 }, { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 }]);
          setConsentData(c.length ? c : [{ name: 'Granted', value: 0, color: '#059669' }, { name: 'Pending', value: 0, color: '#FF8C00' }, { name: 'Denied', value: 0, color: '#dc2626' }]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const quickStats = [
    { ...quickStatIcons[0], value: stats.patientsToday, trend: null as string | null },
    { ...quickStatIcons[1], value: stats.pendingConsent, trend: null },
    { ...quickStatIcons[2], value: stats.accessEvents, trend: null },
  ];

  const recentActivity = activity.length ? activity : [
    { patient: '—', action: 'No activity yet', time: '—', status: 'viewed' },
  ];

  return (
    <div className="dashboard">
      <section className="stats-section">
        <h2>Today's Overview</h2>
        <div className="stats-grid">
          {quickStats.map(({ label, value, icon: Icon, trend }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon-wrap">
                <Icon size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value-row">
                  <span className="stat-value">{loading ? '…' : value}</span>
                  {trend && <span className="stat-trend">{trend}</span>}
                </div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="charts-grid">
            <section className="chart-section">
              <h3>Patients Registered This Week</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="chart-section">
              <h3>Consent Status</h3>
              <div className="chart-container chart-pie">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={consentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {consentData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="dashboard-grid">
            <section className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <Link to="/audit" className="section-link">View all</Link>
              </div>
              <div className="activity-list">
                {recentActivity.map((item, i) => (
                  <div key={i} className={`activity-item activity-${item.status}`}>
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <strong>{item.patient}</strong> — {item.action}
                    </div>
                    <span className="activity-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="notifications-section">
              <h2>
                <Bell size={20} />
                Notifications
              </h2>
              <div className="notifications-list">
                <div className="notification-item notification-pending">
                  <div className="notification-icon">!</div>
                  <div>
                    <p>{stats.pendingConsent} patient(s) haven&apos;t responded to consent requests</p>
                    <Link to="/consent">View requests →</Link>
                  </div>
                </div>
                <div className="notification-item notification-success">
                  <div className="notification-icon">✓</div>
                  <p>System running normally</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="quick-actions-sidebar">
          <h2>Quick Actions</h2>
          <div className="quick-actions-list">
            <Link to="/register" className="quick-action-card quick-action-primary">
              <div className="quick-action-icon">
                <UserPlus size={24} />
              </div>
              <span>Register new patient</span>
              <ArrowRight size={18} className="quick-action-arrow" />
            </Link>
            <Link to="/scan" className="quick-action-card">
              <div className="quick-action-icon">
                <QrCode size={24} />
              </div>
              <span>Scan patient QR</span>
              <ArrowRight size={18} className="quick-action-arrow" />
            </Link>
            <Link to="/consent" className="quick-action-card">
              <div className="quick-action-icon">
                <FileCheck size={24} />
              </div>
              <span>Pending consent requests</span>
              <ArrowRight size={18} className="quick-action-arrow" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
