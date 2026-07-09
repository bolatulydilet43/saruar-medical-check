import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';
import patientsRoutes from './routes/patients.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import rangesRoutes from './routes/ranges.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/ranges', rangesRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Saruar Medical Check API listening on http://localhost:${PORT}`);
});
