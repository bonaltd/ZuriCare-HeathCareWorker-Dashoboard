import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { api } from '../api/client';
import './AuditLog.css';

const ROWS_PER_PAGE = 3;

export default function AuditLog() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState<Array<{
    id: string;
    timestamp: string;
    user: string;
    patient: string;
    action: string;
    result: string;
    scopes: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const actionMap: Record<string, string> = {
      all: '',
      registration: 'registration',
      access_request: 'consent_request',
      consent_granted: 'consent_granted',
      consent_denied: 'consent_denied',
      medical_summary: 'medical_summary',
    };
    api.audit
      .list({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        action: actionMap[actionFilter] || undefined,
      })
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedEntries = entries.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <div className="audit-page">
      <header className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="page-subtitle">Compliance and access event tracking</p>
        </div>
        <button className="btn btn-outline">
          <Download size={18} />
          Export CSV
        </button>
      </header>

      <div className="audit-filters">
        <div className="filter-group">
          <label>Date range</label>
          <div className="date-inputs">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Action type</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All actions</option>
            <option value="registration">Registration</option>
            <option value="access_request">Access request</option>
            <option value="consent_granted">Consent granted</option>
            <option value="consent_denied">Consent denied</option>
            <option value="medical_summary">Medical summary viewed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>User</label>
          <select>
            <option>All users</option>
          </select>
        </div>
      </div>

      <div className="audit-table-container">
        {loading ? (
          <p className="loading-state">Loading audit log…</p>
        ) : (
          <>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Patient (ZuriCare ID)</th>
                  <th>Action</th>
                  <th>Result</th>
                  <th>Scopes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No audit entries found
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.timestamp}</td>
                      <td>{entry.user}</td>
                      <td><code className="zuri-id">{entry.patient}</code></td>
                      <td>{entry.action}</td>
                      <td>
                        <span className={`audit-result audit-${entry.result.toLowerCase()}`}>
                          {entry.result}
                        </span>
                      </td>
                      <td>{entry.scopes}</td>
                    </tr>
                  ))
                )}
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
                Showing {entries.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ROWS_PER_PAGE, entries.length)} of {entries.length} entries
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
