import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';
import patientsRoutes from './routes/patients.routes.js';
import patientPortalRoutes from './routes/patientPortal.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import rangesRoutes from './routes/ranges.routes.js';
import roomsRoutes from './routes/rooms.routes.js';

// Routes are unprefixed here so this router can be mounted at /api locally
// (server.js) or at the function's own base path on Netlify (see
// backend/netlify/functions/api.js), without duplicating route wiring.
export const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/patients', patientsRoutes);
apiRouter.use('/patient-portal', patientPortalRoutes);
apiRouter.use('/appointments', appointmentsRoutes);
apiRouter.use('/ranges', rangesRoutes);
apiRouter.use('/rooms', roomsRoutes);
apiRouter.get('/health', (req, res) => res.json({ ok: true }));

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'https://saruar-medical-check.netlify.app'];
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim())
  : DEFAULT_ALLOWED_ORIGINS;

export function createApp() {
  const app = express();
  // Trust Netlify's single edge proxy hop so req.ip (used by the login rate limiter)
  // reflects the real client IP instead of the proxy's.
  app.set('trust proxy', 1);
  app.use(cors({
    origin(origin, callback) {
      // No Origin header (curl, same-origin requests, server-to-server) is allowed through.
      // Disallowed origins get `false`, not an Error — an Error would hit Express's default
      // error handler and leak a stack trace; `false` just omits the CORS headers so the
      // browser blocks the response itself.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }));
  app.use(express.json());
  return app;
}
