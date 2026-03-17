import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import patientsRouter from './routes/patients.js';
import prescriptionsRouter from './routes/prescriptions.js';
import consentRouter from './routes/consent.js';
import auditRouter from './routes/audit.js';
import dashboardRouter from './routes/dashboard.js';
import medicalSummaryRouter from './routes/medicalSummary.js';
import authRouter from './routes/auth.js';
import transfersRouter from './routes/transfers.js';
import clinicRouter from './routes/clinic.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/patients', patientsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/consent', consentRouter);
app.use('/api/audit', auditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/medical-summary', medicalSummaryRouter);
app.use('/api/auth', authRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/clinic', clinicRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`ZuriCare API running at http://localhost:${PORT}`);
});
