import express from 'express';
import { fileURLToPath } from 'node:url';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createApp(store) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));

  // A running API does not necessarily mean its database connection works.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Electria backend', data_source: store.source });
  });

  app.get('/api/db-health', async (req, res) => {
    if (store.source === 'demo') {
      return res.json({ status: 'not_connected', data_source: 'demo', message: 'Demo mode uses bundled sample data, not Supabase.' });
    }
    await store.read('vehicle_types', { limit: 1 });
    res.json({ status: 'connected', data_source: 'supabase' });
  });

  app.get('/api/users', async (req, res) => {
    const rows = await store.read('users');
    // Account credentials and contact details are not part of this endpoint.
    const data = rows.map(({ user_id, full_name, created_at, account_status }) => ({ user_id, full_name, created_at, account_status }));
    res.json({ data_source: store.source, count: data.length, data });
  });

  app.get('/api/vehicle-types', async (req, res) => {
    const data = await store.read('vehicle_types');
    res.json({ data_source: store.source, count: data.length, data });
  });

  app.get('/api/vehicles', async (req, res) => {
    const typeId = req.query.type_id;
    if (typeId !== undefined && (typeof typeId !== 'string' || !uuid.test(typeId))) {
      return res.status(400).json({ error: 'type_id must be a valid UUID from /api/vehicle-types.' });
    }
    const data = await store.read('vehicles', { typeId: typeId?.toLowerCase() });
    res.json({ data_source: store.source, count: data.length, data });
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    if (!uuid.test(req.params.id)) return res.status(400).json({ error: 'Vehicle ID must be a valid UUID.' });
    const data = await store.read('vehicles', { id: req.params.id.toLowerCase(), limit: 1 });
    if (data.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ data_source: store.source, data: data[0] });
  });

  app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
      error: error.statusCode === 503 ? error.message : 'An unexpected server error occurred.',
    });
  });
  return app;
}
