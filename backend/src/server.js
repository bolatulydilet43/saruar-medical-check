import 'dotenv/config';
import { createApp, apiRouter } from './app.js';
import { isSupabaseConfigured } from './data/supabaseClient.js';

const app = createApp();
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Saruar Medical Check API listening on http://localhost:${PORT}`);
  console.log(`Data store: ${isSupabaseConfigured ? 'Supabase (persistent)' : 'in-memory (resets on restart)'}`);
});
