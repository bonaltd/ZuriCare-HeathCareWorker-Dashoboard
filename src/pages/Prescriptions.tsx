import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '../api/client';
import './Prescriptions.css';

const ROWS_PER_PAGE = 3;

export default function Prescriptions() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [prescriptions, setPrescriptions] = useState<Array<{
    id: string;
    patient: string;
    medication: string;
    dosage: string;
    prescriber: string;
    date: string;
    condition: string;
    status: string;
  }>>([]);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    datePrescribed: new Date().toISOString().slice(0, 10),
    duration: '',
    condition: '',
    pharmacy: '',
  });

  const loadPrescriptions = () => {
    setLoading(true);
    api.prescriptions
      .list(filter === 'all' ? undefined : filter)
      .then(setPrescriptions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPrescriptions();
  }, [filter]);

  useEffect(() => {
    api.patients.list().then((list) =>
      setPatients(list.map((p) => ({ id: p.id, name: p.name })))
    ).catch(() => {});
  }, []);

  const filtered = prescriptions;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedPrescriptions = filtered.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addForm.patientId || !addForm.medicationName.trim()) {
      setAddError('Patient and medication are required');
      return;
    }
    try {
      await api.prescriptions.add({
        patientId: addForm.patientId,
        medicationName: addForm.medicationName.trim(),
        dosage: addForm.dosage || undefined,
        datePrescribed: addForm.datePrescribed || undefined,
        duration: addForm.duration || undefined,
        condition: addForm.condition || undefined,
        pharmacy: addForm.pharmacy || undefined,
      });
      setShowAddModal(false);
      setAddForm({ patientId: '', medicationName: '', dosage: '', datePrescribed: new Date().toISOString().slice(0, 10), duration: '', condition: '', pharmacy: '' });
      loadPrescriptions();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add prescription');
    }
  };

  return (
    <div className="prescriptions-page">
      <header className="page-header">
        <div>
          <h1>Prescription History</h1>
          <p className="page-subtitle">View and manage patient prescriptions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add prescription
        </button>
      </header>

      <div className="prescriptions-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input type="search" placeholder="Search by patient or medication..." />
        </div>
        <div className="filter-tabs">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="prescriptions-table-container">
        {loading ? (
          <p className="loading-state">Loading prescriptions…</p>
        ) : (
          <>
            <table className="prescriptions-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Prescriber</th>
                  <th>Date</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrescriptions.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patient}</td>
                    <td>{p.medication}</td>
                    <td>{p.dosage}</td>
                    <td>{p.prescriber}</td>
                    <td>{p.date}</td>
                    <td>{p.condition}</td>
                    <td>
                      <span className={`status-badge status-${p.status}`}>{p.status}</span>
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
                Showing {filtered.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ROWS_PER_PAGE, filtered.length)} of {filtered.length} prescriptions
              </span>
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add prescription</h2>
            {addError && <p className="form-error">{addError}</p>}
            <form className="prescription-form" onSubmit={handleAddSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    value={addForm.patientId}
                    onChange={(e) => setAddForm((p) => ({ ...p, patientId: e.target.value }))}
                    required
                  >
                    <option value="">Select patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Medication</label>
                  <input
                    type="text"
                    placeholder="e.g. Metformin"
                    value={addForm.medicationName}
                    onChange={(e) => setAddForm((p) => ({ ...p, medicationName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg twice daily"
                    value={addForm.dosage}
                    onChange={(e) => setAddForm((p) => ({ ...p, dosage: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 days"
                    value={addForm.duration}
                    onChange={(e) => setAddForm((p) => ({ ...p, duration: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date prescribed</label>
                  <input
                    type="date"
                    value={addForm.datePrescribed}
                    onChange={(e) => setAddForm((p) => ({ ...p, datePrescribed: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Type 2 Diabetes"
                    value={addForm.condition}
                    onChange={(e) => setAddForm((p) => ({ ...p, condition: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Pharmacy (optional)</label>
                <input
                  type="text"
                  placeholder="Pharmacy name"
                  value={addForm.pharmacy}
                  onChange={(e) => setAddForm((p) => ({ ...p, pharmacy: e.target.value }))}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
