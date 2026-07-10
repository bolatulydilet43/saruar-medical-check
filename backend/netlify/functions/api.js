import serverless from 'serverless-http';
import { createApp, apiRouter } from '../../src/app.js';

// Netlify passes the original request path through unchanged (e.g. /api/health),
// so this mirrors server.js and mounts the router at /api rather than stripping
// a function-path prefix.
const app = createApp();
app.use('/api', apiRouter);

export const handler = serverless(app);
