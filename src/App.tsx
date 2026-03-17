import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import ScanQR from './pages/ScanQR';
import ConsentRequests from './pages/ConsentRequests';
import MedicalSummary from './pages/MedicalSummary';
import Prescriptions from './pages/Prescriptions';
import AuditLog from './pages/AuditLog';
import ClinicSettings from './pages/ClinicSettings';
import PatientRegistration from './pages/PatientRegistration';
import RequestAccess from './pages/RequestAccess';
import TransferPatient from './pages/TransferPatient';
import AcceptInvite from './pages/AcceptInvite';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="consent" element={<ConsentRequests />} />
            <Route path="request-access" element={<RequestAccess />} />
            <Route path="medical-summary" element={<MedicalSummary />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="transfer" element={<TransferPatient />} />
            <Route path="settings" element={<ClinicSettings />} />
            <Route path="register" element={<PatientRegistration />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
