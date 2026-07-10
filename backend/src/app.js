import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';
import patientsRoutes from './routes/patients.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import rangesRoutes from './routes/ranges.routes.js';

// Routes are unprefixed here so this router can be mounted at /api locally
// (server.js) or at the function's own base path on Netlify (see
// backend/netlify/functions/api.js), without duplicating route wiring.
export const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/patients', patientsRoutes);
apiRouter.use('/appointments', appointmentsRoutes);
apiRouter.use('/ranges', rangesRoutes);
apiRouter.get('/health', (req, res) => res.json({ ok: true }));

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  return app;
}
